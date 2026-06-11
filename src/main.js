import './styles.css';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoveHorizontal,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
  createIcons,
} from 'lucide';

const FRAME_COUNT = 36;

const products = [
  {
    id: 'solara',
    name: 'Serafin Esmeralda',
    shortName: 'Serafin',
    category: 'Anillo de autor',
    price: 9800000,
    priceLabel: '$9.800.000 COP',
    description: 'Esmeralda de corte rectangular sostenida por cuatro garras sobre un aro de oro amarillo.',
    cover: '/product-images/solara-ring.png',
    framePath: '/360/solara',
    optionLabel: 'Talla',
    options: ['5', '6', '7', '8', '9'],
    specs: [
      ['Metal', 'Oro amarillo 18K'],
      ['Gema', 'Esmeralda'],
      ['Corte', 'Rectangular'],
      ['Acabado', 'Alto brillo'],
    ],
  },
  {
    id: 'astra',
    name: 'Halo Amatista',
    shortName: 'Halo',
    category: 'Brazalete abierto',
    price: 7200000,
    priceLabel: '$7.200.000 COP',
    description: 'Brazalete rigido de oro amarillo con una secuencia graduada de amatistas sobre el frente.',
    cover: '/product-images/astra-cuff-bracelet.png',
    framePath: '/360/astra',
    optionLabel: 'Medida',
    options: ['S - 15 cm', 'M - 17 cm', 'L - 19 cm'],
    specs: [
      ['Metal', 'Oro amarillo 18K'],
      ['Gemas', 'Amatistas'],
      ['Silueta', 'Cuff abierto'],
      ['Acabado', 'Alto brillo'],
    ],
  },
];

const icons = {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoveHorizontal,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
};

const state = {
  product: products[0],
  frame: 0,
  playing: true,
  dragging: false,
  dragStartX: 0,
  dragStartFrame: 0,
  cart: [],
  favorites: new Set(),
  cueDismissed: false,
  lastAdvance: 0,
};

const spinImage = document.querySelector('#spin-image');
const spinStage = document.querySelector('#spin-stage');
const frameRange = document.querySelector('#frame-range');
const angleValue = document.querySelector('#angle-value');
const toggleSpin = document.querySelector('#toggle-spin');
const dragCue = document.querySelector('#drag-cue');
const overlay = document.querySelector('#overlay');
const cartDrawer = document.querySelector('#cart-drawer');
const searchPanel = document.querySelector('#search-panel');

function formatCOP(value) {
  return `$${new Intl.NumberFormat('es-CO').format(value)} COP`;
}

function frameUrl(product, frame) {
  return `${product.framePath}/frame-${String(frame + 1).padStart(2, '0')}.jpg`;
}

function preloadFrames(product) {
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const image = new Image();
    image.src = frameUrl(product, index);
  }
}

