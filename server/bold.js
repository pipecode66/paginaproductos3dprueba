import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function createIntegritySignature({ orderId, amount, currency, secretKey }) {
  return createHash('sha256').update(`${orderId}${amount}${currency}${secretKey}`, 'utf8').digest('hex');
}

export function createWebhookSignature(rawBody, secretKey) {
  const encodedBody = Buffer.from(rawBody).toString('base64');
  return createHmac('sha256', secretKey).update(encodedBody, 'utf8').digest('hex');
}

export function verifyWebhookSignature(rawBody, receivedSignature, secretKey) {
  if (!receivedSignature || !secretKey) return false;
  const expected = Buffer.from(createWebhookSignature(rawBody, secretKey), 'utf8');
  const received = Buffer.from(String(receivedSignature).trim(), 'utf8');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function mapBoldEventType(type, currentStatus = 'CREATED') {
  const statusByEvent = {
    SALE_APPROVED: 'PAID',
    SALE_REJECTED: 'REJECTED',
    VOID_APPROVED: 'VOIDED',
  };

  return statusByEvent[type] ?? currentStatus;
}
