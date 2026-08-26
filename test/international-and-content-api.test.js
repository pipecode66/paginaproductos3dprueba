import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../server/app.js';
import { createWebhookSignature } from '../server/bold.js';
import { CatalogRepository } from '../server/catalog-repository.js';
import { OrderStore } from '../server/order-store.js';

async function createServer(context) {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-international-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const catalogRepository = new CatalogRepository(path.join(runtimeDir, 'catalog.json'));
  const orderStore = new OrderStore(path.join(runtimeDir, 'orders.json'), catalogRepository);
  const config = {
    runtimeDir,
    bold: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'test-secret-not-public',
      publicBaseUrl: 'http://localhost:4173',
      tax: 'vat-19',
      productionEnabled: false,
    },
    admin: {
      email: 'admin@querubim.co',
      password: 'correct-password',
      sessionSecret: 'a-secure-test-session-secret-with-32-characters',
      sessionTtlMs: 15 * 60 * 1000,
      publicBaseUrl: 'http://localhost:4173',
    },
  };
  const r2Storage = {
    status: () => ({ configured: true, publicUrl: 'https://pub.example.r2.dev' }),
    createPresignedUpload: async () => ({}),
    deletePublicObject: async () => ({}),
  };
  const { app } = createApp({ config, catalogRepository, orderStore, r2Storage, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    catalogRepository,
    orderStore,
  };
}

async function login(baseUrl) {
  const response = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@querubim.co', password: 'correct-password' }),
  });
  const result = await response.json();
  return { cookie: response.headers.get('set-cookie').split(';')[0], csrfToken: result.csrfToken };
}

test('administra contenido comercial y coordina una venta internacional antes de cobrar', async (context) => {
  const { baseUrl, catalogRepository, orderStore } = await createServer(context);
  const originalProduct = await catalogRepository.findById('anillo-rubi-aurora');

  const createdResponse = await fetch(`${baseUrl}/api/international-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente Internacional', email: 'global@example.com', phone: '+1 305 555 0199' },
      destination: { scope: 'international' },
      delivery: {
        method: 'delivery',
        country: 'Estados Unidos',
        city: 'Miami',
        addressLine: '100 Biscayne Boulevard',
        postalCode: '33132',
      },
      items: [{ productId: originalProduct.id, measure: originalProduct.measurements[0], quantity: 1 }],
    }),
  });
  const created = await createdResponse.json();
  assert.equal(createdResponse.status, 201);
  assert.equal(created.request.status, 'PENDING_REVIEW');
  assert.equal(created.request.adjustmentRate, 6);
  assert.match(created.whatsappUrl, /^https:\/\/wa\.me\//);
  assert.equal((await orderStore.list()).length, 0);
  assert.equal((await catalogRepository.findById(originalProduct.id)).stock, originalProduct.stock);

  const { cookie, csrfToken } = await login(baseUrl);
  const adminHeaders = { 'Content-Type': 'application/json', Cookie: cookie, 'x-querubim-csrf': csrfToken };
  const contentResponse = await fetch(`${baseUrl}/api/admin/site-content`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      hero: {
        imageUrl: 'https://pub.example.r2.dev/products/contenido-hero/portada.webp',
        imageAlt: 'Portada Querubim',
        eyebrow: 'Nueva colección',
        title: 'Brillo para siempre.',
        description: 'Una portada administrada desde el panel.',
      },
      campaign: {
        enabled: true,
        imageUrl: '',
        imageAlt: 'Campaña',
        eyebrow: 'Temporada',
        title: 'Celebra con Querubim.',
        description: 'Campaña comercial activa.',
        ctaLabel: 'Ver joyas',
        ctaUrl: '#coleccion',
      },
      premiumShowcase: { title: 'Premium', description: 'Selección premium', eyebrow: 'Querubim', imageAlt: '', imageUrl: '' },
      premiumHero: { title: 'Alta joyería', description: 'Colección especial', eyebrow: 'Premium', imageAlt: '', imageUrl: '' },
    }),
  });
  assert.equal(contentResponse.status, 200);
  const publicContent = await fetch(`${baseUrl}/api/site-content`).then((response) => response.json());
  assert.equal(publicContent.content.hero.title, 'Brillo para siempre.');
  assert.equal(publicContent.content.campaign.enabled, true);

  let dashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(dashboard.summary.pendingInternationalRequests, 1);
  assert.equal(dashboard.internationalRequests[0].id, created.request.id);

  const conditionsResponse = await fetch(`${baseUrl}/api/admin/international-requests/${created.request.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      carrier: 'DHL',
      shippingCost: 180000,
      estimatedDelivery: '8 a 12 días hábiles',
      paymentTerms: 'El transporte y los cargos aduaneros se pagan por separado.',
      internalNotes: 'Cliente atendido por WhatsApp.',
      agreed: true,
    }),
  });
  assert.equal(conditionsResponse.status, 200);
  assert.equal((await conditionsResponse.json()).request.status, 'CONDITIONS_SET');

  const paymentResponse = await fetch(`${baseUrl}/api/admin/international-requests/${created.request.id}/payment`, {
    method: 'POST',
    headers: adminHeaders,
  });
  const payment = await paymentResponse.json();
  assert.equal(paymentResponse.status, 201);
  assert.equal(payment.request.status, 'READY_FOR_PAYMENT');
  assert.match(payment.paymentUrl, /\/pago\/internacional\?solicitud=/);
  assert.equal((await orderStore.list()).length, 1);
  assert.equal((await catalogRepository.findById(originalProduct.id)).stock, originalProduct.stock - 1);

  const paymentUrl = new URL(payment.paymentUrl);
  const invalidCheckout = await fetch(`${baseUrl}/api/international-requests/${created.request.id}/checkout?token=incorrecto`);
  assert.equal(invalidCheckout.status, 403);
  const checkoutResponse = await fetch(
    `${baseUrl}/api/international-requests/${created.request.id}/checkout?token=${encodeURIComponent(paymentUrl.searchParams.get('token'))}`,
  );
  const checkout = await checkoutResponse.json();
  assert.equal(checkoutResponse.status, 200);
  assert.equal(checkout.payment.orderId, payment.request.paymentOrderId);
  assert.equal(JSON.stringify(checkout).includes('test-secret-not-public'), false);

  const event = {
    id: 'international-approved-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-INTERNATIONAL-1',
    data: {
      payment_id: 'BOLD-INTERNATIONAL-1',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: checkout.order.amount },
      metadata: { reference: checkout.order.id },
    },
  };
  const rawEvent = JSON.stringify(event);
  const webhook = await fetch(`${baseUrl}/api/payments/bold/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bold-signature': createWebhookSignature(Buffer.from(rawEvent), ''),
    },
    body: rawEvent,
  });
  assert.equal(webhook.status, 200);

  dashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(dashboard.internationalRequests[0].status, 'PAYMENT_CONFIRMED');
  assert.equal(dashboard.summary.pendingInternationalRequests, 0);
});
