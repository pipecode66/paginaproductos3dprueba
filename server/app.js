import path from 'node:path';
import express from 'express';
import {
  clearAdminSessionCookie,
  createAdminCsrfToken,
  createAdminLoginKeys,
  createAdminSession,
  createAdminSessionId,
  isAdminConfigured,
  isAdminHardened,
  isTrustedAdminOrigin,
  requireAdmin,
  resolveAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials,
  verifyAdminTotpCode,
} from './admin-auth.js';
import { AdminSecurityStore } from './admin-security-store.js';
import { validateCatalogProduct } from './catalog-validation.js';
import { createCatalogExcel } from './catalog-excel.js';
import { createCatalogPdf } from './catalog-pdf.js';
import { InternationalRequestService } from './international-request-service.js';
import { InternationalRequestStore } from './international-request-store.js';
import { archiveManagedOrder, normalizeManagedOrder, updateManagedOrder } from './order-management.js';
import { PaymentError, PaymentService } from './payment-service.js';
import { buildPaymentReadiness } from './payment-readiness.js';
import { createPersistence } from './persistence.js';
import { R2Storage } from './r2-storage.js';
import { validateSiteContent } from './site-content.js';
import { SiteContentRepository } from './site-content-repository.js';

function createRateLimiter({ windowMs, limit }) {
  const clients = new Map();

  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    const current = clients.get(key);
    if (!current || current.resetAt <= now) {
      clients.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > limit) {
      response.status(429).json({ error: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.', code: 'RATE_LIMITED' });
      return;
    }
    next();
  };
}

function serializeError(error) {
  if (error instanceof PaymentError) {
    return { statusCode: error.statusCode, body: { error: error.message, code: error.code } };
  }
  if (error?.expose && Number.isInteger(error.statusCode)) {
    return { statusCode: error.statusCode, body: { error: error.message, code: error.code } };
  }
  return { statusCode: 500, body: { error: 'No fue posible procesar la solicitud.', code: 'INTERNAL_ERROR' } };
}

export function createApp({
  config,
  catalogRepository,
  orderStore,
  siteContentRepository,
  internationalRequestStore,
  adminSecurityStore,
  r2Storage,
  logger = console,
} = {}) {
  if (!config) throw new Error('La configuración del servidor es obligatoria.');
  const persistence = !catalogRepository || !orderStore ? createPersistence(config) : null;
  const resolvedCatalog = catalogRepository ?? persistence.catalogRepository;
  const resolvedOrders = orderStore ?? persistence.orderStore;
  const resolvedSiteContent = siteContentRepository
    ?? persistence?.siteContentRepository
    ?? new SiteContentRepository(path.join(config.runtimeDir, 'site-content.json'));
  const resolvedInternationalRequests = internationalRequestStore
    ?? persistence?.internationalRequestStore
    ?? new InternationalRequestStore(path.join(config.runtimeDir, 'international-requests.json'));
  const resolvedAdminSecurity = adminSecurityStore
    ?? persistence?.adminSecurityStore
    ?? new AdminSecurityStore(path.join(config.runtimeDir, 'admin-security.json'));
  const storage = catalogRepository && orderStore
    ? { mode: 'injected', configured: true, ready: () => Promise.resolve(true) }
    : persistence.storage;
  const paymentService = new PaymentService({
    catalogRepository: resolvedCatalog,
    orderStore: resolvedOrders,
    boldConfig: config.bold,
  });
  const internationalRequestService = new InternationalRequestService({
    store: resolvedInternationalRequests,
    paymentService,
    publicBaseUrl: config.bold.publicBaseUrl,
  });
  const adminConfig = config.admin ?? {};
  const adminLoginPolicy = adminConfig.loginPolicy ?? {
    windowMs: 15 * 60 * 1000,
    limit: 5,
    lockMs: 15 * 60 * 1000,
  };
  const imageStorage = r2Storage ?? new R2Storage(config.r2);
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((request, response, next) => {
    response.set('X-Content-Type-Options', 'nosniff');
    response.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.set('X-Frame-Options', 'DENY');
    response.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (/^https:/i.test(config.bold.publicBaseUrl)) {
      response.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    next();
  });

  app.get('/api/payments/health', async (request, response) => {
    let storageReady = false;
    try {
      storageReady = await storage.ready();
    } catch (error) {
      logger.error('Error verificando el almacenamiento de pagos', error);
    }
    response.json(buildPaymentReadiness({
      boldConfig: config.bold,
      storage: {
        mode: storage.mode,
        configured: storage.configured,
        ready: storageReady,
      },
    }));
  });

  app.get('/api/storage/health', (request, response) => {
    response.json(imageStorage.status());
  });

  app.get('/api/site-content', async (request, response) => {
    try {
      response.json({ content: await resolvedSiteContent.get() });
    } catch (error) {
      const serialized = serializeError(error);
      logger.error('Error consultando el contenido comercial', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post(
    '/api/payments/bold/webhook',
    express.raw({ type: 'application/json', limit: '128kb' }),
    async (request, response) => {
      try {
        const result = await paymentService.processWebhook(request.body, request.get('x-bold-signature'));
        response.status(200).json({ received: true, duplicate: result.duplicate });
      } catch (error) {
        const serialized = serializeError(error);
        if (serialized.statusCode >= 500) logger.error('Error procesando webhook Bold', error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.use(express.json({ limit: '64kb' }));
  app.use('/api/admin', (request, response, next) => {
    response.set('Cache-Control', 'no-store, max-age=0');
    response.set('Pragma', 'no-cache');
    next();
  });

  app.post(
    '/api/international-requests',
    createRateLimiter({ windowMs: 60_000, limit: 10 }),
    async (request, response) => {
      try {
        response.status(201).json(await internationalRequestService.create(request.body));
      } catch (error) {
        const serialized = serializeError(error);
        if (serialized.statusCode >= 500) logger.error('Error creando solicitud internacional', error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.get('/api/international-requests/:requestId/checkout', async (request, response) => {
    try {
      response.json(await internationalRequestService.getCheckout(
        String(request.params.requestId || ''),
        String(request.query.token || ''),
      ));
    } catch (error) {
      const serialized = serializeError(error);
      if (serialized.statusCode >= 500) logger.error('Error abriendo pago internacional', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post(
    '/api/admin/login',
    createRateLimiter({ windowMs: 15 * 60_000, limit: 10 }),
    async (request, response) => {
      try {
        const email = String(request.body?.email || '').trim().toLowerCase();
        const password = String(request.body?.password || '');
        const totpCode = String(request.body?.totpCode || '');
        if (!isAdminConfigured(adminConfig)) {
          response.status(503).json({ error: 'El acceso administrativo todavía no está configurado.', code: 'ADMIN_NOT_CONFIGURED' });
          return;
        }
        if (!isTrustedAdminOrigin(request, adminConfig)) {
          response.status(403).json({ error: 'La solicitud administrativa no pudo verificarse.', code: 'ADMIN_ORIGIN_REJECTED' });
          return;
        }

        const now = Date.now();
        const loginKeys = createAdminLoginKeys(request, email, adminConfig);
        const lockedUntil = await resolvedAdminSecurity.getLoginLock(loginKeys, now);
        if (lockedUntil > now) {
          response.set('Retry-After', String(Math.max(1, Math.ceil((lockedUntil - now) / 1000))));
          response.status(429).json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.', code: 'ADMIN_LOGIN_LOCKED' });
          return;
        }

        const lastTotpStep = await resolvedAdminSecurity.getLastTotpStep(adminConfig.email);
        const [credentialsValid, totpResult] = await Promise.all([
          verifyAdminCredentials(email, password, adminConfig),
          verifyAdminTotpCode(totpCode, adminConfig, lastTotpStep),
        ]);
        const totpAccepted = credentialsValid
          && totpResult.valid
          && (totpResult.timeStep === undefined
            || await resolvedAdminSecurity.consumeTotpStep(adminConfig.email, totpResult.timeStep, now));
        if (!credentialsValid || !totpAccepted) {
          await resolvedAdminSecurity.recordLoginFailure(loginKeys, adminLoginPolicy, now);
          response.status(401).json({ error: 'Credenciales incorrectas.', code: 'ADMIN_INVALID_CREDENTIALS' });
          return;
        }

        await resolvedAdminSecurity.clearLoginFailures(loginKeys);
        const sessionId = createAdminSessionId();
        const expiresAt = now + adminConfig.sessionTtlMs;
        await resolvedAdminSecurity.createSession({ id: sessionId, email, expiresAt, createdAt: now });
        setAdminSessionCookie(response, createAdminSession(email, adminConfig, now, sessionId), adminConfig);
        response.json({
          authenticated: true,
          user: { email },
          csrfToken: createAdminCsrfToken(sessionId, adminConfig),
          expiresAt: new Date(expiresAt).toISOString(),
        });
      } catch (error) {
        const serialized = serializeError(error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.get('/api/admin/session', async (request, response) => {
    try {
      const now = Date.now();
      const session = await resolveAdminSession(request, adminConfig, resolvedAdminSecurity, now);
      let expiresAt;
      if (session) {
        expiresAt = now + adminConfig.sessionTtlMs;
        const touched = await resolvedAdminSecurity.touchSession(session.sid, expiresAt, now);
        if (!touched) {
          clearAdminSessionCookie(response, adminConfig);
          response.json({ authenticated: false, configured: isAdminConfigured(adminConfig), hardened: isAdminHardened(adminConfig), mfaRequired: Boolean(adminConfig.totpSecret), user: null });
          return;
        }
        setAdminSessionCookie(response, createAdminSession(session.sub, adminConfig, now, session.sid), adminConfig);
      }
      response.json({
        authenticated: Boolean(session),
        configured: isAdminConfigured(adminConfig),
        hardened: isAdminHardened(adminConfig),
        mfaRequired: Boolean(adminConfig.totpSecret),
        user: session ? { email: session.sub } : null,
        csrfToken: session ? createAdminCsrfToken(session.sid, adminConfig) : null,
        expiresAt: session ? new Date(expiresAt).toISOString() : null,
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/logout', requireAdmin(adminConfig, resolvedAdminSecurity), async (request, response) => {
    await resolvedAdminSecurity.revokeSession(request.admin.sid);
    clearAdminSessionCookie(response, adminConfig);
    response.json({ authenticated: false });
  });

  app.use('/api/admin', requireAdmin(adminConfig, resolvedAdminSecurity));

  app.post(
    '/api/admin/uploads/presign',
    createRateLimiter({ windowMs: 60_000, limit: 60 }),
    async (request, response) => {
      try {
        const upload = await imageStorage.createPresignedUpload(request.body || {});
        response.status(201).json({ upload });
      } catch (error) {
        const serialized = serializeError(error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.delete('/api/admin/uploads', async (request, response) => {
    try {
      response.json({ deleted: await imageStorage.deletePublicObject(request.body?.publicUrl) });
    } catch (error) {
      const serialized = serializeError(error);
      if (serialized.statusCode >= 500) logger.error('Error eliminando imagen de Cloudflare R2', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.put('/api/admin/site-content', async (request, response) => {
    try {
      const content = validateSiteContent(request.body);
      response.json({ content: await resolvedSiteContent.save(content) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.patch('/api/admin/international-requests/:requestId', async (request, response) => {
    try {
      response.json({
        request: await internationalRequestService.saveConditions(
          String(request.params.requestId || ''),
          request.body,
          request.admin.sub,
        ),
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/international-requests/:requestId/payment', async (request, response) => {
    try {
      response.status(201).json(await internationalRequestService.generatePayment(
        String(request.params.requestId || ''),
        request.admin.sub,
      ));
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/international-requests/:requestId/cancel', async (request, response) => {
    try {
      response.json({
        request: await internationalRequestService.cancel(
          String(request.params.requestId || ''),
          request.admin.sub,
        ),
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.get('/api/admin/dashboard', async (request, response) => {
    try {
      const [products, storedOrders, content] = await Promise.all([
        resolvedCatalog.listAll(),
        resolvedOrders.list(100),
        resolvedSiteContent.get(),
      ]);
      const orders = storedOrders.filter((order) => !order.adminArchivedAt).map(normalizeManagedOrder);
      const internationalRequests = await internationalRequestService.listForAdmin(orders);
      const activeProducts = products.filter((product) => product.active !== false);
      const customers = new Set(
        orders.map((order) => order.customer?.email || order.customer?.phone).filter(Boolean),
      );
      response.json({
        products,
        orders,
        internationalRequests,
        siteContent: content,
        summary: {
          activeProducts: activeProducts.length,
          inactiveProducts: products.length - activeProducts.length,
          lowStockProducts: activeProducts.filter((product) => Number(product.stock) <= 1).length,
          orders: orders.length,
          paidOrders: orders.filter((order) => order.status === 'PAID').length,
          reviewOrders: orders.filter((order) => order.status === 'REVIEW_REQUIRED').length,
          pendingInternationalRequests: internationalRequests.filter((item) =>
            ['PENDING_REVIEW', 'CONDITIONS_SET'].includes(item.status),
          ).length,
          customers: customers.size,
          paidRevenue: orders
            .filter((order) => order.status === 'PAID')
            .reduce((total, order) => total + Number(order.amount || 0), 0),
        },
        storage: imageStorage.status(),
      });
    } catch (error) {
      const serialized = serializeError(error);
      logger.error('Error consultando el panel administrativo', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.patch('/api/admin/orders/:orderId', async (request, response) => {
    const orderId = String(request.params.orderId || '');
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(orderId)) {
      response.status(400).json({ error: 'La referencia de la orden no es válida.', code: 'INVALID_ORDER_ID' });
      return;
    }

    try {
      const order = await resolvedOrders.update(orderId, (current) =>
        updateManagedOrder(current, request.body, request.admin.sub),
      );
      if (!order) {
        response.status(404).json({ error: 'No encontramos la orden solicitada.', code: 'ORDER_NOT_FOUND' });
        return;
      }
      response.json({ order: normalizeManagedOrder(order) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.delete('/api/admin/orders/:orderId', async (request, response) => {
    const orderId = String(request.params.orderId || '');
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(orderId)) {
      response.status(400).json({ error: 'La referencia de la orden no es válida.', code: 'INVALID_ORDER_ID' });
      return;
    }

    try {
      const current = await resolvedOrders.get(orderId);
      if (!current) {
        response.status(404).json({ error: 'No encontramos la orden solicitada.', code: 'ORDER_NOT_FOUND' });
        return;
      }
      const archived = archiveManagedOrder(current, request.admin.sub);
      const archivedAt = archived.adminArchivedAt;
      const result = await resolvedOrders.recordEvent(
        `admin-archive-${orderId}-${Date.parse(archivedAt)}`,
        { id: `admin-archive-${orderId}-${Date.parse(archivedAt)}`, type: 'ADMIN_ARCHIVED', orderId, receivedAt: archivedAt },
        () => archived,
      );
      if (!result.order) throw new Error('La orden desapareció durante la actualización.');
      response.json({ deleted: true, orderId });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.get('/api/admin/catalog/export', async (request, response) => {
    try {
      const products = await resolvedCatalog.listAll();
      const workbook = await createCatalogExcel(products.filter((product) => product.active !== false));
      const date = new Date().toISOString().slice(0, 10);
      response.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="querubim-catalogo-${date}.xlsx"`,
        'Cache-Control': 'no-store',
      });
      response.send(Buffer.from(workbook));
    } catch (error) {
      const serialized = serializeError(error);
      logger.error('Error exportando el catálogo a Excel', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.get('/api/admin/catalog/export/pdf', async (request, response) => {
    try {
      const products = await resolvedCatalog.listAll();
      const pdf = await createCatalogPdf(products, {
        rootDir: config.rootDir || process.cwd(),
        publicBaseUrl: config.bold.publicBaseUrl,
        allowedImageOrigins: [config.r2?.publicUrl],
      });
      const date = new Date().toISOString().slice(0, 10);
      response.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="querubim-catalogo-${date}.pdf"`,
        'Cache-Control': 'no-store',
      });
      response.send(pdf);
    } catch (error) {
      const serialized = serializeError(error);
      logger.error('Error exportando el catálogo a PDF', error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/products', async (request, response) => {
    try {
      const product = validateCatalogProduct(request.body);
      const existing = (await resolvedCatalog.listAll()).find((item) => item.id === product.id);
      if (existing) {
        response.status(409).json({ error: 'Ya existe un producto con esa referencia.', code: 'PRODUCT_ALREADY_EXISTS' });
        return;
      }
      response.status(201).json({ product: await resolvedCatalog.upsert(product) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.put('/api/admin/products/:productId', async (request, response) => {
    const productId = String(request.params.productId || '');
    try {
      const existing = (await resolvedCatalog.listAll()).find((item) => item.id === productId);
      if (!existing) {
        response.status(404).json({ error: 'No encontramos el producto solicitado.', code: 'PRODUCT_NOT_FOUND' });
        return;
      }
      const product = validateCatalogProduct({ ...request.body, active: existing.active }, productId);
      response.json({ product: await resolvedCatalog.upsert(product) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.delete('/api/admin/products/:productId', async (request, response) => {
    const productId = String(request.params.productId || '');
    try {
      const product = await resolvedCatalog.deactivate(productId);
      if (!product) {
        response.status(404).json({ error: 'No encontramos el producto solicitado.', code: 'PRODUCT_NOT_FOUND' });
        return;
      }
      response.json({ product });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post(
    '/api/payments/orders',
    createRateLimiter({ windowMs: 60_000, limit: 20 }),
    async (request, response) => {
      try {
        const result = await paymentService.createOrder(request.body);
        response.status(201).json(result);
      } catch (error) {
        const serialized = serializeError(error);
        if (serialized.statusCode >= 500) logger.error('Error creando orden Bold', error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.get('/api/payments/orders/:orderId', async (request, response) => {
    const orderId = String(request.params.orderId || '');
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(orderId)) {
      response.status(400).json({ error: 'Referencia de orden inválida.', code: 'INVALID_ORDER_ID' });
      return;
    }

    try {
      const order = await paymentService.getOrder(orderId);
      if (!order) {
        response.status(404).json({ error: 'No encontramos la orden solicitada.', code: 'ORDER_NOT_FOUND' });
        return;
      }
      response.json({ order });
    } catch (error) {
      logger.error('Error consultando orden Bold', error);
      response.status(500).json({ error: 'No fue posible consultar la orden.', code: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/catalog/payment-products', async (request, response) => {
    try {
      const products = await resolvedCatalog.listActive();
      response.json({
        products: products.map(({ id, name, price, stock, measurements }) => ({ id, name, price, stock, measurements })),
      });
    } catch (error) {
      logger.error('Error consultando el catálogo de pagos', error);
      response.status(500).json({ error: 'No fue posible consultar el catálogo.', code: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/catalog/products', async (request, response) => {
    try {
      response.json({ products: await resolvedCatalog.listActive() });
    } catch (error) {
      logger.error('Error consultando el catálogo público', error);
      response.status(500).json({ error: 'No fue posible consultar el catálogo.', code: 'INTERNAL_ERROR' });
    }
  });

  return {
    app,
    paymentService,
    internationalRequestService,
    catalogRepository: resolvedCatalog,
    orderStore: resolvedOrders,
    siteContentRepository: resolvedSiteContent,
    internationalRequestStore: resolvedInternationalRequests,
  };
}
