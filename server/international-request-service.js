import { randomBytes, timingSafeEqual } from 'node:crypto';
import { PaymentError } from './payment-service.js';

const WHATSAPP_NUMBER = '573225435618';

function cleanText(value, maxLength) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function createRequestId(now = Date.now()) {
  return `QBI-${now.toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

function createToken() {
  return randomBytes(24).toString('base64url');
}

function tokensMatch(received, expected) {
  const first = Buffer.from(String(received || ''));
  const second = Buffer.from(String(expected || ''));
  return first.length === second.length && first.length > 0 && timingSafeEqual(first, second);
}

function requestError(message, statusCode = 400, code = 'INVALID_INTERNATIONAL_REQUEST') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.expose = true;
  return error;
}

function publicRequest(request, order = null) {
  if (!request) return null;
  let status = request.status;
  if (order?.status === 'PAID') status = 'PAYMENT_CONFIRMED';
  if (order?.status === 'REVIEW_REQUIRED') status = 'PAYMENT_REVIEW';
  if (['REJECTED', 'VOIDED', 'EXPIRED'].includes(order?.status)) status = `PAYMENT_${order.status}`;
  return {
    id: request.id,
    status,
    customer: request.customer,
    destination: request.destination,
    delivery: request.delivery,
    items: request.items,
    subtotal: request.subtotal,
    commercialAdjustment: request.commercialAdjustment,
    adjustmentRate: request.adjustmentRate,
    amount: request.amount,
    currency: request.currency,
    conditions: request.conditions ?? null,
    paymentOrderId: request.paymentOrderId ?? null,
    paymentStatus: order?.status ?? null,
    paymentAmount: order?.amount ?? request.paymentAmount ?? null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

function sanitizeConditions(input = {}, current = {}) {
  const shippingCost = input.shippingCost === '' || input.shippingCost == null
    ? 0
    : Number(input.shippingCost);
  if (!Number.isSafeInteger(shippingCost) || shippingCost < 0 || shippingCost > 100_000_000) {
    throw requestError('El valor estimado del envío debe ser un número válido en COP.', 400, 'INVALID_SHIPPING_COST');
  }
  const conditions = {
    carrier: cleanText(input.carrier ?? current.carrier, 120),
    shippingCost,
    estimatedDelivery: cleanText(input.estimatedDelivery ?? current.estimatedDelivery, 120),
    paymentTerms: cleanText(input.paymentTerms ?? current.paymentTerms, 500),
    internalNotes: cleanText(input.internalNotes ?? current.internalNotes, 1000),
    agreed: Boolean(input.agreed),
  };
  if (!conditions.paymentTerms) {
    throw requestError('Describe las condiciones acordadas para la venta internacional.', 400, 'INTERNATIONAL_TERMS_REQUIRED');
  }
  return conditions;
}

export class InternationalRequestService {
  constructor({ store, paymentService, publicBaseUrl, clock = () => Date.now(), requestIdFactory = createRequestId }) {
    this.store = store;
    this.paymentService = paymentService;
    this.publicBaseUrl = publicBaseUrl;
    this.clock = clock;
    this.requestIdFactory = requestIdFactory;
  }

  async create(payload = {}) {
    const prepared = await this.paymentService.prepareOrderPayload(payload);
    if (prepared.destination.scope !== 'international' || prepared.delivery.method !== 'delivery') {
      throw requestError(
        'La bandeja internacional solo recibe entregas fuera de Colombia.',
        400,
        'INTERNATIONAL_DESTINATION_REQUIRED',
      );
    }

    const now = new Date(this.clock()).toISOString();
    const request = {
      id: this.requestIdFactory(this.clock()),
      status: 'PENDING_REVIEW',
      customer: prepared.customer,
      destination: prepared.destination,
      delivery: prepared.delivery,
      items: prepared.items,
      subtotal: prepared.subtotal,
      commercialAdjustment: prepared.commercialAdjustment,
      adjustmentRate: prepared.adjustmentRate,
      amount: prepared.amount,
      currency: 'COP',
      createdAt: now,
      updatedAt: now,
    };
    await this.store.create(request);

    const message = [
      `Hola Querubim, registré la solicitud internacional ${request.id}.`,
      `Destino: ${request.delivery.address.country}, ${request.delivery.address.city}.`,
      `Valor estimado de las joyas: $${request.amount.toLocaleString('es-CO')} COP.`,
      'Quiero coordinar las condiciones del envío internacional.',
    ].join('\n');
    return {
      request: publicRequest(request),
      whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    };
  }

  async listForAdmin(orders = []) {
    const orderById = new Map(orders.map((order) => [order.id, order]));
    return (await this.store.list(100)).map((request) => {
      const order = request.paymentOrderId ? orderById.get(request.paymentOrderId) : null;
      if (request.paymentToken && order) return this.buildPaymentResponse(request, order).requestWithLinks;
      return publicRequest(request, order);
    });
  }

  async saveConditions(requestId, input, adminEmail) {
    const updated = await this.store.update(requestId, (current) => {
      if (current.status === 'CANCELLED') {
        throw requestError('La solicitud está cancelada y no puede modificarse.', 409, 'INTERNATIONAL_REQUEST_CANCELLED');
      }
      if (current.paymentOrderId) {
        throw requestError('La orden de pago ya fue generada; las condiciones quedaron bloqueadas.', 409, 'PAYMENT_ALREADY_CREATED');
      }
      const conditions = sanitizeConditions(input, current.conditions);
      return {
        ...current,
        status: 'CONDITIONS_SET',
        conditions,
        conditionsUpdatedBy: adminEmail,
        updatedAt: new Date(this.clock()).toISOString(),
      };
    });
    if (!updated) throw requestError('No encontramos la solicitud internacional.', 404, 'INTERNATIONAL_REQUEST_NOT_FOUND');
    return publicRequest(updated);
  }

  async generatePayment(requestId, adminEmail) {
    const current = await this.store.get(requestId);
    if (!current) throw requestError('No encontramos la solicitud internacional.', 404, 'INTERNATIONAL_REQUEST_NOT_FOUND');
    if (current.status === 'CANCELLED') {
      throw requestError('La solicitud está cancelada.', 409, 'INTERNATIONAL_REQUEST_CANCELLED');
    }
    if (!current.conditions?.agreed) {
      throw requestError(
        'Confirma que el cliente aceptó las condiciones antes de generar el pago.',
        409,
        'INTERNATIONAL_CONDITIONS_NOT_AGREED',
      );
    }

    if (current.paymentOrderId && current.paymentToken) {
      const existingOrder = await this.paymentService.getOrder(current.paymentOrderId);
      if (existingOrder && ['CREATED', 'PAID', 'REVIEW_REQUIRED'].includes(existingOrder.status)) {
        return this.buildPaymentResponse(current, existingOrder);
      }
    }

    const result = await this.paymentService.createOrder({
      customer: current.customer,
      delivery: {
        method: current.delivery.method,
        ...(current.delivery.address || {}),
      },
      destination: current.destination,
      items: current.items.map(({ productId, measure, quantity }) => ({ productId, measure, quantity })),
    });
    const paymentToken = createToken();
    const updated = await this.store.update(requestId, (request) => ({
      ...request,
      status: 'READY_FOR_PAYMENT',
      paymentOrderId: result.order.id,
      paymentAmount: result.order.amount,
      paymentToken,
      paymentGeneratedBy: adminEmail,
      paymentGeneratedAt: new Date(this.clock()).toISOString(),
      updatedAt: new Date(this.clock()).toISOString(),
    }));
    return this.buildPaymentResponse(updated, result.order);
  }

  buildPaymentResponse(request, order) {
    const paymentUrl = new URL('/pago/internacional', this.publicBaseUrl);
    paymentUrl.searchParams.set('solicitud', request.id);
    paymentUrl.searchParams.set('token', request.paymentToken);
    const message = [
      `Hola ${request.customer.fullName}, tu solicitud internacional ${request.id} está lista para pagar.`,
      `Total de las joyas: $${Number(order.amount).toLocaleString('es-CO')} COP.`,
      `Condiciones de envío: ${request.conditions.paymentTerms}`,
      `Enlace seguro de pago: ${paymentUrl}`,
    ].join('\n');
    const requestWithLinks = {
      ...publicRequest(request, order),
      paymentUrl: paymentUrl.toString(),
      whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    };
    return {
      request: requestWithLinks,
      requestWithLinks,
      paymentUrl: paymentUrl.toString(),
      whatsappUrl: requestWithLinks.whatsappUrl,
    };
  }

  async getCheckout(requestId, token) {
    const request = await this.store.get(requestId);
    if (!request || !tokensMatch(token, request.paymentToken)) {
      throw requestError('El enlace de pago internacional no es válido.', 403, 'INVALID_INTERNATIONAL_PAYMENT_LINK');
    }
    if (!request.paymentOrderId) {
      throw requestError('La solicitud todavía no está lista para pago.', 409, 'INTERNATIONAL_PAYMENT_NOT_READY');
    }
    return this.paymentService.getCheckout(request.paymentOrderId);
  }

  async cancel(requestId, adminEmail) {
    const updated = await this.store.update(requestId, (current) => {
      if (current.paymentOrderId) {
        throw requestError('No se puede cancelar aquí una solicitud con orden Bold generada.', 409, 'PAYMENT_ALREADY_CREATED');
      }
      return {
        ...current,
        status: 'CANCELLED',
        cancelledBy: adminEmail,
        cancelledAt: new Date(this.clock()).toISOString(),
        updatedAt: new Date(this.clock()).toISOString(),
      };
    });
    if (!updated) throw requestError('No encontramos la solicitud internacional.', 404, 'INTERNATIONAL_REQUEST_NOT_FOUND');
    return publicRequest(updated);
  }
}
