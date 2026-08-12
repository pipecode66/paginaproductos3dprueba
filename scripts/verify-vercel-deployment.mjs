const requestedUrl = process.argv[2] || process.env.PUBLIC_BASE_URL;
if (!requestedUrl) {
  throw new Error('Indica la URL: npm run test:deployment -- https://tu-dominio.vercel.app');
}

const baseUrl = new URL(requestedUrl);
const healthResponse = await fetch(new URL('/api/payments/health', baseUrl), {
  headers: { Accept: 'application/json' },
});
const health = await healthResponse.json();
if (!healthResponse.ok || !health.configured || health.storage?.mode !== 'postgresql' || !health.storage?.ready) {
  throw new Error(`El despliegue todavía no está listo: ${JSON.stringify(health)}`);
}

const catalogResponse = await fetch(new URL('/api/catalog/payment-products', baseUrl), {
  headers: { Accept: 'application/json' },
});
const catalog = await catalogResponse.json();
if (!catalogResponse.ok || !catalog.products?.length) {
  throw new Error(`No fue posible consultar el catálogo de pagos: ${JSON.stringify(catalog)}`);
}

const product = catalog.products.find((item) => item.stock > 0 && item.measurements?.length);
if (!product) throw new Error('El catálogo no tiene un producto disponible para verificar órdenes.');

const createResponse = await fetch(new URL('/api/payments/orders', baseUrl), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({
    customer: {
      fullName: 'Verificación técnica Querubim',
      email: 'verificacion@example.com',
      phone: '3000000000',
    },
    delivery: { method: 'pickup' },
    destination: { scope: 'national' },
    items: [{ productId: product.id, measure: product.measurements[0], quantity: 1 }],
  }),
});
const created = await createResponse.json();
if (!createResponse.ok || !created.order?.id || !created.payment?.integritySignature) {
  throw new Error(`No fue posible crear la orden de verificación: ${JSON.stringify(created)}`);
}

const orderResponse = await fetch(new URL(`/api/payments/orders/${encodeURIComponent(created.order.id)}`, baseUrl));
const persisted = await orderResponse.json();
if (!orderResponse.ok || persisted.order?.id !== created.order.id) {
  throw new Error(`La orden no quedó persistida: ${JSON.stringify(persisted)}`);
}

console.log(`Despliegue verificado en ${baseUrl.origin}`);
console.log(`Ambiente Bold: ${health.environment}`);
console.log(`PostgreSQL: conectado`);
console.log(`Orden técnica persistida: ${created.order.id}`);
