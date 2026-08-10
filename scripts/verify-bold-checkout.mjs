import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const orderResponses = [];
const browserErrors = [];
const failedResponses = [];
const completePayment = process.argv.includes('--complete');

page.on('response', (response) => {
  if (response.url().includes('/api/payments/orders') && response.request().method() === 'POST') {
    orderResponses.push(response.status());
  }
  if (response.status() >= 400) {
    const url = new URL(response.url());
    failedResponses.push({ status: response.status(), host: url.hostname, path: url.pathname });
  }
});
page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(message.text().slice(0, 300));
});
page.on('pageerror', (error) => browserErrors.push(error.message.slice(0, 300)));

try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-open-product="dije-mano-sagrada"]').waitFor();
  await page.locator('[data-open-product="dije-mano-sagrada"]').click();
  await page.locator('#detail-measure').selectOption('Mini');
  await page.locator('#detail-add-cart').click();
  await page.locator('#detail-close').click();
  await page.locator('#cart-button').click();
  await page.locator('#checkout-name').fill('Prueba Integración');
  await page.locator('#checkout-email').fill('prueba@example.com');
  await page.locator('#checkout-phone').fill('3001234567');
  await page.locator('#checkout-pay-button').click();
  await page.waitForFunction(() => typeof window.BoldCheckout === 'function', null, { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(5_000);

  const frameUrls = page.frames().map((frame) => frame.url()).filter((url) => url && url !== page.url());
  const checkoutFrame = page.frames().find((frame) => frame.url().startsWith('https://checkout.bold.co'));
  if (checkoutFrame) {
    const cardMethod = checkoutFrame.locator('input[name="CREDIT_CARD"]');
    if (await cardMethod.count()) {
      await cardMethod.evaluate((element) => element.click());
      const continueButton = checkoutFrame.locator('button').filter({ hasText: 'Pago con tarjeta' }).first();
      await continueButton.click();
      await page.waitForTimeout(5_000);
      if (completePayment) {
        await checkoutFrame.locator('input[name="phone"]').fill('3001234567');
        await checkoutFrame.locator('input[name="email"]').fill('prueba@example.com');
        await checkoutFrame.locator('input[name="cardNumber"]').fill('4111111111111111');
        await checkoutFrame.locator('input[name="cardDate"]').fill('1230');
        await checkoutFrame.locator('input[name="cardCVC"]').fill('123');
        await checkoutFrame.locator('input[name="name"]').fill('PRUEBA BOLD');
        const checkboxes = checkoutFrame.locator('input[type="checkbox"]');
        for (let index = 0; index < await checkboxes.count(); index += 1) {
          await checkboxes.nth(index).evaluate((element) => element.click());
        }
        const payButton = checkoutFrame.getByRole('button', { name: /^Pagar/ }).last();
        await payButton.evaluate((element) => element.click());
        await page.waitForTimeout(15_000);
      }
    }
  }
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/bold-embedded-checkout.png', fullPage: true });
  const checkoutText = checkoutFrame
    ? (await checkoutFrame.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    : '';
  const message = await page.locator('#checkout-message').textContent();
  const result = {
    orderRequestStatus: orderResponses.at(-1) ?? null,
    completePayment,
    boldLibraryLoaded: await page.evaluate(() => typeof window.BoldCheckout === 'function'),
    embeddedFrameDetected: frameUrls.some((url) => /bold\.co|checkout/i.test(url)),
    frameCount: frameUrls.length,
    checkoutReady: /Modo de pruebas/.test(checkoutText) && !/Algo salió mal/.test(checkoutText),
    paymentApproved: /Completaste el pago/.test(checkoutText),
    checkoutSummary: checkoutText.slice(0, 500),
    browserErrors: browserErrors.filter((message) => !/Permissions policy violation/.test(message)),
    failedResponses,
    checkoutMessage: message?.trim() || null,
    screenshot: 'test-results/bold-embedded-checkout.png',
  };

  console.log(JSON.stringify(result));
  if (result.orderRequestStatus !== 201 || !result.boldLibraryLoaded || !result.embeddedFrameDetected || !result.checkoutReady) {
    throw new Error('La verificación de Embedded Checkout no fue satisfactoria.');
  }
  if (completePayment && !result.paymentApproved) {
    throw new Error('Bold no confirmó la compra simulada como aprobada.');
  }
} finally {
  await browser.close();
}
