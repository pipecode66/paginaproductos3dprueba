import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdminConfigured } from '../server/admin-auth.js';
import { createApp } from '../server/app.js';
import { createRuntimeConfig } from '../server/config.js';
import { normalizeVercelRewrite } from '../server/vercel-request.js';

test('usa PostgreSQL cuando Vercel entrega DATABASE_URL', () => {
  const config = createRuntimeConfig({ VERCEL: '1', DATABASE_URL: 'postgresql://example.test/querubim' }, 'C:/app');
  assert.equal(config.storage.mode, 'postgresql');
  assert.equal(config.storage.databaseUrl, 'postgresql://example.test/querubim');
  assert.equal(config.admin.masterEmail, 'adminmaster@querubim.com');
});

test('deshabilita el almacenamiento temporal en Vercel sin base de datos', () => {
  const config = createRuntimeConfig({ VERCEL: '1' }, 'C:/app');
  assert.equal(config.storage.mode, 'unconfigured');
});

test('conserva archivos JSON únicamente para desarrollo local', () => {
  const config = createRuntimeConfig({}, 'C:/app');
  assert.equal(config.storage.mode, 'json');
  assert.equal(config.bold.tax, 'vat-19');
});

test('Vercel rechaza la contraseña administrativa en texto plano', () => {
  const config = createRuntimeConfig({
    VERCEL: '1',
    ADMIN_EMAIL: 'admin@querubim.co',
    ADMIN_PASSWORD: 'Esta-clave-no-debe-bastar-en-produccion',
    ADMIN_SESSION_SECRET: 'session-secret-with-more-than-thirty-two-characters',
  }, 'C:/app');

  assert.equal(config.admin.securityEnforced, true);
  assert.equal(config.admin.allowLegacyPassword, false);
  assert.equal(isAdminConfigured(config.admin), false);
});

test('permite suspender temporalmente el segundo factor mediante una variable explícita', () => {
  const config = createRuntimeConfig({ VERCEL: '1', ADMIN_TOTP_REQUIRED: 'false' }, 'C:/app');
  assert.equal(config.admin.totpRequired, false);
});

test('selecciona exclusivamente el par de credenciales del ambiente Bold', () => {
  const production = createRuntimeConfig({
    BOLD_ENVIRONMENT: 'production',
    BOLD_IDENTITY_KEY: 'legacy-test-identity',
    BOLD_SECRET_KEY: 'legacy-test-secret',
    BOLD_PRODUCTION_IDENTITY_KEY: 'production-identity',
    BOLD_PRODUCTION_SECRET_KEY: 'production-secret',
  }, 'C:/app');
  assert.equal(production.bold.identityKey, 'production-identity');
  assert.equal(production.bold.secretKey, 'production-secret');
  assert.equal(production.bold.credentialEnvironment, 'production');
  assert.equal(production.bold.credentialSource, 'production_specific');

  const testConfig = createRuntimeConfig({
    BOLD_ENVIRONMENT: 'test',
    BOLD_PRODUCTION_IDENTITY_KEY: 'production-identity',
    BOLD_PRODUCTION_SECRET_KEY: 'production-secret',
    BOLD_TEST_IDENTITY_KEY: 'test-identity',
    BOLD_TEST_SECRET_KEY: 'test-secret',
  }, 'C:/app');
  assert.equal(testConfig.bold.identityKey, 'test-identity');
  assert.equal(testConfig.bold.credentialEnvironment, 'test');
});

test('conserva la ruta original de la API después del rewrite de Vercel', () => {
  const request = {
    query: { path: 'payments/orders/QBM-001', vista: 'resumen' },
    url: '/api/index?path=payments%2Forders%2FQBM-001&vista=resumen',
  };
  normalizeVercelRewrite(request);
  assert.equal(request.url, '/api/payments/orders/QBM-001?vista=resumen');
});

test('Vercel informa que falta la base sin guardar órdenes temporalmente', async (context) => {
  const config = createRuntimeConfig({
    VERCEL: '1',
    BOLD_IDENTITY_KEY: 'test-identity',
    BOLD_SECRET_KEY: 'test-secret',
  }, 'C:/app');
  const { app } = createApp({ config, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${baseUrl}/api/payments/health`).then((response) => response.json());
  assert.equal(health.configured, false);
  assert.deepEqual(health.storage, { mode: 'unconfigured', configured: false, ready: false });

  const response = await fetch(`${baseUrl}/api/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { fullName: 'Cliente', email: 'cliente@example.com', phone: '3000000000' },
      delivery: { method: 'pickup' },
      destination: { scope: 'national' },
      items: [{ productId: 'anillo-rubi-aurora', measure: 'Talla 6', quantity: 1 }],
    }),
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'STORAGE_NOT_CONFIGURED');
});
