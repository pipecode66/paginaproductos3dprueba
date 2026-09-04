import path from 'node:path';
import express from 'express';
import {
  clearAdminSessionCookie,
  createAdminCsrfToken,
  createAdminLoginKeys,
  createAdminSession,
  createAdminSessionId,
  hashAdminPassword,
  isAdminConfigured,
  isAdminHardened,
  isTrustedAdminOrigin,
  requireAdmin,
  resolveAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials,
  verifyAdminPasswordHash,
  verifyAdminTotpCode,
} from './admin-auth.js';
import { AdminSecurityStore } from './admin-security-store.js';
import { AdminUserStore } from './admin-user-store.js';
import {
  ADMIN_PERMISSION_OPTIONS,
  ADMIN_PERMISSIONS,
  createInvitationToken,
  hasAdminPermission,
  hashInvitationToken,
  invitationTokenMatches,
  normalizePermissions,
  sanitizeAdminUser,
} from './admin-users.js';
import { BusinessSettingsRepository } from './business-settings-repository.js';
import { findCategory, validateCategory, validateGoldSettings } from './business-settings.js';
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
import { getProductPriceOptions, toPublicProduct } from './product-pricing.js';
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

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildBusinessAnalytics(orders, products, now = Date.now()) {
  const paidOrders = orders.filter((order) => order.status === 'PAID');
  const finalizedOrders = orders.filter((order) => ['PAID', 'REJECTED', 'VOIDED', 'EXPIRED'].includes(order.status));
  const currentStart = now - 30 * 86_400_000;
  const previousStart = now - 60 * 86_400_000;
  const inPeriod = (order, start, end) => {
    const time = Date.parse(order.paidAt || order.createdAt || '');
    return Number.isFinite(time) && time >= start && time < end;
  };
  const currentPaid = paidOrders.filter((order) => inPeriod(order, currentStart, now));
  const previousPaid = paidOrders.filter((order) => inPeriod(order, previousStart, currentStart));
  const sumRevenue = (list) => list.reduce((total, order) => total + Number(order.amount || 0), 0);
  const totalRevenue = sumRevenue(paidOrders);
  const currentRevenue = sumRevenue(currentPaid);
  const previousRevenue = sumRevenue(previousPaid);
  const productById = new Map(products.map((product) => [product.id, product]));
  const productSales = new Map();
  const categorySales = new Map();
  const paymentMethods = new Map();

  paidOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const revenue = Number(item.subtotal || 0);
      const key = item.productId || item.name;
      const current = productSales.get(key) || { productId: item.productId, name: item.name, quantity: 0, revenue: 0 };
      current.quantity += quantity;
      current.revenue += revenue;
      productSales.set(key, current);
      const category = item.category || productById.get(item.productId)?.category || 'sin-categoria';
      const categoryCurrent = categorySales.get(category) || { category, quantity: 0, revenue: 0 };
      categoryCurrent.quantity += quantity;
      categoryCurrent.revenue += revenue;
      categorySales.set(category, categoryCurrent);
    });
  });
  finalizedOrders.forEach((order) => {
    const method = order.paymentMethod || 'Sin identificar';
    const current = paymentMethods.get(method) || { method, attempts: 0, approved: 0 };
    current.attempts += 1;
    if (order.status === 'PAID') current.approved += 1;
    paymentMethods.set(method, current);
  });

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      revenue: 0,
      orders: 0,
    };
  });
  const monthByKey = new Map(monthlyRevenue.map((month) => [month.key, month]));
  paidOrders.forEach((order) => {
    const date = new Date(order.paidAt || order.createdAt || '');
    if (Number.isNaN(date.getTime())) return;
    const month = monthByKey.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    if (!month) return;
    month.revenue += Number(order.amount || 0);
    month.orders += 1;
  });
  const paymentStatusCounts = orders.reduce((counts, order) => {
    const status = order.status || 'CREATED';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  return {
    totalRevenue,
    currentRevenue,
    previousRevenue,
    revenueChange: percentChange(currentRevenue, previousRevenue),
    currentPaidOrders: currentPaid.length,
    ordersChange: percentChange(currentPaid.length, previousPaid.length),
    averageTicket: paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0,
    conversionRate: finalizedOrders.length ? Math.round((paidOrders.length / finalizedOrders.length) * 1000) / 10 : 0,
    topProducts: [...productSales.values()].sort((first, second) => second.revenue - first.revenue).slice(0, 5),
    categorySales: [...categorySales.values()].sort((first, second) => second.revenue - first.revenue),
    monthlyRevenue,
    paymentStatusCounts,
    totalOrders: orders.length,
    paymentMethods: [...paymentMethods.values()].map((item) => ({
      ...item,
      approvalRate: item.attempts ? Math.round((item.approved / item.attempts) * 1000) / 10 : 0,
    })),
  };
}

export function createApp({
  config,
  catalogRepository,
  orderStore,
  siteContentRepository,
  internationalRequestStore,
  adminSecurityStore,
  adminUserStore,
  businessSettingsRepository,
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
  const resolvedAdminUsers = adminUserStore
    ?? persistence?.adminUserStore
    ?? new AdminUserStore(path.join(config.runtimeDir, 'admin-users.json'));
  const resolvedBusinessSettings = businessSettingsRepository
    ?? persistence?.businessSettingsRepository
    ?? new BusinessSettingsRepository(path.join(config.runtimeDir, 'business-settings.json'));
  const storage = catalogRepository && orderStore
    ? { mode: 'injected', configured: true, ready: () => Promise.resolve(true) }
    : persistence.storage;
  const paymentService = new PaymentService({
    catalogRepository: resolvedCatalog,
    orderStore: resolvedOrders,
    businessSettingsRepository: resolvedBusinessSettings,
    boldConfig: config.bold,
  });
  const internationalRequestService = new InternationalRequestService({
    store: resolvedInternationalRequests,
    paymentService,
    publicBaseUrl: config.bold.publicBaseUrl,
  });
  const adminConfig = config.admin ?? {};
  const masterAdminEmail = adminConfig.masterEmail || 'adminmaster@querubim.com';
  const adminMfaRequired = adminConfig.totpRequired !== false && Boolean(adminConfig.totpSecret);
  const adminLoginPolicy = adminConfig.loginPolicy ?? {
    windowMs: 15 * 60 * 1000,
    limit: 5,
    lockMs: 15 * 60 * 1000,
  };
  const imageStorage = r2Storage ?? new R2Storage(config.r2);
  const app = express();
  const resolveAdminIdentity = async (email) => {
    const storedUser = await resolvedAdminUsers.findByEmail(email);
    if (storedUser?.status === 'ACTIVE' && storedUser.active !== false) return sanitizeAdminUser(storedUser);
    const masterActive = await resolvedAdminUsers.hasActiveMaster();
    if (!masterActive && isAdminConfigured(adminConfig) && email === adminConfig.email) {
      return {
        email,
        name: 'Acceso de transición',
        role: 'bootstrap',
        status: 'ACTIVE',
        active: true,
        permissions: Object.values(ADMIN_PERMISSIONS),
      };
    }
    return null;
  };
  const requirePermission = (...permissions) => (request, response, next) => {
    if (permissions.some((permission) => hasAdminPermission(request.admin?.user, permission))) {
      next();
      return;
    }
    response.status(403).json({
      error: 'Tu perfil no tiene permiso para realizar esta acción.',
      code: 'ADMIN_PERMISSION_REQUIRED',
    });
  };

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

  const sendAdminSession = async (response, user, now = Date.now()) => {
    const sessionId = createAdminSessionId();
    const expiresAt = now + adminConfig.sessionTtlMs;
    await resolvedAdminSecurity.createSession({ id: sessionId, email: user.email, expiresAt, createdAt: now });
    setAdminSessionCookie(response, createAdminSession(user.email, adminConfig, now, sessionId), adminConfig);
    response.json({
      authenticated: true,
      user: sanitizeAdminUser(user),
      csrfToken: createAdminCsrfToken(sessionId, adminConfig),
      expiresAt: new Date(expiresAt).toISOString(),
    });
  };

  app.post(
    '/api/admin/account-flow',
    createRateLimiter({ windowMs: 15 * 60_000, limit: 20 }),
    async (request, response) => {
      try {
        if (!isTrustedAdminOrigin(request, adminConfig)) {
          response.status(403).json({ error: 'La solicitud administrativa no pudo verificarse.', code: 'ADMIN_ORIGIN_REJECTED' });
          return;
        }
        const email = String(request.body?.email || '').trim().toLowerCase();
        const user = await resolvedAdminUsers.findByEmail(email);
        if (user?.status === 'INVITED' && user.active !== false && Number(user.inviteExpiresAt || 0) > Date.now()) {
          response.json({ mode: 'activate', email });
          return;
        }
        if (email === masterAdminEmail && !(await resolvedAdminUsers.hasActiveMaster()) && !user) {
          response.json({ mode: 'awaiting-invitation', email });
          return;
        }
        const usesLegacyAccess = !(await resolvedAdminUsers.hasActiveMaster()) && email === adminConfig.email;
        response.json({ mode: 'password', email, mfaRequired: usesLegacyAccess && adminMfaRequired });
      } catch (error) {
        const serialized = serializeError(error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.post(
    '/api/admin/activate',
    createRateLimiter({ windowMs: 15 * 60_000, limit: 10 }),
    async (request, response) => {
      try {
        if (!adminConfig.sessionSecret || !isTrustedAdminOrigin(request, adminConfig)) {
          response.status(403).json({ error: 'La solicitud administrativa no pudo verificarse.', code: 'ADMIN_ORIGIN_REJECTED' });
          return;
        }
        const email = String(request.body?.email || '').trim().toLowerCase();
        const activationToken = String(request.body?.activationToken || '');
        const now = Date.now();
        const invitedUser = await resolvedAdminUsers.findByEmail(email);
        if (
          invitedUser?.status !== 'INVITED'
          || invitedUser.active === false
          || Number(invitedUser.inviteExpiresAt || 0) <= now
          || !invitationTokenMatches(activationToken, invitedUser.inviteTokenHash)
        ) {
          response.status(401).json({
            error: 'El código de activación no es válido o ya venció.',
            code: 'ADMIN_ACTIVATION_INVALID',
          });
          return;
        }
        const passwordHash = await hashAdminPassword(request.body?.password);
        const user = await resolvedAdminUsers.activate(email, activationToken, passwordHash, now);
        if (!user) {
          response.status(401).json({
            error: 'El código de activación no es válido o ya venció.',
            code: 'ADMIN_ACTIVATION_INVALID',
          });
          return;
        }
        if (user.role === 'master') await resolvedAdminSecurity.revokeAllSessions(now);
        await resolvedAdminSecurity.clearLoginFailures(createAdminLoginKeys(request, email, adminConfig));
        await sendAdminSession(response, user, now);
      } catch (error) {
        const serialized = serializeError(error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.post(
    '/api/admin/login',
    createRateLimiter({ windowMs: 15 * 60_000, limit: 10 }),
    async (request, response) => {
      try {
        const email = String(request.body?.email || '').trim().toLowerCase();
        const password = String(request.body?.password || '');
        const totpCode = String(request.body?.totpCode || '');
        if (!adminConfig.sessionSecret) {
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

        const storedUser = await resolvedAdminUsers.findByEmail(email);
        const masterActive = await resolvedAdminUsers.hasActiveMaster();
        let credentialsValid = false;
        let identity = null;
        let totpAccepted = true;
        if (storedUser?.status === 'ACTIVE' && storedUser.active !== false) {
          credentialsValid = await verifyAdminPasswordHash(password, storedUser.passwordHash);
          identity = storedUser;
        } else if (!masterActive && isAdminConfigured(adminConfig)) {
          const lastTotpStep = await resolvedAdminSecurity.getLastTotpStep(adminConfig.email);
          const [legacyValid, totpResult] = await Promise.all([
            verifyAdminCredentials(email, password, adminConfig),
            verifyAdminTotpCode(totpCode, adminConfig, lastTotpStep),
          ]);
          credentialsValid = legacyValid;
          totpAccepted = legacyValid
            && totpResult.valid
            && (totpResult.timeStep === undefined
              || await resolvedAdminSecurity.consumeTotpStep(adminConfig.email, totpResult.timeStep, now));
          if (credentialsValid) identity = await resolveAdminIdentity(email);
        }
        if (!credentialsValid || !totpAccepted || !identity) {
          await resolvedAdminSecurity.recordLoginFailure(loginKeys, adminLoginPolicy, now);
          response.status(401).json({ error: 'Credenciales incorrectas.', code: 'ADMIN_INVALID_CREDENTIALS' });
          return;
        }

        await resolvedAdminSecurity.clearLoginFailures(loginKeys);
        if (storedUser) await resolvedAdminUsers.recordLogin(email, now);
        await sendAdminSession(response, identity, now);
      } catch (error) {
        const serialized = serializeError(error);
        response.status(serialized.statusCode).json(serialized.body);
      }
    },
  );

  app.get('/api/admin/session', async (request, response) => {
    try {
      const now = Date.now();
      const session = await resolveAdminSession(request, adminConfig, resolvedAdminSecurity, now, resolveAdminIdentity);
      let expiresAt;
      if (session) {
        expiresAt = now + adminConfig.sessionTtlMs;
        const touched = await resolvedAdminSecurity.touchSession(session.sid, expiresAt, now);
        if (!touched) {
          clearAdminSessionCookie(response, adminConfig);
          response.json({ authenticated: false, configured: true, hardened: true, mfaRequired: false, user: null });
          return;
        }
        setAdminSessionCookie(response, createAdminSession(session.sub, adminConfig, now, session.sid), adminConfig);
      }
      const hasStoredAccounts = (await resolvedAdminUsers.list()).some((user) => user.active !== false);
      const hasActiveMaster = await resolvedAdminUsers.hasActiveMaster();
      response.json({
        authenticated: Boolean(session),
        configured: Boolean(adminConfig.sessionSecret && (hasStoredAccounts || isAdminConfigured(adminConfig))),
        hardened: hasStoredAccounts ? true : isAdminHardened(adminConfig),
        mfaRequired: session
          ? session.user?.role === 'bootstrap' && adminMfaRequired
          : !hasActiveMaster && adminMfaRequired,
        user: session?.user ?? null,
        csrfToken: session ? createAdminCsrfToken(session.sid, adminConfig) : null,
        expiresAt: session ? new Date(expiresAt).toISOString() : null,
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/logout', requireAdmin(adminConfig, resolvedAdminSecurity, resolveAdminIdentity), async (request, response) => {
    await resolvedAdminSecurity.revokeSession(request.admin.sid);
    clearAdminSessionCookie(response, adminConfig);
    response.json({ authenticated: false });
  });

  app.use('/api/admin', requireAdmin(adminConfig, resolvedAdminSecurity, resolveAdminIdentity));
  app.use('/api/admin/products', requirePermission(ADMIN_PERMISSIONS.CATALOG_MANAGE));
  app.use('/api/admin/orders', requirePermission(ADMIN_PERMISSIONS.ORDERS_MANAGE));
  app.use('/api/admin/international-requests', requirePermission(ADMIN_PERMISSIONS.INTERNATIONAL_MANAGE));
  app.use('/api/admin/site-content', requirePermission(ADMIN_PERMISSIONS.CONTENT_MANAGE));
  app.use('/api/admin/catalog/export', requirePermission(ADMIN_PERMISSIONS.CATALOG_EXPORT));
  app.use('/api/admin/settings/gold', requirePermission(ADMIN_PERMISSIONS.GOLD_MANAGE));
  app.use('/api/admin/categories', requirePermission(ADMIN_PERMISSIONS.CATEGORIES_MANAGE));
  app.use('/api/admin/team', requirePermission(ADMIN_PERMISSIONS.TEAM_MANAGE));
  app.use(
    '/api/admin/uploads',
    requirePermission(ADMIN_PERMISSIONS.CATALOG_MANAGE, ADMIN_PERMISSIONS.CONTENT_MANAGE),
  );

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

  app.put('/api/admin/settings/gold', async (request, response) => {
    try {
      const settings = await resolvedBusinessSettings.get();
      settings.gold = validateGoldSettings(request.body, request.admin.sub);
      response.json({ settings: await resolvedBusinessSettings.save(settings) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/categories', async (request, response) => {
    try {
      const category = validateCategory(request.body);
      const settings = await resolvedBusinessSettings.get();
      if (settings.categories.some((item) => item.slug === category.slug)) {
        response.status(409).json({ error: 'Ya existe una categoría con esa referencia.', code: 'CATEGORY_ALREADY_EXISTS' });
        return;
      }
      settings.categories.push(category);
      response.status(201).json({ category, settings: await resolvedBusinessSettings.save(settings) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.put('/api/admin/categories/:categorySlug', async (request, response) => {
    try {
      const categorySlug = String(request.params.categorySlug || '').toLowerCase();
      const category = validateCategory(request.body, categorySlug);
      const settings = await resolvedBusinessSettings.get();
      const index = settings.categories.findIndex((item) => item.slug === categorySlug);
      if (index < 0) {
        response.status(404).json({ error: 'No encontramos la categoría solicitada.', code: 'CATEGORY_NOT_FOUND' });
        return;
      }
      settings.categories[index] = category;
      response.json({ category, settings: await resolvedBusinessSettings.save(settings) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.delete('/api/admin/categories/:categorySlug', async (request, response) => {
    try {
      const categorySlug = String(request.params.categorySlug || '').toLowerCase();
      const products = await resolvedCatalog.listAll();
      if (products.some((product) => product.category === categorySlug && product.active !== false)) {
        response.status(409).json({
          error: 'Traslada o elimina los productos activos de esta categoría antes de retirarla.',
          code: 'CATEGORY_IN_USE',
        });
        return;
      }
      const settings = await resolvedBusinessSettings.get();
      const previousLength = settings.categories.length;
      settings.categories = settings.categories.filter((category) => category.slug !== categorySlug);
      if (settings.categories.length === previousLength) {
        response.status(404).json({ error: 'No encontramos la categoría solicitada.', code: 'CATEGORY_NOT_FOUND' });
        return;
      }
      response.json({ deleted: true, settings: await resolvedBusinessSettings.save(settings) });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.get('/api/admin/team', async (request, response) => {
    response.json({
      users: (await resolvedAdminUsers.list()).map(sanitizeAdminUser),
      permissionOptions: ADMIN_PERMISSION_OPTIONS,
      masterEmail: masterAdminEmail,
    });
  });

  app.post('/api/admin/team/master-invitation', async (request, response) => {
    try {
      if (await resolvedAdminUsers.hasActiveMaster()) {
        response.status(409).json({ error: 'La cuenta maestra ya fue activada.', code: 'MASTER_ALREADY_ACTIVE' });
        return;
      }
      const token = createInvitationToken();
      const user = await resolvedAdminUsers.createInvitation({
        email: masterAdminEmail,
        name: String(request.body?.name || 'Administradora principal'),
        role: 'master',
        permissions: Object.values(ADMIN_PERMISSIONS),
        tokenHash: hashInvitationToken(token),
        createdBy: request.admin.sub,
      });
      if (!user) {
        response.status(409).json({ error: 'La cuenta maestra ya fue activada.', code: 'MASTER_ALREADY_ACTIVE' });
        return;
      }
      response.status(201).json({
        user: sanitizeAdminUser(user),
        activationToken: token,
        message: 'Guarda este código ahora: por seguridad no volverá a mostrarse.',
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.post('/api/admin/team/invitations', async (request, response) => {
    try {
      if (request.admin.user.role !== 'master') {
        response.status(403).json({ error: 'Solo la administradora maestra puede crear perfiles.', code: 'MASTER_REQUIRED' });
        return;
      }
      const token = createInvitationToken();
      const user = await resolvedAdminUsers.createInvitation({
        email: request.body?.email,
        name: request.body?.name,
        role: 'employee',
        permissions: normalizePermissions(request.body?.permissions),
        tokenHash: hashInvitationToken(token),
        createdBy: request.admin.sub,
      });
      if (!user) {
        response.status(409).json({ error: 'Ese usuario ya tiene una cuenta activa.', code: 'ADMIN_USER_ALREADY_ACTIVE' });
        return;
      }
      response.status(201).json({
        user: sanitizeAdminUser(user),
        activationToken: token,
        message: 'Comparte el código de forma privada. Solo puede utilizarse una vez y vence en 24 horas.',
      });
    } catch (error) {
      const serialized = serializeError(error);
      response.status(serialized.statusCode).json(serialized.body);
    }
  });

  app.patch('/api/admin/team/users/:email', async (request, response) => {
    try {
      if (request.admin.user.role !== 'master') {
        response.status(403).json({ error: 'Solo la administradora maestra puede modificar perfiles.', code: 'MASTER_REQUIRED' });
        return;
      }
      const email = decodeURIComponent(String(request.params.email || '')).toLowerCase();
      const user = await resolvedAdminUsers.update(email, {
        name: request.body?.name,
        permissions: request.body?.permissions,
        active: request.body?.active,
      });
      if (!user) {
        response.status(404).json({ error: 'No encontramos el usuario solicitado.', code: 'ADMIN_USER_NOT_FOUND' });
        return;
      }
      if (user.active === false) await resolvedAdminSecurity.revokeSessionsByEmail(user.email);
      response.json({ user: sanitizeAdminUser(user) });
    } catch (error) {
      const serialized = serializeError(error);
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
      const [products, storedOrders, content, businessSettings] = await Promise.all([
        resolvedCatalog.listAll(),
        resolvedOrders.list(5000),
        resolvedSiteContent.get(),
        resolvedBusinessSettings.get(),
      ]);
      const orders = storedOrders.filter((order) => !order.adminArchivedAt).map(normalizeManagedOrder);
      const internationalRequests = await internationalRequestService.listForAdmin(orders);
      const activeProducts = products.filter((product) => product.active !== false);
      const customers = new Set(
        orders.map((order) => order.customer?.email || order.customer?.phone).filter(Boolean),
      );
      const user = request.admin.user;
      const canManageCatalog = hasAdminPermission(user, ADMIN_PERMISSIONS.CATALOG_MANAGE);
      const canManageCategories = hasAdminPermission(user, ADMIN_PERMISSIONS.CATEGORIES_MANAGE);
      const canManageGold = hasAdminPermission(user, ADMIN_PERMISSIONS.GOLD_MANAGE);
      const canManageOrders = hasAdminPermission(user, ADMIN_PERMISSIONS.ORDERS_MANAGE);
      const canManageInternational = hasAdminPermission(user, ADMIN_PERMISSIONS.INTERNATIONAL_MANAGE);
      const canManageContent = hasAdminPermission(user, ADMIN_PERMISSIONS.CONTENT_MANAGE);
      const canViewFinancials = hasAdminPermission(user, ADMIN_PERMISSIONS.FINANCIALS_VIEW);
      const paidRevenue = orders
        .filter((order) => order.status === 'PAID')
        .reduce((total, order) => total + Number(order.amount || 0), 0);
      response.json({
        products: canManageCatalog || canManageCategories || canManageGold ? products : undefined,
        orders: canManageOrders ? orders : undefined,
        internationalRequests: canManageInternational ? internationalRequests : undefined,
        siteContent: canManageContent ? content : undefined,
        businessSettings: canManageCatalog || canManageCategories || canManageGold
          ? businessSettings
          : { categories: businessSettings.categories, gold: { enabled: businessSettings.gold.enabled } },
        analytics: canViewFinancials ? buildBusinessAnalytics(orders, products) : null,
        summary: {
          activeProducts: canManageCatalog || canManageCategories || canManageGold
            ? activeProducts.length
            : null,
          inactiveProducts: canManageCatalog || canManageCategories || canManageGold
            ? products.length - activeProducts.length
            : null,
          lowStockProducts: canManageCatalog || canManageCategories || canManageGold
            ? activeProducts.filter((product) => Number(product.stock) <= 1).length
            : null,
          orders: canManageOrders || canViewFinancials ? orders.length : null,
          paidOrders: canManageOrders || canViewFinancials
            ? orders.filter((order) => order.status === 'PAID').length
            : null,
          reviewOrders: canManageOrders || canViewFinancials
            ? orders.filter((order) => order.status === 'REVIEW_REQUIRED').length
            : null,
          pendingInternationalRequests: canManageInternational
            ? internationalRequests.filter((item) =>
              ['PENDING_REVIEW', 'CONDITIONS_SET'].includes(item.status),
            ).length
            : null,
          customers: canManageOrders || canViewFinancials ? customers.size : null,
          paidRevenue: canViewFinancials ? paidRevenue : null,
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
      const [products, settings] = await Promise.all([
        resolvedCatalog.listAll(),
        resolvedBusinessSettings.get(),
      ]);
      const activeCategories = new Set(
        settings.categories.filter((category) => category.active !== false).map((category) => category.slug),
      );
      const exportProducts = products
        .filter((product) => product.active !== false && activeCategories.has(product.category))
        .map((product) => ({
          ...product,
          pricing: getProductPriceOptions(product, settings.gold),
        }));
      const workbook = await createCatalogExcel(exportProducts);
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
      const [products, settings] = await Promise.all([
        resolvedCatalog.listAll(),
        resolvedBusinessSettings.get(),
      ]);
      const activeCategories = new Set(
        settings.categories.filter((category) => category.active !== false).map((category) => category.slug),
      );
      const publicProducts = products
        .filter((product) => product.active !== false && activeCategories.has(product.category))
        .map((product) => toPublicProduct(product, settings));
      const pdf = await createCatalogPdf(publicProducts, {
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
      const settings = await resolvedBusinessSettings.get();
      const category = findCategory(settings, String(request.body?.category || '').toLowerCase());
      if (!category?.active) {
        response.status(400).json({ error: 'Selecciona una categoría activa.', code: 'CATEGORY_NOT_AVAILABLE' });
        return;
      }
      const product = validateCatalogProduct(request.body, undefined, { category });
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
      const settings = await resolvedBusinessSettings.get();
      const category = findCategory(settings, String(request.body?.category || '').toLowerCase());
      if (!category?.active) {
        response.status(400).json({ error: 'Selecciona una categoría activa.', code: 'CATEGORY_NOT_AVAILABLE' });
        return;
      }
      const product = validateCatalogProduct({ ...request.body, active: existing.active }, productId, { category });
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
      const [products, settings] = await Promise.all([
        resolvedCatalog.listActive(),
        resolvedBusinessSettings.get(),
      ]);
      const activeCategories = new Set(
        settings.categories.filter((category) => category.active !== false).map((category) => category.slug),
      );
      response.json({
        products: products.filter((product) => activeCategories.has(product.category)).map((product) => {
          const publicProduct = toPublicProduct(product, settings);
          return {
            id: publicProduct.id,
            name: publicProduct.name,
            price: publicProduct.price,
            pricing: publicProduct.pricing,
            stock: publicProduct.stock,
            measurements: publicProduct.measurements,
          };
        }),
      });
    } catch (error) {
      logger.error('Error consultando el catálogo de pagos', error);
      response.status(500).json({ error: 'No fue posible consultar el catálogo.', code: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/catalog/products', async (request, response) => {
    try {
      const [products, settings] = await Promise.all([
        resolvedCatalog.listActive(),
        resolvedBusinessSettings.get(),
      ]);
      const activeCategories = new Set(
        settings.categories.filter((category) => category.active !== false).map((category) => category.slug),
      );
      response.json({
        products: products
          .filter((product) => activeCategories.has(product.category))
          .map((product) => toPublicProduct(product, settings)),
        categories: settings.categories.filter((category) => category.active).map(({ slug, label }) => ({ slug, label })),
      });
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
    adminUserStore: resolvedAdminUsers,
    businessSettingsRepository: resolvedBusinessSettings,
  };
}
