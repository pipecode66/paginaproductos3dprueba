import './styles.css';
import {
  ArrowRight,
  ChevronUp,
  Gem,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PenTool,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  X,
  createIcons,
} from 'lucide';

const WHATSAPP_NUMBER = '570000000000';

const categories = [
  { slug: 'todos', label: 'Todas' },
  { slug: 'cadenas', label: 'Cadenas' },
  { slug: 'dijes', label: 'Dijes' },
  { slug: 'herrajes', label: 'Herrajes' },
  { slug: 'candongas', label: 'Candongas' },
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

const products = [
  {
    id: 'topos-estrellas-ascendentes',
    name: 'Topos Estrellas Ascendentes',
    category: 'topos',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
    premium: false,
    description:
      'Topos en oro de 18 quilates con silueta de estrellas ascendentes. Una pieza delicada, luminosa y fácil de combinar.',
    measurements: ['Par estándar', 'Unidad izquierda', 'Unidad derecha', 'Ajuste especial'],
    details: [
      ['Categoría', 'Topos'],
      ['Material', 'Oro amarillo 18K'],
      ['Acabado', 'Alto brillo'],
      ['Uso sugerido', 'Diario y regalo'],
    ],
    images: [
      '/products/topos-estrellas-1.jpeg',
      '/products/topos-estrellas-2.jpeg',
      '/products/topos-estrellas-3.jpeg',
      '/products/topos-estrellas-4.jpeg',
    ],
  },
  {
    id: 'cadena-eslabon-clasico',
    name: 'Cadena Eslabón Clásico',
    category: 'cadenas',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
    premium: false,
    description:
      'Cadena en oro de 18 quilates con eslabón clásico, brillo cálido y presencia versátil para uso diario o regalo.',
    measurements: ['40 cm', '45 cm', '50 cm', '55 cm', '60 cm', 'Medida personalizada'],
    details: [
      ['Categoría', 'Cadenas'],
      ['Material', 'Oro amarillo 18K'],
      ['Tipo', 'Eslabón clásico'],
      ['Uso sugerido', 'Diario y regalo'],
    ],
    images: ['/products/cadena-eslabon-clasico-ai.png'],
  },
  {
    id: 'candongas-luna-brillante',
    name: 'Candongas Luna Brillante',
    category: 'candongas',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
    premium: false,
    description:
      'Candongas pulidas en oro de 18 quilates con silueta limpia y acabado brillante para combinar con cualquier ocasión.',
    measurements: ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'],
    details: [
      ['Categoría', 'Candongas'],
      ['Material', 'Oro amarillo 18K'],
      ['Acabado', 'Alto brillo'],
      ['Uso sugerido', 'Diario'],
    ],
    images: ['/products/candongas-luna-brillante-ai.png'],
  },
  {
    id: 'dije-solar-delicado',
    name: 'Dije Solar Delicado',
    category: 'dijes',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
    premium: false,
    description:
      'Dije en oro de 18 quilates con motivo solar, diseñado para aportar un detalle luminoso y sutil a cadenas finas.',
    measurements: ['Pequeño', 'Mediano', 'Con argolla estándar', 'Argolla reforzada'],
    details: [
      ['Categoría', 'Dijes'],
      ['Material', 'Oro amarillo 18K'],
      ['Motivo', 'Solar'],
      ['Uso sugerido', 'Cadena fina'],
    ],
    images: ['/products/dije-solar-delicado-ai.png'],
  },
  {
    id: 'pulso-mariposa-filigrana',
    name: 'Pulso Mariposa Filigrana',
    category: 'pulsos',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
    premium: true,
    description:
      'Pulso rígido en oro de 18 quilates con terminales ornamentales tipo mariposa. Un diseño elegante con presencia sutil.',
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    details: [
      ['Categoría', 'Pulsos'],
      ['Material', 'Oro amarillo 18K'],
      ['Tipo', 'Pulso rígido abierto'],
      ['Ajuste', 'Según medida de muñeca'],
    ],
    images: ['/products/pulso-mariposa-1.jpeg', '/products/pulso-mariposa-2.jpeg', '/products/pulso-mariposa-3.jpeg'],
  },
  {
    id: 'premium-argollas-diamante',
    name: 'Argollas Destello Nupcial',
    category: 'argollas-matrimonio',
    material: 'Oro amarillo 18K',
    value: 'Cotización premium',
    premium: true,
    description:
      'Argollas premium en oro de 18 quilates con detalles luminosos, pensadas para ceremonias y aniversarios memorables.',
    measurements: ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'],
    details: [
      ['Categoría', 'Argollas Matrimonio'],
      ['Material', 'Oro amarillo 18K'],
      ['Línea', 'Premium'],
      ['Uso sugerido', 'Matrimonio'],
    ],
    images: ['/products/premium-argollas-diamante-ai.png'],
  },
  {
    id: 'premium-rosario-cruz',
    name: 'Rosario Cruz Serena',
    category: 'rosarios',
    material: 'Oro amarillo 18K',
    value: 'Cotización premium',
    premium: true,
    description:
      'Rosario premium en oro de 18 quilates con cruz delicada, acabado elegante y presencia ceremonial refinada.',
    measurements: ['45 cm', '50 cm', '55 cm', '60 cm', 'Medida personalizada'],
    details: [
      ['Categoría', 'Rosarios'],
      ['Material', 'Oro amarillo 18K'],
      ['Línea', 'Premium'],
      ['Acabado', 'Brillo suave'],
    ],
    images: ['/products/premium-rosario-cruz-ai.png'],
  },
  {
    id: 'premium-pulso-filigrana',
    name: 'Pulso Filigrana Imperial',
    category: 'pulsos',
    material: 'Oro amarillo 18K',
    value: 'Cotización premium',
    premium: true,
    description:
      'Pulso premium en oro de 18 quilates con detalles de filigrana y brillo controlado para una presencia más sofisticada.',
    measurements: ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'],
    details: [
      ['Categoría', 'Pulsos'],
      ['Material', 'Oro amarillo 18K'],
      ['Línea', 'Premium'],
      ['Acabado', 'Filigrana'],
    ],
    images: ['/products/premium-pulso-filigrana-ai.png'],
  },
];

const icons = {
  ArrowRight,
  ChevronUp,
  Gem,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PenTool,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  X,
};

const state = {
  activeFilter: 'todos',
  activePremiumFilter: 'todos',
  activeProduct: products[0],
  activeImageIndex: 0,
  query: '',
  premiumQuery: '',
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

function normalizeText(value) {
  return value
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
  return `
    <article class="product-card${product.premium ? ' premium-product' : ''}${premiumCatalog ? ' premium-catalog-card' : ''}" style="--card-index: ${index}">
      <button class="product-card-view" type="button" data-open-product="${product.id}" aria-label="Ver detalle de ${product.name}">
        <span class="product-image-wrap">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
        </span>
        <span class="product-card-content">
          ${product.premium ? '<span class="premium-badge">Premium</span>' : ''}
          <span class="product-card-category">${getCategoryLabel(product.category)}</span>
          <span class="product-card-name">${product.name}</span>
          <span class="product-card-material">${product.material}</span>
          <span class="product-card-value">${product.value}</span>
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
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join('');
  selectors.detailMeasure.innerHTML = [
    '<option value="">Selecciona una medida</option>',
    ...product.measurements.map((measure) => `<option value="${measure}">${measure}</option>`),
  ].join('');
  selectors.detailMeasure.value = selectedMeasure && product.measurements.includes(selectedMeasure) ? selectedMeasure : '';
  selectors.detailThumbs.innerHTML = product.images
    .map(
      (src, index) => `
        <button class="${index === state.activeImageIndex ? 'active' : ''}" type="button" data-image-index="${index}" aria-label="Ver imagen ${index + 1} de ${product.name}">
          <img src="${src}" alt="" loading="lazy" />
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
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
          <div>
            <strong>${product.name}</strong>
            <span>${getCategoryLabel(product.category)} · ${product.material}</span>
            <small>Medida: ${measure}</small>
          </div>
          <button class="icon-button" type="button" data-remove-cart="${key}" aria-label="Quitar ${product.name}">
            <i data-lucide="x"></i>
          </button>
        </article>
      `,
    )
    .join('');
  refreshIcons();
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
        if (state.currentRoute === 'premium') return;
        updateActiveNavigation(entry.target.id);
      });
    },
    { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 },
  );

  selectors.pageSections.forEach((section) => observer.observe(section));
}

function updateScrollTopButton() {
  state.ticking = false;
  if (state.currentRoute === 'premium') {
    selectors.scrollTopButton.classList.toggle('visible', window.scrollY > 320);
    updateActiveNavigation('premium');
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
  return window.location.pathname.replace(/\/$/, '') === '/premium' ? 'premium' : 'home';
}

function setRoute(route, { push = true, targetSection = null } = {}) {
  state.currentRoute = route;
  document.body.classList.toggle('premium-route', route === 'premium');
  closePanels();

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
      if (link.dataset.routeLink === 'premium') {
        event.preventDefault();
        event.stopPropagation();
        setRoute('premium');
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

  document.querySelector('#catalog-search-button').addEventListener('click', () => {
    setRoute('home', { targetSection: 'coleccion' });
    window.requestAnimationFrame(() => selectors.searchInput.focus());
  });

  document.addEventListener('click', (event) => {
    const productButton = event.target.closest('[data-open-product]');
    const imageButton = event.target.closest('[data-image-index]');
    const removeButton = event.target.closest('[data-remove-cart]');
    const routeLink = event.target.closest('[data-route-link]');

    if (routeLink) {
      event.preventDefault();
      if (routeLink.dataset.routeLink === 'premium') setRoute('premium');
      else setRoute('home', { targetSection: routeLink.dataset.targetSection || 'home' });
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
  });

  selectors.detailMeasure.addEventListener('change', () => {
    selectors.detailWhatsapp.href = buildWhatsAppLink(state.activeProduct, selectors.detailMeasure.value);
    selectors.detailMessage.textContent = '';
    selectors.detailMessage.classList.remove('error', 'success');
  });

  selectors.detailAddCart.addEventListener('click', addActiveProductToCart);

  selectors.scrollTopButton.addEventListener('click', () => {
    if (state.currentRoute === 'premium') {
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