function renderCollection() {
  const grid = document.querySelector('#collection-grid');
  grid.innerHTML = products
    .map(
      (product, index) => `
        <article class="collection-card">
          <button type="button" data-open-product="${product.id}" aria-label="Ver ${product.name} en 360">
            <span class="collection-index">0${index + 1}</span>
            <img src="${product.cover}" alt="${product.name}" />
            <span class="view-chip"><i data-lucide="move-horizontal"></i> Ver en 360</span>
          </button>
          <div class="collection-card-copy">
            <div>
              <span>${product.category}</span>
              <h3>${product.name}</h3>
            </div>
            <strong>${product.priceLabel}</strong>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderProductSelector() {
  const selector = document.querySelector('#product-selector-list');
  selector.innerHTML = products
    .map(
      (product) => `
        <button
          type="button"
          class="${product.id === state.product.id ? 'active' : ''}"
          data-product="${product.id}"
          aria-pressed="${product.id === state.product.id}"
        >
          <img src="${product.cover}" alt="" />
          <span><strong>${product.shortName}</strong><small>${product.category}</small></span>
          <i data-lucide="arrow-right"></i>
        </button>
      `,
    )
    .join('');
}

function renderSpecs() {
  document.querySelector('#product-specs').innerHTML = state.product.specs
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join('');
}

function renderOptions() {
  document.querySelector('#option-label').textContent = state.product.optionLabel;
  document.querySelector('#product-option').innerHTML = state.product.options
    .map((option) => `<option value="${option}">${option}</option>`)
    .join('');
}

function renderFrame() {
  spinImage.src = frameUrl(state.product, state.frame);
  spinImage.alt = `Vista ${state.frame * 10} grados de ${state.product.name}`;
  frameRange.value = String(state.frame);
  angleValue.textContent = `${String(state.frame * 10).padStart(3, '0')}\u00b0`;
}

function renderProduct() {
  document.querySelector('#active-category').textContent = state.product.category;
  document.querySelector('#active-name').textContent = state.product.name;
  document.querySelector('#active-description').textContent = state.product.description;
  document.querySelector('#active-price').textContent = state.product.priceLabel;
  renderProductSelector();
  renderSpecs();
  renderOptions();
  renderFrame();
  renderFavorite();
  createIcons({ icons });
}

function renderFavorite() {
  const button = document.querySelector('#favorite-button');
  const active = state.favorites.has(state.product.id);
  button.classList.toggle('active', active);
  button.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Agregar a favoritos');
}

function setProduct(productId, scrollToViewer = false) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  state.product = product;
  state.frame = 0;
  state.playing = true;
  state.lastAdvance = performance.now();
  updatePlaybackButton();
  renderProduct();
  closePanels();

  if (scrollToViewer) {
    document.querySelector('#vision-360').scrollIntoView({ behavior: 'smooth' });
  }
}

function setFrame(frame) {
  state.frame = (frame + FRAME_COUNT) % FRAME_COUNT;
  renderFrame();
}

function setPlaying(playing) {
  state.playing = playing;
  state.lastAdvance = performance.now();
  updatePlaybackButton();
}

function updatePlaybackButton() {
  toggleSpin.innerHTML = `<i data-lucide="${state.playing ? 'pause' : 'play'}"></i>`;
  toggleSpin.setAttribute('aria-label', state.playing ? 'Pausar rotacion' : 'Reproducir rotacion');
  createIcons({ icons });
}

function dismissCue() {
  if (state.cueDismissed) return;
  state.cueDismissed = true;
  dragCue.classList.add('hidden');
}

function startDrag(clientX) {
  state.dragging = true;
  state.dragStartX = clientX;
  state.dragStartFrame = state.frame;
  spinStage.classList.add('dragging');
  setPlaying(false);
  dismissCue();
}

function moveDrag(clientX) {
  if (!state.dragging) return;
  const distance = clientX - state.dragStartX;
  setFrame(state.dragStartFrame - Math.round(distance / 12));
}

function stopDrag() {
  state.dragging = false;
  spinStage.classList.remove('dragging');
}

function renderCart() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector('#cart-count').textContent = String(count);
  document.querySelector('#cart-empty').hidden = state.cart.length > 0;
  document.querySelector('#cart-summary').hidden = state.cart.length === 0;

  document.querySelector('#cart-items').innerHTML = state.cart
    .map(
      (item, index) => `
        <article class="cart-item">
          <img src="${item.product.cover}" alt="${item.product.name}" />
          <div>
            <span>${item.product.category}</span>
            <strong>${item.product.name}</strong>
            <small>${item.product.optionLabel}: ${item.option}</small>
            <b>${item.product.priceLabel}</b>
          </div>
          <button type="button" data-remove-cart="${index}" aria-label="Eliminar ${item.product.name}">
            <i data-lucide="trash-2"></i>
          </button>
        </article>
      `,
    )
    .join('');

  const subtotal = state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  document.querySelector('#cart-subtotal').textContent = formatCOP(subtotal);
  createIcons({ icons });
}

function renderSearch(query = '') {
  const normalized = query.trim().toLowerCase();
  const matches = products.filter((product) =>
    `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalized),
  );

  document.querySelector('#search-results').innerHTML = matches.length
    ? matches
        .map(
          (product) => `
            <button type="button" data-open-product="${product.id}">
              <img src="${product.cover}" alt="" />
              <span><strong>${product.name}</strong><small>${product.category}</small></span>
              <b>${product.priceLabel}</b>
            </button>
          `,
        )
        .join('')
    : '<p>No encontramos piezas con esa busqueda.</p>';
}

