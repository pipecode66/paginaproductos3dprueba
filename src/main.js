import './styles.css';
import {
  ArrowRight,
  Bell,
  BarChart3,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Edit3,
  Gem,
  ImagePlus,
  KeyRound,
  Layers,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PackageCheck,
  PenTool,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  UploadCloud,
  UserRound,
  X,
  createIcons,
} from 'lucide';
import { siFacebook, siInstagram, siTiktok } from 'simple-icons/icons';

const WHATSAPP_NUMBER = '573225435618';
const ADMIN_BACKUP_KEY = 'querubim-last-catalog-backup';
const ADMIN_ACTIVITY_KEY = 'querubim-admin-activity';
const ADMIN_INACTIVITY_LIMIT = 15 * 60 * 1000;

const categories = [
  { slug: 'todos', label: 'Todas' },
  { slug: 'cadenas', label: 'Cadenas' },
  { slug: 'dijes', label: 'Dijes' },
  { slug: 'herrajes', label: 'Herrajes' },
  { slug: 'candongas', label: 'Candongas' },
  { slug: 'brazaletes', label: 'Brazaletes' },
  { slug: 'dijes-para-manillas', label: 'Dijes para Manillas' },
  { slug: 'manillas', label: 'Manillas' },
  { slug: 'topos', label: 'Topos' },
  { slug: 'pulsos', label: 'Pulsos' },
  { slug: 'tobilleras', label: 'Tobilleras' },
  { slug: 'anillos', label: 'Anillos' },
  { slug: 'aros', label: 'Aros' },
  { slug: 'rosarios', label: 'Rosarios' },
  { slug: 'tejidos-especiales', label: 'Tejidos Especiales' },
  { slug: 'balines', label: 'Balines' },
  { slug: 'argollas-matrimonio', label: 'Argollas Matrimonio' },
  { slug: 'fabricaciones', label: 'Fabricaciones' },
];

const importedCatalogGroups = [
  {
    id: 'anillo-rubi-aurora',
    name: 'Anillo Rubí Aurora',
    category: 'anillos',
    imageNumbers: [1, 2, 3, 4],
    price: 1120000,
    measurements: ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'],
    description:
      'Anillo en oro 18K con cristales rojos tipo rubí en corte rectangular. Una pieza luminosa, femenina y fácil de combinar.',
    finish: 'Cristales rojos',
  },
  {
    id: 'anillo-corona-amatista',
    name: 'Anillo Corona Amatista',
    category: 'anillos',
    imageNumbers: [9, 10, 11, 12],
    price: 1480000,
    measurements: ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'],
    description:
      'Anillo en oro 18K con diseño tipo corona, acentos brillantes y piedra central morada para una presencia elegante.',
    finish: 'Corona con piedra morada',
  },
  {
    id: 'anillo-filigrana-celestial',
    name: 'Anillo Filigrana Celestial',
    category: 'anillos',
    imageNumbers: [17, 18, 19, 20],
    price: 1250000,
    measurements: ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'],
    description:
      'Anillo en oro 18K con volumen ornamental y detalles de filigrana, pensado para quienes prefieren una joya con carácter.',
    finish: 'Filigrana brillante',
  },
  {
    id: 'brazalete-placa-dorada',
    name: 'Brazalete Placa Dorada',
    category: 'brazaletes',
    imageNumbers: [1, 2, 3, 4],
    price: 1320000,
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    description:
      'Brazalete rígido en oro 18K con placa decorativa central y silueta limpia para uso diario o regalo especial.',
    finish: 'Placa decorativa',
  },
  {
    id: 'brazalete-lazo-diamantado',
    name: 'Brazalete Lazo Diamantado',
    category: 'brazaletes',
    imageNumbers: [9, 10, 11, 12],
    price: 1180000,
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    description:
      'Brazalete con terminales tipo lazo y textura diamantada, ideal para una pieza delicada con brillo sutil.',
    finish: 'Lazo diamantado',
  },
  {
    id: 'brazalete-greca-serena',
    name: 'Brazalete Greca Serena',
    category: 'brazaletes',
    imageNumbers: [17, 18, 19, 20],
    price: 1090000,
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    description:
      'Brazalete abierto con motivo geométrico central, acabado sobrio y estructura cómoda para uso frecuente.',
    finish: 'Greca central',
  },
  {
    id: 'brazalete-amuletos-esmeralda',
    name: 'Brazalete Amuletos Esmeralda',
    category: 'brazaletes',
    imageNumbers: [25, 26, 27, 28],
    price: 1580000,
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    description:
      'Brazalete en oro 18K con dijes colgantes y detalles verdes tipo esmeralda para una composición llamativa.',
    finish: 'Dijes con acentos verdes',
  },
  {
    id: 'candongas-brillo-clasico',
    name: 'Candongas Brillo Clásico',
    category: 'candongas',
    imageNumbers: [1, 2, 3, 4],
    price: 680000,
    measurements: ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'],
    description:
      'Candongas en oro 18K de acabado pulido, formato clásico y brillo limpio para acompañar cualquier ocasión.',
    finish: 'Alto brillo',
  },
  {
    id: 'candongas-trenza-dorada',
    name: 'Candongas Trenza Dorada',
    category: 'candongas',
    imageNumbers: [9, 10, 11, 12],
    price: 740000,
    measurements: ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'],
    description:
      'Candongas en oro 18K con volumen trenzado y textura brillante, diseñadas para sumar presencia sin perder delicadeza.',
    finish: 'Trenzado brillante',
  },
  {
    id: 'candongas-ovalo-diamantado',
    name: 'Candongas Óvalo Diamantado',
    category: 'candongas',
    imageNumbers: [17, 18, 19, 20],
    price: 790000,
    measurements: ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'],
    description:
      'Candongas ovaladas en oro 18K con textura diamantada y una silueta alargada que estiliza el rostro.',
    finish: 'Óvalo diamantado',
  },
  {
    id: 'candongas-onda-organica',
    name: 'Candongas Onda Orgánica',
    category: 'candongas',
    imageNumbers: [25, 26, 27],
    price: 860000,
    measurements: ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'],
    description:
      'Candongas en oro 18K con contorno ondulado y acabado orgánico para una pieza más artística y moderna.',
    finish: 'Textura orgánica',
  },
  {
    id: 'dije-mano-sagrada',
    name: 'Dije Mano Sagrada',
    category: 'dijes-para-manillas',
    imageNumbers: [1, 2, 3, 4],
    price: 340000,
    measurements: ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'],
    description:
      'Dije para manilla en oro 18K con símbolo de mano protectora, ideal para personalizar una joya con intención.',
    finish: 'Símbolo protector',
  },
  {
    id: 'dije-medallon-corona-real',
    name: 'Dije Medallón Corona Real',
    category: 'dijes-para-manillas',
    imageNumbers: [9, 10, 11, 12],
    price: 520000,
    measurements: ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'],
    description:
      'Dije para manilla con medallón circular, corona central y contraste bicolor para una pieza de mayor presencia.',
    finish: 'Medallón bicolor',
  },
  {
    id: 'dije-medalla-devocion',
    name: 'Dije Medalla Devoción',
    category: 'dijes-para-manillas',
    imageNumbers: [21, 22, 23, 24],
    price: 460000,
    measurements: ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'],
    description:
      'Dije tipo medalla en oro 18K con forma alargada y relieve delicado para una manilla personalizada.',
    finish: 'Medalla alargada',
  },
  {
    id: 'manilla-atenea-cristal',
    name: 'Manilla Atenea Cristal',
    category: 'manillas',
    imageNumbers: [1, 2, 3, 4],
    price: 1280000,
    measurements: ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'],
    description:
      'Manilla en oro 18K con eslabones rectangulares y detalles brillantes, pensada para una presencia elegante.',
    finish: 'Eslabones con brillo',
  },
  {
    id: 'manilla-esmeralda-enlace',
    name: 'Manilla Esmeralda Enlace',
    category: 'manillas',
    imageNumbers: [9, 10, 11, 12],
    price: 1560000,
    measurements: ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'],
    description:
      'Manilla en oro 18K con eslabones y acentos verdes tipo esmeralda, ideal para una pieza con color protagonista.',
    finish: 'Acentos verdes',
  },
  {
    id: 'manilla-eslabon-dorado',
    name: 'Manilla Eslabón Dorado',
    category: 'manillas',
    imageNumbers: [17, 18, 19, 20],
    price: 1380000,
    measurements: ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'],
    description:
      'Manilla en oro 18K de eslabón ancho con caída flexible, una pieza clásica para uso diario o regalo.',
    finish: 'Eslabón ancho',
  },
  {
    id: 'manilla-placa-sello-dorado',
    name: 'Manilla Placa Sello Dorado',
    category: 'manillas',
    imageNumbers: [25, 26, 27, 28],
    price: 1650000,
    measurements: ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'],
    description:
      'Manilla en oro 18K con eslabón cubano y placa central tipo sello, diseñada para un estilo contundente.',
    finish: 'Placa central',
  },
];

const defaultProducts = createImportedCatalogProducts();

let products = cloneProductList();

const icons = {
  ArrowRight,
  Bell,
  BarChart3,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Edit3,
  Gem,
  ImagePlus,
  KeyRound,
  Layers,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PackageCheck,
  PenTool,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  UploadCloud,
  UserRound,
  X,
};

