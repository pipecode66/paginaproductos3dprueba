import assert from 'node:assert/strict';
import test from 'node:test';
import { newDb } from 'pg-mem';
import { PostgresCatalogRepository } from '../server/postgres-catalog-repository.js';
import { PostgresOrderStore } from '../server/postgres-order-store.js';

function createPool() {
  const database = newDb();
  const adapter = database.adapters.createPg();
  return new adapter.Pool();
}

test('inicializa el catálogo de pagos y permite actualizar productos', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const catalog = new PostgresCatalogRepository(pool);

  assert.equal(await catalog.ready(), true);
  const products = await catalog.listActive();
  assert.ok(products.length >= 18);

  const original = await catalog.findById('anillo-rubi-aurora');
  const updated = await catalog.upsert({
    ...original,
    price: 1190000,
    stock: 7,
    material: 'Oro amarillo 18K',
    description: 'Descripción administrable.',
    images: ['/products/catalogo-real/anillos/anillos-01.jpg'],
  });
  assert.equal(updated.price, 1190000);
  assert.equal(updated.description, 'Descripción administrable.');
  assert.equal(updated.images.length, 1);
  assert.equal((await catalog.findById(original.id)).stock, 7);

  const deactivated = await catalog.deactivate(original.id);
  assert.equal(deactivated.active, false);
  assert.equal(await catalog.findById(original.id), null);
  assert.equal((await catalog.listAll()).find((product) => product.id === original.id).active, false);
});

test('persiste órdenes y procesa cada evento Bold una sola vez', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const orders = new PostgresOrderStore(pool);
  const order = { id: 'QBM-DB-001', status: 'CREATED', amount: 340000, currency: 'COP' };
  await orders.create(order);
  assert.deepEqual(await orders.get(order.id), order);
  assert.deepEqual(await orders.list(10), [order]);
  const managedOrder = await orders.update(order.id, (current) => ({ ...current, fulfillmentStatus: 'PREPARING' }));
  assert.equal(managedOrder.fulfillmentStatus, 'PREPARING');
  assert.equal((await orders.get(order.id)).fulfillmentStatus, 'PREPARING');

  const event = { id: 'bold-event-1', orderId: order.id, type: 'SALE_APPROVED' };
  const first = await orders.recordEvent(event.id, event, (current) => ({ ...current, status: 'PAID' }));
  const duplicate = await orders.recordEvent(event.id, event, (current) => ({ ...current, status: 'REJECTED' }));

  assert.equal(first.duplicate, false);
  assert.equal(first.order.status, 'PAID');
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.order.status, 'PAID');
});
