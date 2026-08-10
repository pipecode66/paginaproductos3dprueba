import { randomUUID } from 'node:crypto';
import { createWebhookSignature } from '../server/bold.js';

const requestedUrl = process.argv[2] || process.env.TEST_BASE_URL;
const orderId = process.argv[3];
const eventType = process.argv[4];
const allowedEvents = new Set(['SALE_APPROVED', 'SALE_REJECTED', 'VOID_APPROVED', 'VOID_REJECTED']);

if (!requestedUrl || !orderId || !allowedEvents.has(eventType)) {
  throw new Error(
    'Uso: node scripts/verify-bold-webhook-state.mjs <URL> <ORDEN> <SALE_APPROVED|SALE_REJECTED|VOID_APPROVED|VOID_REJECTED>',
  );
}

const baseUrl = new URL(requestedUrl);
const healthResponse = await fetch(new URL('/api/payments/health', baseUrl));
const health = await healthResponse.json();
if (!healthResponse.ok || health.environment !== 'test') {
  throw new Error('Esta simulación solo puede ejecutarse cuando Bold está en ambiente de pruebas.');
}

const orderUrl = new URL(`/api/payments/orders/${encodeURIComponent(orderId)}`, baseUrl);
const currentResponse = await fetch(orderUrl);
const currentResult = await currentResponse.json();
if (!currentResponse.ok || !currentResult.order) {
  throw new Error(`No fue posible consultar la orden: ${JSON.stringify(currentResult)}`);
}

const currentOrder = currentResult.order;
if (eventType === 'VOID_APPROVED' && currentOrder.status !== 'PAID') {
  throw new Error(`La anulación requiere una orden pagada; el estado actual es ${currentOrder.status}.`);
}

const paymentId = currentOrder.paymentId || `BOLD-TEST-${randomUUID()}`;
const event = {
  id: randomUUID(),
  type: eventType,
  subject: paymentId,
  source: '/payments',
  spec_version: '1.0',
  time: Date.now() * 1_000_000,
  data: {
    payment_id: paymentId,
    payment_method: currentOrder.paymentMethod || 'CARD_WEB',
    amount: {
      currency: currentOrder.currency,
      total: currentOrder.amount,
    },
    metadata: {
      reference: currentOrder.id,
    },
  },
};
const rawEvent = JSON.stringify(event);
const webhookResponse = await fetch(new URL('/api/payments/bold/webhook', baseUrl), {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-bold-signature': createWebhookSignature(Buffer.from(rawEvent), ''),
  },
  body: rawEvent,
});
const webhookResult = await webhookResponse.json();
if (!webhookResponse.ok) {
  throw new Error(`Bold webhook respondió ${webhookResponse.status}: ${JSON.stringify(webhookResult)}`);
}

const updatedResponse = await fetch(orderUrl);
const updatedResult = await updatedResponse.json();
const expectedStatus = {
  SALE_APPROVED: 'PAID',
  SALE_REJECTED: 'REJECTED',
  VOID_APPROVED: 'VOIDED',
  VOID_REJECTED: currentOrder.status,
}[eventType];

if (!updatedResponse.ok || updatedResult.order?.status !== expectedStatus) {
  throw new Error(`Estado inesperado después de ${eventType}: ${JSON.stringify(updatedResult)}`);
}

console.log(
  JSON.stringify({
    environment: health.environment,
    orderId,
    eventType,
    previousStatus: currentOrder.status,
    status: updatedResult.order.status,
    lastEventType: updatedResult.order.lastEventType,
    webhookAccepted: true,
  }),
);
