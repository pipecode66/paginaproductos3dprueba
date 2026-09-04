const WEIGHT_FACTORS = Object.freeze({ mg: 0.001, g: 1, kg: 1000 });

function cleanText(value, maxLength = 80) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function normalizeMeasurementWeights(input = [], measurements = []) {
  if (!Array.isArray(input)) return [];
  const validMeasures = new Set(measurements);
  const seen = new Set();
  return input.slice(0, 30).flatMap((entry) => {
    const measure = cleanText(entry?.measure);
    const unit = Object.hasOwn(WEIGHT_FACTORS, entry?.unit) ? entry.unit : 'g';
    const value = Number(entry?.value);
    if (!measure || !validMeasures.has(measure) || seen.has(measure) || !Number.isFinite(value) || value <= 0) return [];
    const weightGrams = value * WEIGHT_FACTORS[unit];
    if (!Number.isFinite(weightGrams) || weightGrams <= 0 || weightGrams > 100_000) return [];
    seen.add(measure);
    return [{ measure, value, unit, weightGrams: Math.round(weightGrams * 1_000_000) / 1_000_000 }];
  });
}

export function getProductPriceOptions(product, gold = {}) {
  const garmentPrice = Number(product?.price || 0);
  const pricePerGram = Number(gold?.pricePerGram || 0);
  const measurements = Array.isArray(product?.measurements) ? product.measurements : [];
  const weights = normalizeMeasurementWeights(product?.measurementWeights, measurements);
  const weightByMeasure = new Map(weights.map((entry) => [entry.measure, entry]));
  const usesGoldPricing = Boolean(product?.goldPricing) && Boolean(gold?.enabled) && pricePerGram > 0;

  const options = measurements.map((measure) => {
    const weight = weightByMeasure.get(measure);
    const calculated = usesGoldPricing && weight
      ? garmentPrice + Math.round(weight.weightGrams * pricePerGram)
      : garmentPrice;
    return { measure, price: Number.isSafeInteger(calculated) ? calculated : 0 };
  });
  const validPrices = options.map((option) => option.price).filter((price) => Number.isSafeInteger(price) && price >= 1000);
  return {
    mode: usesGoldPricing ? 'gold_by_weight' : 'fixed',
    requiresSelection: usesGoldPricing,
    startingPrice: validPrices.length ? Math.min(...validPrices) : garmentPrice,
    options,
  };
}

export function getSelectedProductPrice(product, measure, gold = {}) {
  const pricing = getProductPriceOptions(product, gold);
  const selected = pricing.options.find((option) => option.measure === measure);
  return selected ? { ...selected, mode: pricing.mode } : null;
}

export function toPublicProduct(product, settings = {}) {
  const pricing = getProductPriceOptions(product, settings.gold);
  const categoryFields = Array.isArray(settings.categories)
    ? settings.categories.find((category) => category.slug === product.category)?.fields || []
    : [];
  const legacyAttributes = {
    material: product.material,
    metal: product.variants?.metal,
    purity: product.variants?.purity,
    gemstone: product.variants?.gemstone,
    engraving: product.variants?.engraving,
  };
  const publicAttributes = categoryFields
    .filter((field) => field.public !== false)
    .flatMap((field) => {
      const value = product.attributes?.[field.key] ?? legacyAttributes[field.key];
      if (value === '' || value == null) return [];
      const displayValue = field.type === 'boolean' ? (value ? 'Sí' : 'No') : String(value);
      return [{ key: field.key, label: field.label, value: displayValue }];
    });
  const publicAttributeMap = new Map(publicAttributes.map((attribute) => [attribute.key, attribute.value]));

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    material: publicAttributeMap.get('material') || '',
    stock: product.stock,
    measurements: Array.isArray(product.measurements) ? product.measurements : [],
    images: Array.isArray(product.images) ? product.images : [],
    description: product.description,
    premium: Boolean(product.premium),
    featured: Boolean(product.featured),
    active: product.active !== false,
    price: pricing.startingPrice,
    pricing,
    publicAttributes,
    templateManaged: true,
  };
}
