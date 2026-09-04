import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../server/app.js';
import { AdminUserStore } from '../server/admin-user-store.js';
import { BusinessSettingsRepository } from '../server/business-settings-repository.js';
import { CatalogRepository } from '../server/catalog-repository.js';
import { OrderStore } from '../server/order-store.js';

const LEGACY_EMAIL = 'admin@querubim.co';
const LEGACY_PASSWORD = 'legacy-password-secure';
const MASTER_EMAIL = 'adminmaster@querubim.com';
const MASTER_PASSWORD = 'Clave-Maestra-Privada-2026';

async function createManagementServer(context) {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-management-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const catalogRepository = new CatalogRepository(path.join(runtimeDir, 'catalog.json'));
  const orderStore = new OrderStore(path.join(runtimeDir, 'orders.json'));
  const adminUserStore = new AdminUserStore(path.join(runtimeDir, 'users.json'));
  const businessSettingsRepository = new BusinessSettingsRepository(path.join(runtimeDir, 'business.json'));
  const config = {
    runtimeDir,
    bold: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'test-secret',
      publicBaseUrl: 'http://localhost:4173',
      tax: 'vat-19',
      productionEnabled: false,
    },
    admin: {
      email: LEGACY_EMAIL,
      masterEmail: MASTER_EMAIL,
      password: LEGACY_PASSWORD,
      sessionSecret: 'management-test-session-secret-with-32-characters',
      sessionTtlMs: 15 * 60 * 1000,
      publicBaseUrl: 'http://localhost:4173',
      totpRequired: false,
    },
  };
  const { app } = createApp({
    config,
    catalogRepository,
    orderStore,
    adminUserStore,
    businessSettingsRepository,
    logger: { error() {} },
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    adminUserStore,
    config,
  };
}

async function login(baseUrl, email = LEGACY_EMAIL, password = LEGACY_PASSWORD) {
  const response = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  return {
    response,
    body,
    headers: {
      'Content-Type': 'application/json',
      Cookie: response.headers.get('set-cookie')?.split(';')[0],
      'x-querubim-csrf': body.csrfToken,
    },
  };
}

test('calcula el precio final por peso y talla sin exponer datos internos al comprador', async (context) => {
  const { baseUrl } = await createManagementServer(context);
  const admin = await login(baseUrl);
  assert.equal(admin.response.status, 200);

  const gold = await fetch(`${baseUrl}/api/admin/settings/gold`, {
    method: 'PUT',
    headers: admin.headers,
    body: JSON.stringify({ pricePerGram: 450000 }),
  });
  assert.equal(gold.status, 200);

  const product = {
    id: 'cadena-precio-por-peso',
    name: 'Cadena Precio por Peso',
    category: 'cadenas',
    material: 'Oro amarillo 18K',
    price: 1850000,
    stock: 3,
    measurements: ['Talla 2', 'Talla 3'],
    measurementWeights: [
      { measure: 'Talla 2', value: 2, unit: 'g' },
      { measure: 'Talla 3', value: 3, unit: 'g' },
    ],
    goldPricing: true,
    images: ['/products/catalogo-real/anillos/anillos-01.jpg'],
    description: 'Joya para validar el cálculo por talla.',
    attributes: {
      material: 'Oro amarillo 18K',
      metal: 'Oro amarillo',
      purity: '18K',
      gemstone: 'Sin piedra principal',
      engraving: 'Disponible bajo solicitud',
    },
    premium: false,
    featured: false,
  };
  const created = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: admin.headers,
    body: JSON.stringify(product),
  });
  assert.equal(created.status, 201);

  const catalog = await fetch(`${baseUrl}/api/catalog/products`).then((response) => response.json());
  const publicProduct = catalog.products.find((item) => item.id === product.id);
  assert.equal(publicProduct.price, 2750000);
  assert.deepEqual(publicProduct.pricing.options, [
    { measure: 'Talla 2', price: 2750000 },
    { measure: 'Talla 3', price: 3200000 },
  ]);
  assert.equal(Object.hasOwn(publicProduct, 'measurementWeights'), false);
  assert.equal(JSON.stringify(publicProduct).includes('1850000'), false);
  assert.equal(JSON.stringify(publicProduct).includes('450000'), false);

  const orderResponse = await fetch(`${baseUrl}/api/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente con talla', email: 'talla@example.com', phone: '3001234567' },
      delivery: { method: 'pickup' },
      destination: { scope: 'national' },
      items: [{ productId: product.id, measure: 'Talla 3', quantity: 1, price: 1000 }],
    }),
  });
  const order = await orderResponse.json();
  assert.equal(orderResponse.status, 201);
  assert.equal(order.order.subtotal, 3200000);
  assert.equal(order.order.amount, 3360000);
  assert.equal(Object.hasOwn(order.order.items[0], 'weightGramsSnapshot'), false);

  const internationalResponse = await fetch(`${baseUrl}/api/international-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente internacional', email: 'global@example.com', phone: '+1 305 555 0199' },
      delivery: {
        method: 'delivery',
        country: 'Estados Unidos',
        city: 'Miami',
        addressLine: '100 Biscayne Boulevard',
        postalCode: '33132',
      },
      destination: { scope: 'international' },
      items: [{ productId: product.id, measure: 'Talla 3', quantity: 1 }],
    }),
  });
  const international = await internationalResponse.json();
  assert.equal(internationalResponse.status, 201);
  assert.equal(international.request.amount, 3392000);
  assert.equal(Object.hasOwn(international.request.items[0], 'garmentPriceSnapshot'), false);
  assert.equal(Object.hasOwn(international.request.items[0], 'goldPricePerGramSnapshot'), false);
  assert.equal(Object.hasOwn(international.request.items[0], 'weightGramsSnapshot'), false);
});