function openPanel(panel) {
  closePanels();
  overlay.classList.add('visible');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');
}

function closePanels() {
  overlay.classList.remove('visible');
  cartDrawer.classList.remove('open');
  searchPanel.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  searchPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('panel-open');
}

function toggleMobileMenu(open) {
  const nav = document.querySelector('#mobile-nav');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('panel-open', open);
}

function setupInteractions() {
  document.addEventListener('click', (event) => {
    const productButton = event.target.closest('[data-product], [data-open-product]');
    if (productButton) {
      event.preventDefault();
      const id = productButton.dataset.product ?? productButton.dataset.openProduct;
      setProduct(id, Boolean(productButton.dataset.openProduct));
    }

    const removeButton = event.target.closest('[data-remove-cart]');
    if (removeButton) {
      state.cart.splice(Number(removeButton.dataset.removeCart), 1);
      renderCart();
    }

    if (event.target.closest('[data-whatsapp]')) {
      window.open('https://wa.me/573000000000?text=Hola%20Querubim,%20quiero%20recibir%20asesoria.', '_blank', 'noopener');
    }
  });

  spinStage.addEventListener('pointerdown', (event) => {
    spinStage.setPointerCapture(event.pointerId);
    startDrag(event.clientX);
  });
  spinStage.addEventListener('pointermove', (event) => moveDrag(event.clientX));
  spinStage.addEventListener('pointerup', stopDrag);
  spinStage.addEventListener('pointercancel', stopDrag);
  spinStage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setPlaying(false);
      setFrame(state.frame + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  frameRange.addEventListener('input', (event) => {
    setPlaying(false);
    dismissCue();
    setFrame(Number(event.target.value));
  });

  document.querySelector('#reset-view').addEventListener('click', () => {
    setPlaying(false);
    setFrame(0);
  });
  toggleSpin.addEventListener('click', () => setPlaying(!state.playing));

  document.querySelector('#favorite-button').addEventListener('click', () => {
    if (state.favorites.has(state.product.id)) state.favorites.delete(state.product.id);
    else state.favorites.add(state.product.id);
    renderFavorite();
  });

  document.querySelector('#add-to-cart').addEventListener('click', (event) => {
    const option = document.querySelector('#product-option').value;
    state.cart.push({ product: state.product, option, quantity: 1 });
    renderCart();

    const button = event.currentTarget;
    button.classList.add('confirmed');
    button.innerHTML = '<i data-lucide="badge-check"></i> Agregada a la bolsa';
    createIcons({ icons });
    window.setTimeout(() => {
      button.classList.remove('confirmed');
      button.innerHTML = '<i data-lucide="shopping-bag"></i> Agregar a la bolsa';
      createIcons({ icons });
    }, 1500);
  });

  document.querySelector('#cart-button').addEventListener('click', () => openPanel(cartDrawer));
  document.querySelector('#cart-close').addEventListener('click', closePanels);
  document.querySelector('#search-button').addEventListener('click', () => {
    renderSearch();
    openPanel(searchPanel);
    window.setTimeout(() => document.querySelector('#search-input').focus(), 100);
  });
  document.querySelector('#search-close').addEventListener('click', closePanels);
  document.querySelector('#search-input').addEventListener('input', (event) => renderSearch(event.target.value));
  overlay.addEventListener('click', closePanels);

  document.querySelector('#menu-button').addEventListener('click', () => toggleMobileMenu(true));
  document.querySelector('#menu-close').addEventListener('click', () => toggleMobileMenu(false));
  document.querySelectorAll('#mobile-nav a').forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.querySelector('#newsletter-message');
    message.textContent = 'Bienvenido al Circulo Querubim.';
    message.classList.add('success');
    event.currentTarget.reset();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanels();
      toggleMobileMenu(false);
    }
  });
}

function animate(timestamp) {
  if (state.playing && timestamp - state.lastAdvance > 120) {
    setFrame(state.frame + 1);
    state.lastAdvance = timestamp;
  }
  requestAnimationFrame(animate);
}

renderCollection();
products.forEach(preloadFrames);
renderProduct();
renderCart();
renderSearch();
setupInteractions();
createIcons({ icons });
requestAnimationFrame(animate);
