import './styles.css';
import {
  ArrowRight,
  BarChart3,
  ChevronUp,
  Edit3,
  Gem,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PenTool,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
  createIcons,
} from 'lucide';

const WHATSAPP_NUMBER = '570000000000';
const PRODUCT_STORAGE_KEY = 'querubim-products-v6';
const ADMIN_SESSION_KEY = 'querubim-admin-session';
const ADMIN_CREDENTIALS = {
  email: 'admin@querubim.co',
  password: 'Querubim2026',
};

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
    id: 'dije-moneda-sol-querubim',
    name: 'Dije Moneda Sol Querubim',
    category: 'dijes-para-manillas',
    imageNumbers: [17, 18, 19, 20],
    price: 300000,
    measurements: ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'],
    description:
      'Dije redondo en oro 18K con relieve central y borde texturizado, pensado para combinaciones discretas.',
    finish: 'Relieve circular',
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

let products = loadStoredProducts();

const icons = {
  ArrowRight,
  BarChart3,
  ChevronUp,
  Edit3,
  Gem,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PenTool,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
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
  cartItems: [],
  currentRoute: 'home',
  ticking: false,
};

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
  adminProductList: document.querySelector('#admin-product-list'),
  adminSearchInput: document.querySelector('#admin-product-search'),
  adminProductForm: document.querySelector('#admin-product-form'),
  adminFormTitle: document.querySelector('#admin-form-title'),
  adminEditId: document.querySelector('#admin-edit-id'),
  adminName: document.querySelector('#admin-name'),
  adminCategory: document.querySelector('#admin-category'),
  adminPrice: document.querySelector('#admin-price'),
  adminMaterial: document.querySelector('#admin-material'),
  adminImage: document.querySelector('#admin-image'),
  adminMeasurements: document.querySelector('#admin-measurements'),
  adminDescription: document.querySelector('#admin-description'),
  adminPremium: document.querySelector('#admin-premium'),
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
  cartCount: document.querySelector('#cart-count'),
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
      details: [
        ['Categoría', label],
        ['Material', 'Oro amarillo 18K'],
        ['Precio', value],
        ['Acabado', group.finish],
      ],
      images: buildCatalogImageList(group.category, group.imageNumbers),
    };
  });
}

function loadStoredProducts() {
  try {
    const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!storedProducts) return cloneProductList();

    const parsedProducts = JSON.parse(storedProducts);
    if (Array.isArray(parsedProducts)) return parsedProducts;
  } catch {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
  }

  return cloneProductList();
}

function saveProducts() {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function resetProductsToDefault() {
  products = cloneProductList();
  saveProducts();
  state.activeProduct = products[0];
  state.editingProductId = null;
  refreshCatalogViews();
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
  return [
    ['Categoría', getCategoryLabel(product.category)],
    ['Material', product.material],
    ['Precio', product.value],
    ['Línea', product.premium ? 'Premium' : 'Catálogo'],
  ];
}

function normalizeMeasurements(value) {
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
  const image = product.images[0] || '/logo/querubim-symbol.png';

  return `
    <article class="product-card${product.premium ? ' premium-product' : ''}${premiumCatalog ? ' premium-catalog-card' : ''}" style="--card-index: ${index}">
      <button class="product-card-view" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Ver detalle de ${escapeHtml(product.name)}">
        <span class="product-image-wrap">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
        </span>
        <span class="product-card-content">
          ${product.premium ? '<span class="premium-badge">Premium</span>' : ''}
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
  const image = product.images[state.activeImageIndex] ?? product.images[0];

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
  selectors.detailThumbs.innerHTML = product.images
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
  selectors.selectionItems.innerHTML = state.cartItems
    .map(
      ({ key, product, measure }) => `
        <article class="selection-item">
          <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy" />
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

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
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
      const searchableText = normalizeText(
        `${product.name} ${getCategoryLabel(product.category)} ${product.material} ${product.value}`,
      );
      return !query || searchableText.includes(query);
    })
    .sort((first, second) => {
      if (Boolean(first.premium) !== Boolean(second.premium)) return Number(second.premium) - Number(first.premium);
      return first.name.localeCompare(second.name, 'es');
    });
}

