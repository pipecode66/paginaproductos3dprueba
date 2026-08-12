const DEFAULT_SITE_CONTENT = {
  hero: {
    imageUrl: '',
    imageAlt: 'Colección de Joyería Querubim',
    eyebrow: 'Oro 18 quilates · Colombia',
    title: 'Elegancia que trasciende generaciones.',
    description:
      'Joyas creadas para celebrar identidad, amor y memorias duraderas con autenticidad, garantía y una atención familiar profundamente cercana.',
  },
  campaign: {
    enabled: false,
    imageUrl: '',
    imageAlt: 'Campaña especial de Joyería Querubim',
    eyebrow: 'Edición especial',
    title: 'Una campaña para celebrar momentos inolvidables.',
    description: 'Presenta aquí lanzamientos, temporadas, descuentos o colecciones especiales.',
    ctaLabel: 'Explorar colección',
    ctaUrl: '#coleccion',
  },
  premiumShowcase: {
    imageUrl: '',
    imageAlt: 'Catálogo Premium Querubim',
    eyebrow: 'Querubim Premium',
    title: 'Catálogo reservado para piezas de mayor presencia.',
    description:
      'Ingresa a una selección independiente con joyas de acabado superior, brillo dorado y una experiencia de compra más refinada.',
  },
  premiumHero: {
    imageUrl: '',
    imageAlt: 'Colección Premium Querubim',
    eyebrow: 'Querubim Premium',
    title: 'Joyas con brillo reservado y presencia superior.',
    description:
      'Una selección independiente para piezas con acabados especiales, materiales destacados y asesoría prioritaria.',
  },
};

function cleanText(value, maxLength) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanImageUrl(value) {
  const url = cleanText(value, 1000);
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // La validación inferior entrega el mensaje de negocio.
  }
  const error = new Error('Las imágenes comerciales deben usar una ruta local o una URL HTTPS.');
  error.statusCode = 400;
  error.code = 'INVALID_SITE_IMAGE_URL';
  error.expose = true;
  throw error;
}

function cleanCtaUrl(value) {
  const url = cleanText(value, 500);
  if (!url) return '#coleccion';
  if (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//'))) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // La validación inferior entrega el mensaje de negocio.
  }
  const error = new Error('El enlace de campaña debe ser interno o usar HTTPS.');
  error.statusCode = 400;
  error.code = 'INVALID_CAMPAIGN_URL';
  error.expose = true;
  throw error;
}

function sanitizeSlot(input, fallback, { campaign = false } = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const content = {
    ...fallback,
    imageUrl: cleanImageUrl(source.imageUrl ?? fallback.imageUrl),
    imageAlt: cleanText(source.imageAlt ?? fallback.imageAlt, 180),
    eyebrow: cleanText(source.eyebrow ?? fallback.eyebrow, 80),
    title: cleanText(source.title ?? fallback.title, 180),
    description: cleanText(source.description ?? fallback.description, 500),
  };
  if (!content.title || !content.description) {
    const error = new Error('Cada espacio comercial necesita título y descripción.');
    error.statusCode = 400;
    error.code = 'INCOMPLETE_SITE_CONTENT';
    error.expose = true;
    throw error;
  }
  if (campaign) {
    content.enabled = Boolean(source.enabled);
    content.ctaLabel = cleanText(source.ctaLabel ?? fallback.ctaLabel, 60) || fallback.ctaLabel;
    content.ctaUrl = cleanCtaUrl(source.ctaUrl ?? fallback.ctaUrl);
  }
  return content;
}

export function getDefaultSiteContent() {
  return JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
}

export function validateSiteContent(input = {}) {
  return {
    hero: sanitizeSlot(input.hero, DEFAULT_SITE_CONTENT.hero),
    campaign: sanitizeSlot(input.campaign, DEFAULT_SITE_CONTENT.campaign, { campaign: true }),
    premiumShowcase: sanitizeSlot(input.premiumShowcase, DEFAULT_SITE_CONTENT.premiumShowcase),
    premiumHero: sanitizeSlot(input.premiumHero, DEFAULT_SITE_CONTENT.premiumHero),
  };
}
