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

export function validateCatalogProduct(input, forcedId) {
  const id = text(forcedId || input?.id, 80).toLowerCase();
  const name = text(input?.name, 120);
  const category = text(input?.category, 60).toLowerCase();
  const material = text(input?.material, 100);
  const description = text(input?.description, 1200);
  const price = Number(input?.price);
  const stock = Number(input?.stock);
  const measurements = textList(input?.measurements, { maxItems: MAX_MEASUREMENTS, maxLength: 80 });
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

  const variants = {
    metal: text(input?.variants?.metal, 80) || 'Oro amarillo',
    purity: text(input?.variants?.purity, 30) || '18K',
    gemstone: text(input?.variants?.gemstone, 100) || 'Sin piedra principal',
    engraving: text(input?.variants?.engraving, 100) || 'Disponible bajo solicitud',
  };

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
    premium: Boolean(input?.premium),
    featured: Boolean(input?.featured),
    active: input?.active !== false,
  };
}