const brandIcons = {
  facebook: siFacebook,
  instagram: siInstagram,
  tiktok: siTiktok,
};

const state = {
  activeFilter: 'todos',
  activePremiumFilter: 'todos',
  activeProduct: products[0],
  activeImageIndex: 0,
  query: '',
  premiumQuery: '',
  adminQuery: '',
  editingProductId: null,
  adminTimeoutId: null,
  adminAuthenticated: false,
  adminSessionChecked: false,
  adminUser: null,
  adminOrders: [],
  adminSummary: null,
  adminLoading: false,
  adminHeartbeatAt: 0,
  cartItems: [],
  checkoutBusy: false,
  paymentPollAttempts: 0,
  paymentPollTimer: null,
  currentRoute: 'home',
  ticking: false,
};

const standaloneRoutes = new Set(['premium', 'admin', 'historia', 'contacto', 'payment']);

const selectors = {
  pageSections: document.querySelectorAll('[data-page]'),
  navLinks: document.querySelectorAll('.nav-link'),
  mobileDrawer: document.querySelector('#mobile-drawer'),
  overlay: document.querySelector('#overlay'),
  categoryFilters: document.querySelector('#category-filters'),
  productGrid: document.querySelector('#product-grid'),
  searchInput: document.querySelector('#catalog-search'),
  premiumCategoryFilters: document.querySelector('#premium-category-filters'),
  premiumProductGrid: document.querySelector('#premium-product-grid'),
  premiumSearchInput: document.querySelector('#premium-catalog-search'),
  adminLoginView: document.querySelector('#admin-login-view'),
  adminPanelView: document.querySelector('#admin-panel-view'),
  adminLoginForm: document.querySelector('#admin-login-form'),
  adminLoginMessage: document.querySelector('#admin-login-message'),
  adminLogout: document.querySelector('#admin-logout'),
  adminStats: document.querySelector('#admin-stats'),
  adminDiagnostics: document.querySelector('#admin-diagnostics'),
  adminOperations: document.querySelector('#admin-operations'),
  adminExportCatalog: document.querySelector('#admin-export-catalog'),
  adminBackupStatus: document.querySelector('#admin-backup-status'),
  adminSecurityAction: document.querySelector('#admin-security-action'),
  adminProductList: document.querySelector('#admin-product-list'),
  adminSearchInput: document.querySelector('#admin-product-search'),
  adminProductForm: document.querySelector('#admin-product-form'),
  adminFormTitle: document.querySelector('#admin-form-title'),
  adminEditId: document.querySelector('#admin-edit-id'),
  adminName: document.querySelector('#admin-name'),
  adminCategory: document.querySelector('#admin-category'),
  adminPrice: document.querySelector('#admin-price'),
  adminMaterial: document.querySelector('#admin-material'),
  adminImages: document.querySelector('#admin-images'),
  adminImageFiles: document.querySelector('#admin-image-files'),
  adminImageDrop: document.querySelector('#admin-image-drop'),
  adminImagePreview: document.querySelector('#admin-image-preview'),
  adminStock: document.querySelector('#admin-stock'),
  adminMetal: document.querySelector('#admin-metal'),
  adminPurity: document.querySelector('#admin-purity'),
  adminGemstone: document.querySelector('#admin-gemstone'),
  adminEngraving: document.querySelector('#admin-engraving'),
  adminMeasurements: document.querySelector('#admin-measurements'),
  adminDescription: document.querySelector('#admin-description'),
  adminPremium: document.querySelector('#admin-premium'),
  adminFeatured: document.querySelector('#admin-featured'),
  adminFormMessage: document.querySelector('#admin-form-message'),
  adminCancelEdit: document.querySelector('#admin-cancel-edit'),
  adminResetCatalog: document.querySelector('#admin-reset-catalog'),
  detailPanel: document.querySelector('#product-detail-panel'),
  detailCategory: document.querySelector('#detail-category'),
  detailName: document.querySelector('#detail-name'),
  detailMainImage: document.querySelector('#detail-main-image'),
  detailThumbs: document.querySelector('#detail-thumbs'),
  detailDescription: document.querySelector('#detail-description'),
  detailSpecs: document.querySelector('#detail-specs'),
  detailMeasure: document.querySelector('#detail-measure'),
  detailMessage: document.querySelector('#detail-message'),
  detailWhatsapp: document.querySelector('#detail-whatsapp'),
  detailAddCart: document.querySelector('#detail-add-cart'),
  selectionDrawer: document.querySelector('#selection-drawer'),
  selectionItems: document.querySelector('#selection-items'),
  selectionEmpty: document.querySelector('#selection-empty'),
  checkoutForm: document.querySelector('#checkout-form'),
  checkoutTotal: document.querySelector('#checkout-total'),
  checkoutMessage: document.querySelector('#checkout-message'),
  checkoutPayButton: document.querySelector('#checkout-pay-button'),
  checkoutPayLabel: document.querySelector('#checkout-pay-label'),
  cartCount: document.querySelector('#cart-count'),
  paymentResultIcon: document.querySelector('#payment-result-icon'),
  paymentResultTitle: document.querySelector('#payment-result-title'),
  paymentResultMessage: document.querySelector('#payment-result-message'),
  paymentResultSummary: document.querySelector('#payment-result-summary'),
  paymentResultRefresh: document.querySelector('#payment-result-refresh'),
  scrollTopButton: document.querySelector('#scroll-top-button'),
  contactForm: document.querySelector('#contact-form'),
  formMessage: document.querySelector('#form-message'),
};

function refreshIcons() {
  createIcons({
    icons,
    attrs: {
      'aria-hidden': 'true',
      'stroke-width': '1.5',
    },
  });
}

function renderBrandIcons() {
  document.querySelectorAll('[data-brand-icon]').forEach((container) => {
    const icon = brandIcons[container.dataset.brandIcon];
    if (!icon) return;

    container.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${icon.path}"></path></svg>`;
  });
}

function cloneProductList(productList = defaultProducts) {
  return JSON.parse(JSON.stringify(productList));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getProductPrice(product) {
  if (Number.isFinite(Number(product.price))) return Number(product.price);
  const numericValue = String(product.value ?? '').replace(/[^\d]/g, '');
  return Number(numericValue) || 0;
}

function getDefaultStockForGroup(id) {
  const stockById = {
    'anillo-rubi-aurora': 3,
    'anillo-corona-amatista': 2,
    'anillo-filigrana-celestial': 1,
    'brazalete-placa-dorada': 4,
    'brazalete-lazo-diamantado': 2,
    'brazalete-greca-serena': 0,
    'brazalete-amuletos-esmeralda': 1,
    'candongas-brillo-clasico': 6,
    'candongas-trenza-dorada': 4,
    'candongas-ovalo-diamantado': 3,
    'candongas-onda-organica': 1,
    'dije-mano-sagrada': 5,
    'dije-medallon-corona-real': 2,
    'dije-medalla-devocion': 3,
    'manilla-atenea-cristal': 2,
    'manilla-esmeralda-enlace': 1,
    'manilla-eslabon-dorado': 3,
    'manilla-placa-sello-dorado': 1,
  };

  return stockById[id] ?? 1;
}

function getDefaultGemstone(group) {
  const text = normalizeText(`${group.name} ${group.description} ${group.finish}`);
  if (text.includes('rubi') || text.includes('rojo')) return 'Cristal rojo tipo rubí';
  if (text.includes('amatista') || text.includes('morada')) return 'Piedra morada tipo amatista';
  if (text.includes('esmeralda') || text.includes('verde')) return 'Acentos verdes tipo esmeralda';
  if (text.includes('cristal') || text.includes('brillo')) return 'Cristales decorativos';
  return 'Sin piedra principal';
}

function getProductStock(product) {
  const stock = Number(product.stock);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
}

function getProductVariants(product) {
  return {
    metal: product.variants?.metal || product.material?.replace(/\s?18K/i, '') || 'Oro amarillo',
    purity: product.variants?.purity || (product.material?.match(/(14K|18K|925)/i)?.[0] ?? '18K'),
    gemstone: product.variants?.gemstone || 'Sin piedra principal',
    engraving: product.variants?.engraving || 'Disponible bajo solicitud',
  };
}

function getProductImages(product) {
  return Array.isArray(product.images) && product.images.length ? product.images.filter(Boolean) : ['/logo/querubim-symbol.png'];
}

function buildCatalogImageList(category, imageNumbers) {
  return imageNumbers.map((imageNumber) => {
    const number = String(imageNumber).padStart(2, '0');
    return `/products/catalogo-real/${category}/${category}-${number}.jpg`;
  });
}

function createImportedCatalogProducts() {
  return importedCatalogGroups.map((group) => {
    const label = getCategoryLabel(group.category);
    const value = formatCurrency(group.price);
    const stock = getDefaultStockForGroup(group.id);
    const variants = {
      metal: 'Oro amarillo',
      purity: '18K',
      gemstone: getDefaultGemstone(group),
      engraving: 'Disponible bajo solicitud',
    };

    return {
      id: group.id,
      name: group.name,
      category: group.category,
      material: 'Oro amarillo 18K',
      price: group.price,
      value,
      premium: false,
      description: group.description,
      measurements: group.measurements,
      stock,
      featured: false,
      variants,
      details: buildProductDetails({
        category: group.category,
        material: 'Oro amarillo 18K',
        value,
        premium: false,
        stock,
        variants,
        finish: group.finish,
      }),
      images: buildCatalogImageList(group.category, group.imageNumbers),
    };
  });
}

function hydrateCatalogProduct(product) {
  const fallback = defaultProducts.find((item) => item.id === product.id) || {};
  const merged = { ...fallback, ...product };
  merged.images = Array.isArray(product.images) && product.images.length ? product.images : getProductImages(fallback);
  merged.measurements = Array.isArray(product.measurements) ? product.measurements : fallback.measurements || [];
  merged.material = product.material || fallback.material || 'Oro amarillo 18K';
  merged.description = product.description || fallback.description || 'Joya seleccionada por Querubim.';
  merged.variants = { ...getProductVariants(fallback), ...(product.variants || {}) };
  merged.value = formatCurrency(product.price);
  merged.details = buildProductDetails(merged);
  return merged;
}

async function apiRequest(url, options = {}) {
  const method = options.method || 'GET';
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['x-querubim-admin'] = '1';

  const response = await fetch(url, { ...options, method, headers, credentials: 'same-origin' });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'No fue posible completar la solicitud.');
    error.code = result.code;
    error.status = response.status;
    throw error;
  }
  return result;
}

