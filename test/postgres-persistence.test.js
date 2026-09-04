import assert from 'node:assert/strict';
import test from 'node:test';
import { newDb } from 'pg-mem';
import { PostgresCatalogRepository } from '../server/postgres-catalog-repository.js';
import { PostgresAdminSecurityStore } from '../server/postgres-admin-security-store.js';
import { PostgresAdminUserStore } from '../server/postgres-admin-user-store.js';
import { PostgresBusinessSettingsRepository } from '../server/postgres-business-settings-repository.js';
import { PostgresInternationalRequestStore } from '../server/postgres-international-request-store.js';
import { PostgresOrderStore } from '../server/postgres-order-store.js';
import { PostgresSiteContentRepository } from '../server/postgres-site-content-repository.js';
import { hashInvitationToken } from '../server/admin-users.js';

const ADMIN_EMAIL = 'admin@querubim.co';

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

test('reserva inventario y lo libera una sola vez al anular o vencer la orden', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const catalog = new PostgresCatalogRepository(pool);
  const orders = new PostgresOrderStore(pool);
  await catalog.ready();
  const product = await catalog.findById('anillo-rubi-aurora');
  const item = {
    productId: product.id,
    name: product.name,
    measure: product.measurements[0],
    quantity: 1,
    unitPrice: product.price,
    subtotal: product.price,
  };
  const order = {
    id: 'QBM-RESERVE-001',
    status: 'CREATED',
    amount: product.price,
    currency: 'COP',
    items: [item],
    inventoryStatus: 'RESERVED',
    createdAt: '2026-08-12T12:00:00.000Z',
    expiresAt: '2026-08-13T12:00:00.000Z',
  };

  await orders.createWithReservation(order);
  assert.equal((await catalog.findById(product.id)).stock, product.stock - 1);

  const approvedEvent = { id: 'reserve-approved', orderId: order.id, type: 'SALE_APPROVED' };
  await orders.recordEvent(approvedEvent.id, approvedEvent, (current) => ({
    ...current,
    status: 'PAID',
    inventoryStatus: 'COMMITTED',
  }));
  assert.equal((await catalog.findById(product.id)).stock, product.stock - 1);

  const voidEvent = { id: 'reserve-voided', orderId: order.id, type: 'VOID_APPROVED' };
  await orders.recordEvent(voidEvent.id, voidEvent, (current) => ({
    ...current,
    status: 'VOIDED',
    inventoryStatus: 'RELEASED',
  }));
  await orders.recordEvent(voidEvent.id, voidEvent, (current) => current);
  assert.equal((await catalog.findById(product.id)).stock, product.stock);

  const expiringOrder = {
    ...order,
    id: 'QBM-RESERVE-EXPIRED',
    expiresAt: '2026-08-11T12:00:00.000Z',
  };
  await orders.createWithReservation(expiringOrder);
  assert.equal((await catalog.findById(product.id)).stock, product.stock - 1);
  assert.equal(await orders.releaseExpiredReservations('2026-08-12T12:00:00.000Z'), 1);
  assert.equal((await catalog.findById(product.id)).stock, product.stock);
  assert.equal((await orders.get(expiringOrder.id)).status, 'EXPIRED');
});

test('persiste portadas comerciales y solicitudes internacionales en PostgreSQL', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const contentRepository = new PostgresSiteContentRepository(pool);
  const requestStore = new PostgresInternationalRequestStore(pool);

  const defaults = await contentRepository.get();
  assert.match(defaults.hero.title, /Elegancia/);
  const savedContent = await contentRepository.save({
    ...defaults,
    hero: { ...defaults.hero, title: 'Portada persistente' },
  });
  assert.equal(savedContent.hero.title, 'Portada persistente');
  assert.equal((await contentRepository.get()).hero.title, 'Portada persistente');

  const request = {
    id: 'QBI-DB-001',
    status: 'PENDING_REVIEW',
    customer: { fullName: 'Cliente exterior' },
    createdAt: '2026-08-12T15:00:00.000Z',
  };
  await requestStore.create(request);
  assert.equal((await requestStore.get(request.id)).status, 'PENDING_REVIEW');
  await requestStore.update(request.id, (current) => ({ ...current, status: 'CONDITIONS_SET' }));
  assert.equal((await requestStore.list())[0].status, 'CONDITIONS_SET');
});

test('persiste bloqueos, sesiones revocables y protección TOTP en PostgreSQL', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const security = new PostgresAdminSecurityStore(pool);
  const now = 1_800_000_000_000;
  const policy = { windowMs: 900_000, limit: 2, lockMs: 900_000 };

  await security.recordLoginFailure(['account:test', 'address:test'], policy, now);
  const failure = await security.recordLoginFailure(['account:test', 'address:test'], policy, now + 1_000);
  assert.equal(failure.lockedUntil, now + 901_000);
  assert.equal(await security.getLoginLock(['account:test'], now + 2_000), now + 901_000);

  await security.createSession({ id: 'secure-session-id', email: ADMIN_EMAIL, expiresAt: now + 900_000, createdAt: now });
  assert.equal((await security.getSession('secure-session-id', now + 1_000)).email, ADMIN_EMAIL);
  assert.equal(await security.revokeSession('secure-session-id', now + 2_000), true);
  assert.equal(await security.getSession('secure-session-id', now + 3_000), null);

  assert.equal(await security.consumeTotpStep(ADMIN_EMAIL, 12345, now), true);
  assert.equal(await security.consumeTotpStep(ADMIN_EMAIL, 12345, now + 1_000), false);
  assert.equal(await security.consumeTotpStep(ADMIN_EMAIL, 12346, now + 2_000), true);
});

test('persiste el precio del oro, las categorias y los perfiles administrativos en PostgreSQL', async (context) => {
  const pool = createPool();
  context.after(() => pool.end());
  const settings = new PostgresBusinessSettingsRepository(pool);
  const users = new PostgresAdminUserStore(pool);
  const now = 1_800_000_000_000;
  const activationToken = 'codigo-privado-de-activacion';

  const currentSettings = await settings.get();
  const savedSettings = await settings.save({
    ...currentSettings,
    gold: { pricePerGram: 450000, enabled: true },
    categories: [
      ...currentSettings.categories,
      {
        slug: 'ediciones-especiales',
        label: 'Ediciones especiales',
        active: true,
        fields: [{ key: 'coleccion', label: 'Coleccion', type: 'text', required: true, public: true }],
      },
    ],
  });
  assert.equal(savedSettings.gold.pricePerGram, 450000);
  assert.equal((await settings.get()).categories.at(-1).slug, 'ediciones-especiales');

  const invited = await users.createInvitation({
    email: 'adminmaster@querubim.com',
    name: 'Administradora principal',
    role: 'master',
    tokenHash: hashInvitationToken(activationToken),
    createdBy: ADMIN_EMAIL,
    now,
    expiresAt: now + 86_400_000,
  });
  assert.equal(invited.status, 'INVITED');
  assert.equal(await users.hasActiveMaster(), false);

  const activated = await users.activate(
    invited.email,
    activationToken,
    '$argon2id$v=19$m=65536,t=3,p=1$hash-de-prueba',
    now + 1_000,
  );
  assert.equal(activated.status, 'ACTIVE');
  assert.equal(activated.inviteTokenHash, null);
  assert.equal(await users.hasActiveMaster(), true);
});
