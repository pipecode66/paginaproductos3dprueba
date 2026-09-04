import { normalizeMeasurementWeights } from './product-pricing.js';

const MAX_IMAGES = 4;
const MAX_MEASUREMENTS = 30;

export class CatalogValidationError extends Error {
  constructor(message, code = 'INVALID_PRODUCT') {
    super(message);
    this.name = 'CatalogValidationError';
    this.statusCode = 400;
    this.code = code;
    this.expose = true;
  }
}

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function textList(value, { maxItems, maxLength }) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => text(item, maxLength)).filter(Boolean);
}

function sanitizeAttribute(value, field) {
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'number') {
    if (value === '' || value == null) return '';
    const number = Number(value);
    return Number.isFinite(number) ? number : '';
  }
  const result = text(value, field.type === 'textarea' ? 1200 : 200);
  if (field.type === 'select' && result && !field.options.includes(result)) return '';
  return result;
}

function buildAttributes(input, category) {
  const legacy = {
    material: input?.material,
    metal: input?.variants?.metal,
    purity: input?.variants?.purity,
    gemstone: input?.variants?.gemstone,
    engraving: input?.variants?.engraving,
  };
  if (!category?.fields) return { ...(input?.attributes || {}), ...legacy };

  const attributes = {};
  category.fields.forEach((field) => {
    const value = sanitizeAttribute(input?.attributes?.[field.key] ?? legacy[field.key], field);
    const missing = field.type === 'boolean' ? false : value === '' || value == null;
    if (field.required && missing) {
      throw new CatalogValidationError(`El campo “${field.label}” es obligatorio para esta categoría.`, 'CATEGORY_FIELD_REQUIRED');
    }
    if (!missing || field.type === 'boolean') attributes[field.key] = value;
  });
  return attributes;
}

export function validateCatalogProduct(input, forcedId, { category: categoryTemplate } = {}) {
  const id = text(forcedId || input?.id, 80).toLowerCase();
  const name = text(input?.name, 120);
  const category = text(input?.category, 60).toLowerCase();
  const material = text(input?.material, 100);
  const description = text(input?.description, 1200);
  const price = Number(input?.price);
  const stock = Number(input?.stock);
  const measurements = [...new Set(textList(input?.measurements, { maxItems: MAX_MEASUREMENTS, maxLength: 80 }))];
  const rawImages = Array.isArray(input?.images) ? input.images : [];
  if (rawImages.length > MAX_IMAGES) {
    throw new CatalogValidationError(`Cada producto admite un máximo de ${MAX_IMAGES} imágenes.`, 'TOO_MANY_IMAGES');
  }
  const images = textList(rawImages, { maxItems: MAX_IMAGES, maxLength: 1000 });

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new CatalogValidationError('La referencia del producto no es válida.', 'INVALID_PRODUCT_ID');
  }
  if (!name || !category || !material || !description) {
    throw new CatalogValidationError('Nombre, categoría, material y descripción son obligatorios.');
  }
  if (!Number.isInteger(price) || price < 1000 || price > 999_999_999) {
    throw new CatalogValidationError('El precio debe ser un valor entero entre $1.000 y $999.999.999.', 'INVALID_PRICE');
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 999_999) {
    throw new CatalogValidationError('El inventario debe ser un número entero válido.', 'INVALID_STOCK');
  }
  if (!measurements.length) {
    throw new CatalogValidationError('Agrega por lo menos una medida disponible.', 'MEASUREMENTS_REQUIRED');
  }
  if (!images.length || images.some((image) => !image.startsWith('/') && !/^https:\/\//i.test(image))) {
    throw new CatalogValidationError('Cada imagen debe usar una ruta pública o una URL HTTPS.', 'INVALID_IMAGES');
  }

  const attributes = buildAttributes(input, categoryTemplate);
  const variants = {
    metal: text(attributes.metal ?? input?.variants?.metal, 80) || 'Oro amarillo',
    purity: text(attributes.purity ?? input?.variants?.purity, 30) || '18K',
    gemstone: text(attributes.gemstone ?? input?.variants?.gemstone, 100) || 'Sin piedra principal',
    engraving: text(attributes.engraving ?? input?.variants?.engraving, 100) || 'Disponible bajo solicitud',
  };
  const measurementWeights = normalizeMeasurementWeights(input?.measurementWeights, measurements);
  const goldPricing = Boolean(input?.goldPricing);
  if (goldPricing && measurementWeights.length !== measurements.length) {
    throw new CatalogValidationError(
      'Indica un peso válido para cada talla antes de activar el cálculo con oro.',
      'MEASUREMENT_WEIGHTS_REQUIRED',
    );
  }

  return {
    id,
    name,
    category,
    material,
    price,
    stock,
    measurements,
    images,
    description,
    variants,
    attributes: {
      ...attributes,
      material: text(attributes.material ?? material, 100),
      metal: variants.metal,
      purity: variants.purity,
      gemstone: variants.gemstone,
      engraving: variants.engraving,
    },
    measurementWeights,
    goldPricing,
    premium: Boolean(input?.premium),
    featured: Boolean(input?.featured),
    active: input?.active !== false,
  };
}
