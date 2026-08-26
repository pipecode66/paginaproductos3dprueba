import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import dotenv from 'dotenv';
import { createWebhookSignature } from '../server/bold.js';

dotenv.config({ path: '.env.local' });

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env.local.');
const catalogResponse = await fetch(`${baseUrl}/api/catalog/payment-products`);
const catalog = await catalogResponse.json();
const availableProduct = catalog.products?.find((product) => product.stock > 0 && product.measurements?.length);
if (!availableProduct) throw new Error('No hay un producto con inventario disponible para verificar el panel.');
const orderResponse = await fetch(`${baseUrl}/api/payments/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { fullName: 'Cliente Gestión', email: 'gestion@example.com', phone: '3001234567' },
    delivery: { method: 'pickup' },
    destination: { scope: 'national' },
    items: [{ productId: availableProduct.id, measure: availableProduct.measurements[0], quantity: 1 }],
  }),
});
if (!orderResponse.ok) throw new Error(`No fue posible crear la orden administrativa: ${orderResponse.status}`);
const { order } = await orderResponse.json();
const event = {
  id: `admin-ui-approved-${Date.now()}`,
  type: 'SALE_APPROVED',
  subject: `BOLD-ADMIN-UI-${Date.now()}`,
  data: {
    payment_id: `BOLD-ADMIN-UI-${Date.now()}`,
    payment_method: 'CARD_WEB',
    amount: { currency: 'COP', total: order.amount },
    metadata: { reference: order.id },
  },
};
const rawEvent = JSON.stringify(event);
const webhookResponse = await fetch(`${baseUrl}/api/payments/bold/webhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-bold-signature': createWebhookSignature(Buffer.from(rawEvent), ''),
  },
  body: rawEvent,
});
if (!webhookResponse.ok) throw new Error(`No fue posible aprobar la orden administrativa: ${webhookResponse.status}`);
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const browserErrors = [];
const commercialImageUrl = 'https://media.example/products/contenido/portada-prueba.png';
const productImageUrls = [
  'https://media.example/products/prueba-panel/imagen-prueba-01.png',
  'https://media.example/products/prueba-panel/imagen-prueba-02.png',
  'https://media.example/products/prueba-panel/imagen-prueba-03.png',
];
let productUploadIndex = 0;
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const internationalRequest = {
  id: 'QBI-UI-001',
  status: 'PENDING_REVIEW',
  customer: { fullName: 'Cliente Exterior', email: 'exterior@example.com', phone: '+1 305 555 0199' },
  delivery: {
    method: 'delivery',
    address: { country: 'Estados Unidos', city: 'Miami', addressLine: '100 Biscayne Boulevard', postalCode: '33132' },
  },
  items: [{ name: 'Joya internacional', measure: 'Medida única', subtotal: 840000 }],
  amount: 890400,
  createdAt: '2026-08-12T15:00:00.000Z',
};

function isDevelopmentSocketMessage(message) {
  return /vite|WebSocket|localhost:24678|Failed to send error to Vite server/i.test(message);
}

page.on('console', (message) => {
  if (message.type() === 'error' && !isDevelopmentSocketMessage(message.text())) {
    browserErrors.push(message.text().slice(0, 300));
  }
});
page.on('pageerror', (error) => {
  if (!isDevelopmentSocketMessage(error.message)) browserErrors.push(error.message.slice(0, 300));
});

