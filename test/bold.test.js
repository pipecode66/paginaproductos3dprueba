import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createIntegritySignature,
  createWebhookSignature,
  mapBoldEventType,
  verifyWebhookSignature,
} from '../server/bold.js';

test('genera el hash de integridad en el orden exigido por Bold', () => {
  const signature = createIntegritySignature({
    orderId: 'inv0334',
    amount: 39400,
    currency: 'COP',
    secretKey: 'kgfq2nN0o52XqnuXZWIN2F',
  });

  assert.equal(signature, '620a64c6eab8858d0f96d4f818a1d77be5e9b9eb9dc681f527de1af54fc1b739');
});

test('valida la firma del webhook sobre el cuerpo crudo en Base64', () => {
  const rawBody = Buffer.from('{"id":"evt-1","type":"SALE_APPROVED"}');
  const secretKey = 'test-secret';
  const signature = createWebhookSignature(rawBody, secretKey);

  assert.equal(verifyWebhookSignature(rawBody, signature, secretKey), true);
  assert.equal(verifyWebhookSignature(Buffer.from('{"id":"evt-2"}'), signature, secretKey), false);
  assert.equal(verifyWebhookSignature(rawBody, 'invalid', secretKey), false);
});

test('traduce únicamente los eventos que cambian el estado de la orden', () => {
  assert.equal(mapBoldEventType('SALE_APPROVED'), 'PAID');
  assert.equal(mapBoldEventType('SALE_REJECTED'), 'REJECTED');
  assert.equal(mapBoldEventType('VOID_APPROVED'), 'VOIDED');
  assert.equal(mapBoldEventType('VOID_REJECTED', 'PAID'), 'PAID');
});
