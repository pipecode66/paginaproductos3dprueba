const FULFILLMENT_TRANSITIONS = {
  PENDING: new Set(['PENDING', 'CONFIRMED', 'CANCELLED']),
  CONFIRMED: new Set(['CONFIRMED', 'PREPARING', 'CANCELLED']),
  PREPARING: new Set(['CONFIRMED', 'PREPARING', 'READY', 'CANCELLED']),
  READY: new Set(['PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  SHIPPED: new Set(['READY', 'SHIPPED', 'DELIVERED']),
  DELIVERED: new Set(['DELIVERED']),
  CANCELLED: new Set(['CANCELLED', 'CONFIRMED']),
};

const PAID_FULFILLMENT_STATUSES = new Set(['CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED']);

export class OrderManagementError extends Error {
  constructor(message, statusCode = 400, code = 'INVALID_ORDER_UPDATE') {
    super(message);
    this.name = 'OrderManagementError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().replace(/\r\n/g, '\n').slice(0, maxLength);
}

export function getDefaultFulfillmentStatus(order) {
  if (order?.fulfillmentStatus && FULFILLMENT_TRANSITIONS[order.fulfillmentStatus]) return order.fulfillmentStatus;
  if (order?.status === 'PAID') return 'CONFIRMED';
  if (order?.status === 'REJECTED' || order?.status === 'VOIDED') return 'CANCELLED';
  return 'PENDING';
}

export function normalizeManagedOrder(order) {
  if (!order) return null;
  return { ...order, fulfillmentStatus: getDefaultFulfillmentStatus(order) };
}

export function updateManagedOrder(order, payload, adminEmail, now = Date.now()) {
  const current = getDefaultFulfillmentStatus(order);
  const requested = cleanText(payload?.fulfillmentStatus || current, 30).toUpperCase();
  if (!FULFILLMENT_TRANSITIONS[requested]) {
    throw new OrderManagementError('El estado operativo seleccionado no es válido.', 400, 'INVALID_FULFILLMENT_STATUS');
  }
  if (!FULFILLMENT_TRANSITIONS[current].has(requested)) {
    throw new OrderManagementError(
      'Ese cambio no respeta el flujo operativo del pedido.',
      409,
      'INVALID_FULFILLMENT_TRANSITION',
    );
  }
  if (PAID_FULFILLMENT_STATUSES.has(requested) && order.status !== 'PAID') {
    throw new OrderManagementError(
      'Bold todavía no confirma el pago; el pedido no puede pasar a preparación.',
      409,
      'PAYMENT_NOT_APPROVED',
    );
  }

  const internalNotes = cleanText(payload?.internalNotes, 2000);
  if (requested === 'CANCELLED' && requested !== current && !internalNotes) {
    throw new OrderManagementError(
      'Indica el motivo de la cancelación en las notas internas.',
      400,
      'CANCELLATION_REASON_REQUIRED',
    );
  }

  const updatedAt = new Date(now).toISOString();
  const history = Array.isArray(order.fulfillmentHistory) ? order.fulfillmentHistory.slice(-24) : [];
  if (requested !== current) {
    history.push({ from: current, to: requested, at: updatedAt, by: adminEmail });
  }

  return {
    ...order,
    fulfillmentStatus: requested,
    internalNotes,
    shippingCarrier: cleanText(payload?.shippingCarrier, 100),
    trackingNumber: cleanText(payload?.trackingNumber, 120),
    fulfillmentUpdatedAt: updatedAt,
    fulfillmentUpdatedBy: adminEmail,
    fulfillmentHistory: history,
  };
}
