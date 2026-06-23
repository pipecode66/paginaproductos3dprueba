import './styles.css';
import {
  ArrowRight,
  ChevronUp,
  Gem,
  Mail,
  MapPin,
  Menu,
  PenTool,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  X,
  createIcons,
} from 'lucide';

const products = [
  {
    id: 'anillo-serafin',
    name: 'Anillo Serafín',
    category: 'anillos',
    material: 'Oro amarillo 18K',
    price: 'Cotización personalizada',
    description: 'Silueta clásica para compromisos, aniversarios y celebraciones íntimas.',
  },
  {
    id: 'cadena-aurora',
    name: 'Cadena Aurora',
    category: 'cadenas',
    material: 'Oro amarillo 18K',
    price: 'Cotización personalizada',
    description: 'Cadena luminosa para uso diario, medallas familiares o dijes especiales.',
  },
  {
    id: 'pulsera-halo',
    name: 'Pulsera Halo',
    category: 'pulseras',
    material: 'Oro amarillo 18K',
    price: 'Cotización personalizada',
    description: 'Pulsera de presencia delicada, ideal para regalo o pieza de legado.',
  },
  {
    id: 'aretes-celeste',
    name: 'Aretes Celeste',
    category: 'aretes',
    material: 'Oro amarillo 18K',
    price: 'Cotización personalizada',
    description: 'Diseño sobrio y elegante para acompañar ocasiones especiales.',
  },
];

const icons = {
  ArrowRight,
  ChevronUp,
  Gem,
  Mail,
  MapPin,
  Menu,
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
  query: '',
  selectedProducts: [],
  ticking: false,
};

const selectors = {
  pageSections: document.querySelectorAll('[data-page]'),
  navLinks: document.querySelectorAll('.nav-link'),
  mobileDrawer: document.querySelector('#mobile-drawer'),
  overlay: document.querySelector('#overlay'),
  productGrid: document.querySelector('#product-grid'),
  searchInput: document.querySelector('#catalog-search'),
  filterButtons: document.querySelectorAll('[data-filter]'),
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

function getVisibleProducts() {
  const query = normalizeText(state.query.trim());

  return products.filter((product) => {
    const matchesFilter = state.activeFilter === 'todos' || product.category === state.activeFilter;
    const searchableText = normalizeText(`${product.name} ${product.category} ${product.material} ${product.description}`);
    return matchesFilter && (!query || searchableText.includes(query));
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  selectors.productGrid.innerHTML = visibleProducts.length
    ? visibleProducts
        .map(
          (product) => `
            <article class="product-card">
              <div class="product-placeholder" role="img" aria-label="Imagen de producto pendiente para ${product.name}">
                <i data-lucide="gem"></i>
                <span>Imagen de producto</span>
              </div>
              <div class="product-copy">
                <span>${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <dl>
                  <div><dt>Material</dt><dd>${product.material}</dd></div>
                  <div><dt>Valor</dt><dd>${product.price}</dd></div>
                </dl>
                <button class="text-action" type="button" data-select-product="${product.id}">
                  Guardar para asesoría
                  <i data-lucide="arrow-right"></i>
                </button>
              </div>
            </article>
          `,
        )
        .join('')
    : '<p class="empty-results">No encontramos joyas con ese criterio. Escríbenos y te asesoramos.</p>';

  refreshIcons();
}

function renderFilters() {
  selectors.filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.activeFilter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderSelection() {
  selectors.cartCount.textContent = String(state.selectedProducts.length);
  selectors.selectionEmpty.hidden = state.selectedProducts.length > 0;
  selectors.selectionItems.innerHTML = state.selectedProducts
    .map(
      (product) => `
        <article class="selection-item">
          <div class="mini-placeholder"><i data-lucide="gem"></i></div>
          <div>
            <strong>${product.name}</strong>
            <span>${product.material}</span>
          </div>
          <button class="icon-button" type="button" data-remove-product="${product.id}" aria-label="Quitar ${product.name}">
            <i data-lucide="x"></i>
          </button>
        </article>
      `,
    )
    .join('');
  refreshIcons();
}

function selectProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || state.selectedProducts.some((item) => item.id === productId)) return;
  state.selectedProducts.push(product);
  renderSelection();
}

function removeSelectedProduct(productId) {
  state.selectedProducts = state.selectedProducts.filter((item) => item.id !== productId);
  renderSelection();
}

function openPanel(panel) {
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  selectors.overlay.classList.add('visible');
  document.body.classList.add('panel-open');
}

function closePanels() {
  selectors.mobileDrawer.classList.remove('open');
  selectors.selectionDrawer.classList.remove('open');
  selectors.mobileDrawer.setAttribute('aria-hidden', 'true');
  selectors.selectionDrawer.setAttribute('aria-hidden', 'true');
  selectors.overlay.classList.remove('visible');
  document.body.classList.remove('panel-open');
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
  document.querySelector('#menu-close').addEventListener('click', closePanels);
  document.querySelector('#cart-button').addEventListener('click', () => openPanel(selectors.selectionDrawer));
  document.querySelector('#cart-close').addEventListener('click', closePanels);
  selectors.overlay.addEventListener('click', closePanels);

  selectors.navLinks.forEach((link) => {
    link.addEventListener('click', () => closePanels());
  });

  selectors.filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.filter;
      renderFilters();
      renderProducts();
    });
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
    const selectButton = event.target.closest('[data-select-product]');
    const removeButton = event.target.closest('[data-remove-product]');

    if (selectButton) selectProduct(selectButton.dataset.selectProduct);
    if (removeButton) removeSelectedProduct(removeButton.dataset.removeProduct);
  });

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

renderProducts();
renderFilters();
renderSelection();
setupEvents();
setupSectionObservers();
refreshIcons();
requestScrollUpdate();
