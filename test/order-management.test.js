import assert from 'node:assert/strict';
import test from 'node:test';
import { getDefaultFulfillmentStatus, updateManagedOrder } from '../server/order-management.js';

test('deriva el estado operativo sin modificar el estado financiero', () => {
  const paidOrder = { id: 'QBM-001', status: 'PAID' };
  assert.equal(getDefaultFulfillmentStatus(paidOrder), 'CONFIRMED');

  const prepared = updateManagedOrder(
    paidOrder,
    { fulfillmentStatus: 'PREPARING', internalNotes: 'Revisar grabado.' },
    'admin@querubim.co',
    1_800_000_000_000,
  );
  assert.equal(prepared.status, 'PAID');
  assert.equal(prepared.fulfillmentStatus, 'PREPARING');
  assert.equal(prepared.fulfillmentHistory.length, 1);
});

test('impide preparar órdenes sin pago y reabrir pedidos entregados', () => {
  assert.throws(
    () => updateManagedOrder({ status: 'CREATED' }, { fulfillmentStatus: 'CONFIRMED' }, 'admin@querubim.co'),
    (error) => error.code === 'PAYMENT_NOT_APPROVED',
  );
  assert.throws(
    () => updateManagedOrder(
      { status: 'PAID', fulfillmentStatus: 'DELIVERED' },
      { fulfillmentStatus: 'PREPARING' },
      'admin@querubim.co',
    ),
    (error) => error.code === 'INVALID_FULFILLMENT_TRANSITION',
  );
});

test('exige una razón para cancelar y permite reabrir únicamente órdenes pagadas', () => {
  assert.throws(
    () => updateManagedOrder(
      { status: 'PAID', fulfillmentStatus: 'PREPARING' },
      { fulfillmentStatus: 'CANCELLED', internalNotes: '' },
      'admin@querubim.co',
    ),
    (error) => error.code === 'CANCELLATION_REASON_REQUIRED',
  );
  const reopened = updateManagedOrder(
    { status: 'PAID', fulfillmentStatus: 'CANCELLED' },
    { fulfillmentStatus: 'CONFIRMED', internalNotes: 'Cliente retomó el pedido.' },
    'admin@querubim.co',
  );
  assert.equal(reopened.fulfillmentStatus, 'CONFIRMED');
});
