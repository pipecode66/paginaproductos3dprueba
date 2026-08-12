import assert from 'node:assert/strict';
import test from 'node:test';
import { createWebhookSignature } from '../server/bold.js';
import { PaymentError, PaymentService } from '../server/payment-service.js';

const product = {
  id: 'anillo-prueba',
  name: 'Anillo de Prueba',
  price: 1250000,
  stock: 2,
  measurements: ['Talla 6', 'Talla 7'],
  active: true,
};

class MemoryCatalog {
  async findById(productId) {
    return productId === product.id ? product : null;
  }
}

class MemoryOrders {
  constructor() {
    this.orders = new Map();
    this.events = new Map();
  }

  async create(order) {
    this.orders.set(order.id, structuredClone(order));
    return order;
  }

  async get(orderId) {
    return structuredClone(this.orders.get(orderId) ?? null);
  }

  async recordEvent(eventId, eventRecord, updateOrder) {
    if (this.events.has(eventId)) return { duplicate: true, order: await this.get(eventRecord.orderId) };
    this.events.set(eventId, eventRecord);
    const order = this.orders.get(eventRecord.orderId) ?? null;
    if (order && updateOrder) this.orders.set(eventRecord.orderId, updateOrder(order));
    return { duplicate: false, order: await this.get(eventRecord.orderId) };
  }
}

function createService(overrides = {}) {
  return new PaymentService({
    catalogRepository: overrides.catalogRepository ?? new MemoryCatalog(),
    orderStore: overrides.orderStore ?? new MemoryOrders(),
    boldConfig: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'test-secret',
      publicBaseUrl: 'http://localhost:4173',
      tax: 'vat-19',
      productionEnabled: false,
      ...overrides.boldConfig,
    },
    clock: () => 1_800_000_000_000,
    orderIdFactory: () => 'QBM-ORDER-001',
  });
}

function validPayload(extraItemFields = {}) {
  return {
    customer: { fullName: 'Cliente Prueba', email: 'cliente@example.com', phone: '3001234567' },
    destination: { scope: 'national' },
    items: [{ productId: product.id, measure: 'Talla 6', quantity: 1, ...extraItemFields }],
  };
}

test('recalcula el total desde el catálogo e ignora precios enviados por el navegador', async () => {
  const service = createService();
  const result = await service.createOrder({
    ...validPayload({ price: 1000, subtotal: 1000 }),
    amount: 1000,
    adjustmentRate: 0,
    destination: { scope: 'national', adjustmentRate: 0 },
  });

  assert.equal(result.order.subtotal, 1250000);
  assert.equal(result.order.commercialAdjustment, 62500);
  assert.equal(result.order.adjustmentRate, 5);
  assert.equal(result.order.amount, 1312500);
  assert.equal(result.payment.amount, '1312500');
  assert.equal(result.payment.tax, 'vat-19');
  assert.equal(result.payment.renderMode, 'embedded');
  assert.equal(Object.hasOwn(result.payment, 'redirectionUrl'), false);
  assert.equal(Object.hasOwn(result.payment, 'secretKey'), false);
});

test('aplica el 6 % a entregas internacionales y rechaza destinos desconocidos', async () => {
  const service = createService();
  const international = await service.createOrder({
    ...validPayload(),
    destination: { scope: 'international' },
  });

  assert.equal(international.order.commercialAdjustment, 75000);
  assert.equal(international.order.adjustmentRate, 6);
  assert.equal(international.order.amount, 1325000);
  assert.equal(international.order.destination.label, 'Fuera de Colombia');

  await assert.rejects(
    () => service.createOrder({ ...validPayload(), destination: { scope: 'desconocido' } }),
    (error) => {
      assert.equal(error.code, 'INVALID_PAYMENT_REQUEST');
      return true;
    },
  );
});

test('incluye la redirección únicamente cuando la tienda usa HTTPS', async () => {
  const service = createService({ boldConfig: { publicBaseUrl: 'https://joyeriaquerubim.com' } });
  const result = await service.createOrder(validPayload());

  assert.equal(result.payment.redirectionUrl, 'https://joyeriaquerubim.com/pago/resultado?orden=QBM-ORDER-001');
});

test('rechaza medidas inexistentes y cantidades superiores al stock', async () => {
  const service = createService();

  await assert.rejects(() => service.createOrder(validPayload({ measure: 'Talla 99' })), (error) => {
    assert.equal(error.code, 'MEASURE_NOT_AVAILABLE');
    return true;
  });
  await assert.rejects(() => service.createOrder(validPayload({ quantity: 3 })), (error) => {
    assert.equal(error.code, 'INSUFFICIENT_STOCK');
    return true;
  });
});

