import express from 'express';
import { PaymentError, PaymentService } from './payment-service.js';
import { createPersistence } from './persistence.js';

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

export function createApp({ config, catalogRepository, orderStore, logger = console } = {}) {
  if (!config) throw new Error('La configuración del servidor es obligatoria.');
  const persistence = !catalogRepository || !orderStore ? createPersistence(config) : null;
  const resolvedCatalog = catalogRepository ?? persistence.catalogRepository;
  const resolvedOrders = orderStore ?? persistence.orderStore;
  const storage = catalogRepository && orderStore
    ? { mode: 'injected', configured: true, ready: () => Promise.resolve(true) }
    : persistence.storage;
  const paymentService = new PaymentService({
    catalogRepository: resolvedCatalog,
    orderStore: resolvedOrders,
    boldConfig: config.bold,
  });
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.get('/api/payments/health', async (request, response) => {
    let storageReady = false;
    try {
      storageReady = await storage.ready();
    } catch (error) {
      logger.error('Error verificando el almacenamiento de pagos', error);
    }
    const boldConfigured = Boolean(config.bold.identityKey && config.bold.secretKey);
    response.json({
      configured: boldConfigured && storageReady,
      boldConfigured,
      environment: config.bold.environment,
      productionEnabled: config.bold.environment !== 'production' || config.bold.productionEnabled,
      storage: {
        mode: storage.mode,
        configured: storage.configured,
        ready: storageReady,
      },
    });
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

  return { app, paymentService, catalogRepository: resolvedCatalog, orderStore: resolvedOrders };
}