function applyRemoteCatalog(remoteProducts) {
  products = remoteProducts.filter((product) => product.active !== false).map(hydrateCatalogProduct);
  if (!products.some((product) => product.id === state.activeProduct?.id)) state.activeProduct = products[0];
  state.cartItems = state.cartItems.filter((item) => products.some((product) => product.id === item.product.id));
  refreshCatalogViews();
}

async function loadPublicCatalog() {
  try {
    const result = await apiRequest('/api/catalog/products');
    if (Array.isArray(result.products)) applyRemoteCatalog(result.products);
  } catch {
    // El catálogo incluido en la aplicación permanece disponible si la API está temporalmente fuera de línea.
  }
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function refreshCatalogViews() {
  renderCategories();
  renderProducts();
  renderCategories({ premium: true });
  renderProducts({ premium: true });
  renderCart();
  renderAdminPanel();
}

function buildProductDetails(product) {
  const stock = getProductStock(product);
  const variants = getProductVariants(product);
  const details = [
    ['Categoría', getCategoryLabel(product.category)],
    ['Material', product.material],
    ['Precio', product.value],
    ['Línea', product.premium ? 'Premium' : 'Catálogo'],
    ['Disponibilidad', stock > 0 ? `${stock} unidades` : 'Agotado'],
    ['Metal y pureza', `${variants.metal} ${variants.purity}`],
  ];

  if (variants.gemstone) details.push(['Piedra o gema', variants.gemstone]);
  if (product.finish) details.push(['Acabado', product.finish]);

  return details;
}

function normalizeMeasurements(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMultilineList(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getCategoryLabel(slug) {
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}

function buildWhatsAppLink(product, measure = '') {
  const measureText = measure ? ` Medida seleccionada: ${measure}.` : '';
  const message = `Hola Querubim, quiero cotizar la joya ${product.name}.${measureText}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getVisibleProducts({ premium = false } = {}) {
  const query = normalizeText((premium ? state.premiumQuery : state.query).trim());
  const activeFilter = premium ? state.activePremiumFilter : state.activeFilter;

  return products.filter((product) => {
    const matchesCatalog = Boolean(product.premium) === premium;
    const matchesFilter = activeFilter === 'todos' || product.category === activeFilter;
    const searchableText = normalizeText(
      `${product.name} ${getCategoryLabel(product.category)} ${product.material} ${product.description}`,
    );
    return matchesCatalog && matchesFilter && (!query || searchableText.includes(query));
  });
}

function renderCategories({ premium = false } = {}) {
  const activeFilter = premium ? state.activePremiumFilter : state.activeFilter;
  const target = premium ? selectors.premiumCategoryFilters : selectors.categoryFilters;
  if (!target) return;

  target.innerHTML = categories
    .map(
      (category) => `
        <button
          class="${category.slug === activeFilter ? 'active' : ''}"
          type="button"
          data-filter="${category.slug}"
          data-premium-filter="${premium}"
          aria-pressed="${category.slug === activeFilter}"
        >
          ${category.label}
        </button>
      `,
    )
    .join('');
}

function getProductCardMarkup(product, { premiumCatalog = false, index = 0 } = {}) {
  const image = getProductImages(product)[0];
  const stock = getProductStock(product);

  return `
    <article class="product-card${product.premium ? ' premium-product' : ''}${premiumCatalog ? ' premium-catalog-card' : ''}" style="--card-index: ${index}">
      <button class="product-card-view" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Ver detalle de ${escapeHtml(product.name)}">
        <span class="product-image-wrap">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
        </span>
        <span class="product-card-content">
          ${product.premium ? '<span class="premium-badge">Premium</span>' : ''}
          ${stock === 0 ? '<span class="stock-badge">Agotado</span>' : ''}
          <span class="product-card-category">${escapeHtml(getCategoryLabel(product.category))}</span>
          <span class="product-card-name">${escapeHtml(product.name)}</span>
          <span class="product-card-material">${escapeHtml(product.material)}</span>
          <span class="product-card-value">${escapeHtml(product.value)}</span>
          <span class="product-card-cta">Ver detalle</span>
        </span>
      </button>
    </article>
  `;
}

function renderProducts({ premium = false } = {}) {
  const visibleProducts = getVisibleProducts({ premium });
  const target = premium ? selectors.premiumProductGrid : selectors.productGrid;
  if (!target) return;

  target.innerHTML = visibleProducts.length
    ? visibleProducts.map((product, index) => getProductCardMarkup(product, { premiumCatalog: premium, index })).join('')
    : '<p class="empty-results">No encontramos joyas en esta categoría todavía. Escríbenos y te asesoramos.</p>';

  refreshIcons();
}

function renderDetail() {
  const product = state.activeProduct;
  const selectedMeasure = selectors.detailMeasure.value;
  const images = getProductImages(product);
  const image = images[state.activeImageIndex] ?? images[0];

  selectors.detailCategory.textContent = getCategoryLabel(product.category);
  selectors.detailName.textContent = product.name;
  selectors.detailMainImage.src = image;
  selectors.detailMainImage.alt = product.name;
  selectors.detailDescription.textContent = product.description;
  selectors.detailSpecs.innerHTML = product.details
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join('');
  selectors.detailMeasure.innerHTML = [
    '<option value="">Selecciona una medida</option>',
    ...product.measurements.map((measure) => `<option value="${escapeHtml(measure)}">${escapeHtml(measure)}</option>`),
  ].join('');
  selectors.detailMeasure.value = selectedMeasure && product.measurements.includes(selectedMeasure) ? selectedMeasure : '';
  selectors.detailThumbs.innerHTML = images
    .map(
      (src, index) => `
        <button class="${index === state.activeImageIndex ? 'active' : ''}" type="button" data-image-index="${index}" aria-label="Ver imagen ${index + 1} de ${escapeHtml(product.name)}">
          <img src="${escapeHtml(src)}" alt="" loading="lazy" />
        </button>
      `,
    )
    .join('');
  selectors.detailWhatsapp.href = buildWhatsAppLink(product, selectors.detailMeasure.value);
  selectors.detailMessage.textContent = '';
  selectors.detailMessage.classList.remove('error', 'success');
  refreshIcons();
}

function openProductDetail(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  state.activeProduct = product;
  state.activeImageIndex = 0;
  renderDetail();
  openPanel(selectors.detailPanel);
}

function addActiveProductToCart() {
  const measure = selectors.detailMeasure.value;
  const product = state.activeProduct;

  if (!measure) {
    selectors.detailMessage.textContent = 'Selecciona una medida antes de añadir la joya a la canasta.';
    selectors.detailMessage.classList.add('error');
    selectors.detailMeasure.focus();
    return;
  }

  const key = `${product.id}-${measure}`;
  if (state.cartItems.some((item) => item.key === key)) {
    selectors.detailMessage.textContent = 'Esta joya con esa medida ya está en la canasta.';
    selectors.detailMessage.classList.add('error');
    return;
  }

  state.cartItems.push({ key, product, measure });
  renderCart();
  selectors.detailMessage.textContent = 'Joya añadida a la canasta con la medida seleccionada.';
  selectors.detailMessage.classList.remove('error');
  selectors.detailMessage.classList.add('success');
}

function removeCartItem(key) {
  state.cartItems = state.cartItems.filter((item) => item.key !== key);
  renderCart();
}

function renderCart() {
  selectors.cartCount.textContent = String(state.cartItems.length);
  selectors.selectionEmpty.hidden = state.cartItems.length > 0;
  selectors.checkoutForm.hidden = state.cartItems.length === 0;
  selectors.checkoutTotal.textContent = formatCurrency(
    state.cartItems.reduce((total, item) => total + getProductPrice(item.product), 0),
  );
  selectors.selectionItems.innerHTML = state.cartItems
    .map(
      ({ key, product, measure }) => `
        <article class="selection-item">
          <img src="${escapeHtml(getProductImages(product)[0])}" alt="${escapeHtml(product.name)}" loading="lazy" />
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span>${getCategoryLabel(product.category)} · ${product.material}</span>
            <small>Medida: ${escapeHtml(measure)}</small>
          </div>
          <button class="icon-button" type="button" data-remove-cart="${escapeHtml(key)}" aria-label="Quitar ${escapeHtml(product.name)}">
            <i data-lucide="x"></i>
          </button>
        </article>
      `,
    )
    .join('');
  refreshIcons();
}

let boldCheckoutScriptPromise;

function loadBoldCheckoutScript() {
  if (window.BoldCheckout) return Promise.resolve(window.BoldCheckout);
  if (boldCheckoutScriptPromise) return boldCheckoutScriptPromise;

  boldCheckoutScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]');
    const script = existingScript || document.createElement('script');
    const handleLoad = () => {
      if (window.BoldCheckout) resolve(window.BoldCheckout);
      else reject(new Error('Bold Checkout no quedó disponible después de cargar la librería.'));
    };
    const handleError = () => reject(new Error('No fue posible cargar la pasarela segura de Bold.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (!existingScript) {
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return boldCheckoutScriptPromise;
}

function setCheckoutBusy(isBusy) {
  state.checkoutBusy = isBusy;
  selectors.checkoutPayButton.disabled = isBusy;
  selectors.checkoutPayButton.classList.toggle('loading', isBusy);
  selectors.checkoutPayLabel.textContent = isBusy ? 'Preparando pago' : 'Pagar con Bold';
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (state.checkoutBusy || state.cartItems.length === 0) return;

  selectors.checkoutMessage.textContent = '';
  selectors.checkoutMessage.classList.remove('error', 'success');
  if (!selectors.checkoutForm.checkValidity()) {
    selectors.checkoutMessage.textContent = 'Completa tus datos para continuar con el pago.';
    selectors.checkoutMessage.classList.add('error');
    selectors.checkoutForm.reportValidity();
    return;
  }

  setCheckoutBusy(true);
  try {
    const formData = new FormData(selectors.checkoutForm);
    const customer = {
      fullName: String(formData.get('fullName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
    };
    const response = await fetch('/api/payments/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        items: state.cartItems.map(({ product, measure }) => ({ productId: product.id, measure, quantity: 1 })),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No fue posible crear la orden de pago.');

    const BoldCheckout = await loadBoldCheckoutScript();
    const checkoutConfig = {
      orderId: result.payment.orderId,
      currency: result.payment.currency,
      amount: result.payment.amount,
      apiKey: result.payment.apiKey,
      integritySignature: result.payment.integritySignature,
      description: result.payment.description,
      renderMode: 'embedded',
    };
    if (result.payment.redirectionUrl) checkoutConfig.redirectionUrl = result.payment.redirectionUrl;
    if (result.payment.tax) checkoutConfig.tax = result.payment.tax;
    const checkout = new BoldCheckout(checkoutConfig);

    sessionStorage.setItem('querubim-last-order', result.order.id);
    selectors.checkoutMessage.textContent = `Orden ${result.order.id} creada correctamente.`;
    selectors.checkoutMessage.classList.add('success');
    closePanels();
    checkout.open();
  } catch (error) {
    selectors.checkoutMessage.textContent = error.message || 'No fue posible iniciar el pago. Inténtalo nuevamente.';
    selectors.checkoutMessage.classList.add('error');
  } finally {
    setCheckoutBusy(false);
  }
}

const paymentStatusContent = {
  PAID: {
    icon: 'circle-check',
    tone: 'success',
    title: 'Tu pago fue confirmado.',
    message: 'Recibimos el pago correctamente. Querubim continuará con la preparación de tu pedido.',
  },
  REJECTED: {
    icon: 'circle-x',
    tone: 'error',
    title: 'El pago no fue aprobado.',
    message: 'No se realizó ningún cobro confirmado. Puedes volver al catálogo e intentarlo de nuevo.',
  },
  VOIDED: {
    icon: 'circle-x',
    tone: 'neutral',
    title: 'El pago fue anulado.',
    message: 'La transacción figura como anulada. Comunícate con Querubim si necesitas ayuda con tu pedido.',
  },
  REVIEW_REQUIRED: {
    icon: 'shield-check',
    tone: 'warning',
    title: 'El pago requiere verificación.',
    message: 'Detectamos una diferencia en la notificación y el pedido quedó protegido para revisión manual.',
  },
  CREATED: {
    icon: 'loader-circle',
    tone: 'pending',
    title: 'Estamos confirmando tu pago.',
    message: 'Bold todavía no ha enviado la confirmación definitiva. Esta página se actualizará automáticamente.',
  },
};

const paymentStatusLabels = {
  CREATED: 'Confirmación pendiente',
  PAID: 'Pago aprobado',
  REJECTED: 'Pago rechazado',
  VOIDED: 'Pago anulado',
  REVIEW_REQUIRED: 'Revisión requerida',
};

function renderPaymentResult(order, errorMessage = '') {
  const content = errorMessage
    ? { icon: 'circle-x', tone: 'error', title: 'No pudimos consultar el pago.', message: errorMessage }
    : paymentStatusContent[order?.status] || paymentStatusContent.CREATED;
  selectors.paymentResultIcon.className = `payment-result-icon ${content.tone}`;
  selectors.paymentResultIcon.innerHTML = `<i data-lucide="${content.icon}"></i>`;
  selectors.paymentResultTitle.textContent = content.title;
  selectors.paymentResultMessage.textContent = content.message;
  selectors.paymentResultSummary.innerHTML = order
    ? `
        <div><dt>Orden</dt><dd>${escapeHtml(order.id)}</dd></div>
        <div><dt>Total</dt><dd>${formatCurrency(order.amount)}</dd></div>
        <div><dt>Estado</dt><dd>${escapeHtml(paymentStatusLabels[order.status] || order.status)}</dd></div>
      `
    : '';
  if (order?.status === 'PAID') {
    state.cartItems = [];
    renderCart();
  }
  refreshIcons();
}

async function consultPaymentOrder({ scheduleNext = true } = {}) {
  window.clearTimeout(state.paymentPollTimer);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orden') || sessionStorage.getItem('querubim-last-order');
  if (!orderId) {
    renderPaymentResult(null, 'No encontramos una referencia de orden para verificar.');
    return;
  }

  selectors.paymentResultRefresh.disabled = true;
  try {
    const response = await fetch(`/api/payments/orders/${encodeURIComponent(orderId)}`, { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No fue posible consultar la orden.');
    renderPaymentResult(result.order);

    const isPending = result.order.status === 'CREATED';
    if (scheduleNext && isPending && state.paymentPollAttempts < 60) {
      state.paymentPollAttempts += 1;
      state.paymentPollTimer = window.setTimeout(() => consultPaymentOrder(), 10_000);
    }
  } catch (error) {
    renderPaymentResult(null, error.message || 'Inténtalo de nuevo en unos minutos.');
  } finally {
    selectors.paymentResultRefresh.disabled = false;
  }
}

function isAdminLoggedIn() {
  return state.adminAuthenticated;
}

async function loadAdminDashboard() {
  if (!isAdminLoggedIn() || state.adminLoading) return;
  state.adminLoading = true;
  try {
    const result = await apiRequest('/api/admin/dashboard');
    state.adminOrders = Array.isArray(result.orders) ? result.orders : [];
    state.adminSummary = result.summary || null;
    if (Array.isArray(result.products)) applyRemoteCatalog(result.products);
    renderAdminPanel();
  } catch (error) {
    if (error.status === 401) {
      state.adminAuthenticated = false;
      state.adminUser = null;
      updateAdminViews();
    } else if (selectors.adminBackupStatus) {
      selectors.adminBackupStatus.textContent = error.message;
    }
  } finally {
    state.adminLoading = false;
  }
}

async function checkAdminSession() {
  try {
    const result = await apiRequest('/api/admin/session');
    state.adminAuthenticated = Boolean(result.authenticated);
    state.adminUser = result.user;
    if (result.authenticated) state.adminHeartbeatAt = Date.now();
    if (!result.configured && selectors.adminLoginMessage) {
      selectors.adminLoginMessage.textContent = 'El acceso administrativo debe configurarse en Vercel antes de ingresar.';
      selectors.adminLoginMessage.classList.add('error');
    }
  } catch (error) {
    state.adminAuthenticated = false;
    state.adminUser = null;
    if (error.code === 'ADMIN_NOT_CONFIGURED' && selectors.adminLoginMessage) {
      selectors.adminLoginMessage.textContent = 'El acceso administrativo debe configurarse en Vercel antes de ingresar.';
      selectors.adminLoginMessage.classList.add('error');
    }
  } finally {
    state.adminSessionChecked = true;
    updateAdminViews();
    if (state.adminAuthenticated) await loadAdminDashboard();
  }
}

function populateAdminCategoryOptions() {
  if (!selectors.adminCategory) return;
  const selectedCategory = selectors.adminCategory.value || 'anillos';

  selectors.adminCategory.innerHTML = categories
    .filter((category) => category.slug !== 'todos')
    .map(
      (category) =>
        `<option value="${escapeHtml(category.slug)}"${category.slug === selectedCategory ? ' selected' : ''}>${escapeHtml(category.label)}</option>`,
    )
    .join('');
}

function getAdminVisibleProducts() {
  const query = normalizeText(state.adminQuery.trim());

  return products
    .filter((product) => {
      const variants = getProductVariants(product);
      const searchableText = normalizeText(
        `${product.name} ${getCategoryLabel(product.category)} ${product.material} ${product.value} ${variants.metal} ${variants.purity} ${variants.gemstone} stock ${getProductStock(product)}`,
      );
      return !query || searchableText.includes(query);
    })
    .sort((first, second) => {
      if (Boolean(first.premium) !== Boolean(second.premium)) return Number(second.premium) - Number(first.premium);
      return first.name.localeCompare(second.name, 'es');
    });
}

function getLowStockProducts() {
  return products.filter((product) => getProductStock(product) <= 1);
}

function getCatalogImageCount() {
  return products.reduce((total, product) => total + getProductImages(product).length, 0);
}

function getAdminActivityLog() {
  try {
    const storedActivity = localStorage.getItem(ADMIN_ACTIVITY_KEY);
    const parsedActivity = JSON.parse(storedActivity || '[]');
    if (Array.isArray(parsedActivity)) return parsedActivity;
  } catch {
    localStorage.removeItem(ADMIN_ACTIVITY_KEY);
  }

  return [
    {
      action: 'Panel administrativo rediseñado con diagnóstico operativo.',
      user: state.adminUser?.email || 'Administrador Querubim',
      date: new Date().toISOString(),
    },
  ];
}

function recordAdminActivity(action) {
  const activity = getAdminActivityLog();
  activity.unshift({
    action,
    user: state.adminUser?.email || 'Administrador Querubim',
    date: new Date().toISOString(),
  });
  localStorage.setItem(ADMIN_ACTIVITY_KEY, JSON.stringify(activity.slice(0, 12)));
  renderAdminOperations();
}

function getLastBackupLabel() {
  const backupDate = localStorage.getItem(ADMIN_BACKUP_KEY);
  if (!backupDate) return 'Pendiente de exportar respaldo';

  return `Último respaldo: ${new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(backupDate))}`;
}

function updateBackupState() {
  if (selectors.adminBackupStatus) {
    selectors.adminBackupStatus.textContent = `${getLastBackupLabel()} · sesión segura de 15 minutos.`;
  }

  if (selectors.adminResetCatalog) selectors.adminResetCatalog.disabled = state.adminLoading;
}

function renderAdminStats() {
  if (!selectors.adminStats) return;

  const normalProducts = products.filter((product) => !product.premium).length;
  const pendingOrders = state.adminOrders.filter((order) => order.status === 'CREATED').length;
  const categoriesUsed = new Set(products.map((product) => product.category)).size;
  const paidRevenue = Number(state.adminSummary?.paidRevenue || 0);
  const lowStock = getLowStockProducts().length;

  const stats = [
    { icon: 'package', label: 'Productos', value: products.length },
    { icon: 'image-plus', label: 'Fotos gestionadas', value: getCatalogImageCount() },
    { icon: 'package-check', label: 'Stock bajo', value: lowStock },
    { icon: 'clipboard-list', label: 'Pagos pendientes', value: pendingOrders },
    { icon: 'user-round', label: 'Clientes reales', value: Number(state.adminSummary?.customers || 0) },
    { icon: 'shield-check', label: 'Categorías activas', value: categoriesUsed },
    { icon: 'shopping-bag', label: 'Ingresos aprobados', value: formatCurrency(paidRevenue) },
    { icon: 'gem', label: 'En revisión', value: Number(state.adminSummary?.reviewOrders || 0) },
  ];

  selectors.adminStats.innerHTML = stats
    .map(
      (stat) => `
        <article class="admin-stat">
          <i data-lucide="${stat.icon}"></i>
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </article>
      `,
    )
    .join('');
}

function renderAdminDiagnostics() {
  if (!selectors.adminDiagnostics) return;

  const diagnostics = [
    {
      icon: 'image-plus',
      title: 'Almacenamiento de imágenes',
      before: 'Actual: galerías mediante rutas públicas o URL HTTPS.',
      improvement: 'Siguiente mejora: carga directa cuando estén disponibles las credenciales de Cloudflare.',
      status: 'En integración',
    },
    {
      icon: 'package-check',
      title: 'Inventario invisible',
      before: 'Antes: no existía stock.',
      improvement: 'Ahora: cada producto registra existencias y el panel marca stock bajo o agotado.',
      status: 'Corregido',
    },
    {
      icon: 'layers',
      title: 'Variantes incompletas',
      before: 'Antes: solo medidas.',
      improvement: 'Ahora: metal, pureza, piedra o gema, medida y grabado personalizado.',
      status: 'Corregido',
    },
    {
      icon: 'clipboard-list',
      title: 'Pedidos sin seguimiento',
      before: 'Antes: la bandeja utilizaba datos de ejemplo.',
      improvement: 'Ahora: muestra las órdenes y estados recibidos desde Bold.',
      status: 'Corregido',
    },
    {
      icon: 'user-round',
      title: 'Clientes sin historial',
      before: 'Antes: los clientes visibles eran demostrativos.',
      improvement: 'Ahora: el resumen se calcula a partir de compradores y pedidos reales.',
      status: 'Corregido',
    },
    {
      icon: 'download',
      title: 'Restauración riesgosa',
      before: 'Antes: restaurar podía borrar cambios sin respaldo.',
      improvement: 'Ahora: el botón de restaurar exige exportar el catálogo en CSV primero.',
      status: 'Corregido',
    },
    {
      icon: 'database',
      title: 'Catálogo aislado',
      before: 'Antes: los cambios solo existían en el navegador del administrador.',
      improvement: 'Ahora: tienda, panel, inventario y pagos consumen la misma base de datos.',
      status: 'Corregido',
    },
    {
      icon: 'shield-check',
      title: 'Roles y trazabilidad',
      before: 'Antes: las credenciales estaban incluidas en el JavaScript público.',
      improvement: 'Ahora: el servidor valida al administrador y entrega una sesión protegida.',
      status: 'Mejorado',
    },
    {
      icon: 'key-round',
      title: 'Sesión administrativa',
      before: 'Antes: el acceso dependía de localStorage.',
      improvement: 'Ahora: cookie segura, inaccesible al JavaScript y cierre tras 15 minutos.',
      status: 'Corregido',
    },
    {
      icon: 'credit-card',
      title: 'Pagos sin conexión',
      before: 'Antes: se mostraban proveedores de pago simulados.',
      improvement: 'Ahora: ingresos y alertas reflejan directamente la integración con Bold.',
      status: 'Corregido',
    },
  ];

  selectors.adminDiagnostics.innerHTML = diagnostics
    .map(
      (item) => `
        <article class="admin-diagnostic-card">
          <i data-lucide="${item.icon}"></i>
          <span>${escapeHtml(item.status)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.before)}</p>
          <strong>${escapeHtml(item.improvement)}</strong>
        </article>
      `,
    )
    .join('');
}

function getAdminCustomers() {
  const customers = new Map();
  state.adminOrders.forEach((order) => {
    const customer = order.customer || {};
    const key = customer.email || customer.phone;
    if (!key) return;
    const current = customers.get(key) || {
      name: customer.fullName || 'Cliente sin nombre',
      email: customer.email || '',
      phone: customer.phone || '',
      purchases: 0,
      lastPurchase: '',
    };
    current.purchases += 1;
    if (!current.lastPurchase) current.lastPurchase = order.items?.map((item) => item.name).join(', ') || 'Sin detalle';
    customers.set(key, current);
  });
  return [...customers.values()];
}

function getOrderStatusLabel(status) {
  return {
    CREATED: 'Pendiente de pago',
    PAID: 'Pago aprobado',
    REJECTED: 'Pago rechazado',
    VOIDED: 'Pago anulado',
    REVIEW_REQUIRED: 'Revisión requerida',
  }[status] || status || 'Sin estado';
}

function renderAdminOperations() {
  if (!selectors.adminOperations) return;

  const activity = getAdminActivityLog();
  const lowStockProducts = getLowStockProducts().slice(0, 4);
  const recentOrders = state.adminOrders.slice(0, 5);
  const customers = getAdminCustomers().slice(0, 5);
  const paymentCounts = state.adminOrders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }, {});

  selectors.adminOperations.innerHTML = `
    <section class="admin-ops-card">
      <div class="admin-panel-title compact">
        <div><span class="eyebrow">Pedidos</span><h2>Órdenes recientes</h2></div>
        <i data-lucide="clipboard-list"></i>
      </div>
      <div class="admin-mini-list">
        ${recentOrders.length
          ? recentOrders.map((order) => `
              <article>
                <strong>${escapeHtml(order.id)} · ${escapeHtml(order.customer?.fullName || 'Cliente')}</strong>
                <span>${escapeHtml(order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'Sin detalle')}</span>
                <small>${escapeHtml(getOrderStatusLabel(order.status))} / ${escapeHtml(formatCurrency(order.amount))}</small>
              </article>`).join('')
          : '<article><strong>Aún no hay pedidos</strong><span>Las órdenes creadas con Bold aparecerán aquí.</span><small>Sin movimientos</small></article>'}
      </div>
    </section>

    <section class="admin-ops-card">
      <div class="admin-panel-title compact">
        <div><span class="eyebrow">Clientes</span><h2>Compradores reales</h2></div>
        <i data-lucide="user-round"></i>
      </div>
      <div class="admin-mini-list">
        ${customers.length
          ? customers.map((customer) => `
              <article>
                <strong>${escapeHtml(customer.name)}</strong>
                <span>${escapeHtml(customer.email || customer.phone)}</span>
                <small>${customer.purchases} pedido${customer.purchases === 1 ? '' : 's'} / Última pieza: ${escapeHtml(customer.lastPurchase)}</small>
              </article>`).join('')
          : '<article><strong>Sin compradores registrados</strong><span>Los datos aparecerán después de la primera orden.</span><small>Historial vacío</small></article>'}
      </div>
    </section>

    <section class="admin-ops-card">
      <div class="admin-panel-title compact">
        <div><span class="eyebrow">Inventario</span><h2>Alertas de stock</h2></div>
        <i data-lucide="bell"></i>
      </div>
      <div class="admin-mini-list">
        ${lowStockProducts.length
          ? lowStockProducts.map((product) => `
              <article>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(getCategoryLabel(product.category))}</span>
                <small>${getProductStock(product) === 0 ? 'Agotado' : 'Última unidad disponible'}</small>
              </article>`).join('')
          : '<article><strong>Inventario estable</strong><span>No hay alertas de stock bajo.</span><small>Seguimiento activo</small></article>'}
      </div>
    </section>

    <section class="admin-ops-card">
      <div class="admin-panel-title compact">
        <div><span class="eyebrow">Bold</span><h2>Estados de pago</h2></div>
        <i data-lucide="credit-card"></i>
      </div>
      <div class="admin-mini-list">
        <article><strong>${paymentCounts.PAID || 0} pagos aprobados</strong><span>${formatCurrency(state.adminSummary?.paidRevenue || 0)}</span><small>Confirmados por webhook</small></article>
        <article><strong>${paymentCounts.CREATED || 0} pagos pendientes</strong><span>${paymentCounts.REJECTED || 0} rechazados / ${paymentCounts.VOIDED || 0} anulados</span><small>${paymentCounts.REVIEW_REQUIRED || 0} requieren revisión</small></article>
      </div>
    </section>

    <section class="admin-ops-card wide">
      <div class="admin-panel-title compact">
        <div><span class="eyebrow">Actividad</span><h2>Registro local de cambios</h2></div>
        <i data-lucide="database"></i>
      </div>
      <div class="admin-mini-list activity-list">
        ${activity.slice(0, 6).map((item) => `
            <article>
              <strong>${escapeHtml(item.action)}</strong>
              <span>${escapeHtml(item.user)}</span>
              <small>${escapeHtml(new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.date)))}</small>
            </article>`).join('')}
      </div>
    </section>
  `;
}

function renderAdminProducts() {
  if (!selectors.adminProductList) return;
  const visibleProducts = getAdminVisibleProducts();

  selectors.adminProductList.innerHTML = visibleProducts.length
    ? visibleProducts
        .map((product) => {
          const image = getProductImages(product)[0];
          const stock = getProductStock(product);
          const imageCount = getProductImages(product).length;
          return `
            <article class="admin-product-item${product.premium ? ' premium-admin-item' : ''}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(getCategoryLabel(product.category))} / ${escapeHtml(product.material)}</span>
                <small>${escapeHtml(product.value)} / ${stock === 0 ? 'Agotado' : `${stock} und.`} / ${imageCount} fotos${product.featured ? ' / Destacado' : ''}${product.premium ? ' / Premium' : ''}</small>
              </div>
              <div class="admin-product-actions">
                <button class="icon-button" type="button" data-admin-edit="${escapeHtml(product.id)}" aria-label="Editar ${escapeHtml(product.name)}">
                  <i data-lucide="edit-3"></i>
                </button>
                <button class="icon-button danger-button" type="button" data-admin-delete="${escapeHtml(product.id)}" aria-label="Eliminar ${escapeHtml(product.name)}">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </article>
          `;
        })
        .join('')
    : '<p class="empty-results">No hay productos que coincidan con la búsqueda.</p>';
}

function renderAdminPanel() {
  if (!selectors.adminStats || !isAdminLoggedIn()) return;

  populateAdminCategoryOptions();
  renderAdminStats();
  renderAdminDiagnostics();
  renderAdminOperations();
  renderAdminProducts();
  updateBackupState();
  refreshIcons();
}

function updateAdminViews() {
  if (!selectors.adminLoginView || !selectors.adminPanelView) return;

  const loggedIn = isAdminLoggedIn();
  selectors.adminLoginView.hidden = loggedIn;
  selectors.adminPanelView.hidden = !loggedIn;

  if (loggedIn) {
    scheduleAdminTimeout();
    populateAdminCategoryOptions();
    renderAdminPanel();
  }

  refreshIcons();
}

function renderAdminImagePreview() {
  if (!selectors.adminImagePreview || !selectors.adminImages) return;

  const images = normalizeMultilineList(selectors.adminImages.value);
  selectors.adminImagePreview.innerHTML = images.length
    ? images
        .slice(0, 8)
        .map(
          (image, index) => `
            <figure class="${index === 0 ? 'primary' : ''}">
              <img src="${escapeHtml(image)}" alt="Vista previa ${index + 1}" loading="lazy" />
              <figcaption>${index === 0 ? 'Principal' : `Foto ${index + 1}`}</figcaption>
            </figure>
          `,
        )
        .join('')
    : '<p>La vista previa aparecerá cuando agregues rutas o cargues imágenes.</p>';
}

function handleAdminImageFiles(files) {
  const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
  if (!imageFiles.length) return;
  selectors.adminFormMessage.textContent =
    'La carga directa se habilitará al conectar Cloudflare. Por ahora agrega rutas públicas o URL HTTPS en el campo de galería.';
  selectors.adminFormMessage.classList.remove('success');
  selectors.adminFormMessage.classList.add('error');
}

function resetAdminForm() {
  if (!selectors.adminProductForm) return;

  state.editingProductId = null;
  selectors.adminProductForm.reset();
  selectors.adminEditId.value = '';
  selectors.adminFormTitle.textContent = 'Crear producto';
  selectors.adminMaterial.value = 'Oro amarillo 18K';
  selectors.adminStock.value = '1';
  selectors.adminMetal.value = 'Oro amarillo';
  selectors.adminPurity.value = '18K';
  selectors.adminGemstone.value = 'Sin piedra principal';
  selectors.adminEngraving.value = 'Disponible bajo solicitud';
  selectors.adminImages.value = '';
  selectors.adminMeasurements.value = 'Medida personalizada';
  selectors.adminDescription.value = '';
  selectors.adminFeatured.checked = false;
  selectors.adminFormMessage.textContent = '';
  selectors.adminFormMessage.classList.remove('error', 'success');
  populateAdminCategoryOptions();
  renderAdminImagePreview();
}

function fillAdminForm(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !selectors.adminProductForm) return;

  state.editingProductId = product.id;
  selectors.adminEditId.value = product.id;
  selectors.adminFormTitle.textContent = 'Editar producto';
  selectors.adminName.value = product.name;
  selectors.adminCategory.value = product.category;
  selectors.adminPrice.value = getProductPrice(product);
  selectors.adminMaterial.value = product.material;
  selectors.adminStock.value = getProductStock(product);
  selectors.adminImages.value = getProductImages(product).join('\n');
  selectors.adminMetal.value = getProductVariants(product).metal;
  selectors.adminPurity.value = getProductVariants(product).purity;
  selectors.adminGemstone.value = getProductVariants(product).gemstone;
  selectors.adminEngraving.value = getProductVariants(product).engraving;
  selectors.adminMeasurements.value = product.measurements.join(', ');
  selectors.adminDescription.value = product.description;
  selectors.adminPremium.checked = Boolean(product.premium);
  selectors.adminFeatured.checked = Boolean(product.featured);
  selectors.adminFormMessage.textContent = '';
  selectors.adminFormMessage.classList.remove('error', 'success');
  renderAdminImagePreview();
  selectors.adminName.focus();
}

function buildProductFromAdminForm() {
  const name = selectors.adminName.value.trim();
  const category = selectors.adminCategory.value;
  const price = Number(selectors.adminPrice.value);
  const stock = Number(selectors.adminStock.value);
  const material = selectors.adminMaterial.value.trim();
  const images = normalizeMultilineList(selectors.adminImages.value);
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  const description = selectors.adminDescription.value.trim();
  const premium = selectors.adminPremium.checked;
  const featured = selectors.adminFeatured.checked;
  const variants = {
    metal: selectors.adminMetal.value,
    purity: selectors.adminPurity.value,
    gemstone: selectors.adminGemstone.value.trim() || 'Sin piedra principal',
    engraving: selectors.adminEngraving.value,
  };
  const existingId = selectors.adminEditId.value || state.editingProductId;
  const id = existingId || `${slugify(name || category)}-${Date.now()}`;
  const value = formatCurrency(price);

  return {
    id,
    name,
    category,
    material,
    price,
    value,
    premium,
    featured,
    description,
    measurements,
    stock,
    variants,
    details: buildProductDetails({ category, material, value, premium, stock, variants }),
    images,
  };
}

async function saveAdminProduct(event) {
  event.preventDefault();

  if (!selectors.adminProductForm.checkValidity()) {
    selectors.adminFormMessage.textContent = 'Revisa los campos requeridos antes de guardar.';
    selectors.adminFormMessage.classList.add('error');
    selectors.adminProductForm.reportValidity();
    return;
  }

  const product = buildProductFromAdminForm();

  if (!product.measurements.length) {
    selectors.adminFormMessage.textContent = 'Agrega por lo menos una medida disponible.';
    selectors.adminFormMessage.classList.add('error');
    selectors.adminMeasurements.focus();
    return;
  }

  if (!product.images.length) {
    selectors.adminFormMessage.textContent = 'Agrega por lo menos una imagen para la galería.';
    selectors.adminFormMessage.classList.add('error');
    selectors.adminImages.focus();
    return;
  }

  const existingIndex = products.findIndex((item) => item.id === product.id);
  const submitButton = selectors.adminProductForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  selectors.adminFormMessage.textContent = 'Guardando producto...';
  selectors.adminFormMessage.classList.remove('error', 'success');

  try {
    const result = await apiRequest(
      existingIndex >= 0 ? `/api/admin/products/${encodeURIComponent(product.id)}` : '/api/admin/products',
      {
        method: existingIndex >= 0 ? 'PUT' : 'POST',
        body: JSON.stringify(product),
      },
    );
    const savedProduct = hydrateCatalogProduct(result.product);
    if (existingIndex >= 0) products[existingIndex] = savedProduct;
    else products.unshift(savedProduct);
    state.activeProduct = savedProduct;
    resetAdminForm();
    refreshCatalogViews();
    selectors.adminFormMessage.textContent = 'Producto guardado en el catálogo y conectado con pagos.';
    selectors.adminFormMessage.classList.add('success');
    recordAdminActivity(`${existingIndex >= 0 ? 'Actualización' : 'Creación'} de producto: ${savedProduct.name}.`);
    await loadAdminDashboard();
  } catch (error) {
    selectors.adminFormMessage.textContent = error.message;
    selectors.adminFormMessage.classList.add('error');
    if (error.status === 401) await checkAdminSession();
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteAdminProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  if (!window.confirm(`¿Eliminar ${product.name} del catálogo?`)) return;

  try {
    await apiRequest(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
    products = products.filter((item) => item.id !== productId);
    state.cartItems = state.cartItems.filter((item) => item.product.id !== productId);
    if (state.activeProduct?.id === productId) state.activeProduct = products[0];
    refreshCatalogViews();
    recordAdminActivity(`Retiro de producto: ${product.name}.`);
    await loadAdminDashboard();
  } catch (error) {
    window.alert(error.message);
    if (error.status === 401) await checkAdminSession();
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  if (!selectors.adminLoginForm.checkValidity()) {
    selectors.adminLoginMessage.textContent = 'Completa el correo y la contraseña.';
    selectors.adminLoginMessage.classList.add('error');
    selectors.adminLoginForm.reportValidity();
    return;
  }

  const formData = new FormData(selectors.adminLoginForm);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const submitButton = selectors.adminLoginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  selectors.adminLoginMessage.textContent = 'Verificando acceso...';
  selectors.adminLoginMessage.classList.remove('error');

  try {
    const result = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    state.adminAuthenticated = true;
    state.adminSessionChecked = true;
    state.adminUser = result.user;
    state.adminHeartbeatAt = Date.now();
    selectors.adminLoginForm.reset();
    selectors.adminLoginMessage.textContent = '';
    selectors.adminLoginMessage.classList.remove('error');
    resetAdminForm();
    scheduleAdminTimeout();
    updateAdminViews();
    recordAdminActivity('Ingreso al panel administrativo.');
    await loadAdminDashboard();
  } catch (error) {
    selectors.adminLoginMessage.textContent = error.message;
    selectors.adminLoginMessage.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleAdminLogout() {
  try {
    await apiRequest('/api/admin/logout', { method: 'POST' });
  } catch {
    // La interfaz debe cerrar la sesión incluso si la solicitud de salida no responde.
  }
  state.adminAuthenticated = false;
  state.adminSessionChecked = true;
  state.adminUser = null;
  state.adminOrders = [];
  state.adminSummary = null;
  state.adminHeartbeatAt = 0;
  state.editingProductId = null;
  window.clearTimeout(state.adminTimeoutId);
  updateAdminViews();
}

function scheduleAdminTimeout() {
  window.clearTimeout(state.adminTimeoutId);
  if (!isAdminLoggedIn()) return;

  state.adminTimeoutId = window.setTimeout(() => {
    handleAdminLogout();
    if (state.currentRoute === 'admin') {
      selectors.adminLoginMessage.textContent = 'La sesión se cerró por inactividad.';
      selectors.adminLoginMessage.classList.add('error');
    }
  }, ADMIN_INACTIVITY_LIMIT);
}

function registerAdminActivity() {
  if (!isAdminLoggedIn()) return;
  scheduleAdminTimeout();
  const now = Date.now();
  if (now - state.adminHeartbeatAt < 5 * 60 * 1000) return;
  state.adminHeartbeatAt = now;
  apiRequest('/api/admin/session')
    .then((result) => {
      if (!result.authenticated) handleAdminLogout();
    })
    .catch(() => undefined);
}

function exportCatalogCsv() {
  const headers = [
    'id',
    'nombre',
    'categoria',
    'precio_cop',
    'stock',
    'material',
    'metal',
    'pureza',
    'piedra_gema',
    'grabado',
    'premium',
    'destacado',
    'medidas',
    'imagenes',
    'descripcion',
  ];

  const rows = products.map((product) => {
    const variants = getProductVariants(product);
    return [
      product.id,
      product.name,
      getCategoryLabel(product.category),
      getProductPrice(product),
      getProductStock(product),
      product.material,
      variants.metal,
      variants.purity,
      variants.gemstone,
      variants.engraving,
      product.premium ? 'Sí' : 'No',
      product.featured ? 'Sí' : 'No',
      product.measurements?.join(' | ') || '',
      getProductImages(product).join(' | '),
      product.description,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `querubim-catalogo-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  localStorage.setItem(ADMIN_BACKUP_KEY, new Date().toISOString());
  updateBackupState();
  recordAdminActivity('Exportación de respaldo CSV del catálogo.');
}

function handlePasswordRecovery() {
  if (!selectors.adminBackupStatus) return;
  selectors.adminBackupStatus.textContent =
    'La recuperación por correo se habilitará al conectar el proveedor de correo transaccional. Por seguridad, solicita el cambio al responsable técnico.';
  recordAdminActivity('Consulta de recuperación de contraseña.');
}

function openPanel(panel) {
  closePanels(false);
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  selectors.overlay.classList.add('visible');
  document.body.classList.add('panel-open');
}

function closePanels(removeOverlay = true) {
  selectors.mobileDrawer.classList.remove('open');
  selectors.detailPanel.classList.remove('open');
  selectors.selectionDrawer.classList.remove('open');
  selectors.mobileDrawer.setAttribute('aria-hidden', 'true');
  selectors.detailPanel.setAttribute('aria-hidden', 'true');
  selectors.selectionDrawer.setAttribute('aria-hidden', 'true');
  if (removeOverlay) {
    selectors.overlay.classList.remove('visible');
    document.body.classList.remove('panel-open');
  }
}

function updateActiveNavigation(sectionId) {
  selectors.navLinks.forEach((link) => {
    const isActive =
      sectionId === 'premium'
        ? link.dataset.routeLink === 'premium'
        : sectionId === 'admin'
          ? link.dataset.routeLink === 'admin'
          : sectionId === 'historia'
            ? link.dataset.routeLink === 'historia'
            : sectionId === 'contacto'
              ? link.dataset.routeLink === 'contacto'
              : link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateActiveNavigationFromScroll() {
  if (standaloneRoutes.has(state.currentRoute)) {
    updateActiveNavigation(state.currentRoute);
    return;
  }

  const headerOffset = document.querySelector('#site-header').offsetHeight;
  const targetLine = window.scrollY + headerOffset + window.innerHeight * 0.38;
  let activeSection = selectors.pageSections[0]?.id;

  selectors.pageSections.forEach((section) => {
    if (section.offsetTop <= targetLine) activeSection = section.id;
  });

  if (activeSection) updateActiveNavigation(activeSection);
}

function setupSectionObservers() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (state.currentRoute !== 'home') return;
        updateActiveNavigation(entry.target.id);
      });
    },
    { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 },
  );

  selectors.pageSections.forEach((section) => observer.observe(section));
}

