import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generate, generateSecret } from 'otplib';
import {
  hashAdminPassword,
  isAdminHardened,
  verifyAdminCredentials,
  verifyAdminTotpCode,
} from '../server/admin-auth.js';
import { AdminSecurityStore } from '../server/admin-security-store.js';
import { createApp } from '../server/app.js';
import { CatalogRepository } from '../server/catalog-repository.js';
import { OrderStore } from '../server/order-store.js';

const ADMIN_EMAIL = 'admin@querubim.co';
const ADMIN_PASSWORD = 'Clave-Administrativa-Segura-2026';
const PUBLIC_ORIGIN = 'https://joyeriaquerubim.vercel.app';

test('protege la contraseña con Argon2id y exige configuración endurecida', async () => {
  const passwordHash = await hashAdminPassword(ADMIN_PASSWORD);
  const config = {
    email: ADMIN_EMAIL,
    passwordHash,
    sessionSecret: 'session-secret-with-more-than-thirty-two-characters',
    totpSecret: generateSecret(),
    securityEnforced: true,
  };

  assert.match(passwordHash, /^\$argon2id\$/);
  assert.equal(isAdminHardened(config), true);
  assert.equal(await verifyAdminCredentials(ADMIN_EMAIL, ADMIN_PASSWORD, config), true);
  assert.equal(await verifyAdminCredentials(ADMIN_EMAIL, 'contraseña-incorrecta', config), false);
});

test('acepta TOTP vigente y rechaza su reutilización persistente', async (context) => {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-security-store-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const filePath = path.join(runtimeDir, 'admin-security.json');
  const firstStore = new AdminSecurityStore(filePath);
  const secret = generateSecret();
  const token = await generate({ secret });
  const verified = await verifyAdminTotpCode(token, { totpSecret: secret, securityEnforced: true });

  assert.equal(verified.valid, true);
  assert.equal(await firstStore.consumeTotpStep(ADMIN_EMAIL, verified.timeStep), true);

  const reloadedStore = new AdminSecurityStore(filePath);
  const lastTimeStep = await reloadedStore.getLastTotpStep(ADMIN_EMAIL);
  const replay = await verifyAdminTotpCode(token, { totpSecret: secret, securityEnforced: true }, lastTimeStep);
  assert.equal(replay.valid, false);
});

test('permite suspender temporalmente TOTP sin aceptar contraseñas en texto plano', async () => {
  const config = {
    email: ADMIN_EMAIL,
    passwordHash: await hashAdminPassword(ADMIN_PASSWORD),
    sessionSecret: 'temporary-mfa-session-secret-with-more-than-thirty-two-characters',
    totpSecret: generateSecret(),
    totpRequired: false,
    allowLegacyPassword: false,
    securityEnforced: true,
  };

  assert.equal(isAdminHardened(config), true);
  assert.deepEqual(await verifyAdminTotpCode('', config), { valid: true, timeStep: undefined });
  assert.equal(await verifyAdminCredentials(ADMIN_EMAIL, ADMIN_PASSWORD, config), true);
  assert.equal(await verifyAdminCredentials(ADMIN_EMAIL, 'incorrecta', config), false);
});

test('exige origen y CSRF, revoca la sesión y conserva el bloqueo de acceso', async (context) => {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'querubim-hardened-admin-'));
  context.after(() => rm(runtimeDir, { recursive: true, force: true }));
  const catalogRepository = new CatalogRepository(path.join(runtimeDir, 'catalog.json'));
  const orderStore = new OrderStore(path.join(runtimeDir, 'orders.json'));
  const adminSecurityStore = new AdminSecurityStore(path.join(runtimeDir, 'admin-security.json'));
  const totpSecret = generateSecret();
  const passwordHash = await hashAdminPassword(ADMIN_PASSWORD);
  const config = {
    runtimeDir,
    bold: {
      environment: 'test',
      identityKey: 'test-identity',
      secretKey: 'test-secret',
      publicBaseUrl: PUBLIC_ORIGIN,
      tax: 'vat-19',
      productionEnabled: false,
    },
    admin: {
      email: ADMIN_EMAIL,
      passwordHash,
      sessionSecret: 'another-session-secret-with-more-than-thirty-two-characters',
      totpSecret,
      sessionTtlMs: 15 * 60 * 1000,
      publicBaseUrl: PUBLIC_ORIGIN,
      allowLegacyPassword: false,
      securityEnforced: true,
      enforceOrigin: true,
      loginPolicy: { windowMs: 15 * 60 * 1000, limit: 3, lockMs: 15 * 60 * 1000 },
    },
  };
  const r2Storage = {
    status: () => ({ configured: true, publicUrl: 'https://pub.example.r2.dev' }),
    createPresignedUpload: async () => ({}),
    deletePublicObject: async () => ({}),
  };
  const { app } = createApp({
    config,
    catalogRepository,
    orderStore,
    adminSecurityStore,
    r2Storage,
    logger: { error() {} },
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const loginBody = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    totpCode: await generate({ secret: totpSecret }),
  };

  const rejectedOrigin = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
    body: JSON.stringify(loginBody),
  });
  assert.equal(rejectedOrigin.status, 403);
  assert.equal((await rejectedOrigin.json()).code, 'ADMIN_ORIGIN_REJECTED');

  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: PUBLIC_ORIGIN },
    body: JSON.stringify(loginBody),
  });
  const loginResult = await login.json();
  const setCookie = login.headers.get('set-cookie');
  const cookie = setCookie.split(';')[0];
  assert.equal(login.status, 200);
  assert.match(setCookie, /^__Host-querubim_admin_session=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Strict/i);
  assert.ok(loginResult.csrfToken);

  const dashboard = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } });
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.headers.get('cache-control'), 'no-store, max-age=0');

  const missingCsrf = await fetch(`${baseUrl}/api/admin/logout`, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: PUBLIC_ORIGIN },
  });
  assert.equal(missingCsrf.status, 403);
  assert.equal((await missingCsrf.json()).code, 'ADMIN_REQUEST_REJECTED');

  const replay = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: PUBLIC_ORIGIN },
    body: JSON.stringify(loginBody),
  });
  assert.equal(replay.status, 401);

  const logout = await fetch(`${baseUrl}/api/admin/logout`, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: PUBLIC_ORIGIN, 'x-querubim-csrf': loginResult.csrfToken },
  });
  assert.equal(logout.status, 200);
  const revoked = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Cookie: cookie } });
  assert.equal(revoked.status, 401);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const invalid = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: PUBLIC_ORIGIN },
      body: JSON.stringify({ ...loginBody, password: `incorrecta-${attempt}` }),
    });
    assert.equal(invalid.status, 401);
  }
  const locked = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: PUBLIC_ORIGIN },
    body: JSON.stringify({ ...loginBody, totpCode: await generate({ secret: totpSecret }) }),
  });
  assert.equal(locked.status, 429);
  assert.equal((await locked.json()).code, 'ADMIN_LOGIN_LOCKED');
  assert.ok(Number(locked.headers.get('retry-after')) > 0);
});
