import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const catalogResponse = await fetch(`${baseUrl}/api/catalog/products`);
if (!catalogResponse.ok) throw new Error(`No fue posible consultar el catálogo: ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const products = catalog.products || [];
const actualPremiumProduct = products.find((product) => product.premium);
const premiumProduct = actualPremiumProduct || products.find((product) => product.images?.length) || products[0];
if (!premiumProduct) throw new Error('No hay productos disponibles para verificar el detalle Premium.');

const renderedCatalog = actualPremiumProduct
  ? catalog
  : {
      ...catalog,
      products: products.map((product) => (
        product.id === premiumProduct.id ? { ...product, premium: true } : product
      )),
    };

const browser = await chromium.launch({ headless: true, executablePath });

async function verifyViewport(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));

  if (!actualPremiumProduct) {
    await page.route('**/api/catalog/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(renderedCatalog),
      });
    });
  }

  await page.goto(`${baseUrl}/premium`, { waitUntil: 'domcontentloaded' });
  await page.locator(`[data-open-product="${premiumProduct.id}"]`).click();
  const panel = page.locator('#product-detail-panel.open.premium-detail');
  await panel.waitFor();
  await page.waitForTimeout(250);

  const visuals = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const panelElement = document.querySelector('#product-detail-panel');
    const panelBox = panelElement.getBoundingClientRect();
    const selectBox = document.querySelector('#detail-measure').getBoundingClientRect();

    return {
      panelBackground: style('#product-detail-panel').backgroundImage,
      headingColor: style('#detail-name').color,
      descriptionColor: style('#detail-description').color,
      specBackground: style('#detail-specs > div').backgroundColor,
      selectBackground: style('#detail-measure').backgroundColor,
      selectColor: style('#detail-measure').color,
      closeColor: style('#detail-close').color,
      bodyMode: document.body.classList.contains('premium-detail-open'),
      panelInsideViewport:
        panelBox.left >= 0
        && panelBox.right <= window.innerWidth
        && panelBox.top >= 0
        && panelBox.bottom <= window.innerHeight,
      selectHeight: selectBox.height,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  const passed =
    visuals.panelBackground.includes('linear-gradient')
    && visuals.headingColor === 'rgb(255, 247, 230)'
    && visuals.descriptionColor === 'rgba(255, 247, 230, 0.76)'
    && visuals.specBackground === 'rgba(18, 15, 12, 0.88)'
    && visuals.selectBackground === 'rgb(23, 19, 15)'
    && visuals.selectColor === 'rgb(255, 247, 230)'
    && visuals.closeColor === 'rgb(242, 210, 130)'
    && visuals.bodyMode
    && visuals.panelInsideViewport
    && visuals.selectHeight >= 62
    && !visuals.horizontalOverflow
    && browserErrors.length === 0;

  await page.screenshot({ path: `test-results/premium-product-detail-${name}.png` });
  await panel.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `test-results/premium-product-detail-${name}-bottom.png` });
  await page.close();

  return { passed, visuals, browserErrors };
}

try {
  await mkdir('test-results', { recursive: true });
  const desktop = await verifyViewport('desktop', { width: 1440, height: 900 });
  const mobile = await verifyViewport('mobile', { width: 390, height: 844 });
  const result = {
    baseUrl,
    productId: premiumProduct.id,
    usedCatalogPremiumProduct: Boolean(actualPremiumProduct),
    desktop,
    mobile,
    verified: desktop.passed && mobile.passed,
  };
  console.log(JSON.stringify(result));
  if (!result.verified) throw new Error('La verificación visual del detalle Premium no fue satisfactoria.');
} finally {
  await browser.close();
}
