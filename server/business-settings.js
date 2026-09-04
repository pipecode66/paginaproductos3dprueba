const CATEGORY_FIELD_TYPES = new Set(['text', 'textarea', 'number', 'select', 'boolean']);
const MAX_CATEGORY_FIELDS = 20;
const RESERVED_CATEGORY_FIELD_KEYS = new Set([
  'name',
  'description',
  'price',
  'stock',
  'images',
  'measurements',
  'measurementweights',
  'category',
]);

const categoryNames = [
  ['cadenas', 'Cadenas'],
  ['dijes', 'Dijes'],
  ['herrajes', 'Herrajes'],
  ['candongas', 'Candongas'],
  ['brazaletes', 'Brazaletes'],
  ['dijes-para-manillas', 'Dijes para Manillas'],
  ['manillas', 'Manillas'],
  ['topos', 'Topos'],
  ['pulsos', 'Pulsos'],
  ['tobilleras', 'Tobilleras'],
  ['anillos', 'Anillos'],
  ['aros', 'Aros'],
  ['rosarios', 'Rosarios'],
  ['tejidos-especiales', 'Tejidos Especiales'],
  ['balines', 'Balines'],
  ['argollas-matrimonio', 'Argollas Matrimonio'],
  ['fabricaciones', 'Fabricaciones'],
];

const defaultTemplateFields = [
  { key: 'material', label: 'Material', type: 'text', required: true, public: true },
  {
    key: 'metal',
    label: 'Metal principal',
    type: 'select',
    required: true,
    public: true,
    options: ['Oro amarillo', 'Oro blanco', 'Oro rosa', 'Plata 925', 'Combinado'],
  },
  {
    key: 'purity',
    label: 'Pureza',
    type: 'select',
    required: true,
    public: true,
    options: ['18K', '14K', 'Plata 925', 'Personalizada'],
  },
  { key: 'gemstone', label: 'Piedra o gema', type: 'text', required: false, public: true },
  {
    key: 'engraving',
    label: 'Grabado personalizado',
    type: 'select',
    required: false,
    public: true,
    options: ['Disponible bajo solicitud', 'No disponible', 'Incluido'],
  },
];

export const CORE_PRODUCT_FIELDS = [
  { key: 'name', label: 'Nombre', required: true },
  { key: 'description', label: 'Descripción', required: true },
  { key: 'price', label: 'Precio de la prenda', required: true },
  { key: 'stock', label: 'Inventario', required: true },
  { key: 'images', label: 'Galería de imágenes', required: true },
  { key: 'measurements', label: 'Tallas y peso por talla', required: true },
];

export const DEFAULT_BUSINESS_SETTINGS = Object.freeze({
  gold: {
    pricePerGram: 0,
    enabled: false,
    updatedAt: null,
    updatedBy: null,
  },
  categories: categoryNames.map(([slug, label]) => ({
    slug,
    label,
    active: true,
    fields: defaultTemplateFields.map((field) => ({ ...field, options: field.options ? [...field.options] : [] })),
  })),
});

export class BusinessSettingsError extends Error {
  constructor(message, code = 'INVALID_BUSINESS_SETTINGS', statusCode = 400) {
    super(message);
    this.name = 'BusinessSettingsError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function cloneDefaultBusinessSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_BUSINESS_SETTINGS));
}

export function normalizeBusinessSettings(value = {}) {
  const defaults = cloneDefaultBusinessSettings();
  const categories = Array.isArray(value.categories) && value.categories.length
    ? value.categories.map((category) => validateCategory(category))
    : defaults.categories;
  const pricePerGram = Number(value.gold?.pricePerGram || 0);
  return {
    gold: {
      pricePerGram: Number.isSafeInteger(pricePerGram) && pricePerGram >= 0 ? pricePerGram : 0,
      enabled: Boolean(value.gold?.enabled) && pricePerGram > 0,
      updatedAt: value.gold?.updatedAt || null,
      updatedBy: value.gold?.updatedBy || null,
    },
    categories,
  };
}

export function validateGoldSettings(input = {}, adminEmail = '') {
  const pricePerGram = Number(input.pricePerGram);
  if (!Number.isSafeInteger(pricePerGram) || pricePerGram < 1 || pricePerGram > 100_000_000) {
    throw new BusinessSettingsError(
      'El precio del oro debe ser un valor entero entre $1 y $100.000.000 por gramo.',
      'INVALID_GOLD_PRICE',
    );
  }
  return {
    pricePerGram,
    enabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: cleanText(adminEmail, 160),
  };
}

export function validateCategory(input = {}, forcedSlug = '') {
  const slug = cleanText(forcedSlug || input.slug, 60).toLowerCase();
  const label = cleanText(input.label, 60);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BusinessSettingsError('La referencia de la categoría no es válida.', 'INVALID_CATEGORY_SLUG');
  }
  if (label.length < 2) {
    throw new BusinessSettingsError('El nombre de la categoría es obligatorio.', 'CATEGORY_NAME_REQUIRED');
  }
  if (!Array.isArray(input.fields) || input.fields.length > MAX_CATEGORY_FIELDS) {
    throw new BusinessSettingsError(
      `Cada categoría admite hasta ${MAX_CATEGORY_FIELDS} campos personalizados.`,
      'INVALID_CATEGORY_FIELDS',
    );
  }

  const seen = new Set();
  const fields = input.fields.map((field, index) => {
    const key = cleanText(field?.key, 50).toLowerCase();
    const fieldLabel = cleanText(field?.label, 80);
    const type = cleanText(field?.type, 20).toLowerCase();
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(key)
      || seen.has(key)
      || RESERVED_CATEGORY_FIELD_KEYS.has(key.replace(/-/g, ''))
    ) {
      throw new BusinessSettingsError(`El campo ${index + 1} tiene una referencia inválida o repetida.`, 'INVALID_FIELD_KEY');
    }
    if (!fieldLabel || !CATEGORY_FIELD_TYPES.has(type)) {
      throw new BusinessSettingsError(`Revisa el nombre y tipo del campo ${index + 1}.`, 'INVALID_CATEGORY_FIELD');
    }
    seen.add(key);
    const options = type === 'select'
      ? [...new Set((Array.isArray(field.options) ? field.options : [])
        .map((option) => cleanText(option, 80)).filter(Boolean))].slice(0, 30)
      : [];
    if (type === 'select' && !options.length) {
      throw new BusinessSettingsError(`Agrega opciones al campo “${fieldLabel}”.`, 'CATEGORY_FIELD_OPTIONS_REQUIRED');
    }
    return {
      key,
      label: fieldLabel,
      type,
      required: Boolean(field.required),
      public: field.public !== false,
      options,
    };
  });

  return { slug, label, active: input.active !== false, fields };
}

export function findCategory(settings, slug) {
  return settings?.categories?.find((category) => category.slug === slug) ?? null;
}
