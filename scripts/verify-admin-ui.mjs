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
const orderResponse = await fetch(`${baseUrl}/api/payments/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { fullName: 'Cliente Gestión', email: 'gestion@example.com', phone: '3001234567' },
    items: [{ productId: 'dije-mano-sagrada', measure: 'Mini', quantity: 1 }],
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

page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(message.text().slice(0, 300));
});
page.on('pageerror', (error) => browserErrors.push(error.message.slice(0, 300)));

try {
  await mkdir('test-results', { recursive: true });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  await page.locator('#admin-email').fill(adminEmail);
  await page.locator('#admin-password').fill(adminPassword);
  await page.locator('#admin-login-form button[type="submit"]').click();
  await page.locator('#admin-panel-view:not([hidden])').waitFor();
  await page.locator('#admin-stats .admin-stat').first().waitFor();

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

  const productName = `Producto UI ${Date.now()}`;
  await page.locator('#admin-name').fill(productName);
  await page.locator('#admin-category').selectOption('anillos');
  await page.locator('#admin-price').fill('875000');
  await page.locator('#admin-stock').fill('2');
  await page.locator('#admin-material').fill('Oro amarillo 18K');
  await page.locator('#admin-images').fill('/products/catalogo-real/anillos/anillos-01.jpg');
  await page.locator('#admin-measurements').fill('Talla 6, Talla 7');
  await page.locator('#admin-description').fill('Producto temporal para comprobar el panel administrativo.');
  await page.locator('#admin-product-form button[type="submit"]').click();
  await page.getByText('Producto guardado en el catálogo y conectado con pagos.').waitFor();
  await page.locator('#admin-product-search').fill(productName);
  await page.locator('.admin-product-item').filter({ hasText: productName }).waitFor();
  await page.screenshot({ path: 'test-results/admin-panel-desktop.png', fullPage: true });

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.admin-product-item').filter({ hasText: productName }).locator('[data-admin-delete]').click();
  await page.locator('.admin-product-item').filter({ hasText: productName }).waitFor({ state: 'detached' });

  await page.locator('#admin-product-search').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#admin-panel-view:not([hidden])').waitFor();
  await page.locator(`[data-admin-order="${order.id}"]`).click();
  await page.locator('#admin-order-dialog[open]').waitFor();
  const dialogBox = await page.locator('#admin-order-dialog').boundingBox();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.screenshot({ path: 'test-results/admin-order-detail-mobile.png' });

  const result = {
    authenticated: await page.locator('#admin-panel-view:not([hidden])').isVisible(),
    statCount: await page.locator('#admin-stats .admin-stat').count(),
    productCount: await page.locator('#admin-product-list .admin-product-item').count(),
    orderUpdated: (await page.locator('#admin-order-status').inputValue()) === 'PREPARING',
    dialogInsideViewport: Boolean(dialogBox && dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= 390),
    hasHorizontalOverflow,
    browserErrors,
  };
  console.log(JSON.stringify(result));
  if (!result.authenticated || result.statCount < 6 || result.productCount < 1 || !result.orderUpdated || !result.dialogInsideViewport || hasHorizontalOverflow || browserErrors.length) {
    throw new Error('La verificación visual del panel administrativo no fue satisfactoria.');
  }
} finally {
  await browser.close();
}
