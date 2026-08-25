import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../server/app.js';
import { createWebhookSignature } from '../server/bold.js';
import { CatalogRepository } from '../server/catalog-repository.js';
import { OrderStore } from '../server/order-store.js';

const adminProduct = {
  id: 'anillo-panel-prueba',
  name: 'Anillo Panel Prueba',
  category: 'anillos',
  material: 'Oro amarillo 18K',
  price: 990000,
  stock: 3,
  measurements: ['Talla 6', 'Talla 7'],
  images: ['/products/catalogo-real/anillos/anillos-01.jpg'],
  description: 'Producto creado desde la API administrativa para validar su persistencia.',
  variants: {
    metal: 'Oro amarillo',
    purity: '18K',
    gemstone: 'Sin piedra principal',
    engraving: 'Disponible bajo solicitud',
  },
  premium: false,
  featured: true,
};

async function createAdminServer(context) {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-admin-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const catalogRepository = new CatalogRepository(path.join(runtimeDir, 'catalog.json'));
  const orderStore = new OrderStore(path.join(runtimeDir, 'orders.json'));
  await orderStore.create({
    id: 'QBM-ADMIN-001',
    status: 'PAID',
    amount: 990000,
    customer: { fullName: 'Cliente Panel', email: 'panel@example.com', phone: '3001234567' },
    items: [{ name: 'Anillo Panel Prueba', quantity: 1 }],
    createdAt: '2026-08-10T12:00:00.000Z',
  });
  const config = {
    runtimeDir,
    bold: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'test-secret',
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
    status: () => ({
      configured: true,
      publicUrl: 'https://pub.example.r2.dev',
      maxImageSize: 8 * 1024 * 1024,
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    }),
    createPresignedUpload: async ({ productId, contentType, size }) => ({
      key: `products/${productId}/test-image.jpg`,
      uploadUrl: 'https://upload.example/signed',
      publicUrl: `https://pub.example.r2.dev/products/${productId}/test-image.jpg`,
      expiresIn: 300,
      contentType,
      size,
    }),
    deletePublicObject: async (publicUrl) => ({ key: 'products/test-image.jpg', publicUrl }),
  };
  const { app } = createApp({ config, catalogRepository, orderStore, r2Storage, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('protege el panel y permite administrar el catálogo con una sesión válida', async (context) => {
  const baseUrl = await createAdminServer(context);

  const denied = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(denied.status, 401);

  const invalidLogin = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@querubim.co', password: 'incorrecta' }),
  });
  assert.equal(invalidLogin.status, 401);

  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@querubim.co', password: 'correct-password' }),
  });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /Max-Age=900/);
  const cookie = setCookie.split(';')[0];
  assert.match(cookie, /^querubim_admin_session=/);

  const adminHeaders = {
    'Content-Type': 'application/json',
    Cookie: cookie,
    'x-querubim-admin': '1',
  };
  const dashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } });
  const dashboardData = await dashboard.json();
  assert.equal(dashboard.status, 200);
  assert.equal(dashboardData.summary.orders, 1);
  assert.equal(dashboardData.summary.paidRevenue, 990000);
  assert.equal(dashboardData.storage.configured, true);

  const excel = await fetch(`${baseUrl}/api/admin/catalog/export`, { headers: { Cookie: cookie } });
  const excelBytes = Buffer.from(await excel.arrayBuffer());
  assert.equal(excel.status, 200);
  assert.match(excel.headers.get('content-type'), /spreadsheetml/);
  assert.equal(excelBytes.subarray(0, 2).toString(), 'PK');

  const pdf = await fetch(`${baseUrl}/api/admin/catalog/export/pdf`, { headers: { Cookie: cookie } });
  const pdfBytes = Buffer.from(await pdf.arrayBuffer());
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get('content-type'), /application\/pdf/);
  assert.equal(pdfBytes.subarray(0, 5).toString(), '%PDF-');

  const storageHealth = await fetch(`${baseUrl}/api/storage/health`).then((response) => response.json());
  assert.equal(storageHealth.configured, true);

  const presigned = await fetch(`${baseUrl}/api/admin/uploads/presign`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      productId: adminProduct.id,
      fileName: 'anillo.jpg',
      contentType: 'image/jpeg',
      size: 2048,
    }),
  });
  const presignedData = await presigned.json();
  assert.equal(presigned.status, 201);
  assert.equal(
    presignedData.upload.publicUrl,
    `https://pub.example.r2.dev/products/${adminProduct.id}/test-image.jpg`,
  );

  const deletedUpload = await fetch(`${baseUrl}/api/admin/uploads`, {
    method: 'DELETE',
    headers: adminHeaders,
    body: JSON.stringify({ publicUrl: presignedData.upload.publicUrl }),
  });
  assert.equal(deletedUpload.status, 200);
  assert.equal((await deletedUpload.json()).deleted.publicUrl, presignedData.upload.publicUrl);

  const created = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(adminProduct),
  });
  assert.equal(created.status, 201);

  const tooManyImages = await fetch(`${baseUrl}/api/admin/products/${adminProduct.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      ...adminProduct,
      images: Array.from({ length: 5 }, (_, index) => `https://pub.example.r2.dev/products/${adminProduct.id}/${index + 1}.jpg`),
    }),
  });
  assert.equal(tooManyImages.status, 400);
  assert.equal((await tooManyImages.json()).code, 'TOO_MANY_IMAGES');

  const updated = await fetch(`${baseUrl}/api/admin/products/${adminProduct.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ ...adminProduct, price: 1050000, stock: 7 }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).product.price, 1050000);

  let publicCatalog = await fetch(`${baseUrl}/api/catalog/products`).then((response) => response.json());
  assert.equal(publicCatalog.products.find((product) => product.id === adminProduct.id).stock, 7);

  const paymentOrder = await fetch(`${baseUrl}/api/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Compra desde panel', email: 'compra@example.com', phone: '3007654321' },
      delivery: { method: 'pickup' },
      destination: { scope: 'national' },
      items: [{ productId: adminProduct.id, measure: 'Talla 6', quantity: 1 }],
    }),
  });
  const paymentOrderData = await paymentOrder.json();
  assert.equal(paymentOrder.status, 201);
  assert.equal(paymentOrderData.order.amount, 1102500);

  const blockedPreparation = await fetch(`${baseUrl}/api/admin/orders/${paymentOrderData.order.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ fulfillmentStatus: 'CONFIRMED' }),
  });
  assert.equal(blockedPreparation.status, 409);
  assert.equal((await blockedPreparation.json()).code, 'PAYMENT_NOT_APPROVED');

  const event = {
    id: 'admin-order-approved-1',
    type: 'SALE_APPROVED',
    subject: 'BOLD-ADMIN-PAYMENT-1',
    data: {
      payment_id: 'BOLD-ADMIN-PAYMENT-1',
      payment_method: 'CARD_WEB',
      amount: { currency: 'COP', total: 1102500 },
      metadata: { reference: paymentOrderData.order.id },
    },
  };
  const rawEvent = JSON.stringify(event);
  const approved = await fetch(`${baseUrl}/api/payments/bold/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bold-signature': createWebhookSignature(Buffer.from(rawEvent), ''),
    },
    body: rawEvent,
  });
  assert.equal(approved.status, 200);

  const managed = await fetch(`${baseUrl}/api/admin/orders/${paymentOrderData.order.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      fulfillmentStatus: 'PREPARING',
      internalNotes: 'Empaque de regalo solicitado.',
      shippingCarrier: 'Transportadora de prueba',
      trackingNumber: 'GUIA-001',
    }),
  });
  const managedData = await managed.json();
  assert.equal(managed.status, 200);
  assert.equal(managedData.order.status, 'PAID');
  assert.equal(managedData.order.fulfillmentStatus, 'PREPARING');
  assert.equal(managedData.order.internalNotes, 'Empaque de regalo solicitado.');

  const ready = await fetch(`${baseUrl}/api/admin/orders/${paymentOrderData.order.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ fulfillmentStatus: 'READY', internalNotes: 'Pedido terminado.' }),
  });
  assert.equal(ready.status, 200);
  const delivered = await fetch(`${baseUrl}/api/admin/orders/${paymentOrderData.order.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ fulfillmentStatus: 'DELIVERED', internalNotes: 'Entregado al cliente.' }),
  });
  assert.equal(delivered.status, 200);
  const deletedOrder = await fetch(`${baseUrl}/api/admin/orders/${paymentOrderData.order.id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert.equal(deletedOrder.status, 200);
  const dashboardAfterDelete = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(dashboardAfterDelete.orders.some((order) => order.id === paymentOrderData.order.id), false);

  const removed = await fetch(`${baseUrl}/api/admin/products/${adminProduct.id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert.equal(removed.status, 200);

  publicCatalog = await fetch(`${baseUrl}/api/catalog/products`).then((response) => response.json());
  assert.equal(publicCatalog.products.some((product) => product.id === adminProduct.id), false);
});

test('rechaza modificaciones administrativas sin el encabezado de verificación', async (context) => {
  const baseUrl = await createAdminServer(context);
  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@querubim.co', password: 'correct-password' }),
  });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const response = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(adminProduct),
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, 'ADMIN_REQUEST_REJECTED');
});
