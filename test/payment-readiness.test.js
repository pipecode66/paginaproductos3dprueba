import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaymentReadiness } from '../server/payment-readiness.js';

const storage = { mode: 'postgresql', configured: true, ready: true };
const baseBoldConfig = {
  environment: 'production',
  identityKey: 'production-identity',
  secretKey: 'production-secret',
  publicBaseUrl: 'https://joyeriaquerubim.vercel.app',
  tax: '',
  productionEnabled: false,
};

test('mantiene producción bloqueada aun cuando la infraestructura está lista', () => {
  const readiness = buildPaymentReadiness({ boldConfig: baseBoldConfig, storage });
  assert.equal(readiness.launchStage, 'production_locked');
  assert.equal(readiness.readyToActivate, true);
  assert.equal(readiness.configured, false);
  assert.equal(readiness.canReceiveWebhooks, true);
  assert.equal(readiness.productionEnabled, false);
  assert.equal(
    readiness.webhookUrl,
    'https://joyeriaquerubim.vercel.app/api/payments/bold/webhook',
  );
});

test('solo informa producción activa después de abrir el interruptor explícito', () => {
  const readiness = buildPaymentReadiness({
    boldConfig: { ...baseBoldConfig, productionEnabled: true },
    storage,
  });
  assert.equal(readiness.launchStage, 'production_live');
  assert.equal(readiness.configured, true);
  assert.equal(readiness.live, true);
});

test('rechaza una preparación de producción sin HTTPS o almacenamiento', () => {
  const withoutHttps = buildPaymentReadiness({
    boldConfig: { ...baseBoldConfig, publicBaseUrl: 'http://joyeriaquerubim.test' },
    storage,
  });
  assert.equal(withoutHttps.launchStage, 'production_incomplete');
  assert.equal(withoutHttps.readyToActivate, false);

  const withoutStorage = buildPaymentReadiness({
    boldConfig: baseBoldConfig,
    storage: { mode: 'unconfigured', configured: false, ready: false },
  });
  assert.equal(withoutStorage.launchStage, 'production_incomplete');
  assert.equal(withoutStorage.canReceiveWebhooks, false);
});

test('permite pruebas locales sin exigir HTTPS de producción', () => {
  const readiness = buildPaymentReadiness({
    boldConfig: {
      ...baseBoldConfig,
      environment: 'test',
      publicBaseUrl: 'http://localhost:4173',
    },
    storage,
  });
  assert.equal(readiness.launchStage, 'test');
  assert.equal(readiness.configured, true);
  assert.equal(readiness.readyToActivate, false);
});
