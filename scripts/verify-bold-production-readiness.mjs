const requestedUrl = process.argv[2] || process.env.PUBLIC_BASE_URL;
const expectedStage = process.argv[3] || 'production_locked';
const validStages = new Set(['test', 'production_locked', 'production_live']);

if (!requestedUrl || !validStages.has(expectedStage)) {
  throw new Error(
    'Uso: npm run test:production-readiness -- https://tu-dominio.com <test|production_locked|production_live>',
  );
}

const baseUrl = new URL(requestedUrl);
if (baseUrl.protocol !== 'https:') throw new Error('La verificación de producción requiere una URL HTTPS.');

const healthResponse = await fetch(new URL('/api/payments/health', baseUrl), {
  headers: { Accept: 'application/json' },
});
const health = await healthResponse.json();
if (!healthResponse.ok) throw new Error(`No fue posible consultar pagos: ${JSON.stringify(health)}`);

const catalogResponse = await fetch(new URL('/api/catalog/payment-products', baseUrl), {
  headers: { Accept: 'application/json' },
});
const catalog = await catalogResponse.json();
if (!catalogResponse.ok || !catalog.products?.some((product) => product.stock > 0)) {
  throw new Error('El catálogo de pagos no tiene productos disponibles para el lanzamiento.');
}

if (health.launchStage !== expectedStage) {
  throw new Error(`Se esperaba ${expectedStage}, pero el despliegue informa ${health.launchStage}.`);
}

if (!health.boldConfigured || !health.storage?.ready || !health.canReceiveWebhooks) {
  throw new Error(`La infraestructura de pagos está incompleta: ${JSON.stringify(health.checks)}`);
}

if (expectedStage === 'production_locked' && (!health.readyToActivate || health.productionEnabled)) {
  throw new Error('Producción debe estar completamente configurada, pero aún bloqueada para nuevas compras.');
}

if (expectedStage === 'production_live' && (!health.configured || !health.live || !health.productionEnabled)) {
  throw new Error('El despliegue todavía no está habilitado para recibir cobros reales.');
}

console.log(
  JSON.stringify({
    url: baseUrl.origin,
    launchStage: health.launchStage,
    environment: health.environment,
    productionEnabled: health.productionEnabled,
    readyToActivate: health.readyToActivate,
    canReceiveWebhooks: health.canReceiveWebhooks,
    webhookUrl: health.webhookUrl,
    taxConfigured: health.checks?.taxConfigured,
    availableProducts: catalog.products.filter((product) => product.stock > 0).length,
    verified: true,
  }),
);
