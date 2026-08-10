import { randomBytes } from 'node:crypto';
import { createIntegritySignature, mapBoldEventType, verifyWebhookSignature } from './bold.js';

const ORDER_LIFETIME_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 20;
const MAX_QUANTITY = 10;

export class PaymentError extends Error {
  constructor(message, statusCode = 400, code = 'INVALID_PAYMENT_REQUEST') {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sanitizeCustomer(customer = {}) {
  const sanitized = {
    fullName: cleanText(customer.fullName, 100),
    email: cleanText(customer.email, 160).toLowerCase(),
    phone: cleanText(customer.phone, 24).replace(/[^\d+\s()-]/g, ''),
  };

  if (sanitized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
    throw new PaymentError('El correo electrónico no tiene un formato válido.');
  }
  if (!sanitized.fullName || !sanitized.email || sanitized.phone.replace(/\D/g, '').length < 7) {
    throw new PaymentError('Nombre, correo electrónico y celular son obligatorios para crear la orden.');
  }

  return sanitized;
}

function createOrderId(now = Date.now()) {
  const time = now.toString(36).toUpperCase();
  const random = randomBytes(5).toString('hex').toUpperCase();
  return `QBM-${time}-${random}`;
}

function buildDescription(items) {
  const names = items.map((item) => item.name).join(', ');
  const description = `Compra Querubim: ${names}`;
  return description.length <= 100 ? description : `${description.slice(0, 97)}...`;
}

function publicOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    items: order.items,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt ?? null,
    paymentId: order.paymentId ?? null,
    paymentMethod: order.paymentMethod ?? null,
    lastEventType: order.lastEventType ?? null,
    reviewReason: order.reviewReason ?? null,
  };
}

export class PaymentService {
  constructor({ catalogRepository, orderStore, boldConfig, clock = () => Date.now(), orderIdFactory = createOrderId }) {
    this.catalogRepository = catalogRepository;
    this.orderStore = orderStore;
    this.boldConfig = boldConfig;
    this.clock = clock;
    this.orderIdFactory = orderIdFactory;
  }

  assertConfigured() {
    const { environment, identityKey, secretKey, productionEnabled, publicBaseUrl, tax } = this.boldConfig;
    if (!identityKey || !secretKey) {
      throw new PaymentError('El servicio de pagos todavía no está configurado.', 503, 'PAYMENTS_NOT_CONFIGURED');
    }
    if (environment === 'production' && !productionEnabled) {
      throw new PaymentError('Los pagos de producción están bloqueados hasta completar la validación final.', 503, 'PRODUCTION_LOCKED');
    }
    let baseUrl;
    try {
      baseUrl = new URL(publicBaseUrl);
    } catch {
      throw new PaymentError('La URL pública del comercio no es válida.', 503, 'INVALID_PUBLIC_URL');
    }
    if (environment === 'production' && baseUrl.protocol !== 'https:') {
      throw new PaymentError('La URL pública de producción debe usar HTTPS.', 503, 'HTTPS_REQUIRED');
    }
    if (tax && !/^(vat-5|vat-19|iac-8|\d+(?:\.\d{1,2})?)$/.test(tax)) {
      throw new PaymentError('La configuración de impuestos de Bold no es válida.', 503, 'INVALID_TAX_CONFIGURATION');
    }
  }

  async createOrder(payload = {}) {
    this.assertConfigured();
    if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > MAX_ITEMS) {
      throw new PaymentError('La canasta debe contener entre 1 y 20 productos.');
    }

    const requestedItems = payload.items.map((item) => ({
      productId: cleanText(item.productId, 100),
      measure: cleanText(item.measure, 80),
      quantity: Number(item.quantity ?? 1),
    }));
    const productQuantities = new Map();
    const orderItems = [];

