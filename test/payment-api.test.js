import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../server/app.js';
import { createWebhookSignature } from '../server/bold.js';
import { CatalogRepository } from '../server/catalog-repository.js';
import { OrderStore } from '../server/order-store.js';

test('crea y consulta una orden por HTTP sin exponer la llave secreta', async (context) => {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-payment-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const config = {
    runtimeDir,
    bold: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'never-return-this-secret',
      publicBaseUrl: 'http://localhost:4173',
      tax: '',
      productionEnabled: false,
    },
  };
  const catalogRepository = new CatalogRepository(path.join(runtimeDir, 'catalog.json'));
  const orderStore = new OrderStore(path.join(runtimeDir, 'orders.json'));
  const { app } = createApp({ config, catalogRepository, orderStore, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const createResponse = await fetch(`${baseUrl}/api/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente API', email: 'api@example.com', phone: '3001234567' },
      items: [{ productId: 'anillo-rubi-aurora', measure: 'Talla 6', quantity: 1, price: 1000 }],
    }),
  });
  const created = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(created.order.amount, 1120000);
  assert.equal(JSON.stringify(created).includes('never-return-this-secret'), false);

  const getResponse = await fetch(`${baseUrl}/api/payments/orders/${created.order.id}`);
  const fetched = await getResponse.json();
  assert.equal(getResponse.status, 200);
  assert.equal(fetched.order.id, created.order.id);
  assert.equal(fetched.order.status, 'CREATED');

  const event = {
    id: 'api-event-approved-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-API-PAYMENT-1',
    data: {
      payment_id: 'BOLD-API-PAYMENT-1',
      payment_method: 'CARD_WEB',
      payer_email: 'api@example.com',
      amount: { currency: 'COP', total: 1120000 },
      metadata: { reference: created.order.id },
    },
  };
  const rawEvent = JSON.stringify(event);
  const webhookResponse = await fetch(`${baseUrl}/api/payments/bold/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bold-signature': createWebhookSignature(Buffer.from(rawEvent), config.bold.secretKey),
    },
    body: rawEvent,
  });
  const webhookResult = await webhookResponse.json();
  assert.equal(webhookResponse.status, 200);
  assert.equal(webhookResult.duplicate, false);

  const paidResponse = await fetch(`${baseUrl}/api/payments/orders/${created.order.id}`);
  const paid = await paidResponse.json();
  assert.equal(paid.order.status, 'PAID');
  assert.equal(paid.order.paymentId, 'BOLD-API-PAYMENT-1');
});
