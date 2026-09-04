import { randomBytes } from 'node:crypto';
import { createIntegritySignature, mapBoldEventType, verifyWebhookSignature } from './bold.js';
import { getDefaultFulfillmentStatus } from './order-management.js';
import { getSelectedProductPrice } from './product-pricing.js';

const ORDER_LIFETIME_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 20;
const MAX_QUANTITY = 10;
const DESTINATION_POLICIES = {
  national: { label: 'Colombia', adjustmentRate: 5 },
  international: { label: 'Fuera de Colombia', adjustmentRate: 6 },
};
const PICKUP_ADDRESS = 'Centro Comercial Alejandría, Av. 6 entre calles 8 y 9, Entrada 5, Local 1-161, Cúcuta, Norte de Santander';

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

function sanitizeDestination(destination = {}) {
  const scope = cleanText(destination.scope, 20).toLowerCase();
  const policy = DESTINATION_POLICIES[scope];
  if (!policy) {
    throw new PaymentError('Selecciona si la entrega será en Colombia o fuera de Colombia.');
  }
  return { scope, label: policy.label };
}

function sanitizeDelivery(delivery = {}, requestedDestination = {}) {
  const method = cleanText(delivery.method, 20).toLowerCase();
  if (method === 'pickup') {
    return {
      destination: { scope: 'national', label: DESTINATION_POLICIES.national.label },
      delivery: { method, label: 'Recoger en tienda', pickupAddress: PICKUP_ADDRESS },
    };
  }
  if (method !== 'delivery') {
    throw new PaymentError('Selecciona si deseas recoger la compra o recibirla a domicilio.');
  }

  const destination = sanitizeDestination(requestedDestination);
  const address = {
    country: destination.scope === 'national' ? 'Colombia' : cleanText(delivery.country, 80),
    department: cleanText(delivery.department, 100),
    city: cleanText(delivery.city, 100),
    addressLine: cleanText(delivery.addressLine, 180),
    reference: cleanText(delivery.reference, 200),
    postalCode: cleanText(delivery.postalCode, 20).replace(/[^A-Za-z0-9 -]/g, ''),
  };

  if (!address.country || !address.city || !address.addressLine) {
    throw new PaymentError('Completa el país, la ciudad y la dirección de entrega.');
  }
  if (destination.scope === 'national' && !address.department) {
    throw new PaymentError('Completa el departamento de entrega.');
  }
  if (destination.scope === 'international' && address.country.toLowerCase() === 'colombia') {
    throw new PaymentError('Para entregas en Colombia selecciona el destino nacional.');
  }

  return {
    destination,
    delivery: {
      method,
      label: 'Envío a domicilio',
      address,
      shippingPayment: destination.scope === 'international' ? 'TO_BE_AGREED' : 'PAY_ON_DELIVERY',
      shippingPaymentLabel: destination.scope === 'international'
        ? 'El envío internacional se coordina y paga según las condiciones acordadas'
        : 'El domicilio se paga por separado al recibir',
    },
  };
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
    subtotal: order.subtotal,
    commercialAdjustment: order.commercialAdjustment,
    adjustmentRate: order.adjustmentRate,
    destination: order.destination,
    delivery: order.delivery,
    inventoryStatus: order.inventoryStatus,
    taxRate: order.taxRate,
    currency: order.currency,
    items: (order.items || []).map(({ productId, name, category, measure, quantity, unitPrice, subtotal }) => ({
      productId,
      name,
      category,
      measure,
      quantity,
      unitPrice,
      subtotal,
    })),
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
  constructor({
    catalogRepository,
    orderStore,
    businessSettingsRepository,
    boldConfig,
    clock = () => Date.now(),
    orderIdFactory = createOrderId,
  }) {
    this.catalogRepository = catalogRepository;
    this.orderStore = orderStore;
    this.businessSettingsRepository = businessSettingsRepository;
    this.boldConfig = boldConfig;
    this.clock = clock;
    this.orderIdFactory = orderIdFactory;
  }

  assertCredentialsConfigured() {
    const { identityKey, secretKey } = this.boldConfig;
    if (!identityKey || !secretKey) {
      throw new PaymentError('El servicio de pagos todavía no está configurado.', 503, 'PAYMENTS_NOT_CONFIGURED');
    }
  }

  assertConfigured() {
    const { environment, productionEnabled, publicBaseUrl, tax, credentialEnvironment } = this.boldConfig;
    this.assertCredentialsConfigured();
    const credentialsMatchEnvironment = !credentialEnvironment
      || credentialEnvironment === environment
      || (credentialEnvironment === 'legacy' && environment === 'test');
    if (!credentialsMatchEnvironment) {
      throw new PaymentError(
        'Las credenciales de Bold no corresponden al ambiente seleccionado.',
        503,
        'BOLD_CREDENTIAL_ENVIRONMENT_MISMATCH',
      );
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

  async prepareOrderPayload(payload = {}) {
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
    const businessSettings = this.businessSettingsRepository
      ? await this.businessSettingsRepository.get()
      : { gold: { enabled: false, pricePerGram: 0 } };

    for (const requested of requestedItems) {
      if (!requested.productId || !requested.measure) {
        throw new PaymentError('Cada producto debe incluir su referencia y medida.');
      }
      if (!Number.isInteger(requested.quantity) || requested.quantity < 1 || requested.quantity > MAX_QUANTITY) {
        throw new PaymentError('La cantidad solicitada no es válida.');
      }

      const product = await this.catalogRepository.findById(requested.productId);
      if (!product) throw new PaymentError('Uno de los productos ya no está disponible.', 409, 'PRODUCT_NOT_AVAILABLE');
      if (
        Array.isArray(businessSettings.categories)
        && !businessSettings.categories.some((category) => category.slug === product.category && category.active !== false)
      ) {
        throw new PaymentError('Uno de los productos ya no está disponible.', 409, 'PRODUCT_NOT_AVAILABLE');
      }
      if (!product.measurements.includes(requested.measure)) {
        throw new PaymentError(`La medida seleccionada para ${product.name} no está disponible.`, 409, 'MEASURE_NOT_AVAILABLE');
      }

      const accumulatedQuantity = (productQuantities.get(product.id) ?? 0) + requested.quantity;
      productQuantities.set(product.id, accumulatedQuantity);
      if (accumulatedQuantity > product.stock) {
        throw new PaymentError(`No hay existencias suficientes de ${product.name}.`, 409, 'INSUFFICIENT_STOCK');
      }
      const selectedPrice = getSelectedProductPrice(product, requested.measure, businessSettings.gold);
      if (!selectedPrice || !Number.isSafeInteger(selectedPrice.price) || selectedPrice.price < 1000) {
        throw new PaymentError(`El precio de ${product.name} requiere revisión.`, 409, 'INVALID_CATALOG_PRICE');
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        measure: requested.measure,
        quantity: requested.quantity,
        unitPrice: selectedPrice.price,
        subtotal: selectedPrice.price * requested.quantity,
        pricingMode: selectedPrice.mode,
        garmentPriceSnapshot: product.price,
        goldPricePerGramSnapshot: selectedPrice.mode === 'gold_by_weight' ? businessSettings.gold.pricePerGram : null,
        weightGramsSnapshot: selectedPrice.mode === 'gold_by_weight'
          ? product.measurementWeights?.find((entry) => entry.measure === requested.measure)?.weightGrams ?? null
          : null,
      });
    }

    const subtotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
    const checkoutDelivery = sanitizeDelivery(payload.delivery, payload.destination);
    const { destination, delivery } = checkoutDelivery;
    const adjustmentRate = DESTINATION_POLICIES[destination.scope].adjustmentRate;
    const commercialAdjustment = Math.round((subtotal * adjustmentRate) / 100);
    const amount = subtotal + commercialAdjustment;
    if (!Number.isSafeInteger(amount) || amount < 1000) {
      throw new PaymentError('El total de la orden no es válido.');
    }

    return {
      items: orderItems,
      subtotal,
      commercialAdjustment,
      adjustmentRate,
      amount,
      destination,
      delivery,
      customer: sanitizeCustomer(payload.customer),
    };
  }

  buildPaymentPayload(order) {
    const redirectionUrl = new URL('/pago/resultado', this.boldConfig.publicBaseUrl);
    redirectionUrl.searchParams.set('orden', order.id);
    const payment = {
      orderId: order.id,
      currency: order.currency,
      amount: String(order.amount),
      apiKey: this.boldConfig.identityKey,
      integritySignature: createIntegritySignature({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        secretKey: this.boldConfig.secretKey,
      }),
      description: buildDescription(order.items),
      renderMode: 'embedded',
    };
    if (redirectionUrl.protocol === 'https:') payment.redirectionUrl = redirectionUrl.toString();
    if (this.boldConfig.tax) payment.tax = this.boldConfig.tax;
    return payment;
  }

  async createOrder(payload = {}) {
    this.assertConfigured();
    if (typeof this.orderStore.releaseExpiredReservations === 'function') {
      await this.orderStore.releaseExpiredReservations(new Date(this.clock()).toISOString());
    }

    const prepared = await this.prepareOrderPayload(payload);
    const {
      items: orderItems,
      subtotal,
      commercialAdjustment,
      adjustmentRate,
      amount,
      destination,
      delivery,
      customer,
    } = prepared;

    const now = this.clock();
    const orderId = this.orderIdFactory(now);
    const expiresAt = now + ORDER_LIFETIME_MS;
    const currency = 'COP';
    const order = {
      id: orderId,
      status: 'CREATED',
      amount,
      subtotal,
      commercialAdjustment,
      adjustmentRate,
      destination,
      delivery,
      taxRate: 19,
      currency,
      items: orderItems,
      customer,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      environment: this.boldConfig.environment,
      fulfillmentStatus: 'PENDING',
      inventoryStatus: 'RESERVED',
    };

    if (typeof this.orderStore.createWithReservation === 'function') {
      await this.orderStore.createWithReservation(order);
    } else {
      await this.orderStore.create(order);
    }

    const payment = this.buildPaymentPayload(order);

    return { order: publicOrder(order), payment, environment: this.boldConfig.environment };
  }

  async getCheckout(orderId) {
    this.assertConfigured();
    const order = await this.orderStore.get(orderId);
    if (!order) throw new PaymentError('No encontramos la orden solicitada.', 404, 'ORDER_NOT_FOUND');
    if (order.status !== 'CREATED' || order.inventoryStatus !== 'RESERVED') {
      throw new PaymentError('Esta orden ya no está disponible para pago.', 409, 'ORDER_NOT_PAYABLE');
    }
    return {
      order: publicOrder(order),
      payment: this.buildPaymentPayload(order),
      environment: this.boldConfig.environment,
    };
  }

  async getOrder(orderId) {
    return publicOrder(await this.orderStore.get(orderId));
  }

  async processWebhook(rawBody, receivedSignature) {
    // El interruptor de ventas no debe impedir confirmar pagos que ya estaban en curso.
    this.assertCredentialsConfigured();
    const webhookSecret = this.boldConfig.environment === 'test' ? '' : this.boldConfig.secretKey;
    if (!verifyWebhookSignature(rawBody, receivedSignature, webhookSecret)) {
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
        const paymentId = cleanText(event.data?.payment_id || event.subject, 100);
        const isSandboxProbe = this.boldConfig.environment === 'test' && /^X+$/i.test(paymentId);
        const next = {
          ...order,
          lastEventType: eventType,
          lastWebhookAt: receivedAt,
          paymentId,
          paymentMethod: cleanText(event.data?.payment_method, 40),
          payerEmail: cleanText(event.data?.payer_email, 160),
        };
        // Una notificación tardía vuelve a mostrar un pedido archivado para que el equipo pueda revisarlo.
        delete next.adminArchivedAt;
        delete next.adminArchivedBy;

        if ((!amountMatches || !currencyMatches) && !isSandboxProbe) {
          next.status = 'REVIEW_REQUIRED';
          next.reviewReason = 'El monto o la moneda notificados por Bold no coinciden con la orden.';
          return next;
        }

        if (isSandboxProbe) next.sandboxWebhookTest = true;
        delete next.reviewReason;
        next.status = mapBoldEventType(eventType, order.status);
        if (eventType === 'SALE_APPROVED') {
          const reservationExpired = order.inventoryStatus === 'RELEASED' || Date.parse(order.expiresAt) <= this.clock();
          if (reservationExpired && order.status !== 'PAID') {
            next.status = 'REVIEW_REQUIRED';
            next.inventoryStatus = 'RELEASED';
            next.reviewReason = 'Bold aprobó el pago después de vencer la reserva de inventario.';
            return next;
          }
          next.paidAt = receivedAt;
          next.inventoryStatus = 'COMMITTED';
          if (getDefaultFulfillmentStatus(order) === 'PENDING') {
            next.fulfillmentStatus = 'CONFIRMED';
            next.fulfillmentHistory = [
              ...(Array.isArray(order.fulfillmentHistory) ? order.fulfillmentHistory.slice(-24) : []),
              { from: 'PENDING', to: 'CONFIRMED', at: receivedAt, by: 'Bold' },
            ];
          }
        }
        if (eventType === 'SALE_REJECTED') {
          if (getDefaultFulfillmentStatus(order) === 'PENDING') next.fulfillmentStatus = 'CANCELLED';
          if (order.inventoryStatus === 'RESERVED') next.inventoryStatus = 'RELEASED';
        }
        if (eventType === 'VOID_APPROVED') {
          const previousFulfillment = getDefaultFulfillmentStatus(order);
          next.fulfillmentStatus = 'CANCELLED';
          next.fulfillmentHistory = [
            ...(Array.isArray(order.fulfillmentHistory) ? order.fulfillmentHistory.slice(-24) : []),
            { from: previousFulfillment, to: 'CANCELLED', at: receivedAt, by: 'Bold' },
          ];
          next.inventoryStatus = 'RELEASED';
        }
        if (eventType === 'VOID_REJECTED') next.voidStatus = 'REJECTED';
        return next;
      },
    );

    return { duplicate: result.duplicate, order: publicOrder(result.order) };
  }
}