    for (const requested of requestedItems) {
      if (!requested.productId || !requested.measure) {
        throw new PaymentError('Cada producto debe incluir su referencia y medida.');
      }
      if (!Number.isInteger(requested.quantity) || requested.quantity < 1 || requested.quantity > MAX_QUANTITY) {
        throw new PaymentError('La cantidad solicitada no es válida.');
      }

      const product = await this.catalogRepository.findById(requested.productId);
      if (!product) throw new PaymentError('Uno de los productos ya no está disponible.', 409, 'PRODUCT_NOT_AVAILABLE');
      if (!product.measurements.includes(requested.measure)) {
        throw new PaymentError(`La medida seleccionada para ${product.name} no está disponible.`, 409, 'MEASURE_NOT_AVAILABLE');
      }

      const accumulatedQuantity = (productQuantities.get(product.id) ?? 0) + requested.quantity;
      productQuantities.set(product.id, accumulatedQuantity);
      if (accumulatedQuantity > product.stock) {
        throw new PaymentError(`No hay existencias suficientes de ${product.name}.`, 409, 'INSUFFICIENT_STOCK');
      }
      if (!Number.isSafeInteger(product.price) || product.price < 1000) {
        throw new PaymentError(`El precio de ${product.name} requiere revisión.`, 409, 'INVALID_CATALOG_PRICE');
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        measure: requested.measure,
        quantity: requested.quantity,
        unitPrice: product.price,
        subtotal: product.price * requested.quantity,
      });
    }

    const amount = orderItems.reduce((total, item) => total + item.subtotal, 0);
    if (!Number.isSafeInteger(amount) || amount < 1000) {
      throw new PaymentError('El total de la orden no es válido.');
    }

    const now = this.clock();
    const orderId = this.orderIdFactory(now);
    const expiresAt = now + ORDER_LIFETIME_MS;
    const currency = 'COP';
    const customer = sanitizeCustomer(payload.customer);
    const order = {
      id: orderId,
      status: 'CREATED',
      amount,
      currency,
      items: orderItems,
      customer,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      environment: this.boldConfig.environment,
    };

    await this.orderStore.create(order);

    const redirectionUrl = new URL('/pago/resultado', this.boldConfig.publicBaseUrl);
    redirectionUrl.searchParams.set('orden', orderId);
    const payment = {
      orderId,
      currency,
      amount: String(amount),
      apiKey: this.boldConfig.identityKey,
      integritySignature: createIntegritySignature({
        orderId,
        amount,
        currency,
        secretKey: this.boldConfig.secretKey,
      }),
      description: buildDescription(orderItems),
      renderMode: 'embedded',
    };
    if (redirectionUrl.protocol === 'https:') payment.redirectionUrl = redirectionUrl.toString();
    if (this.boldConfig.tax) payment.tax = this.boldConfig.tax;

    return { order: publicOrder(order), payment, environment: this.boldConfig.environment };
  }

  async getOrder(orderId) {
    return publicOrder(await this.orderStore.get(orderId));
  }

  async processWebhook(rawBody, receivedSignature) {
    this.assertConfigured();
    if (!verifyWebhookSignature(rawBody, receivedSignature, this.boldConfig.secretKey)) {
      throw new PaymentError('Firma de webhook inválida.', 401, 'INVALID_WEBHOOK_SIGNATURE');
    }

    let event;
    try {
      event = JSON.parse(Buffer.from(rawBody).toString('utf8'));
    } catch {
      throw new PaymentError('El webhook no contiene JSON válido.', 400, 'INVALID_WEBHOOK_BODY');
    }

    const eventId = cleanText(event.id, 100);
    const eventType = cleanText(event.type, 40);
    const orderId = cleanText(event.data?.metadata?.reference, 100);
    if (!eventId || !eventType || !orderId) {
      throw new PaymentError('El webhook no incluye los identificadores requeridos.', 400, 'INCOMPLETE_WEBHOOK');
    }

    const receivedAt = new Date(this.clock()).toISOString();
    const eventAmount = Number(event.data?.amount?.total);
    const eventCurrency = cleanText(event.data?.amount?.currency, 8);
    const result = await this.orderStore.recordEvent(
      eventId,
      { id: eventId, type: eventType, orderId, subject: cleanText(event.subject, 100), receivedAt },
      (order) => {
        const amountMatches = eventAmount === order.amount;
        const currencyMatches = eventCurrency === order.currency;
        const next = {
          ...order,
          lastEventType: eventType,
          lastWebhookAt: receivedAt,
          paymentId: cleanText(event.data?.payment_id || event.subject, 100),
          paymentMethod: cleanText(event.data?.payment_method, 40),
          payerEmail: cleanText(event.data?.payer_email, 160),
        };

        if (!amountMatches || !currencyMatches) {
          next.status = 'REVIEW_REQUIRED';
          next.reviewReason = 'El monto o la moneda notificados por Bold no coinciden con la orden.';
          return next;
        }

        next.status = mapBoldEventType(eventType, order.status);
        if (eventType === 'SALE_APPROVED') next.paidAt = receivedAt;
        if (eventType === 'VOID_REJECTED') next.voidStatus = 'REJECTED';
        return next;
      },
    );

    return { duplicate: result.duplicate, order: publicOrder(result.order) };
  }
}