function renderAdminStats() {
  if (!selectors.adminStats) return;

  const normalProducts = products.filter((product) => !product.premium).length;
  const premiumProducts = products.filter((product) => product.premium).length;
  const categoriesUsed = new Set(products.map((product) => product.category)).size;
  const estimatedValue = products.reduce((total, product) => total + getProductPrice(product), 0);

  const stats = [
    { icon: 'package', label: 'Productos', value: products.length },
    { icon: 'bar-chart-3', label: 'Catálogo normal', value: normalProducts },
    { icon: 'gem', label: 'Premium', value: premiumProducts },
    { icon: 'shield-check', label: 'Categorías activas', value: categoriesUsed },
    { icon: 'shopping-bag', label: 'Valor provisional', value: formatCurrency(estimatedValue) },
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

function renderAdminProducts() {
  if (!selectors.adminProductList) return;
  const visibleProducts = getAdminVisibleProducts();

  selectors.adminProductList.innerHTML = visibleProducts.length
    ? visibleProducts
        .map((product) => {
          const image = product.images[0] || '/logo/querubim-symbol.png';
          return `
            <article class="admin-product-item${product.premium ? ' premium-admin-item' : ''}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(getCategoryLabel(product.category))} / ${escapeHtml(product.material)}</span>
                <small>${escapeHtml(product.value)}${product.premium ? ' / Premium' : ''}</small>
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
  renderAdminProducts();
  refreshIcons();
}

function updateAdminViews() {
  if (!selectors.adminLoginView || !selectors.adminPanelView) return;

  const loggedIn = isAdminLoggedIn();
  selectors.adminLoginView.hidden = loggedIn;
  selectors.adminPanelView.hidden = !loggedIn;

  if (loggedIn) {
    populateAdminCategoryOptions();
    renderAdminPanel();
  }

  refreshIcons();
}

function resetAdminForm() {
  if (!selectors.adminProductForm) return;

  state.editingProductId = null;
  selectors.adminProductForm.reset();
  selectors.adminEditId.value = '';
  selectors.adminFormTitle.textContent = 'Crear producto';
  selectors.adminMaterial.value = 'Oro amarillo 18K';
  selectors.adminMeasurements.value = 'Medida personalizada';
  selectors.adminDescription.value = '';
  selectors.adminFormMessage.textContent = '';
  selectors.adminFormMessage.classList.remove('error', 'success');
  populateAdminCategoryOptions();
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
  selectors.adminImage.value = product.images[0] || '';
  selectors.adminMeasurements.value = product.measurements.join(', ');
  selectors.adminDescription.value = product.description;
  selectors.adminPremium.checked = Boolean(product.premium);
  selectors.adminFormMessage.textContent = '';
  selectors.adminFormMessage.classList.remove('error', 'success');
  selectors.adminName.focus();
}

function buildProductFromAdminForm() {
  const name = selectors.adminName.value.trim();
  const category = selectors.adminCategory.value;
  const price = Number(selectors.adminPrice.value);
  const material = selectors.adminMaterial.value.trim();
  const image = selectors.adminImage.value.trim();
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  const description = selectors.adminDescription.value.trim();
  const premium = selectors.adminPremium.checked;
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
    description,
    measurements,
    details: buildProductDetails({ category, material, value, premium }),
    images: [image],
  };
}

function saveAdminProduct(event) {
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

  const existingIndex = products.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) products[existingIndex] = product;
  else products.unshift(product);

  state.activeProduct = product;
  saveProducts();
  resetAdminForm();
  refreshCatalogViews();
  selectors.adminFormMessage.textContent = 'Producto guardado correctamente.';
  selectors.adminFormMessage.classList.add('success');
}

function deleteAdminProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  if (!window.confirm(`¿Eliminar ${product.name} del catálogo?`)) return;

  products = products.filter((item) => item.id !== productId);
  state.cartItems = state.cartItems.filter((item) => item.product.id !== productId);
  if (state.activeProduct?.id === productId) state.activeProduct = products[0];

  saveProducts();
  refreshCatalogViews();
}

function handleAdminLogin(event) {
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

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    selectors.adminLoginForm.reset();
    selectors.adminLoginMessage.textContent = '';
    selectors.adminLoginMessage.classList.remove('error');
    resetAdminForm();
    updateAdminViews();
    return;
  }

  selectors.adminLoginMessage.textContent = 'Credenciales incorrectas.';
  selectors.adminLoginMessage.classList.add('error');
}

function handleAdminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  state.editingProductId = null;
  updateAdminViews();
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
        : link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateActiveNavigationFromScroll() {
  if (state.currentRoute === 'premium') {
    updateActiveNavigation('premium');
    return;
  }

  if (state.currentRoute === 'admin') {
    updateActiveNavigation('admin');
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
  if (state.currentRoute === 'premium' || state.currentRoute === 'admin') {
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
  if (pathname === '/premium') return 'premium';
  if (pathname === '/admin') return 'admin';
  return 'home';
}

function setRoute(route, { push = true, targetSection = null } = {}) {
  state.currentRoute = route;
  document.body.classList.toggle('premium-route', route === 'premium');
  document.body.classList.toggle('admin-route', route === 'admin');
  closePanels();

  if (route === 'admin') {
    document.title = 'Panel administrativo Querubim';
    updateActiveNavigation('admin');
    updateAdminViews();
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
      if (link.dataset.routeLink === 'premium' || link.dataset.routeLink === 'admin') {
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
  selectors.adminProductForm?.addEventListener('submit', saveAdminProduct);
  selectors.adminCancelEdit?.addEventListener('click', resetAdminForm);
  selectors.adminSearchInput?.addEventListener('input', (event) => {
    state.adminQuery = event.target.value;
    renderAdminProducts();
    refreshIcons();
  });
  selectors.adminResetCatalog?.addEventListener('click', () => {
    if (!window.confirm('¿Restaurar el catálogo inicial de Querubim?')) return;
    resetAdminForm();
    resetProductsToDefault();
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
      if (routeLink.dataset.routeLink === 'premium' || routeLink.dataset.routeLink === 'admin') {
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

  selectors.scrollTopButton.addEventListener('click', () => {
    if (state.currentRoute === 'premium' || state.currentRoute === 'admin') {
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

    selectors.formMessage.textContent = 'Gracias. El equipo de Querubim revisará tu solicitud y te contactará pronto.';
    selectors.formMessage.classList.remove('error');
    selectors.formMessage.classList.add('success');
    selectors.contactForm.reset();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanels();
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
setupEvents();
setupSectionObservers();
refreshIcons();
setRoute(getInitialRoute(), {
  push: false,
  targetSection: getInitialRoute() === 'home' ? window.location.hash.slice(1) || 'home' : null,
});
requestScrollUpdate();
