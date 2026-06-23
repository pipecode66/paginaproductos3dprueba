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
    id: 'pulso-mariposa-filigrana',
    name: 'Pulso Mariposa Filigrana',
    category: 'pulsos',
    material: 'Oro amarillo 18K',
    value: 'Cotización personalizada',
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
  activeProduct: products[0],
  activeImageIndex: 0,
  query: '',
  cartItems: [],
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

function getVisibleProducts() {
  const query = normalizeText(state.query.trim());

  return products.filter((product) => {
    const matchesFilter = state.activeFilter === 'todos' || product.category === state.activeFilter;
    const searchableText = normalizeText(
      `${product.name} ${getCategoryLabel(product.category)} ${product.material} ${product.description}`,
    );
    return matchesFilter && (!query || searchableText.includes(query));
  });
}

function renderCategories() {
  selectors.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button
          class="${category.slug === state.activeFilter ? 'active' : ''}"
          type="button"
          data-filter="${category.slug}"
          aria-pressed="${category.slug === state.activeFilter}"
        >
          ${category.label}
        </button>
      `,
    )
    .join('');
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  selectors.productGrid.innerHTML = visibleProducts.length
    ? visibleProducts
        .map(
          (product) => `
            <article class="product-card">
              <button class="product-card-view" type="button" data-open-product="${product.id}" aria-label="Ver detalle de ${product.name}">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
                <span class="product-card-category">${getCategoryLabel(product.category)}</span>
                <span class="product-card-name">${product.name}</span>
                <span class="product-card-material">${product.material}</span>
                <span class="product-card-value">${product.value}</span>
              </button>
            </article>
          `,
        )
        .join('')
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
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateActiveNavigationFromScroll() {
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
        updateActiveNavigation(entry.target.id);
      });
    },
    { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 },
  );

  selectors.pageSections.forEach((section) => observer.observe(section));
}

function updateScrollTopButton() {
  state.ticking = false;
  const heroHeight = document.querySelector('#home').offsetHeight;
  selectors.scrollTopButton.classList.toggle('visible', window.scrollY > heroHeight * 0.55);
  updateActiveNavigationFromScroll();
}

function requestScrollUpdate() {
  if (state.ticking) return;
  state.ticking = true;
  requestAnimationFrame(updateScrollTopButton);
}

function setupEvents() {
  document.querySelector('#menu-button').addEventListener('click', () => openPanel(selectors.mobileDrawer));
  document.querySelector('#menu-close').addEventListener('click', () => closePanels());
  document.querySelector('#cart-button').addEventListener('click', () => openPanel(selectors.selectionDrawer));
  document.querySelector('#cart-close').addEventListener('click', () => closePanels());
  document.querySelector('#detail-close').addEventListener('click', () => closePanels());
  selectors.overlay.addEventListener('click', () => closePanels());

  selectors.navLinks.forEach((link) => {
    link.addEventListener('click', () => closePanels());
  });

  selectors.categoryFilters.addEventListener('click', (event) => {
    const filterButton = event.target.closest('[data-filter]');
    if (!filterButton) return;
    state.activeFilter = filterButton.dataset.filter;
    renderCategories();
    renderProducts();
  });

  selectors.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderProducts();
  });

  document.querySelector('#catalog-search-button').addEventListener('click', () => {
    document.querySelector('#coleccion').scrollIntoView({ behavior: 'smooth' });
    window.requestAnimationFrame(() => selectors.searchInput.focus());
  });

  document.addEventListener('click', (event) => {
    const productButton = event.target.closest('[data-open-product]');
    const imageButton = event.target.closest('[data-image-index]');
    const removeButton = event.target.closest('[data-remove-cart]');

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
}

renderCategories();
renderProducts();
renderCart();
setupEvents();
setupSectionObservers();
refreshIcons();
requestScrollUpdate();
