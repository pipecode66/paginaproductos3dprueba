import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const orderResponse = await fetch(`${baseUrl}/api/payments/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { fullName: 'Prueba Visual', email: 'visual@example.com', phone: '3001234567' },
    items: [{ productId: 'dije-mano-sagrada', measure: 'Mini', quantity: 1 }],
  }),
});
if (!orderResponse.ok) throw new Error(`No fue posible crear la orden visual: ${orderResponse.status}`);
const { order } = await orderResponse.json();
const browser = await chromium.launch({ headless: true, executablePath });

try {
  await mkdir('test-results', { recursive: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${baseUrl}/pago/resultado?orden=${encodeURIComponent(order.id)}`, { waitUntil: 'domcontentloaded' });
  await desktop.locator('#payment-result-summary').waitFor();
  await desktop.screenshot({ path: 'test-results/payment-result-desktop.png', fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await mobile.locator('[data-open-product="dije-mano-sagrada"]').click();
  await mobile.locator('#detail-measure').selectOption('Mini');
  await mobile.locator('#detail-add-cart').click();
  await mobile.locator('#detail-close').click();
  await mobile.locator('#cart-button').click();
  await mobile.locator('#checkout-form').waitFor();
  const drawerBox = await mobile.locator('#selection-drawer').boundingBox();
  const hasHorizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await mobile.screenshot({ path: 'test-results/checkout-cart-mobile.png', fullPage: true });

  const result = {
    paymentResultVisible: await desktop.locator('#payment-result-title').isVisible(),
    cartFormVisible: await mobile.locator('#checkout-form').isVisible(),
    drawerInsideViewport: Boolean(drawerBox && drawerBox.x >= 0 && drawerBox.x + drawerBox.width <= 390),
    hasHorizontalOverflow,
  };
  console.log(JSON.stringify(result));
  if (!result.paymentResultVisible || !result.cartFormVisible || !result.drawerInsideViewport || result.hasHorizontalOverflow) {
    throw new Error('La verificación visual del flujo de pago no fue satisfactoria.');
  }
} finally {
  await browser.close();
}
