import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const catalogResponse = await fetch(`${baseUrl}/api/catalog/products`);
const catalog = await catalogResponse.json();
const availableProduct = catalog.products?.find((product) => !product.premium && product.stock > 0 && product.measurements?.length);
if (!availableProduct) throw new Error('No hay un producto con inventario disponible para verificar el pago.');
const orderResponse = await fetch(`${baseUrl}/api/payments/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { fullName: 'Prueba Visual', email: 'visual@example.com', phone: '3001234567' },
    delivery: { method: 'pickup' },
    destination: { scope: 'national' },
    items: [{ productId: availableProduct.id, measure: availableProduct.measurements[0], quantity: 1 }],
  }),
});
if (!orderResponse.ok) throw new Error(`No fue posible crear la orden visual: ${orderResponse.status}`);
const orderResult = await orderResponse.json();
const { order } = orderResult;
const browser = await chromium.launch({ headless: true, executablePath });

try {
  await mkdir('test-results', { recursive: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${baseUrl}/pago/resultado?orden=${encodeURIComponent(order.id)}`, { waitUntil: 'domcontentloaded' });
  await desktop.locator('#payment-result-summary').waitFor();
  await desktop.screenshot({ path: 'test-results/payment-result-desktop.png', fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  const catalogCategoryScroll = await mobile.locator('#category-filters').evaluate((element) => ({
    horizontal: element.scrollWidth > element.clientWidth,
    overflowX: getComputedStyle(element).overflowX,
  }));
  await mobile.locator('#category-filters').scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(150);
  await mobile.screenshot({ path: 'test-results/catalog-categories-mobile.png' });
  await mobile.locator(`[data-open-product="${availableProduct.id}"]`).click();
  const detailScroll = await mobile.locator('#product-detail-panel').evaluate((element) => ({
    vertical: element.scrollHeight > element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrollbarWidth: getComputedStyle(element).scrollbarWidth,
  }));
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: 'test-results/product-detail-mobile.png' });
  await mobile.locator('#product-detail-panel').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await mobile.waitForTimeout(150);
  await mobile.screenshot({ path: 'test-results/product-detail-mobile-bottom.png' });
  await mobile.locator('#detail-measure').selectOption(availableProduct.measurements[0]);
  await mobile.locator('#detail-add-cart').click();
  await mobile.locator('#detail-close').click();
  await mobile.locator('#cart-button').click();
  await mobile.locator('#checkout-form').waitFor();
  const cartScroll = await mobile.locator('#selection-drawer').evaluate((element) => ({
    vertical: element.scrollHeight > element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrollbarWidth: getComputedStyle(element).scrollbarWidth,
  }));
  await mobile.locator('#checkout-delivery-method').selectOption('pickup');
  await mobile.locator('#selection-drawer').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await mobile.waitForTimeout(200);
  await mobile.screenshot({ path: 'test-results/checkout-cart-bold-mobile.png' });
  await mobile.locator('#checkout-delivery-method').selectOption('delivery');
  const nationalAdjustment = await mobile.locator('#checkout-adjustment-label').textContent();
  const nationalTotal = await mobile.locator('#checkout-total').textContent();
  await mobile.locator('#checkout-destination').selectOption('international');
  await mobile.locator('#checkout-country').fill('Estados Unidos');
  await mobile.locator('#checkout-city').fill('Miami');
  await mobile.locator('#checkout-address').fill('1000 Brickell Avenue');
  const shippingNoticeVisible = await mobile.locator('.checkout-shipping-note').isVisible();
  const shippingNotice = await mobile.locator('#checkout-total-note').textContent();
  const internationalAdjustment = await mobile.locator('#checkout-adjustment-label').textContent();
  const internationalTotal = await mobile.locator('#checkout-total').textContent();
  const internationalAction = await mobile.locator('#checkout-pay-label').textContent();
  const quoteHref = await mobile.locator('#checkout-quote-button').getAttribute('href');
  const drawerBox = await mobile.locator('#selection-drawer').boundingBox();
  const hasHorizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await mobile.locator('#selection-drawer').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: 'test-results/checkout-cart-mobile.png' });

  const premium = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await premium.goto(`${baseUrl}/premium`, { waitUntil: 'domcontentloaded' });
  const premiumCategoryScroll = await premium.locator('#premium-category-filters').evaluate((element) => ({
    horizontal: element.scrollWidth > element.clientWidth,
    overflowX: getComputedStyle(element).overflowX,
  }));
  await premium.locator('#premium-category-filters').scrollIntoViewIfNeeded();
  await premium.waitForTimeout(150);
  await premium.screenshot({ path: 'test-results/premium-categories-mobile.png' });

  const internationalPayment = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await internationalPayment.route('**/api/international-requests/QBI-UI-PAY/checkout?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(orderResult),
    });
  });
  await internationalPayment.goto(`${baseUrl}/pago/internacional?solicitud=QBI-UI-PAY&token=token-seguro`, { waitUntil: 'domcontentloaded' });
  await internationalPayment.locator('#international-payment-open:not([disabled])').waitFor();
  await internationalPayment.screenshot({ path: 'test-results/international-payment-desktop.png', fullPage: true });

  const result = {
    paymentResultVisible: await desktop.locator('#payment-result-title').isVisible(),
    cartFormVisible: await mobile.locator('#checkout-form').isVisible(),
    drawerInsideViewport: Boolean(drawerBox && drawerBox.x >= 0 && drawerBox.x + drawerBox.width <= 390),
    hasHorizontalOverflow,
    nationalAdjustmentApplied: /5\s*%/.test(nationalAdjustment || ''),
    internationalAdjustmentApplied:
      /6\s*%/.test(internationalAdjustment || '') && internationalTotal !== nationalTotal,
    internationalCoordinationVisible:
      shippingNoticeVisible && /envío internacional se cotiza y acuerda por separado/i.test(shippingNotice || '')
      && /coordinar envío internacional/i.test(internationalAction || ''),
    internationalPaymentVisible: await internationalPayment.locator('#international-payment-open').isVisible(),
    catalogCategoryScrollable: catalogCategoryScroll.horizontal && catalogCategoryScroll.overflowX === 'auto',
    premiumCategoryScrollable: premiumCategoryScroll.horizontal && premiumCategoryScroll.overflowX === 'auto',
    detailScrollable: detailScroll.vertical && detailScroll.overflowY === 'auto' && detailScroll.scrollbarWidth !== 'none',
    cartScrollable: cartScroll.vertical && cartScroll.overflowY === 'auto' && cartScroll.scrollbarWidth !== 'none',
    customQuoteVisible: /^https:\/\/wa\.me\//.test(quoteHref || ''),
  };
  console.log(JSON.stringify(result));
  if (
    !result.paymentResultVisible ||
    !result.cartFormVisible ||
    !result.drawerInsideViewport ||
    result.hasHorizontalOverflow ||
    !result.nationalAdjustmentApplied ||
    !result.internationalAdjustmentApplied ||
    !result.internationalCoordinationVisible
    || !result.internationalPaymentVisible
    || !result.catalogCategoryScrollable
    || !result.premiumCategoryScrollable
    || !result.detailScrollable
    || !result.cartScrollable
    || !result.customQuoteVisible
  ) {
    throw new Error('La verificación visual del flujo de pago no fue satisfactoria.');
  }
} finally {
  await browser.close();
}