function updateScrollTopButton() {
  state.ticking = false;
  if (standaloneRoutes.has(state.currentRoute)) {
    selectors.scrollTopButton.classList.toggle('visible', window.scrollY > 320);
    updateActiveNavigation(state.currentRoute);
    return;
  }

  const heroHeight = document.querySelector('#home').offsetHeight;
  selectors.scrollTopButton.classList.toggle('visible', window.scrollY > heroHeight * 0.55);
  updateActiveNavigationFromScroll();
}

function requestScrollUpdate() {
  if (state.ticking) return;
  state.ticking = true;
  requestAnimationFrame(updateScrollTopButton);
}

function getInitialRoute() {
  const pathname = window.location.pathname.replace(/\/$/, '');
  if (pathname === '/pago/resultado') return 'payment';
  if (pathname === '/premium') return 'premium';
  if (pathname === '/admin') return 'admin';
  if (pathname === '/historia') return 'historia';
  if (pathname === '/contacto') return 'contacto';
  return 'home';
}

function setRoute(route, { push = true, targetSection = null } = {}) {
  state.currentRoute = route;
  window.clearTimeout(state.paymentPollTimer);
  document.body.classList.toggle('premium-route', route === 'premium');
  document.body.classList.toggle('admin-route', route === 'admin');
  document.body.classList.toggle('history-route', route === 'historia');
  document.body.classList.toggle('contact-route', route === 'contacto');
  document.body.classList.toggle('payment-route', route === 'payment');
  closePanels();

  if (route === 'payment') {
    document.title = 'Estado del pago | Joyería Querubim';
    state.paymentPollAttempts = 0;
    if (push) window.history.pushState({ route: 'payment' }, '', `/pago/resultado${window.location.search}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderPaymentResult(null);
    consultPaymentOrder();
    requestScrollUpdate();
    return;
  }

  if (route === 'admin') {
    document.title = 'Panel administrativo Querubim';
    updateActiveNavigation('admin');
    updateAdminViews();
    checkAdminSession();
    if (push) window.history.pushState({ route: 'admin' }, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestScrollUpdate();
    return;
  }

  if (route === 'premium') {
    document.title = 'Catálogo Premium Querubim | Joyas en oro 18K';
    updateActiveNavigation('premium');
    renderCategories({ premium: true });
    renderProducts({ premium: true });
    if (push) window.history.pushState({ route: 'premium' }, '', '/premium');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestScrollUpdate();
    return;
  }

  if (route === 'historia') {
    document.title = 'Historia, Misión y Visión | Joyería Querubim';
    updateActiveNavigation('historia');
    if (push) window.history.pushState({ route: 'historia' }, '', '/historia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestScrollUpdate();
    return;
  }

  if (route === 'contacto') {
    document.title = 'Contacto y ubicación | Joyería Querubim';
    updateActiveNavigation('contacto');
    if (push) window.history.pushState({ route: 'contacto' }, '', '/contacto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestScrollUpdate();
    return;
  }

  document.title = 'Joyería Querubim | Elegancia que trasciende generaciones';
  if (push) window.history.pushState({ route: 'home' }, '', targetSection ? `/#${targetSection}` : '/');

  window.requestAnimationFrame(() => {
    const target = document.querySelector(`#${targetSection || 'home'}`);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    updateActiveNavigationFromScroll();
    requestScrollUpdate();
  });
}

function setupEvents() {
  document.querySelector('#menu-button').addEventListener('click', () => openPanel(selectors.mobileDrawer));
  document.querySelector('#menu-close').addEventListener('click', () => closePanels());
  document.querySelector('#cart-button').addEventListener('click', () => openPanel(selectors.selectionDrawer));
  document.querySelector('#cart-close').addEventListener('click', () => closePanels());
  document.querySelector('#detail-close').addEventListener('click', () => closePanels());
  selectors.overlay.addEventListener('click', () => closePanels());

  selectors.navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (standaloneRoutes.has(link.dataset.routeLink)) {
        event.preventDefault();
        event.stopPropagation();
        setRoute(link.dataset.routeLink);
        return;
      }

      if (href?.startsWith('#')) {
        event.preventDefault();
        event.stopPropagation();
        setRoute('home', { targetSection: href.slice(1) });
      }
    });
  });

  selectors.categoryFilters.addEventListener('click', (event) => {
    const filterButton = event.target.closest('[data-filter]');
    if (!filterButton) return;
    state.activeFilter = filterButton.dataset.filter;
    renderCategories();
    renderProducts();
  });

  selectors.premiumCategoryFilters?.addEventListener('click', (event) => {
    const filterButton = event.target.closest('[data-filter]');
    if (!filterButton) return;
    state.activePremiumFilter = filterButton.dataset.filter;
    renderCategories({ premium: true });
    renderProducts({ premium: true });
  });

  selectors.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderProducts();
  });

  selectors.premiumSearchInput?.addEventListener('input', (event) => {
    state.premiumQuery = event.target.value;
    renderProducts({ premium: true });
  });

  selectors.adminLoginForm?.addEventListener('submit', handleAdminLogin);
  selectors.adminLogout?.addEventListener('click', handleAdminLogout);
  selectors.adminExportCatalog?.addEventListener('click', exportCatalogCsv);
  selectors.adminSecurityAction?.addEventListener('click', handlePasswordRecovery);
  selectors.adminProductForm?.addEventListener('submit', saveAdminProduct);
  selectors.adminCancelEdit?.addEventListener('click', resetAdminForm);
  selectors.adminImages?.addEventListener('input', renderAdminImagePreview);
  selectors.adminImageFiles?.addEventListener('change', (event) => {
    handleAdminImageFiles(event.target.files);
    event.target.value = '';
  });
  selectors.adminImageDrop?.addEventListener('dragover', (event) => {
    event.preventDefault();
    selectors.adminImageDrop.classList.add('dragging');
  });
  selectors.adminImageDrop?.addEventListener('dragleave', () => {
    selectors.adminImageDrop.classList.remove('dragging');
  });
  selectors.adminImageDrop?.addEventListener('drop', (event) => {
    event.preventDefault();
    selectors.adminImageDrop.classList.remove('dragging');
    handleAdminImageFiles(event.dataTransfer.files);
  });
  selectors.adminSearchInput?.addEventListener('input', (event) => {
    state.adminQuery = event.target.value;
    renderAdminProducts();
    refreshIcons();
  });
  selectors.adminResetCatalog?.addEventListener('click', async () => {
    await loadAdminDashboard();
    recordAdminActivity('Actualización manual de catálogo, pedidos y estadísticas.');
  });

  document.querySelector('#catalog-search-button').addEventListener('click', () => {
    setRoute('home', { targetSection: 'coleccion' });
    window.requestAnimationFrame(() => selectors.searchInput.focus());
  });

  document.addEventListener('click', (event) => {
    const productButton = event.target.closest('[data-open-product]');
    const imageButton = event.target.closest('[data-image-index]');
    const removeButton = event.target.closest('[data-remove-cart]');
    const routeLink = event.target.closest('[data-route-link]');
    const adminEditButton = event.target.closest('[data-admin-edit]');
    const adminDeleteButton = event.target.closest('[data-admin-delete]');

    if (routeLink) {
      event.preventDefault();
      if (standaloneRoutes.has(routeLink.dataset.routeLink)) {
        setRoute(routeLink.dataset.routeLink);
      } else setRoute('home', { targetSection: routeLink.dataset.targetSection || 'home' });
      return;
    }

    const hashLink = event.target.closest('a[href^="#"]');
    if (hashLink) {
      event.preventDefault();
      setRoute('home', { targetSection: hashLink.getAttribute('href').slice(1) });
      return;
    }

    if (productButton) openProductDetail(productButton.dataset.openProduct);
    if (imageButton) {
      state.activeImageIndex = Number(imageButton.dataset.imageIndex);
      renderDetail();
    }
    if (removeButton) removeCartItem(removeButton.dataset.removeCart);
    if (adminEditButton) fillAdminForm(adminEditButton.dataset.adminEdit);
    if (adminDeleteButton) deleteAdminProduct(adminDeleteButton.dataset.adminDelete);
  });

  selectors.detailMeasure.addEventListener('change', () => {
    selectors.detailWhatsapp.href = buildWhatsAppLink(state.activeProduct, selectors.detailMeasure.value);
    selectors.detailMessage.textContent = '';
    selectors.detailMessage.classList.remove('error', 'success');
  });

  selectors.detailAddCart.addEventListener('click', addActiveProductToCart);
  selectors.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  selectors.paymentResultRefresh.addEventListener('click', () => consultPaymentOrder({ scheduleNext: true }));

  selectors.scrollTopButton.addEventListener('click', () => {
    if (standaloneRoutes.has(state.currentRoute)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
  });

  selectors.contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!selectors.contactForm.checkValidity()) {
      selectors.formMessage.textContent = 'Revisa los campos marcados con asterisco para poder enviarlo.';
      selectors.formMessage.classList.add('error');
      selectors.contactForm.reportValidity();
      return;
    }

    const formData = new FormData(selectors.contactForm);
    const message = [
      `Hola Querubim, soy ${formData.get('name')}.`,
      `Mi correo es ${formData.get('email')}.`,
      `Estoy interesado(a) en: ${formData.get('interest')}.`,
      `Consulta: ${formData.get('message')}`,
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    selectors.formMessage.textContent = 'Abrimos WhatsApp con tu solicitud lista para enviar.';
    selectors.formMessage.classList.remove('error');
    selectors.formMessage.classList.add('success');
    selectors.contactForm.reset();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanels();
  });

  ['click', 'keydown', 'input', 'scroll', 'pointermove'].forEach((eventName) => {
    document.addEventListener(eventName, registerAdminActivity, { passive: true });
  });

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('popstate', () => {
    const route = getInitialRoute();
    setRoute(route, { push: false, targetSection: route === 'home' ? window.location.hash.slice(1) || 'home' : null });
  });
}

renderCategories();
renderProducts();
renderCategories({ premium: true });
renderProducts({ premium: true });
renderCart();
loadPublicCatalog();
setupEvents();
setupSectionObservers();
refreshIcons();
renderBrandIcons();
document.querySelector('#current-year').textContent = new Date().getFullYear();
setRoute(getInitialRoute(), {
  push: false,
  targetSection: getInitialRoute() === 'home' ? window.location.hash.slice(1) || 'home' : null,
});
requestScrollUpdate();