await page.route('**/api/admin/dashboard', async (route) => {
  const response = await route.fetch();
  const dashboard = await response.json();
  const headers = response.headers();
  delete headers['content-length'];
  await route.fulfill({
    status: response.status(),
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      ...dashboard,
      internationalRequests: [internationalRequest, ...(dashboard.internationalRequests || [])],
      summary: { ...dashboard.summary, pendingInternationalRequests: 1 },
      storage: {
        configured: true,
        publicUrl: 'https://media.example',
        maxImageSize: 8 * 1024 * 1024,
        acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
      },
    }),
  });
});
await page.route('**/api/admin/uploads/presign', async (route) => {
  const payload = route.request().postDataJSON();
  const publicUrl = String(payload.productId || '').startsWith('contenido-')
    ? commercialImageUrl
    : productImageUrls[Math.min(productUploadIndex++, productImageUrls.length - 1)];
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      upload: {
        uploadUrl: 'https://upload.example/signed-image',
        publicUrl,
        contentType: 'image/png',
        expiresIn: 300,
      },
    }),
  });
});
await page.route('**/api/admin/uploads', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ deleted: { publicUrl: route.request().postDataJSON()?.publicUrl || '' } }),
  });
});
await page.route('https://upload.example/**', async (route) => route.fulfill({ status: 200, body: '' }));
await page.route('https://media.example/**', async (route) =>
  route.fulfill({ status: 200, contentType: 'image/png', body: tinyPng }),
);

