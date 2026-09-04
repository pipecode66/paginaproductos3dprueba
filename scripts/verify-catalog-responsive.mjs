import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4173';
const executablePath = process.env.BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const viewports = [
  { name: 'mobile', width: 390, height: 844, minimumColumns: 1 },
  { name: 'tablet', width: 768, height: 1024, minimumColumns: 2 },
  { name: 'desktop', width: 1440, height: 900, minimumColumns: 3 },
  { name: 'wide', width: 2200, height: 1200, minimumColumns: 4 },
];
const weightedProduct = {
  id: 'producto-precio-talla-ui',
  name: 'Anillo Precio por Talla',
  category: 'anillos',
  material: 'Oro amarillo 18K',
  stock: 2,
  measurements: ['Talla 6', 'Talla 7'],
  images: ['/products/catalogo-real/manillas/manillas-01.jpg'],
  description: 'Joya utilizada para comprobar el precio final segun la talla elegida.',
  premium: false,
  featured: false,
  active: true,
  price: 2750000,
  pricing: {
    mode: 'gold_by_weight',
    requiresSelection: true,
    startingPrice: 2750000,
    options: [
      { measure: 'Talla 6', price: 2750000 },
      { measure: 'Talla 7', price: 3200000 },
    ],
  },
  publicAttributes: [
    { key: 'material', label: 'Material', value: 'Oro amarillo 18K' },
  ],
};

try {
  await mkdir('test-results', { recursive: true });
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.route('**/api/catalog/products', async (route) => {
      const response = await route.fetch();
      const result = await response.json();
      await route.fulfill({
        response,
        contentType: 'application/json',
        body: JSON.stringify({ ...result, products: [weightedProduct, ...(result.products || [])] }),
      });
    });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const grid = page.locator('#product-grid');
    await grid.locator('.product-card').first().waitFor();
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const layout = await grid.evaluate((element) => {
      const cards = [...element.querySelectorAll('.product-card')];
      const firstCard = cards[0];
      const cardRect = firstCard.getBoundingClientRect();
      const firstRowTop = Math.round(cardRect.top);
      const columns = cards.filter((card) => Math.abs(Math.round(card.getBoundingClientRect().top) - firstRowTop) <= 2).length;
      const content = firstCard.querySelector('.product-card-content');
      const image = firstCard.querySelector('.product-image-wrap');
      const cta = firstCard.querySelector('.product-card-cta');
      const documentWidth = document.documentElement.scrollWidth;

      return {
        columns,
        gridWidth: Math.round(element.getBoundingClientRect().width),
        gridTemplate: getComputedStyle(element).gridTemplateColumns,
        cardWidth: Math.round(cardRect.width),
        cardHeight: Math.round(cardRect.height),
        imageHeight: Math.round(image.getBoundingClientRect().height),
        contentHeight: Math.round(content.getBoundingClientRect().height),
        contentClipped: content.scrollHeight > content.clientHeight + 1,
        ctaHeight: Math.round(cta.getBoundingClientRect().height),
        ctaVisible: cta.getBoundingClientRect().height >= 40,
        horizontalOverflow: documentWidth > window.innerWidth,
      };
    });
    const startingPriceVisible = await grid.locator(`[data-open-product="${weightedProduct.id}"] .product-card-value`)
      .getByText(/Desde.*2\.750\.000/)
      .isVisible();

    await page.screenshot({ path: `test-results/catalog-responsive-${viewport.name}.png` });
    results.push({ viewport: viewport.name, startingPriceVisible, ...layout });

    if (
      layout.columns < viewport.minimumColumns
      || layout.cardWidth > 370
      || layout.cardHeight > 620
      || layout.imageHeight < 190
      || layout.contentHeight < 150
      || layout.contentClipped
      || !layout.ctaVisible
      || layout.horizontalOverflow
      || !startingPriceVisible
    ) {
      throw new Error(`La cuadrícula no es satisfactoria en ${viewport.name}: ${JSON.stringify(layout)}`);
    }

    if (viewport.name === 'mobile') {
      await grid.locator(`[data-open-product="${weightedProduct.id}"]`).click();
      const detail = page.locator('#product-detail-panel');
      const measure = page.locator('#detail-measure');
      await detail.waitFor();
      await page.locator('#detail-live-price').getByText('Selecciona una talla para conocer el precio').waitFor();
      await measure.selectOption('Talla 6');
      await page.locator('#detail-live-price strong').getByText(/2\.750\.000/).waitFor();
      await measure.selectOption('Talla 7');
      await page.locator('#detail-live-price strong').getByText(/3\.200\.000/).waitFor();
      await page.locator('#detail-add-cart').click();
      const selectedPriceReachedCart = /3\.200\.000/.test(await page.locator('#selection-items').textContent());
      await measure.scrollIntoViewIfNeeded();
      const detailLayout = await detail.evaluate((element) => {
        const specs = [...element.querySelectorAll('.detail-specs > div')];
        const measureIcon = element.querySelector('.measure-select-wrap svg');
        return {
          measureHeight: Math.round(element.querySelector('#detail-measure').getBoundingClientRect().height),
          measureIconVisible: Boolean(measureIcon && measureIcon.getBoundingClientRect().width >= 20),
          specColumns: specs.length > 1 && Math.abs(specs[0].getBoundingClientRect().top - specs[1].getBoundingClientRect().top) <= 2 ? 2 : 1,
          horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
        };
      });
      results.push({ viewport: 'mobile-detail', selectedPriceReachedCart, ...detailLayout });
      if (
        detailLayout.measureHeight < 60
        || !detailLayout.measureIconVisible
        || detailLayout.specColumns !== 2
        || detailLayout.horizontalOverflow
        || !selectedPriceReachedCart
      ) {
        throw new Error(`El detalle móvil no es satisfactorio: ${JSON.stringify(detailLayout)}`);
      }
    }

    await page.close();
  }

  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
