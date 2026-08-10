import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdminSession, verifyAdminSession } from '../server/admin-auth.js';

const config = {
  email: 'admin@querubim.co',
  password: 'secret-password',
  sessionSecret: 'a-secure-test-session-secret-with-32-characters',
  sessionTtlMs: 15 * 60 * 1000,
  publicBaseUrl: 'https://joyeriaquerubim.vercel.app',
};

test('firma la sesión administrativa y rechaza tokens expirados o alterados', () => {
  const now = 1_800_000_000_000;
  const token = createAdminSession(config.email, config, now);

  assert.equal(verifyAdminSession(token, config, now + 60_000).sub, config.email);
  assert.equal(verifyAdminSession(token, config, now + config.sessionTtlMs + 1), null);
  assert.equal(verifyAdminSession(`${token}alterado`, config, now), null);
});