test('aplica la plantilla de una categoría y valida sus campos obligatorios', async (context) => {
  const { baseUrl } = await createManagementServer(context);
  const admin = await login(baseUrl);
  const categoryResponse = await fetch(`${baseUrl}/api/admin/categories`, {
    method: 'POST',
    headers: admin.headers,
    body: JSON.stringify({
      slug: 'edicion-limitada',
      label: 'Edición limitada',
      active: true,
      fields: [
        { key: 'coleccion', label: 'Colección', type: 'text', required: true, public: true },
        { key: 'certificado', label: 'Incluye certificado', type: 'boolean', required: false, public: true },
        { key: 'codigo-interno', label: 'Código interno', type: 'text', required: false, public: false },
      ],
    }),
  });
  assert.equal(categoryResponse.status, 201);

  const baseProduct = {
    id: 'pieza-edicion-limitada',
    name: 'Pieza Edición Limitada',
    category: 'edicion-limitada',
    material: 'Oro amarillo 18K',
    price: 850000,
    stock: 1,
    measurements: ['Única'],
    measurementWeights: [{ measure: 'Única', value: 1, unit: 'g' }],
    goldPricing: true,
    images: ['/products/catalogo-real/anillos/anillos-01.jpg'],
    description: 'Producto con plantilla configurable.',
  };
  const invalid = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: admin.headers,
    body: JSON.stringify(baseProduct),
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, 'CATEGORY_FIELD_REQUIRED');

  const valid = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: admin.headers,
    body: JSON.stringify({
      ...baseProduct,
      attributes: { coleccion: 'Querubim Única', certificado: true, 'codigo-interno': 'PRIVADO-001' },
    }),
  });
  assert.equal(valid.status, 201);
  const catalog = await fetch(`${baseUrl}/api/catalog/products`).then((response) => response.json());
  const product = catalog.products.find((item) => item.id === baseProduct.id);
  assert.deepEqual(product.publicAttributes, [
    { key: 'coleccion', label: 'Colección', value: 'Querubim Única' },
    { key: 'certificado', label: 'Incluye certificado', value: 'Sí' },
  ]);
  assert.equal(product.material, '');
  assert.equal(Object.hasOwn(product, 'variants'), false);
  assert.equal(JSON.stringify(product).includes('PRIVADO-001'), false);
  const hiddenCategory = await fetch(`${baseUrl}/api/admin/categories/edicion-limitada`, {
    method: 'PUT',
    headers: admin.headers,
    body: JSON.stringify({
      slug: 'edicion-limitada',
      label: 'Edición limitada',
      active: false,
      fields: [
        { key: 'coleccion', label: 'Colección', type: 'text', required: true, public: true },
        { key: 'certificado', label: 'Incluye certificado', type: 'boolean', required: false, public: true },
      ],
    }),
  });
  assert.equal(hiddenCategory.status, 200);
  const catalogAfterHiding = await fetch(`${baseUrl}/api/catalog/products`).then((response) => response.json());
  assert.equal(catalogAfterHiding.products.some((item) => item.id === baseProduct.id), false);

  const hiddenProductOrder = await fetch(`${baseUrl}/api/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente categoría oculta', email: 'oculta@example.com', phone: '3001234567' },
      delivery: { method: 'pickup' },
      destination: { scope: 'national' },
      items: [{ productId: baseProduct.id, measure: 'Única', quantity: 1 }],
    }),
  });
  assert.equal(hiddenProductOrder.status, 409);
  assert.equal((await hiddenProductOrder.json()).code, 'PRODUCT_NOT_AVAILABLE');
});

test('activa la cuenta maestra una sola vez y anula el acceso administrativo anterior', async (context) => {
  const { baseUrl, adminUserStore, config } = await createManagementServer(context);
  const legacy = await login(baseUrl);
  const invitationResponse = await fetch(`${baseUrl}/api/admin/team/master-invitation`, {
    method: 'POST',
    headers: legacy.headers,
    body: JSON.stringify({ name: 'Administradora Querubim' }),
  });
  const invitation = await invitationResponse.json();
  assert.equal(invitationResponse.status, 201);
  assert.equal(invitation.user.email, MASTER_EMAIL);
  assert.ok(invitation.activationToken);

  const activationResponse = await fetch(`${baseUrl}/api/admin/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: MASTER_EMAIL,
      activationToken: invitation.activationToken,
      password: MASTER_PASSWORD,
    }),
  });
  const activation = await activationResponse.json();
  assert.equal(activationResponse.status, 200);
  assert.equal(activation.user.role, 'master');
  assert.equal(JSON.stringify(activation).includes(MASTER_PASSWORD), false);
  const stored = await adminUserStore.findByEmail(MASTER_EMAIL);
  assert.match(stored.passwordHash, /^\$argon2id\$/);
  assert.equal(stored.inviteTokenHash, null);

  const oldSession = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: legacy.headers.Cookie } });
  assert.equal(oldSession.status, 401);
  const oldLogin = await login(baseUrl);
  assert.equal(oldLogin.response.status, 401);

  config.admin.email = '';
  config.admin.password = '';
  config.admin.passwordHash = '';
  const master = await login(baseUrl, MASTER_EMAIL, MASTER_PASSWORD);
  assert.equal(master.response.status, 200);
  const employeeInvitation = await fetch(`${baseUrl}/api/admin/team/invitations`, {
    method: 'POST',
    headers: master.headers,
    body: JSON.stringify({
      name: 'Asesora de ventas',
      email: 'asesora@querubim.com',
      permissions: ['dashboard.view', 'orders.manage'],
    }),
  });
  assert.equal(employeeInvitation.status, 201);
  const invitedEmployee = await employeeInvitation.json();
  assert.ok(invitedEmployee.activationToken);

  const employeeActivation = await fetch(`${baseUrl}/api/admin/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'asesora@querubim.com',
      activationToken: invitedEmployee.activationToken,
      password: 'Clave-Asesora-Privada-2026',
    }),
  });
  assert.equal(employeeActivation.status, 200);

  const employee = await login(baseUrl, 'asesora@querubim.com', 'Clave-Asesora-Privada-2026');
  assert.equal(employee.response.status, 200);
  assert.deepEqual(employee.body.user.permissions, ['dashboard.view', 'orders.manage']);

  const employeeDashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: employee.headers });
  assert.equal(employeeDashboard.status, 200);
  const dashboardBody = await employeeDashboard.json();
  assert.equal(Object.hasOwn(dashboardBody, 'products'), false);
  assert.equal(Array.isArray(dashboardBody.orders), true);

  const forbiddenTeam = await fetch(`${baseUrl}/api/admin/team`, { headers: employee.headers });
  assert.equal(forbiddenTeam.status, 403);
  assert.equal((await forbiddenTeam.json()).code, 'ADMIN_PERMISSION_REQUIRED');

  const forbiddenProduct = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: employee.headers,
    body: JSON.stringify({}),
  });
  assert.equal(forbiddenProduct.status, 403);

  const financialPermissionUpdate = await fetch(`${baseUrl}/api/admin/team/users/${encodeURIComponent('asesora@querubim.com')}`, {
    method: 'PATCH',
    headers: master.headers,
    body: JSON.stringify({ permissions: ['dashboard.view', 'financials.view'], active: true }),
  });
  assert.equal(financialPermissionUpdate.status, 200);
  const financialDashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: employee.headers });
  const financialDashboardBody = await financialDashboard.json();
  assert.equal(financialDashboard.status, 200);
  assert.equal(Object.hasOwn(financialDashboardBody, 'orders'), false);
  assert.ok(financialDashboardBody.analytics);
  assert.equal(typeof financialDashboardBody.summary.paidRevenue, 'number');

  const permissionUpdate = await fetch(`${baseUrl}/api/admin/team/users/${encodeURIComponent('asesora@querubim.com')}`, {
    method: 'PATCH',
    headers: master.headers,
    body: JSON.stringify({ permissions: ['dashboard.view', 'catalog.manage'], active: true }),
  });
  assert.equal(permissionUpdate.status, 200);

  const updatedEmployeeSession = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: employee.headers });
  assert.equal(updatedEmployeeSession.status, 200);
  assert.equal(Array.isArray((await updatedEmployeeSession.json()).products), true);
});