try {
  await mkdir('test-results', { recursive: true });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  await page.locator('#admin-email').fill(adminEmail);
  await page.locator('#admin-password').fill(adminPassword);
  await page.locator('#admin-login-form button[type="submit"]').click();
  await page.locator('#admin-panel-view:not([hidden])').waitFor();
  await page.locator('#admin-stats .admin-stat').first().waitFor();
  await page.locator('#admin-overview-charts .admin-chart-panel').first().waitFor();
  await page.waitForFunction(() => Number(document.querySelector('#admin-nav-orders-count')?.textContent || 0) > 0);
  const adminButtonVisuals = await page.evaluate(() => {
    const background = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
    return {
      pdf: background('#admin-export-catalog-pdf'),
      secondary: background('#admin-reset-catalog'),
      changeImage: background('[data-content-slot="hero"] .button-success'),
      removeImage: background('[data-content-remove="hero"]'),
      closeDialog: background('#admin-order-close'),
      cancelRequest: background('#admin-international-cancel'),
      pdfIconVisible: Boolean(document.querySelector('#admin-export-catalog-pdf svg')),
    };
  });
  const adminButtonColorsVerified =
    adminButtonVisuals.pdf === 'rgb(123, 90, 38)'
    && adminButtonVisuals.secondary === 'rgb(123, 90, 38)'
    && adminButtonVisuals.changeImage === 'rgb(36, 109, 80)'
    && adminButtonVisuals.removeImage === 'rgb(126, 38, 55)'
    && adminButtonVisuals.closeDialog === 'rgb(126, 38, 55)'
    && adminButtonVisuals.cancelRequest === 'rgb(126, 38, 55)'
    && adminButtonVisuals.pdfIconVisible;
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#admin-export-catalog').click();
  const catalogDownload = await downloadPromise;
  const excelExportVerified = catalogDownload.suggestedFilename().endsWith('.xlsx');
  const pdfDownloadPromise = page.waitForEvent('download');
  await page.locator('#admin-export-catalog-pdf').click();
  const pdfDownload = await pdfDownloadPromise;
  const pdfExportVerified = pdfDownload.suggestedFilename().endsWith('.pdf');
  await page.screenshot({ path: 'test-results/admin-dashboard-desktop.png', fullPage: true });

  await page.locator('[data-admin-view-target="content"]').click();
  await page.locator('.admin-commercial-panel').waitFor();
  const commercialSlotCount = await page.locator('.admin-commercial-slot').count();
  await page.locator('[data-content-upload="hero"]').setInputFiles({
    name: 'portada-prueba.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });
  await page.locator('[data-content-preview="hero"] img').waitFor();
  const commercialUploadVerified = (await page.locator('[data-content-field="hero.imageUrl"]').inputValue()) === commercialImageUrl;
  await page.locator('[data-content-remove="hero"]').click();
  await page.locator('[data-admin-view-target="international"]').click();
  await page.locator(`[data-admin-international="${internationalRequest.id}"]`).click();
  await page.locator('#admin-international-dialog[open]').waitFor();
  const internationalDialogVisible = await page.locator('#admin-international-dialog[open]').isVisible();
  await page.screenshot({ path: 'test-results/admin-international-desktop.png' });
  await page.locator('#admin-international-close').click();

  await page.locator('[data-admin-view-target="products"]').click();
  await page.getByText('Arrastra imágenes o selecciónalas').waitFor();
  await page.locator('#admin-image-files').setInputFiles({
    name: 'imagen-prueba.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });
  await page.waitForTimeout(1200);
  const uploadMessage = (await page.locator('#admin-form-message').textContent()).trim();
  if (uploadMessage !== '1 imagen fue cargada correctamente. Guarda el producto para publicarla.') {
    const storageState = await page.evaluate(() =>
      fetch('/api/admin/dashboard').then((response) => response.json()).then((result) => result.storage),
    );
    const dropTitle = (await page.locator('#admin-image-drop-title').textContent()).trim();
    throw new Error(
      `La carga visual no terminó correctamente: ${uploadMessage}. Estado: ${JSON.stringify(storageState)}. Control: ${dropTitle}`,
    );
  }
  const uploadVerified = (await page.locator('#admin-images').inputValue()) === productImageUrls[0];
  await page.locator('[data-admin-image-remove="0"]').click();
  await page.locator('.admin-image-preview > p').waitFor();

  await page.locator('[data-admin-view-target="orders"]').click();
  await page.locator(`[data-admin-order="${order.id}"]`).click();
  await page.locator('#admin-order-dialog[open]').waitFor();
  await page.locator('#admin-order-status').selectOption('PREPARING');
  await page.locator('#admin-order-carrier').fill('Transportadora de prueba');
  await page.locator('#admin-order-tracking').fill('GUIA-UI-001');
  await page.locator('#admin-order-notes').fill('Empaque de regalo confirmado.');
  await page.locator('#admin-order-form button[type="submit"]').click();
  await page.getByText('Seguimiento actualizado correctamente.').waitFor();
  await page.screenshot({ path: 'test-results/admin-order-detail-desktop.png' });
  await page.locator('#admin-order-close').click();

  await page.locator('[data-admin-view-target="products"]').click();
  const productName = `Producto UI ${Date.now()}`;
  await page.locator('#admin-name').fill(productName);
  await page.locator('#admin-category').selectOption('anillos');
  await page.locator('#admin-price').fill('875000');
  await page.locator('#admin-stock').fill('2');
  await page.locator('#admin-material').fill('Oro amarillo 18K');
  await page.locator('#admin-image-files').setInputFiles([
    { name: 'imagen-producto-02.png', mimeType: 'image/png', buffer: tinyPng },
    { name: 'imagen-producto-03.png', mimeType: 'image/png', buffer: tinyPng },
  ]);
  await page.getByText('2 imágenes fueron cargadas correctamente. Guarda el producto para publicarlas.').waitFor();
  await page.locator('[data-admin-image-move="0"][data-direction="1"]').click();
  const imageOrderVerified = (await page.locator('#admin-images').inputValue()).startsWith(productImageUrls[2]);
  await page.locator('#admin-measurement-entry').fill('Talla 6');
  await page.locator('#admin-measurement-add').click();
  await page.locator('#admin-measurement-entry').fill('Talla 7');
  await page.locator('#admin-measurement-add').click();
  await page.locator('[data-admin-measurement-index="1"]').fill('Talla 8');
  await page.locator('[data-admin-measurement-index="1"]').blur();
  const measurementsVerified = (await page.locator('#admin-measurements').inputValue()) === 'Talla 6, Talla 8';
  await page.locator('#admin-description').fill('Producto temporal para comprobar el panel administrativo.');
  await page.screenshot({ path: 'test-results/admin-product-editor-desktop.png', fullPage: true });
  await page.locator('#admin-product-form button[type="submit"]').click();
  await page.getByText('Producto guardado en el catálogo y conectado con pagos.').waitFor();
  await page.locator('#admin-product-search').fill(productName);
  await page.locator('#admin-product-category-filter').selectOption('anillos');
  await page.locator('.admin-product-item').filter({ hasText: productName }).waitFor();
  await page.screenshot({ path: 'test-results/admin-panel-desktop.png', fullPage: true });

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.admin-product-item').filter({ hasText: productName }).locator('[data-admin-delete]').click();
  await page.locator('.admin-product-item').filter({ hasText: productName }).waitFor({ state: 'detached' });

  await page.locator('#admin-product-search').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#admin-panel-view:not([hidden])').waitFor();
  await page.locator('#admin-sidebar-toggle').click();
  await page.locator('#admin-app-sidebar.open [data-admin-view-target="overview"]').click();
  await page.locator('[data-admin-view="overview"].active').waitFor();
  await page.locator('[data-admin-view-target="overview"].active').waitFor();
  await page.locator('#admin-app-sidebar:not(.open)').waitFor();
  await page.waitForTimeout(280);
  await page.screenshot({ path: 'test-results/admin-dashboard-mobile.png' });
  await page.locator('#admin-sidebar-toggle').click();
  await page.locator('#admin-app-sidebar.open [data-admin-view-target="orders"]').click();
  await page.locator(`[data-admin-order="${order.id}"]`).click();
  await page.locator('#admin-order-dialog[open]').waitFor();
  const dialogBox = await page.locator('#admin-order-dialog').boundingBox();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.screenshot({ path: 'test-results/admin-order-detail-mobile.png' });
  const orderUpdated = (await page.locator('#admin-order-status').inputValue()) === 'PREPARING';
  await page.locator('#admin-order-status').selectOption('READY');
  await page.locator('#admin-order-form button[type="submit"]').click();
  await page.getByText('Seguimiento actualizado correctamente.').waitFor();
  await page.locator('#admin-order-status').selectOption('DELIVERED');
  await page.locator('#admin-order-form button[type="submit"]').click();
  await page.getByText('Seguimiento actualizado correctamente.').waitFor();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#admin-order-delete:not(:disabled)').click();
  await page.locator('#admin-order-dialog').waitFor({ state: 'hidden' });
  const orderDeleteVerified = (await page.locator(`[data-admin-order="${order.id}"]`).count()) === 0;

  const result = {
    authenticated: await page.locator('#admin-panel-view:not([hidden])').isVisible(),
    statCount: await page.locator('#admin-stats .admin-stat').count(),
    productCount: await page.locator('#admin-product-list .admin-product-item').count(),
    orderUpdated,
    orderDeleteVerified,
    uploadVerified,
    imageOrderVerified,
    measurementsVerified,
    excelExportVerified,
    pdfExportVerified,
    commercialSlotCount,
    commercialUploadVerified,
    internationalDialogVisible,
    adminButtonColorsVerified,
    adminButtonVisuals,
    dialogInsideViewport: Boolean(dialogBox && dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= 390),
    hasHorizontalOverflow,
    browserErrors,
  };
  console.log(JSON.stringify(result));
  if (!result.authenticated || result.statCount !== 4 || result.productCount < 1 || !result.orderUpdated || !result.orderDeleteVerified || !result.uploadVerified || !result.imageOrderVerified || !result.measurementsVerified || !result.excelExportVerified || !result.pdfExportVerified || result.commercialSlotCount !== 4 || !result.commercialUploadVerified || !result.internationalDialogVisible || !result.adminButtonColorsVerified || !result.dialogInsideViewport || hasHorizontalOverflow || browserErrors.length) {
    throw new Error('La verificación visual del panel administrativo no fue satisfactoria.');
  }
} finally {
  await browser.close();
}