test('procesa un pago aprobado una sola vez', async () => {
  const orderStore = new MemoryOrders();
  const service = createService({ orderStore });
  await service.createOrder(validPayload());
  const event = {
    id: 'event-approved-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-PAYMENT-1',
    data: {
      payment_id: 'BOLD-PAYMENT-1',
      payment_method: 'CARD_WEB',
      payer_email: 'cliente@example.com',
      amount: { currency: 'COP', total: 1312500 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawBody = Buffer.from(JSON.stringify(event));
  const signature = createWebhookSignature(rawBody, '');

  const first = await service.processWebhook(rawBody, signature);
  const second = await service.processWebhook(rawBody, signature);
  assert.equal(first.duplicate, false);
  assert.equal(first.order.status, 'PAID');
  assert.equal(first.order.paymentId, 'BOLD-PAYMENT-1');
  assert.equal(second.duplicate, true);
  assert.equal((await orderStore.get('QBM-ORDER-001')).fulfillmentStatus, 'CONFIRMED');
});

test('cancela operativamente las ventas rechazadas y anuladas', async () => {
  const rejectedStore = new MemoryOrders();
  const rejectedService = createService({ orderStore: rejectedStore });
  await rejectedService.createOrder(validPayload());
  const rejectedEvent = {
    id: 'event-rejected-1',
    type: 'SALE_REJECTED',
    subject: 'BOLD-REJECTED-1',
    data: {
      payment_id: 'BOLD-REJECTED-1',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: 1312500 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawRejected = Buffer.from(JSON.stringify(rejectedEvent));
  const rejected = await rejectedService.processWebhook(rawRejected, createWebhookSignature(rawRejected, ''));
  assert.equal(rejected.order.status, 'REJECTED');
  assert.equal((await rejectedStore.get('QBM-ORDER-001')).fulfillmentStatus, 'CANCELLED');

  const voidedStore = new MemoryOrders();
  const voidedService = createService({ orderStore: voidedStore });
  await voidedService.createOrder(validPayload());
  const approvedEvent = {
    id: 'event-before-void-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-VOID-1',
    data: {
      payment_id: 'BOLD-VOID-1',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: 1312500 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawApproved = Buffer.from(JSON.stringify(approvedEvent));
  await voidedService.processWebhook(rawApproved, createWebhookSignature(rawApproved, ''));
  const voidEvent = { ...approvedEvent, id: 'event-void-approved-1', type: 'VOID_APPROVED' };
  const rawVoid = Buffer.from(JSON.stringify(voidEvent));
  const voided = await voidedService.processWebhook(rawVoid, createWebhookSignature(rawVoid, ''));
  assert.equal(voided.order.status, 'VOIDED');
  assert.equal((await voidedStore.get('QBM-ORDER-001')).fulfillmentStatus, 'CANCELLED');
});

test('envía a revisión una notificación cuyo monto no coincide', async () => {
  const service = createService();
  await service.createOrder(validPayload());
  const event = {
    id: 'event-mismatch-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-PAYMENT-2',
    data: {
      amount: { currency: 'COP', total: 1000 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawBody = Buffer.from(JSON.stringify(event));
  const signature = createWebhookSignature(rawBody, '');
  const result = await service.processWebhook(rawBody, signature);

  assert.equal(result.order.status, 'REVIEW_REQUIRED');
  assert.match(result.order.reviewReason, /monto/i);
});

test('acepta la notificación anonimizada del botón Probar el webhook', async () => {
  const service = createService();
  await service.createOrder(validPayload());
  const event = {
    id: 'event-sandbox-probe-1',
    type: 'SALE_APPROVED',
    subject: 'XXXX',
    data: {
      payment_id: 'XXXX',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: 1000 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawBody = Buffer.from(JSON.stringify(event));
  const signature = createWebhookSignature(rawBody, '');
  const result = await service.processWebhook(rawBody, signature);

  assert.equal(result.order.status, 'PAID');
  assert.equal(result.order.reviewReason, null);
});

test('bloquea producción mientras no exista habilitación explícita', async () => {
  const service = createService({ boldConfig: { environment: 'production', productionEnabled: false } });

  await assert.rejects(() => service.createOrder(validPayload()), (error) => {
    assert.ok(error instanceof PaymentError);
    assert.equal(error.code, 'PRODUCTION_LOCKED');
    return true;
  });
});

test('continúa recibiendo webhooks cuando las nuevas ventas de producción están bloqueadas', async () => {
  const orderStore = new MemoryOrders();
  const setupService = createService({ orderStore });
  await setupService.createOrder(validPayload());
  const service = createService({
    orderStore,
    boldConfig: {
      environment: 'production',
      publicBaseUrl: 'https://joyeriaquerubim.vercel.app',
      secretKey: 'production-secret',
      productionEnabled: false,
    },
  });
  const event = {
    id: 'event-production-lock-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-PRODUCTION-LOCK-1',
    data: {
      payment_id: 'BOLD-PRODUCTION-LOCK-1',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: 1312500 },
      metadata: { reference: 'QBM-ORDER-001' },
    },
  };
  const rawBody = Buffer.from(JSON.stringify(event));
  const result = await service.processWebhook(rawBody, createWebhookSignature(rawBody, 'production-secret'));

  assert.equal(result.order.status, 'PAID');
  assert.equal((await orderStore.get('QBM-ORDER-001')).fulfillmentStatus, 'CONFIRMED');
});
