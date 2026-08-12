import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const orderResponses = [];
const orderPayloads = [];
const browserErrors = [];
const failedResponses = [];
const checkoutResponses = [];
const scenarioArgument = process.argv.find((argument) => argument.startsWith('--scenario='));
const paymentScenario = scenarioArgument?.split('=')[1] || 'approved';
const cardByScenario = {
  approved: '4111111111111111',
  rejected: '4970110000000062',
  failed: '5204730000008404',
};
if (!cardByScenario[paymentScenario]) throw new Error(`Escenario de pago no válido: ${paymentScenario}`);
const completePayment = process.argv.includes('--complete') || Boolean(scenarioArgument);
const inspectWebhook = process.argv.includes('--inspect-webhook');
const sendWebhook = process.argv.includes('--send-webhook');

page.on('response', (response) => {
  if (response.url().includes('/api/payments/orders') && response.request().method() === 'POST') {
    orderResponses.push(response.status());
    orderPayloads.push(response.json().catch(() => null));
  }
  if (response.status() >= 400) {
    const url = new URL(response.url());
    failedResponses.push({ status: response.status(), host: url.hostname, path: url.pathname });
  }
  if (response.url().includes('checkout.bold.co/api/')) {
    const url = new URL(response.url());
    checkoutResponses.push({ status: response.status(), method: response.request().method(), path: url.pathname });
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
  await page.locator('#checkout-delivery-method').selectOption('pickup');
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
        await checkoutFrame.locator('input[name="cardNumber"]').fill(cardByScenario[paymentScenario]);
        await page.waitForTimeout(900);
        await checkoutFrame.locator('input[name="cardDate"]').fill('1230');
        await checkoutFrame.locator('input[name="cardCVC"]').fill('123');
        await checkoutFrame.locator('input[name="name"]').fill('PRUEBA BOLD');
        await page.waitForTimeout(300);
        const documentNumber = checkoutFrame.getByPlaceholder('Ingresa un número de documento válido');
        if (await documentNumber.count()) await documentNumber.fill('1090123456');
        const billingAddress = checkoutFrame.getByPlaceholder('Ingresa tu dirección de facturación');
        if (await billingAddress.count()) {
          await billingAddress.fill('Calle 10 numero 20 30');
          if (!(await billingAddress.inputValue()).trim()) throw new Error('Bold no conservó la dirección de prueba.');
        }
        const checkboxes = checkoutFrame.locator('input[type="checkbox"]');
        for (let index = 0; index < await checkboxes.count(); index += 1) {
          await checkboxes.nth(index).evaluate((element) => element.click());
        }
        const payButton = checkoutFrame.getByRole('button', { name: /^Pagar/ }).last();
        for (let attempt = 0; attempt < 2; attempt += 1) {
          if (!(await payButton.count())) break;
          await payButton.click({ force: true });
          await page.waitForTimeout(15_000);
          const outcomeText = await checkoutFrame.locator('body').innerText();
          if (/Completaste el pago|rechazad|no (?:pudimos|fue posible).*pago|fallid|algo salió mal/i.test(outcomeText)) break;
        }
      }
    }
  }
  const createdOrder = orderPayloads.length ? await orderPayloads.at(-1) : null;
  let webhookInspection = null;
  let webhookSent = false;
  if (checkoutFrame && (inspectWebhook || sendWebhook)) {
    const receiptButton = checkoutFrame.getByText('Ver comprobante', { exact: true }).last();
    if (await receiptButton.count()) {
      await receiptButton.click();
      await page.waitForTimeout(1_000);
    }
    const webhookButton = checkoutFrame.getByText('Probar el webhook', { exact: true }).last();
    if (await webhookButton.count()) {
      await webhookButton.click();
      await page.waitForTimeout(1_000);
      if (sendWebhook) {
        await checkoutFrame.locator('input[name="InputUrlWebhook"]').fill(
          new URL('/api/payments/bold/webhook', baseUrl).toString(),
        );
        await checkoutFrame.getByText('Guardar webhook', { exact: true }).click();
        await page.waitForTimeout(5_000);
        webhookSent = true;
      }
      webhookInspection = await checkoutFrame.evaluate(() => ({
        text: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1200),
        inputs: [...document.querySelectorAll('input')].map((input) => ({
          name: input.name,
          type: input.type,
          placeholder: input.placeholder,
          value: input.value,
        })),
        buttons: [...document.querySelectorAll('button')].map((button) => button.innerText.trim()).filter(Boolean),
      }));
    }
  }
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/bold-embedded-checkout.png', fullPage: true });
  const checkoutText = checkoutFrame
    ? (await checkoutFrame.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    : '';
  const checkoutFormInspection = checkoutFrame
    ? await checkoutFrame.evaluate(() => ({
        inputs: [...document.querySelectorAll('input')]
          .filter((input) => input.offsetParent !== null)
          .map((input) => ({
            name: input.name,
            type: input.type,
            placeholder: input.placeholder,
            value: input.type === 'checkbox' ? undefined : input.value,
            checked: input.type === 'checkbox' ? input.checked : undefined,
            valid: input.validity.valid,
            validationMessage: input.validationMessage,
          })),
        selects: [...document.querySelectorAll('select')]
          .filter((select) => select.offsetParent !== null)
          .map((select) => ({ name: select.name, value: select.value, valid: select.validity.valid })),
      }))
    : null;
  const message = await page.locator('#checkout-message').textContent();
  let persistedOrder = null;
  if (createdOrder?.order?.id) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await fetch(`${baseUrl}/api/payments/orders/${encodeURIComponent(createdOrder.order.id)}`);
      const result = await response.json();
      persistedOrder = result.order || null;
      if (!sendWebhook || persistedOrder?.status !== 'CREATED') break;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
  const result = {
    orderRequestStatus: orderResponses.at(-1) ?? null,
    completePayment,
    paymentScenario,
    boldLibraryLoaded: await page.evaluate(() => typeof window.BoldCheckout === 'function'),
    embeddedFrameDetected: frameUrls.some((url) => /bold\.co|checkout/i.test(url)),
    frameCount: frameUrls.length,
    checkoutReady:
      (/Modo de pruebas/.test(checkoutText) ||
        /Completaste el pago|transacción fue rechazada|pago fallid/i.test(checkoutText)) &&
      !/Algo salió mal/.test(checkoutText),
    paymentApproved: /Completaste el pago/.test(checkoutText),
    paymentRejected: /rechazad|PaymentReceipt\.REJECTED|no (?:pudimos|fue posible).*pago/i.test(checkoutText),
    paymentFailed: /fallid|algo salió mal/i.test(checkoutText),
    checkoutSummary: checkoutText.slice(0, 500),
    browserErrors: browserErrors.filter((message) => !/Permissions policy violation/.test(message)),
    failedResponses,
    checkoutResponses,
    checkoutFormInspection,
    checkoutMessage: message?.trim() || null,
    orderId: createdOrder?.order?.id || null,
    persistedStatus: persistedOrder?.status || null,
    lastEventType: persistedOrder?.lastEventType || null,
    webhookSent,
    webhookInspection,
    screenshot: 'test-results/bold-embedded-checkout.png',
  };

  console.log(JSON.stringify(result));
  if (result.orderRequestStatus !== 201 || !result.boldLibraryLoaded || !result.embeddedFrameDetected || !result.checkoutReady) {
    throw new Error('La verificación de Embedded Checkout no fue satisfactoria.');
  }
  const outcomeDetected = {
    approved: result.paymentApproved,
    rejected: result.paymentRejected,
    failed: result.paymentFailed,
  }[paymentScenario];
  if (completePayment && !outcomeDetected) {
    throw new Error(`Bold no confirmó la compra simulada como ${paymentScenario}.`);
  }
  const expectedPersistedStatus = { approved: 'PAID', rejected: 'REJECTED', failed: 'CREATED' }[paymentScenario];
  if (sendWebhook && result.persistedStatus !== expectedPersistedStatus) {
    throw new Error(
      `El webhook de prueba no actualizó la orden como ${expectedPersistedStatus}: ${result.persistedStatus}.`,
    );
  }
} finally {
  await browser.close();
}
