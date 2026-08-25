import './styles.css';
import { inject } from '@vercel/analytics';
import {
  ArrowRight,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  ClockAlert,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Edit3,
  Gem,
  GalleryHorizontalEnd,
  GripVertical,
  Image,
  ImagePlus,
  KeyRound,
  Layers,
  LayoutDashboard,
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
  Plane,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  Truck,
  Upload,
  UploadCloud,
  UserRound,
  X,
  createIcons,
} from 'lucide';
import { siFacebook, siInstagram, siTiktok } from 'simple-icons/icons';

if (import.meta.env.PROD) inject();

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
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clock3,
  ClockAlert,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Edit3,
  Gem,
  GalleryHorizontalEnd,
  GripVertical,
  Image,
  ImagePlus,
  KeyRound,
  Layers,
  LayoutDashboard,
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
  Plane,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  Truck,
  Upload,
  UploadCloud,
  UserRound,
  X,
};

const brandIcons = {
  facebook: siFacebook,
  instagram: siInstagram,
  tiktok: siTiktok,
};

const DEFAULT_ADMIN_STORAGE = {
  configured: false,
  publicUrl: '',
  maxImageSize: 8 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};
const MAX_PRODUCT_IMAGES = 4;

const state = {
  activeFilter: 'todos',
  activePremiumFilter: 'todos',
  activeProduct: products[0],
  activeImageIndex: 0,
  query: '',
  premiumQuery: '',
  adminQuery: '',
  adminCategoryFilter: 'todos',
  activeAdminView: 'overview',
  editingProductId: null,
  adminTimeoutId: null,
  adminAuthenticated: false,
  adminSessionChecked: false,
  adminUser: null,
  adminOrders: [],
  adminInternationalRequests: [],
  siteContent: null,
  originalSiteContent: null,
  adminSummary: null,
  adminLoading: false,
  adminHeartbeatAt: 0,
  adminOrderQuery: '',
  adminOrderFilter: 'todos',
  adminOrderPage: 1,
  activeAdminOrderId: null,
  activeInternationalRequestId: null,
  adminStorage: { ...DEFAULT_ADMIN_STORAGE },
  adminImageUploading: false,
  adminUploadProgress: 0,
  adminDraggedImageIndex: null,
  originalAdminImages: [],
  pendingR2Uploads: new Set(),
  pendingContentUploads: new Set(),
  cartItems: [],
  checkoutBusy: false,
  paymentPollAttempts: 0,
  paymentPollTimer: null,
  internationalCheckout: null,
  currentRoute: 'home',
  ticking: false,
};

const standaloneRoutes = new Set(['premium', 'admin', 'historia', 'contacto', 'payment', 'international-payment']);

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
  commercialHeroImage: document.querySelector('#commercial-hero-image'),
  commercialHeroEyebrow: document.querySelector('#commercial-hero-eyebrow'),
  commercialHeroTitle: document.querySelector('#commercial-hero-title'),
  commercialHeroDescription: document.querySelector('#commercial-hero-description'),
  commercialCampaign: document.querySelector('#commercial-campaign'),
  commercialCampaignImage: document.querySelector('#commercial-campaign-image'),
  commercialCampaignEyebrow: document.querySelector('#commercial-campaign-eyebrow'),
  commercialCampaignTitle: document.querySelector('#commercial-campaign-title'),
  commercialCampaignDescription: document.querySelector('#commercial-campaign-description'),
  commercialCampaignCta: document.querySelector('#commercial-campaign-cta'),
  commercialCampaignCtaLabel: document.querySelector('#commercial-campaign-cta-label'),
  commercialPremiumShowcase: document.querySelector('#commercial-premium-showcase'),
  commercialPremiumEyebrow: document.querySelector('#commercial-premium-eyebrow'),
  commercialPremiumTitle: document.querySelector('#commercial-premium-title'),
  commercialPremiumDescription: document.querySelector('#commercial-premium-description'),
  commercialPremiumHero: document.querySelector('#commercial-premium-hero'),
  commercialPremiumHeroEyebrow: document.querySelector('#commercial-premium-hero-eyebrow'),
  commercialPremiumHeroTitle: document.querySelector('#commercial-premium-hero-title'),
  commercialPremiumHeroDescription: document.querySelector('#commercial-premium-hero-description'),
  adminLoginView: document.querySelector('#admin-login-view'),
  adminPanelView: document.querySelector('#admin-panel-view'),
  adminLoginForm: document.querySelector('#admin-login-form'),
  adminLoginMessage: document.querySelector('#admin-login-message'),
  adminLogout: document.querySelector('#admin-logout'),
  adminStats: document.querySelector('#admin-stats'),
  adminOperations: document.querySelector('#admin-operations'),
  adminOrderList: document.querySelector('#admin-order-list'),
  adminOrderSearch: document.querySelector('#admin-order-search'),
  adminOrderFilter: document.querySelector('#admin-order-filter'),
  adminOrderDialog: document.querySelector('#admin-order-dialog'),
  adminOrderDialogTitle: document.querySelector('#admin-order-dialog-title'),
  adminOrderDetailContent: document.querySelector('#admin-order-detail-content'),
  adminOrderForm: document.querySelector('#admin-order-form'),
  adminOrderStatus: document.querySelector('#admin-order-status'),
  adminOrderCarrier: document.querySelector('#admin-order-carrier'),
  adminOrderTracking: document.querySelector('#admin-order-tracking'),
  adminOrderNotes: document.querySelector('#admin-order-notes'),
  adminOrderMessage: document.querySelector('#admin-order-message'),
  adminOrderClose: document.querySelector('#admin-order-close'),
  adminOrderCancel: document.querySelector('#admin-order-cancel'),
  adminOrderDelete: document.querySelector('#admin-order-delete'),
  adminCommercialForm: document.querySelector('#admin-commercial-form'),
  adminCommercialMessage: document.querySelector('#admin-commercial-message'),
  adminInternationalList: document.querySelector('#admin-international-list'),
  adminInternationalDialog: document.querySelector('#admin-international-dialog'),
  adminInternationalDialogTitle: document.querySelector('#admin-international-dialog-title'),
  adminInternationalDetail: document.querySelector('#admin-international-detail'),
  adminInternationalForm: document.querySelector('#admin-international-form'),
  adminInternationalCarrier: document.querySelector('#admin-international-carrier'),
  adminInternationalShippingCost: document.querySelector('#admin-international-shipping-cost'),
  adminInternationalDeliveryTime: document.querySelector('#admin-international-delivery-time'),
  adminInternationalTerms: document.querySelector('#admin-international-terms'),
  adminInternationalNotes: document.querySelector('#admin-international-notes'),
  adminInternationalAgreed: document.querySelector('#admin-international-agreed'),
  adminInternationalMessage: document.querySelector('#admin-international-message'),
  adminInternationalGenerate: document.querySelector('#admin-international-generate'),
  adminInternationalWhatsapp: document.querySelector('#admin-international-whatsapp'),
  adminInternationalCancel: document.querySelector('#admin-international-cancel'),
  adminInternationalClose: document.querySelector('#admin-international-close'),
  adminExportCatalog: document.querySelector('#admin-export-catalog'),
  adminExportCatalogPdf: document.querySelector('#admin-export-catalog-pdf'),
  adminExportMessage: document.querySelector('#admin-export-message'),
  adminBackupStatus: document.querySelector('#admin-backup-status'),
  adminProductList: document.querySelector('#admin-product-list'),
  adminSearchInput: document.querySelector('#admin-product-search'),
  adminCategoryFilter: document.querySelector('#admin-product-category-filter'),
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
  adminImageDropTitle: document.querySelector('#admin-image-drop-title'),
  adminImageDropDescription: document.querySelector('#admin-image-drop-description'),
  adminImageUploadStatus: document.querySelector('#admin-image-upload-status'),
  adminImageUploadText: document.querySelector('#admin-image-upload-text'),
  adminImageUploadProgress: document.querySelector('#admin-image-upload-progress'),
  adminImageUploadBar: document.querySelector('#admin-image-upload-bar'),
  adminImagePreview: document.querySelector('#admin-image-preview'),
  adminStock: document.querySelector('#admin-stock'),
  adminMetal: document.querySelector('#admin-metal'),
  adminPurity: document.querySelector('#admin-purity'),
  adminGemstone: document.querySelector('#admin-gemstone'),
  adminEngraving: document.querySelector('#admin-engraving'),
  adminMeasurements: document.querySelector('#admin-measurements'),
  adminMeasurementEntry: document.querySelector('#admin-measurement-entry'),
  adminMeasurementAdd: document.querySelector('#admin-measurement-add'),
  adminMeasurementList: document.querySelector('#admin-measurement-list'),
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
  checkoutDeliveryMethod: document.querySelector('#checkout-delivery-method'),
  checkoutPickupNote: document.querySelector('#checkout-pickup-note'),
  checkoutAddressFields: document.querySelector('#checkout-address-fields'),
  checkoutShippingNoteText: document.querySelector('#checkout-shipping-note-text'),
  checkoutDestination: document.querySelector('#checkout-destination'),
  checkoutCountryField: document.querySelector('#checkout-country-field'),
  checkoutCountry: document.querySelector('#checkout-country'),
  checkoutDepartmentLabel: document.querySelector('#checkout-department-label'),
  checkoutDepartment: document.querySelector('#checkout-department'),
  checkoutCity: document.querySelector('#checkout-city'),
  checkoutAddress: document.querySelector('#checkout-address'),
  checkoutReference: document.querySelector('#checkout-reference'),
  checkoutPostalCode: document.querySelector('#checkout-postal-code'),
  checkoutSubtotal: document.querySelector('#checkout-subtotal'),
  checkoutAdjustmentLabel: document.querySelector('#checkout-adjustment-label'),
  checkoutAdjustment: document.querySelector('#checkout-adjustment'),
  checkoutTotal: document.querySelector('#checkout-total'),
  checkoutTotalNote: document.querySelector('#checkout-total-note'),
  checkoutMessage: document.querySelector('#checkout-message'),
  checkoutPayButton: document.querySelector('#checkout-pay-button'),
  checkoutQuoteButton: document.querySelector('#checkout-quote-button'),
  checkoutPayLabel: document.querySelector('#checkout-pay-label'),
  checkoutPayCardIcon: document.querySelector('#checkout-pay-card-icon'),
  checkoutPayMessageIcon: document.querySelector('#checkout-pay-message-icon'),
  checkoutSecurity: document.querySelector('#checkout-security'),
  cartCount: document.querySelector('#cart-count'),
  paymentResultIcon: document.querySelector('#payment-result-icon'),
  paymentResultTitle: document.querySelector('#payment-result-title'),
  paymentResultMessage: document.querySelector('#payment-result-message'),
  paymentResultSummary: document.querySelector('#payment-result-summary'),
  paymentResultRefresh: document.querySelector('#payment-result-refresh'),
  internationalPaymentTitle: document.querySelector('#international-payment-title'),
  internationalPaymentMessage: document.querySelector('#international-payment-message'),
  internationalPaymentSummary: document.querySelector('#international-payment-summary'),
  internationalPaymentOpen: document.querySelector('#international-payment-open'),
  scrollTopButton: document.querySelector('#scroll-top-button'),
  contactForm: document.querySelector('#contact-form'),
  formMessage: document.querySelector('#form-message'),
};

const adminViewMeta = {
  overview: { title: 'Resumen general', description: 'Indicadores y actividad reciente del negocio' },
  products: { title: 'Catálogo e inventario', description: 'Productos, precios, existencias y galerías' },
  orders: { title: 'Pedidos', description: 'Pagos confirmados y seguimiento de entregas' },
  international: { title: 'Solicitudes internacionales', description: 'Condiciones, coordinación y enlaces de pago' },
  content: { title: 'Contenido comercial', description: 'Portadas, campañas y vitrinas de la tienda' },
};

function setupAdminApplicationShell() {
  const panel = selectors.adminPanelView;
  if (!panel || panel.querySelector('.admin-app-shell')) return;

  const nodes = {
    header: panel.querySelector('.admin-panel-header'),
    commands: panel.querySelector('.admin-command-bar'),
    stats: panel.querySelector('#admin-stats'),
    commercial: panel.querySelector('.admin-commercial-panel'),
    international: panel.querySelector('.admin-international-panel'),
    operations: panel.querySelector('#admin-operations'),
    orders: panel.querySelector('.admin-orders-management'),
    products: panel.querySelector('.admin-workspace'),
  };
  const logoutButton = selectors.adminLogout;

  const shell = document.createElement('div');
  shell.className = 'admin-app-shell';
  shell.innerHTML = `
    <aside class="admin-app-sidebar" id="admin-app-sidebar" aria-label="Navegación administrativa">
      <a class="admin-app-brand" href="/" data-route-link="home" aria-label="Volver a la tienda Querubim">
        <img src="/logo/querubim-logo-full.png" alt="Joyería Querubim" />
      </a>
      <div class="admin-sidebar-context">
        <span>Administración</span>
        <strong>Centro de gestión</strong>
      </div>
      <nav class="admin-app-nav">
        <button class="active" type="button" data-admin-view-target="overview"><i data-lucide="layout-dashboard"></i><span>Resumen</span></button>
        <button type="button" data-admin-view-target="products"><i data-lucide="package"></i><span>Catálogo</span><b id="admin-nav-products-count">0</b></button>
        <button type="button" data-admin-view-target="orders"><i data-lucide="clipboard-list"></i><span>Pedidos</span><b id="admin-nav-orders-count">0</b></button>
        <button type="button" data-admin-view-target="international"><i data-lucide="plane"></i><span>Internacional</span><b id="admin-nav-international-count">0</b></button>
        <button type="button" data-admin-view-target="content"><i data-lucide="gallery-horizontal-end"></i><span>Contenido</span></button>
      </nav>
      <div class="admin-sidebar-footer">
        <div class="admin-sidebar-user">
          <span>Q</span>
          <div><strong>Administrador</strong><small id="admin-sidebar-user-email">Sesión protegida</small></div>
        </div>
      </div>
    </aside>
    <div class="admin-sidebar-scrim" data-admin-sidebar-close></div>
    <div class="admin-app-main">
      <header class="admin-app-topbar">
        <div class="admin-topbar-heading">
          <button class="icon-button admin-sidebar-toggle" id="admin-sidebar-toggle" type="button" aria-label="Abrir menú administrativo"><i data-lucide="menu"></i></button>
          <div><span>Panel administrativo</span><h1 id="admin-view-title">Resumen general</h1><p id="admin-view-description">Indicadores y actividad reciente del negocio</p></div>
        </div>
        <div class="admin-topbar-actions">
          <span class="admin-system-status"><i></i>Sistema operativo</span>
          <a class="icon-button" href="/" data-route-link="home" aria-label="Ver tienda" title="Ver tienda"><i data-lucide="shopping-bag"></i></a>
        </div>
      </header>
      <div class="admin-app-content">
        <section class="admin-app-view active" data-admin-view="overview"></section>
        <section class="admin-app-view" data-admin-view="products"></section>
        <section class="admin-app-view" data-admin-view="orders"></section>
        <section class="admin-app-view" data-admin-view="international"></section>
        <section class="admin-app-view" data-admin-view="content"></section>
      </div>
    </div>`;

  panel.appendChild(shell);
  const view = (name) => shell.querySelector(`[data-admin-view="${name}"]`);
  if (nodes.header) {
    logoutButton?.remove();
    view('overview').appendChild(nodes.header);
  }
  if (nodes.commands) view('overview').appendChild(nodes.commands);
  if (nodes.stats) view('overview').appendChild(nodes.stats);
  const charts = document.createElement('div');
  charts.className = 'admin-overview-charts';
  charts.id = 'admin-overview-charts';
  view('overview').appendChild(charts);
  if (nodes.operations) view('overview').appendChild(nodes.operations);
  if (nodes.products) view('products').appendChild(nodes.products);
  if (nodes.orders) view('orders').appendChild(nodes.orders);
  if (nodes.international) view('international').appendChild(nodes.international);
  if (nodes.commercial) view('content').appendChild(nodes.commercial);
  if (logoutButton) {
    logoutButton.className = 'admin-sidebar-logout';
    logoutButton.innerHTML = '<i data-lucide="log-out"></i><span>Cerrar sesión</span>';
    shell.querySelector('.admin-sidebar-footer').appendChild(logoutButton);
  }
}

setupAdminApplicationShell();

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

function cloneData(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function setCommercialBackground(element, imageUrl) {
  if (!element) return;
  const url = String(imageUrl || '').trim();
  if (!url) {
    element.classList.remove('has-commercial-image');
    element.style.removeProperty('--commercial-image');
    return;
  }
  const safeUrl = url.replace(/["\\\n\r]/g, (character) => encodeURIComponent(character));
  element.style.setProperty('--commercial-image', `url("${safeUrl}")`);
  element.classList.add('has-commercial-image');
}

function applySiteContent(content) {
  if (!content) return;
  state.siteContent = cloneData(content);
  const { hero, campaign, premiumShowcase, premiumHero } = content;

  setCommercialBackground(selectors.commercialHeroImage, hero?.imageUrl);
  selectors.commercialHeroEyebrow.textContent = hero?.eyebrow || '';
  selectors.commercialHeroTitle.textContent = hero?.title || '';
  selectors.commercialHeroDescription.textContent = hero?.description || '';

  selectors.commercialCampaign.hidden = !campaign?.enabled;
  setCommercialBackground(selectors.commercialCampaignImage, campaign?.imageUrl);
  selectors.commercialCampaignEyebrow.textContent = campaign?.eyebrow || '';
  selectors.commercialCampaignTitle.textContent = campaign?.title || '';
  selectors.commercialCampaignDescription.textContent = campaign?.description || '';
  selectors.commercialCampaignCtaLabel.textContent = campaign?.ctaLabel || 'Explorar colección';
  selectors.commercialCampaignCta.href = campaign?.ctaUrl || '#coleccion';

  setCommercialBackground(selectors.commercialPremiumShowcase, premiumShowcase?.imageUrl);
  selectors.commercialPremiumEyebrow.textContent = premiumShowcase?.eyebrow || '';
  selectors.commercialPremiumTitle.textContent = premiumShowcase?.title || '';
  selectors.commercialPremiumDescription.textContent = premiumShowcase?.description || '';

  setCommercialBackground(selectors.commercialPremiumHero, premiumHero?.imageUrl);
  selectors.commercialPremiumHeroEyebrow.textContent = premiumHero?.eyebrow || '';
  selectors.commercialPremiumHeroTitle.textContent = premiumHero?.title || '';
  selectors.commercialPremiumHeroDescription.textContent = premiumHero?.description || '';
}

async function loadSiteContent() {
  try {
    const result = await apiRequest('/api/site-content');
    if (result.content) applySiteContent(result.content);
  } catch {
    // El contenido incluido en el HTML funciona como respaldo cuando la API no responde.
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

function getCartPricing() {
  const subtotal = state.cartItems.reduce((total, item) => total + getProductPrice(item.product), 0);
  const international =
    selectors.checkoutDeliveryMethod?.value === 'delivery' &&
    selectors.checkoutDestination?.value === 'international';
  const adjustmentRate = international ? 6 : 5;
  const commercialAdjustment = Math.round((subtotal * adjustmentRate) / 100);
  return {
    subtotal,
    commercialAdjustment,
    adjustmentRate,
    amount: subtotal + commercialAdjustment,
    destinationScope: international ? 'international' : 'national',
  };
}

function buildCartWhatsAppLink(pricing = getCartPricing()) {
  const products = state.cartItems
    .map(({ product, measure }, index) => `${index + 1}. ${product.name} (${measure})`)
    .join('\n');
  const message = [
    'Hola Querubim, quiero solicitar una cotización personalizada para estas joyas:',
    products,
    `Total estimado de las joyas: ${formatCurrency(pricing.amount)}.`,
    'Quedo atento(a) a su asesoría.',
  ]
    .filter(Boolean)
    .join('\n\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function syncCheckoutDeliveryForm() {
  const method = selectors.checkoutDeliveryMethod.value;
  const isDelivery = method === 'delivery';
  const isPickup = method === 'pickup';
  const isInternational = isDelivery && selectors.checkoutDestination.value === 'international';

  selectors.checkoutPickupNote.hidden = !isPickup;
  selectors.checkoutAddressFields.hidden = !isDelivery;
  selectors.checkoutCountryField.hidden = !isInternational;
  selectors.checkoutCountry.required = isInternational;
  selectors.checkoutCountry.disabled = !isInternational;
  selectors.checkoutDepartment.required = isDelivery && !isInternational;
  selectors.checkoutDepartment.disabled = !isDelivery;
  selectors.checkoutCity.required = isDelivery;
  selectors.checkoutCity.disabled = !isDelivery;
  selectors.checkoutAddress.required = isDelivery;
  selectors.checkoutAddress.disabled = !isDelivery;
  selectors.checkoutReference.disabled = !isDelivery;
  selectors.checkoutPostalCode.disabled = !isDelivery;
  selectors.checkoutDestination.disabled = !isDelivery;
  selectors.checkoutDepartmentLabel.textContent = isInternational ? 'Estado o provincia (opcional)' : 'Departamento';
  selectors.checkoutShippingNoteText.textContent = isInternational
    ? 'Querubim revisará el destino, acordará contigo el transporte internacional y después enviará el enlace de pago de las joyas.'
    : 'El domicilio no está incluido en este pago. Querubim confirmará su valor y se pagará por separado al recibir.';
  selectors.checkoutTotalNote.textContent = isInternational
    ? 'IVA del 19 % incluido. El envío internacional se cotiza y acuerda por separado.'
    : isDelivery
      ? 'IVA del 19 % incluido. El domicilio se paga por separado al recibir.'
      : 'IVA del 19 % incluido en el total.';
  selectors.checkoutPayLabel.textContent = isInternational ? 'Coordinar envío internacional' : 'Pagar con Bold';
  selectors.checkoutPayCardIcon.hidden = isInternational;
  selectors.checkoutPayMessageIcon.hidden = !isInternational;
  selectors.checkoutSecurity.innerHTML = isInternational
    ? '<i data-lucide="shield-check"></i> La orden de pago se generará después de acordar el envío'
    : '<i data-lucide="shield-check"></i> Pago protegido por Bold';
  renderCart();
  refreshIcons();
}

function renderCart() {
  const pricing = getCartPricing();
  selectors.cartCount.textContent = String(state.cartItems.length);
  selectors.selectionEmpty.hidden = state.cartItems.length > 0;
  selectors.checkoutForm.hidden = state.cartItems.length === 0;
  selectors.checkoutSubtotal.textContent = formatCurrency(pricing.subtotal);
  selectors.checkoutAdjustmentLabel.textContent = `${pricing.destinationScope === 'international' ? 'Ajuste internacional' : 'Ajuste nacional'} (${pricing.adjustmentRate} %)`;
  selectors.checkoutAdjustment.textContent = formatCurrency(pricing.commercialAdjustment);
  selectors.checkoutTotal.textContent = formatCurrency(pricing.amount);
  selectors.checkoutQuoteButton.href = buildCartWhatsAppLink(pricing);
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
  const isInternational = selectors.checkoutDeliveryMethod.value === 'delivery'
    && selectors.checkoutDestination.value === 'international';
  selectors.checkoutPayLabel.textContent = isBusy
    ? isInternational ? 'Registrando solicitud' : 'Preparando pago'
    : isInternational ? 'Coordinar envío internacional' : 'Pagar con Bold';
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
    const delivery = {
      method: String(formData.get('deliveryMethod') || ''),
      country: String(formData.get('country') || '').trim(),
      department: String(formData.get('department') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      addressLine: String(formData.get('addressLine') || '').trim(),
      reference: String(formData.get('reference') || '').trim(),
      postalCode: String(formData.get('postalCode') || '').trim(),
    };
    const destination = { scope: String(formData.get('destinationType') || '') };
    const isInternational = delivery.method === 'delivery' && destination.scope === 'international';
    const endpoint = isInternational ? '/api/international-requests' : '/api/payments/orders';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        delivery,
        destination,
        items: state.cartItems.map(({ product, measure }) => ({ productId: product.id, measure, quantity: 1 })),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || (isInternational
      ? 'No fue posible registrar la solicitud internacional.'
      : 'No fue posible crear la orden de pago.'));

    if (isInternational) {
      selectors.checkoutMessage.textContent = `Solicitud ${result.request.id} registrada. Abrimos WhatsApp para coordinar el envío.`;
      selectors.checkoutMessage.classList.add('success');
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

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
  EXPIRED: {
    icon: 'clock-alert',
    tone: 'neutral',
    title: 'La reserva de la joya venció.',
    message: 'La orden no recibió un pago confirmado dentro del plazo. Vuelve al catálogo para comprobar la disponibilidad actual.',
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
  EXPIRED: 'Reserva vencida',
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
        <div><dt>Entrega</dt><dd>${escapeHtml(order.delivery?.label || 'Por confirmar')}<br />${escapeHtml(order.destination?.label || '')}${order.delivery?.shippingPaymentLabel ? `<br />${escapeHtml(order.delivery.shippingPaymentLabel)}` : ''}</dd></div>
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

function buildBoldCheckoutConfig(result) {
  const config = {
    orderId: result.payment.orderId,
    currency: result.payment.currency,
    amount: result.payment.amount,
    apiKey: result.payment.apiKey,
    integritySignature: result.payment.integritySignature,
    description: result.payment.description,
    renderMode: 'embedded',
  };
  if (result.payment.redirectionUrl) config.redirectionUrl = result.payment.redirectionUrl;
  if (result.payment.tax) config.tax = result.payment.tax;
  return config;
}

async function loadInternationalPayment() {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get('solicitud');
  const token = params.get('token');
  selectors.internationalPaymentOpen.disabled = true;
  state.internationalCheckout = null;

  if (!requestId || !token) {
    selectors.internationalPaymentTitle.textContent = 'El enlace está incompleto.';
    selectors.internationalPaymentMessage.textContent = 'Solicita un nuevo enlace al equipo de Querubim.';
    return;
  }

  try {
    const result = await apiRequest(
      `/api/international-requests/${encodeURIComponent(requestId)}/checkout?token=${encodeURIComponent(token)}`,
    );
    state.internationalCheckout = buildBoldCheckoutConfig(result);
    selectors.internationalPaymentTitle.textContent = 'Tu orden internacional está lista.';
    selectors.internationalPaymentMessage.textContent = 'La joya quedó reservada. Completa el pago con Bold dentro del plazo indicado.';
    selectors.internationalPaymentSummary.innerHTML = `
      <div><dt>Solicitud</dt><dd>${escapeHtml(requestId)}</dd></div>
      <div><dt>Orden</dt><dd>${escapeHtml(result.order.id)}</dd></div>
      <div><dt>Total joyas</dt><dd>${escapeHtml(formatCurrency(result.order.amount))}</dd></div>
      <div><dt>Vigencia</dt><dd>${escapeHtml(formatAdminDate(result.order.expiresAt))}</dd></div>
    `;
    selectors.internationalPaymentOpen.disabled = false;
    sessionStorage.setItem('querubim-last-order', result.order.id);
  } catch (error) {
    selectors.internationalPaymentTitle.textContent = 'Este pago no está disponible.';
    selectors.internationalPaymentMessage.textContent = error.message || 'Solicita un nuevo enlace al equipo de Querubim.';
    selectors.internationalPaymentSummary.innerHTML = '';
  }
}

async function openInternationalPayment() {
  if (!state.internationalCheckout) return;
  selectors.internationalPaymentOpen.disabled = true;
  try {
    const BoldCheckout = await loadBoldCheckoutScript();
    new BoldCheckout(state.internationalCheckout).open();
  } catch (error) {
    selectors.internationalPaymentMessage.textContent = error.message || 'No fue posible abrir Bold.';
  } finally {
    selectors.internationalPaymentOpen.disabled = false;
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
    state.adminInternationalRequests = Array.isArray(result.internationalRequests) ? result.internationalRequests : [];
    state.adminSummary = result.summary || null;
    state.adminStorage = { ...DEFAULT_ADMIN_STORAGE, ...(result.storage || {}) };
    if (result.siteContent) {
      state.originalSiteContent = cloneData(result.siteContent);
      applySiteContent(result.siteContent);
      renderAdminCommercialContent();
    }
    updateAdminImageUploadState();
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

  if (selectors.adminCategoryFilter) {
    const selectedFilter = state.adminCategoryFilter;
    selectors.adminCategoryFilter.innerHTML = categories
      .map((category) =>
        `<option value="${escapeHtml(category.slug)}"${category.slug === selectedFilter ? ' selected' : ''}>${escapeHtml(category.label)}</option>`,
      )
      .join('');
  }
}

function getAdminVisibleProducts() {
  const query = normalizeText(state.adminQuery.trim());

  return products
    .filter((product) => {
      if (state.adminCategoryFilter !== 'todos' && product.category !== state.adminCategoryFilter) return false;
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
      action: 'Panel administrativo disponible para la gestión comercial.',
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
    selectors.adminBackupStatus.textContent = getLastBackupLabel();
  }

  if (selectors.adminResetCatalog) selectors.adminResetCatalog.disabled = state.adminLoading;
}

function renderAdminStats() {
  if (!selectors.adminStats) return;

  const paidRevenue = Number(state.adminSummary?.paidRevenue || 0);
  const lowStock = getLowStockProducts().length;
  const paidOrders = state.adminOrders.filter((order) => order.status === 'PAID').length;
  const pendingInternational = Number(state.adminSummary?.pendingInternationalRequests || 0);

  const stats = [
    { icon: 'shopping-bag', label: 'Ingresos confirmados', value: formatCurrency(paidRevenue), detail: `${paidOrders} pagos aprobados`, tone: 'gold' },
    { icon: 'clipboard-list', label: 'Pedidos registrados', value: state.adminOrders.length, detail: `${state.adminOrders.filter((order) => order.status === 'CREATED').length} esperan pago`, tone: 'burgundy' },
    { icon: 'package', label: 'Catálogo activo', value: products.length, detail: `${lowStock} alertas de existencias`, tone: 'charcoal' },
    { icon: 'plane', label: 'Solicitudes internacionales', value: pendingInternational, detail: `${state.adminInternationalRequests.length} solicitudes totales`, tone: 'green' },
  ];

  selectors.adminStats.innerHTML = stats
    .map(
      (stat) => `
        <article class="admin-stat">
          <div class="admin-stat-icon ${stat.tone}"><i data-lucide="${stat.icon}"></i></div>
          <div><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong><small>${escapeHtml(stat.detail)}</small></div>
        </article>
      `,
    )
    .join('');

  const productCount = document.querySelector('#admin-nav-products-count');
  const orderCount = document.querySelector('#admin-nav-orders-count');
  const internationalCount = document.querySelector('#admin-nav-international-count');
  if (productCount) productCount.textContent = String(products.length);
  if (orderCount) orderCount.textContent = String(state.adminOrders.length);
  if (internationalCount) internationalCount.textContent = String(pendingInternational);
  const userEmail = document.querySelector('#admin-sidebar-user-email');
  if (userEmail) userEmail.textContent = state.adminUser?.email || 'Sesión protegida';
}

function getRecentAdminMonths(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date).replace('.', ''),
      revenue: 0,
      orders: 0,
    };
  });
}

function renderAdminOverviewCharts() {
  const target = document.querySelector('#admin-overview-charts');
  if (!target) return;
  const months = getRecentAdminMonths();
  const monthByKey = new Map(months.map((month) => [month.key, month]));
  state.adminOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const month = monthByKey.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    if (!month) return;
    if (order.status === 'PAID') {
      month.orders += 1;
      month.revenue += Number(order.amount || 0);
    }
  });
  const maxRevenue = Math.max(...months.map((month) => month.revenue), 1);
  const periodRevenue = months.reduce((total, month) => total + month.revenue, 0);
  const paymentCounts = {
    paid: state.adminOrders.filter((order) => order.status === 'PAID').length,
    pending: state.adminOrders.filter((order) => order.status === 'CREATED').length,
    attention: state.adminOrders.filter((order) => ['REJECTED', 'VOIDED', 'EXPIRED', 'REVIEW_REQUIRED'].includes(order.status)).length,
  };
  const paymentTotal = Math.max(paymentCounts.paid + paymentCounts.pending + paymentCounts.attention, 1);
  const paidEnd = (paymentCounts.paid / paymentTotal) * 100;
  const pendingEnd = paidEnd + (paymentCounts.pending / paymentTotal) * 100;

  target.innerHTML = `
    <section class="admin-chart-panel admin-sales-chart">
      <div class="admin-chart-heading">
        <div><span>Rendimiento</span><h2>Ingresos por mes</h2></div>
        <small>Últimos 6 meses · pagos confirmados</small>
      </div>
      <div class="admin-bar-chart" aria-label="Ingresos confirmados durante los últimos seis meses">
        ${periodRevenue === 0 ? '<p class="admin-chart-empty">Todavía no hay pagos confirmados en este periodo.</p>' : ''}
        ${months.map((month) => `
          <div class="admin-bar-column" title="${escapeHtml(month.label)}: ${escapeHtml(formatCurrency(month.revenue))}">
            <div><i style="height:${Math.max(month.revenue ? 10 : 2, (month.revenue / maxRevenue) * 100)}%"></i></div>
            <strong>${escapeHtml(month.label)}</strong>
            <small>${month.orders} ped.</small>
          </div>`).join('')}
      </div>
    </section>
    <section class="admin-chart-panel admin-payment-chart">
      <div class="admin-chart-heading"><div><span>Pagos</span><h2>Distribución actual</h2></div></div>
      <div class="admin-payment-visual">
        <div class="admin-donut" style="--paid-end:${paidEnd}%;--pending-end:${pendingEnd}%">
          <div><strong>${state.adminOrders.length}</strong><span>órdenes</span></div>
        </div>
        <div class="admin-chart-legend">
          <span><i class="paid"></i><b>Aprobados</b><strong>${paymentCounts.paid}</strong></span>
          <span><i class="pending"></i><b>Pendientes</b><strong>${paymentCounts.pending}</strong></span>
          <span><i class="attention"></i><b>Requieren atención</b><strong>${paymentCounts.attention}</strong></span>
        </div>
      </div>
    </section>`;
}

function setAdminView(viewName, { scroll = true } = {}) {
  if (!adminViewMeta[viewName]) return;
  state.activeAdminView = viewName;
  document.querySelectorAll('[data-admin-view]').forEach((view) => {
    view.classList.toggle('active', view.dataset.adminView === viewName);
  });
  document.querySelectorAll('[data-admin-view-target]').forEach((button) => {
    const active = button.dataset.adminViewTarget === viewName;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  const title = document.querySelector('#admin-view-title');
  const description = document.querySelector('#admin-view-description');
  if (title) title.textContent = adminViewMeta[viewName].title;
  if (description) description.textContent = adminViewMeta[viewName].description;
  document.querySelector('#admin-app-sidebar')?.classList.remove('open');
  document.body.classList.remove('admin-sidebar-open');
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
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
    EXPIRED: 'Reserva vencida',
    REVIEW_REQUIRED: 'Revisión requerida',
  }[status] || status || 'Sin estado';
}

const fulfillmentTransitions = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
  PREPARING: ['CONFIRMED', 'PREPARING', 'READY', 'CANCELLED'],
  READY: ['PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['READY', 'SHIPPED', 'DELIVERED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED', 'CONFIRMED'],
};

function getFulfillmentStatusLabel(status) {
  return {
    PENDING: 'Pendiente de pago',
    CONFIRMED: 'Pedido confirmado',
    PREPARING: 'En preparación',
    READY: 'Listo para entregar',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }[status] || status || 'Pendiente';
}

function getOrderStatusClass(status) {
  return `status-${String(status || 'pending').toLowerCase().replace(/_/g, '-')}`;
}

function getInventoryStatusLabel(status) {
  return {
    RESERVED: 'Existencias reservadas',
    COMMITTED: 'Inventario confirmado',
    RELEASED: 'Existencias liberadas',
  }[status] || 'Sin movimiento automático';
}

function formatAdminDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getAdminVisibleOrders() {
  const query = normalizeText(state.adminOrderQuery);
  const [filterType, filterValue] = state.adminOrderFilter.split(':');
  return state.adminOrders.filter((order) => {
    const searchable = normalizeText([
      order.id,
      order.customer?.fullName,
      order.customer?.email,
      order.customer?.phone,
      order.items?.map((item) => item.name).join(' '),
    ].join(' '));
    if (query && !searchable.includes(query)) return false;
    if (filterType === 'payment' && order.status !== filterValue) return false;
    if (filterType === 'fulfillment' && order.fulfillmentStatus !== filterValue) return false;
    return true;
  });
}

function renderAdminOrderManagement() {
  if (!selectors.adminOrderList) return;
  const orders = getAdminVisibleOrders();
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  state.adminOrderPage = Math.min(state.adminOrderPage, pageCount);
  const pageOrders = orders.slice((state.adminOrderPage - 1) * pageSize, state.adminOrderPage * pageSize);
  selectors.adminOrderList.innerHTML = orders.length
    ? `${pageOrders.map((order) => `
        <button class="admin-order-row" type="button" data-admin-order="${escapeHtml(order.id)}">
          <div>
            <strong>${escapeHtml(order.id)}</strong>
            <small>${escapeHtml(formatAdminDate(order.createdAt))}</small>
          </div>
          <div>
            <strong>${escapeHtml(order.customer?.fullName || 'Cliente')}</strong>
            <span>${escapeHtml(order.items?.map((item) => item.name).join(', ') || 'Sin detalle')}</span>
          </div>
          <div>
            <span class="admin-order-badge ${getOrderStatusClass(order.status)}">${escapeHtml(getOrderStatusLabel(order.status))}</span>
            <small>${escapeHtml(formatCurrency(order.amount))}</small>
          </div>
          <div>
            <span class="admin-order-badge ${getOrderStatusClass(order.fulfillmentStatus)}">${escapeHtml(getFulfillmentStatusLabel(order.fulfillmentStatus))}</span>
            <small>${escapeHtml(order.trackingNumber || 'Sin guía')}</small>
          </div>
          <i data-lucide="arrow-right"></i>
        </button>`).join('')}
        <div class="admin-order-pagination" aria-label="Paginación de pedidos">
          <button class="button button-secondary" type="button" data-admin-order-page="${state.adminOrderPage - 1}"${state.adminOrderPage === 1 ? ' disabled' : ''}>Anterior</button>
          <span>Página ${state.adminOrderPage} de ${pageCount} · ${orders.length} pedidos</span>
          <button class="button button-secondary" type="button" data-admin-order-page="${state.adminOrderPage + 1}"${state.adminOrderPage === pageCount ? ' disabled' : ''}>Siguiente</button>
        </div>`
    : '<p class="empty-results">No hay pedidos que coincidan con la búsqueda o el filtro.</p>';
}

function closeAdminOrderDialog() {
  state.activeAdminOrderId = null;
  if (selectors.adminOrderDialog?.open) selectors.adminOrderDialog.close();
}

function canDeleteAdminOrder(order) {
  return ['CREATED', 'REJECTED', 'VOIDED', 'EXPIRED'].includes(order?.status)
    || ['DELIVERED', 'CANCELLED'].includes(order?.fulfillmentStatus);
}

function openAdminOrder(orderId) {
  const order = state.adminOrders.find((item) => item.id === orderId);
  if (!order || !selectors.adminOrderDialog) return;
  state.activeAdminOrderId = order.id;
  selectors.adminOrderDialogTitle.textContent = order.id;
  selectors.adminOrderDetailContent.innerHTML = `
    <section class="admin-order-detail-block">
      <h3>Cliente</h3>
      <p>${escapeHtml(order.customer?.fullName || 'Sin nombre')}<br />${escapeHtml(order.customer?.email || 'Sin correo')}<br />${escapeHtml(order.customer?.phone || 'Sin celular')}</p>
    </section>
    <section class="admin-order-detail-block">
      <h3>Pago verificado por Bold</h3>
      <p><span class="admin-order-badge ${getOrderStatusClass(order.status)}">${escapeHtml(getOrderStatusLabel(order.status))}</span><br />${escapeHtml(formatCurrency(order.amount))} · ${escapeHtml(order.paymentMethod || 'Método pendiente')}</p>
      <p>Subtotal: ${escapeHtml(formatCurrency(order.subtotal ?? order.amount))}<br />Ajuste ${order.adjustmentRate || 0} %: ${escapeHtml(formatCurrency(order.commercialAdjustment || 0))}<br />IVA incluido: ${order.taxRate || 19} %<br />Inventario: ${escapeHtml(getInventoryStatusLabel(order.inventoryStatus))}</p>
    </section>
    <section class="admin-order-detail-block">
      <h3>Destino de entrega</h3>
      <p>${escapeHtml(order.delivery?.label || 'Pendiente de confirmar')}<br />${escapeHtml(order.destination?.label || '')}${order.delivery?.pickupAddress ? `<br />${escapeHtml(order.delivery.pickupAddress)}` : ''}${order.delivery?.address ? `<br />${escapeHtml([order.delivery.address.addressLine, order.delivery.address.city, order.delivery.address.department, order.delivery.address.country, order.delivery.address.postalCode].filter(Boolean).join(', '))}${order.delivery.address.reference ? `<br />Referencia: ${escapeHtml(order.delivery.address.reference)}` : ''}` : ''}${order.delivery?.shippingPaymentLabel ? `<br /><strong>${escapeHtml(order.delivery.shippingPaymentLabel)}.</strong>` : ''}</p>
    </section>
    <section class="admin-order-detail-block wide">
      <h3>Piezas solicitadas</h3>
      <ul>${(order.items || []).map((item) => `<li>${escapeHtml(item.name)} · ${escapeHtml(item.measure)} · ${item.quantity} unidad${item.quantity === 1 ? '' : 'es'}</li>`).join('')}</ul>
    </section>
    <section class="admin-order-detail-block wide">
      <h3>Historial operativo</h3>
      ${(order.fulfillmentHistory || []).length
        ? `<ul>${order.fulfillmentHistory.slice(-5).reverse().map((item) => `<li>${escapeHtml(getFulfillmentStatusLabel(item.from))} → ${escapeHtml(getFulfillmentStatusLabel(item.to))} · ${escapeHtml(formatAdminDate(item.at))}</li>`).join('')}</ul>`
        : '<p>Aún no se han registrado cambios manuales.</p>'}
    </section>`;

  const currentStatus = order.fulfillmentStatus || 'PENDING';
  selectors.adminOrderStatus.innerHTML = (fulfillmentTransitions[currentStatus] || [currentStatus])
    .map((status) => `<option value="${status}"${status === currentStatus ? ' selected' : ''}>${escapeHtml(getFulfillmentStatusLabel(status))}</option>`)
    .join('');
  selectors.adminOrderCarrier.value = order.shippingCarrier || '';
  selectors.adminOrderTracking.value = order.trackingNumber || '';
  selectors.adminOrderNotes.value = order.internalNotes || '';
  selectors.adminOrderMessage.textContent = '';
  selectors.adminOrderMessage.classList.remove('error', 'success');
  if (selectors.adminOrderDelete) {
    const canDelete = canDeleteAdminOrder(order);
    selectors.adminOrderDelete.disabled = !canDelete;
    selectors.adminOrderDelete.title = canDelete
      ? 'Eliminar este pedido de las vistas administrativas'
      : 'Solo puede eliminarse cuando esté pendiente de pago, finalizado, cancelado, rechazado, anulado o vencido';
  }
  if (!selectors.adminOrderDialog.open) selectors.adminOrderDialog.showModal();
  refreshIcons();
}

async function saveAdminOrder(event) {
  event.preventDefault();
  const orderId = state.activeAdminOrderId;
  if (!orderId || !selectors.adminOrderForm.checkValidity()) return;
  const submitButton = selectors.adminOrderForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  selectors.adminOrderMessage.textContent = 'Guardando seguimiento...';
  selectors.adminOrderMessage.classList.remove('error', 'success');

  try {
    const result = await apiRequest(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fulfillmentStatus: selectors.adminOrderStatus.value,
        shippingCarrier: selectors.adminOrderCarrier.value,
        trackingNumber: selectors.adminOrderTracking.value,
        internalNotes: selectors.adminOrderNotes.value,
      }),
    });
    const index = state.adminOrders.findIndex((order) => order.id === orderId);
    if (index >= 0) state.adminOrders[index] = result.order;
    renderAdminOrderManagement();
    renderAdminOperations();
    openAdminOrder(orderId);
    selectors.adminOrderMessage.textContent = 'Seguimiento actualizado correctamente.';
    selectors.adminOrderMessage.classList.add('success');
    recordAdminActivity(`Actualización del pedido ${orderId}: ${getFulfillmentStatusLabel(result.order.fulfillmentStatus)}.`);
    refreshIcons();
  } catch (error) {
    selectors.adminOrderMessage.textContent = error.message;
    selectors.adminOrderMessage.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteAdminOrder() {
  const orderId = state.activeAdminOrderId;
  const order = state.adminOrders.find((item) => item.id === orderId);
  if (!order || !canDeleteAdminOrder(order)) return;
  if (!window.confirm(`¿Eliminar el pedido ${orderId} del panel administrativo? El registro de pago se conservará de forma protegida.`)) return;

  selectors.adminOrderDelete.disabled = true;
  selectors.adminOrderMessage.textContent = 'Eliminando pedido del panel...';
  selectors.adminOrderMessage.classList.remove('error', 'success');
  try {
    await apiRequest(`/api/admin/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
    state.adminOrders = state.adminOrders.filter((item) => item.id !== orderId);
    closeAdminOrderDialog();
    renderAdminPanel();
    recordAdminActivity(`Eliminación administrativa del pedido ${orderId}.`);
    await loadAdminDashboard();
  } catch (error) {
    selectors.adminOrderMessage.textContent = error.message;
    selectors.adminOrderMessage.classList.add('error');
    selectors.adminOrderDelete.disabled = false;
  }
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

function getNestedContentValue(content, path) {
  return String(path || '').split('.').reduce((value, key) => value?.[key], content);
}

function setNestedContentValue(content, path, value) {
  const keys = String(path || '').split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => current[key], content);
  target[lastKey] = value;
}

function renderCommercialPreview(slot, imageUrl) {
  const preview = selectors.adminCommercialForm?.querySelector(`[data-content-preview="${slot}"]`);
  if (!preview) return;
  preview.innerHTML = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Vista previa de ${escapeHtml(slot)}" />`
    : '<i data-lucide="image"></i><span>Sin imagen cargada</span>';
}

function renderAdminCommercialContent() {
  if (!selectors.adminCommercialForm || !state.siteContent) return;
  selectors.adminCommercialForm.querySelectorAll('[data-content-field]').forEach((field) => {
    const value = getNestedContentValue(state.siteContent, field.dataset.contentField);
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  });
  ['hero', 'campaign', 'premiumShowcase', 'premiumHero'].forEach((slot) =>
    renderCommercialPreview(slot, state.siteContent?.[slot]?.imageUrl),
  );
  selectors.adminCommercialForm.querySelectorAll('[data-content-upload]').forEach((input) => {
    input.disabled = !state.adminStorage.configured || state.adminImageUploading;
  });
  refreshIcons();
}

async function uploadCommercialImage(slot, file) {
  if (!file || state.adminImageUploading) return;
  const acceptedTypes = new Set(state.adminStorage.acceptedTypes);
  if (!acceptedTypes.has(file.type) || file.size < 1 || file.size > state.adminStorage.maxImageSize) {
    selectors.adminCommercialMessage.textContent = 'La imagen debe ser JPEG, PNG, WebP o AVIF y pesar máximo 8 MB.';
    selectors.adminCommercialMessage.className = 'form-message error';
    return;
  }
  state.adminImageUploading = true;
  selectors.adminCommercialMessage.textContent = 'Cargando imagen comercial...';
  selectors.adminCommercialMessage.className = 'form-message';
  selectors.adminCommercialForm.querySelectorAll('[data-content-upload]').forEach((input) => { input.disabled = true; });
  try {
    const result = await apiRequest('/api/admin/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({
        productId: `contenido-${slot}`,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    await uploadFileToSignedUrl(file, result.upload, () => undefined);
    const previousDraftUrl = state.siteContent[slot].imageUrl;
    if (state.pendingContentUploads.has(previousDraftUrl)) {
      await deleteR2Images([previousDraftUrl]);
      state.pendingContentUploads.delete(previousDraftUrl);
    }
    state.pendingContentUploads.add(result.upload.publicUrl);
    state.siteContent[slot].imageUrl = result.upload.publicUrl;
    const field = selectors.adminCommercialForm.querySelector(`[data-content-field="${slot}.imageUrl"]`);
    field.value = result.upload.publicUrl;
    renderCommercialPreview(slot, result.upload.publicUrl);
    selectors.adminCommercialMessage.textContent = 'Imagen cargada. Publica los cambios para mostrarla en la tienda.';
    selectors.adminCommercialMessage.className = 'form-message success';
  } catch (error) {
    selectors.adminCommercialMessage.textContent = error.message;
    selectors.adminCommercialMessage.className = 'form-message error';
  } finally {
    state.adminImageUploading = false;
    selectors.adminCommercialForm.querySelectorAll('[data-content-upload]').forEach((input) => {
      input.disabled = !state.adminStorage.configured;
    });
  }
}

async function saveAdminCommercialContent(event) {
  event.preventDefault();
  if (!selectors.adminCommercialForm.checkValidity()) {
    selectors.adminCommercialMessage.textContent = 'Completa los títulos y descripciones comerciales.';
    selectors.adminCommercialMessage.className = 'form-message error';
    selectors.adminCommercialForm.reportValidity();
    return;
  }
  const content = cloneData(state.siteContent);
  selectors.adminCommercialForm.querySelectorAll('[data-content-field]').forEach((field) => {
    setNestedContentValue(content, field.dataset.contentField, field.type === 'checkbox' ? field.checked : field.value.trim());
  });
  const submitButton = selectors.adminCommercialForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  selectors.adminCommercialMessage.textContent = 'Publicando contenido comercial...';
  selectors.adminCommercialMessage.className = 'form-message';
  try {
    const result = await apiRequest('/api/admin/site-content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
    const previousImages = ['hero', 'campaign', 'premiumShowcase', 'premiumHero']
      .map((slot) => state.originalSiteContent?.[slot]?.imageUrl)
      .filter((url) => url && !Object.values(result.content).some((slot) => slot.imageUrl === url));
    const cleanup = await deleteR2Images(previousImages);
    Object.values(result.content).forEach((slot) => state.pendingContentUploads.delete(slot.imageUrl));
    state.originalSiteContent = cloneData(result.content);
    applySiteContent(result.content);
    renderAdminCommercialContent();
    selectors.adminCommercialMessage.textContent = cleanup.some((item) => item.status === 'rejected')
      ? 'Contenido publicado. Una imagen anterior quedó pendiente de limpieza.'
      : 'Contenido comercial publicado correctamente.';
    selectors.adminCommercialMessage.className = 'form-message success';
    recordAdminActivity('Actualización de portadas y contenido comercial.');
  } catch (error) {
    selectors.adminCommercialMessage.textContent = error.message;
    selectors.adminCommercialMessage.className = 'form-message error';
  } finally {
    submitButton.disabled = false;
  }
}

const internationalStatusLabels = {
  PENDING_REVIEW: 'Pendiente de revisión',
  CONDITIONS_SET: 'Condiciones registradas',
  READY_FOR_PAYMENT: 'Lista para pagar',
  PAYMENT_CONFIRMED: 'Pago confirmado',
  PAYMENT_REVIEW: 'Pago en revisión',
  PAYMENT_REJECTED: 'Pago rechazado',
  PAYMENT_VOIDED: 'Pago anulado',
  PAYMENT_EXPIRED: 'Pago vencido',
  CANCELLED: 'Cancelada',
};

function renderAdminInternationalRequests() {
  if (!selectors.adminInternationalList) return;
  selectors.adminInternationalList.innerHTML = state.adminInternationalRequests.length
    ? state.adminInternationalRequests.map((request) => `
        <button class="admin-international-row" type="button" data-admin-international="${escapeHtml(request.id)}">
          <div><strong>${escapeHtml(request.id)}</strong><small>${escapeHtml(formatAdminDate(request.createdAt))}</small></div>
          <div><strong>${escapeHtml(request.customer?.fullName || 'Cliente')}</strong><span>${escapeHtml(request.delivery?.address?.country || 'Destino internacional')} · ${escapeHtml(request.delivery?.address?.city || '')}</span></div>
          <div><strong>${escapeHtml(formatCurrency(request.amount))}</strong><small>${escapeHtml(request.items?.map((item) => item.name).join(', ') || 'Sin productos')}</small></div>
          <span class="admin-order-badge ${getOrderStatusClass(request.status)}">${escapeHtml(internationalStatusLabels[request.status] || request.status)}</span>
          <i data-lucide="arrow-right"></i>
        </button>
      `).join('')
    : '<p class="empty-results">No hay solicitudes internacionales registradas.</p>';
}

function closeAdminInternationalDialog() {
  state.activeInternationalRequestId = null;
  if (selectors.adminInternationalDialog?.open) selectors.adminInternationalDialog.close();
}

function openAdminInternationalRequest(requestId) {
  const request = state.adminInternationalRequests.find((item) => item.id === requestId);
  if (!request || !selectors.adminInternationalDialog) return;
  state.activeInternationalRequestId = request.id;
  const address = request.delivery?.address || {};
  selectors.adminInternationalDialogTitle.textContent = request.id;
  selectors.adminInternationalDetail.innerHTML = `
    <div class="admin-order-detail-block"><h3>Cliente</h3><p>${escapeHtml(request.customer?.fullName || '')}<br />${escapeHtml(request.customer?.email || '')}<br />${escapeHtml(request.customer?.phone || '')}</p></div>
    <div class="admin-order-detail-block"><h3>Destino</h3><p>${escapeHtml(address.country || '')}, ${escapeHtml(address.city || '')}<br />${escapeHtml(address.addressLine || '')}<br />${escapeHtml(address.postalCode || '')}</p></div>
    <div class="admin-order-detail-block wide"><h3>Joyas solicitadas</h3><ul>${request.items.map((item) => `<li>${escapeHtml(item.name)} · ${escapeHtml(item.measure)} · ${escapeHtml(formatCurrency(item.subtotal))}</li>`).join('')}</ul><p>Total de joyas con ajuste internacional: <strong>${escapeHtml(formatCurrency(request.amount))}</strong></p></div>
  `;
  selectors.adminInternationalCarrier.value = request.conditions?.carrier || '';
  selectors.adminInternationalShippingCost.value = request.conditions?.shippingCost || '';
  selectors.adminInternationalDeliveryTime.value = request.conditions?.estimatedDelivery || '';
  selectors.adminInternationalTerms.value = request.conditions?.paymentTerms || '';
  selectors.adminInternationalNotes.value = request.conditions?.internalNotes || '';
  selectors.adminInternationalAgreed.checked = Boolean(request.conditions?.agreed);
  selectors.adminInternationalMessage.textContent = request.paymentOrderId
    ? `Orden Bold ${request.paymentOrderId}: ${getOrderStatusLabel(request.paymentStatus)}`
    : '';
  selectors.adminInternationalMessage.className = 'form-message';
  const locked = Boolean(request.paymentOrderId) || request.status === 'CANCELLED';
  selectors.adminInternationalForm.querySelectorAll('input, textarea').forEach((field) => { field.disabled = locked; });
  selectors.adminInternationalForm.querySelector('button[type="submit"]').disabled = locked;
  selectors.adminInternationalGenerate.disabled = locked || !request.conditions?.agreed;
  selectors.adminInternationalCancel.disabled = locked;
  selectors.adminInternationalWhatsapp.hidden = !request.whatsappUrl;
  selectors.adminInternationalWhatsapp.href = request.whatsappUrl || '#';
  if (!selectors.adminInternationalDialog.open) selectors.adminInternationalDialog.showModal();
  refreshIcons();
}

async function saveInternationalConditions(event) {
  event.preventDefault();
  const requestId = state.activeInternationalRequestId;
  if (!requestId || !selectors.adminInternationalForm.checkValidity()) {
    selectors.adminInternationalForm.reportValidity();
    return;
  }
  const submitButton = selectors.adminInternationalForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  selectors.adminInternationalMessage.textContent = 'Guardando condiciones...';
  try {
    const result = await apiRequest(`/api/admin/international-requests/${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        carrier: selectors.adminInternationalCarrier.value,
        shippingCost: selectors.adminInternationalShippingCost.value,
        estimatedDelivery: selectors.adminInternationalDeliveryTime.value,
        paymentTerms: selectors.adminInternationalTerms.value,
        internalNotes: selectors.adminInternationalNotes.value,
        agreed: selectors.adminInternationalAgreed.checked,
      }),
    });
    const index = state.adminInternationalRequests.findIndex((item) => item.id === requestId);
    state.adminInternationalRequests[index] = result.request;
    selectors.adminInternationalMessage.textContent = result.request.conditions?.agreed
      ? 'Condiciones guardadas y confirmadas. Ya puedes generar el pago.'
      : 'Condiciones guardadas. Confirma la aceptación del cliente antes de generar el pago.';
    selectors.adminInternationalMessage.className = 'form-message success';
    selectors.adminInternationalGenerate.disabled = !result.request.conditions?.agreed;
    renderAdminInternationalRequests();
    refreshIcons();
  } catch (error) {
    selectors.adminInternationalMessage.textContent = error.message;
    selectors.adminInternationalMessage.className = 'form-message error';
  } finally {
    submitButton.disabled = false;
  }
}

async function generateInternationalPayment() {
  const requestId = state.activeInternationalRequestId;
  if (!requestId) return;
  selectors.adminInternationalGenerate.disabled = true;
  selectors.adminInternationalMessage.textContent = 'Reservando inventario y generando el enlace seguro...';
  try {
    const result = await apiRequest(`/api/admin/international-requests/${encodeURIComponent(requestId)}/payment`, { method: 'POST' });
    const index = state.adminInternationalRequests.findIndex((item) => item.id === requestId);
    state.adminInternationalRequests[index] = result.request;
    openAdminInternationalRequest(requestId);
    selectors.adminInternationalMessage.textContent = 'Orden creada. El enlace está listo para enviarse por WhatsApp.';
    selectors.adminInternationalMessage.className = 'form-message success';
    renderAdminInternationalRequests();
    recordAdminActivity(`Orden internacional generada: ${requestId}.`);
  } catch (error) {
    selectors.adminInternationalMessage.textContent = error.message;
    selectors.adminInternationalMessage.className = 'form-message error';
    selectors.adminInternationalGenerate.disabled = false;
  }
}

async function cancelInternationalRequest() {
  const requestId = state.activeInternationalRequestId;
  if (!requestId || !window.confirm(`¿Cancelar la solicitud ${requestId}?`)) return;
  try {
    await apiRequest(`/api/admin/international-requests/${encodeURIComponent(requestId)}/cancel`, { method: 'POST' });
    closeAdminInternationalDialog();
    await loadAdminDashboard();
  } catch (error) {
    selectors.adminInternationalMessage.textContent = error.message;
    selectors.adminInternationalMessage.className = 'form-message error';
  }
}

function renderAdminPanel() {
  if (!selectors.adminStats || !isAdminLoggedIn()) return;

  populateAdminCategoryOptions();
  renderAdminStats();
  renderAdminOverviewCharts();
  renderAdminOperations();
  renderAdminCommercialContent();
  renderAdminInternationalRequests();
  renderAdminOrderManagement();
  renderAdminProducts();
  updateBackupState();
  setAdminView(state.activeAdminView, { scroll: false });
  refreshIcons();
}

function updateAdminViews() {
  if (!selectors.adminLoginView || !selectors.adminPanelView) return;

  const loggedIn = isAdminLoggedIn();
  selectors.adminLoginView.hidden = loggedIn;
  selectors.adminPanelView.hidden = !loggedIn;
  document.body.classList.toggle('admin-panel-active', loggedIn && state.currentRoute === 'admin');

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
        .slice(0, MAX_PRODUCT_IMAGES)
        .map(
          (image, index) => `
            <figure class="${index === 0 ? 'primary' : ''}" draggable="true" data-admin-image-index="${index}">
              <span class="admin-image-drag-handle" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>
              <img src="${escapeHtml(image)}" alt="Vista previa ${index + 1}" loading="lazy" />
              <button
                class="icon-button admin-image-remove"
                type="button"
                data-admin-image-remove="${index}"
                aria-label="Retirar imagen ${index + 1}"
                title="Retirar imagen"
              >
                <i data-lucide="trash-2"></i>
              </button>
              <figcaption>
                <span>${index === 0 ? 'Portada' : `Foto ${index + 1}`}</span>
                <span class="admin-image-order-actions">
                  <button type="button" data-admin-image-move="${index}" data-direction="-1" aria-label="Mover imagen a la izquierda"${index === 0 ? ' disabled' : ''}><i data-lucide="chevron-left"></i></button>
                  <button type="button" data-admin-image-move="${index}" data-direction="1" aria-label="Mover imagen a la derecha"${index === images.length - 1 ? ' disabled' : ''}><i data-lucide="chevron-right"></i></button>
                </span>
              </figcaption>
            </figure>
          `,
        )
        .join('')
    : '<p>Arrastra archivos al área superior o selecciónalos para crear la galería.</p>';
  refreshIcons();
}

function reorderAdminImage(fromIndex, toIndex) {
  const images = normalizeMultilineList(selectors.adminImages.value);
  if (
    state.adminImageUploading ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.length ||
    toIndex >= images.length
  ) return;
  const [image] = images.splice(fromIndex, 1);
  images.splice(toIndex, 0, image);
  selectors.adminImages.value = images.join('\n');
  setAdminFormMessage('Orden de la galería actualizado. Guarda el producto para publicarlo.');
  renderAdminImagePreview();
}

function renderAdminMeasurements() {
  if (!selectors.adminMeasurements || !selectors.adminMeasurementList) return;
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  selectors.adminMeasurementList.innerHTML = measurements.length
    ? measurements.map((measurement, index) => `
        <div class="admin-measurement-item">
          <input type="text" maxlength="80" value="${escapeHtml(measurement)}" data-admin-measurement-index="${index}" aria-label="Editar medida ${index + 1}" />
          <button class="icon-button danger-button" type="button" data-admin-measurement-remove="${index}" aria-label="Eliminar ${escapeHtml(measurement)}"><i data-lucide="trash-2"></i></button>
        </div>`).join('')
    : '<p>Agrega por lo menos una medida o talla para publicar el producto.</p>';
  refreshIcons();
}

function setAdminMeasurements(measurements) {
  selectors.adminMeasurements.value = measurements.map((item) => String(item).trim()).filter(Boolean).join(', ');
  renderAdminMeasurements();
}

function addAdminMeasurement() {
  const value = selectors.adminMeasurementEntry.value.trim();
  if (!value) {
    selectors.adminMeasurementEntry.focus();
    return;
  }
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  if (measurements.some((item) => normalizeText(item) === normalizeText(value))) {
    setAdminFormMessage('Esa medida ya está incluida en el producto.', 'error');
    return;
  }
  if (measurements.length >= 30) {
    setAdminFormMessage('Cada producto admite un máximo de 30 medidas.', 'error');
    return;
  }
  measurements.push(value);
  selectors.adminMeasurementEntry.value = '';
  setAdminMeasurements(measurements);
  setAdminFormMessage('Medida agregada. Guarda el producto para publicarla.');
  selectors.adminMeasurementEntry.focus();
}

function removeAdminMeasurement(index) {
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  measurements.splice(index, 1);
  setAdminMeasurements(measurements);
}

function updateAdminMeasurement(index, value) {
  const measurements = normalizeMeasurements(selectors.adminMeasurements.value);
  if (!measurements[index]) return;
  const cleaned = String(value).trim();
  if (!cleaned) {
    renderAdminMeasurements();
    return;
  }
  measurements[index] = cleaned;
  setAdminMeasurements(measurements);
  setAdminFormMessage('Medida actualizada. Guarda el producto para publicarla.');
}

function updateAdminImageUploadState() {
  if (!selectors.adminImageFiles) return;
  const storageReady = Boolean(state.adminStorage.configured);
  selectors.adminImageFiles.disabled = !storageReady || state.adminImageUploading;
  selectors.adminImageDrop?.classList.toggle('uploading', state.adminImageUploading);

  if (selectors.adminImageDropTitle) {
    selectors.adminImageDropTitle.textContent = state.adminImageUploading
      ? 'Subiendo imágenes al catálogo'
      : storageReady
        ? 'Arrastra imágenes o selecciónalas'
        : 'Carga directa pendiente de configuración';
  }
  if (selectors.adminImageDropDescription) {
    selectors.adminImageDropDescription.textContent = storageReady
      ? `JPEG, PNG, WebP o AVIF · máximo ${Math.round(state.adminStorage.maxImageSize / 1024 / 1024)} MB · hasta ${MAX_PRODUCT_IMAGES} fotos.`
      : 'Completa las cinco variables de Cloudflare R2 en Vercel y vuelve a desplegar.';
  }
  if (selectors.adminImageUploadStatus) selectors.adminImageUploadStatus.hidden = !state.adminImageUploading;
}

function setAdminUploadProgress(progress, message) {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  state.adminUploadProgress = normalizedProgress;
  if (selectors.adminImageUploadText) selectors.adminImageUploadText.textContent = message;
  if (selectors.adminImageUploadProgress) selectors.adminImageUploadProgress.textContent = `${normalizedProgress}%`;
  if (selectors.adminImageUploadBar) {
    selectors.adminImageUploadBar.value = normalizedProgress;
    selectors.adminImageUploadBar.textContent = `${normalizedProgress}%`;
  }
}

function setAdminFormMessage(message, type = '') {
  if (!selectors.adminFormMessage) return;
  selectors.adminFormMessage.textContent = message;
  selectors.adminFormMessage.classList.remove('error', 'success');
  if (type) selectors.adminFormMessage.classList.add(type);
}

function appendAdminImages(imageUrls) {
  const currentImages = normalizeMultilineList(selectors.adminImages.value);
  const mergedImages = [...new Set([...currentImages, ...imageUrls])].slice(0, MAX_PRODUCT_IMAGES);
  selectors.adminImages.value = mergedImages.join('\n');
  renderAdminImagePreview();
}

function uploadFileToSignedUrl(file, upload, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', upload.uploadUrl);
    request.setRequestHeader('Content-Type', upload.contentType);
    request.timeout = 120_000;
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`Cloudflare rechazó la imagen con estado ${request.status}.`));
    });
    request.addEventListener('error', () =>
      reject(new Error('No fue posible enviar la imagen a Cloudflare. Revisa la configuración CORS del bucket.')),
    );
    request.addEventListener('timeout', () => reject(new Error('La carga de la imagen tardó demasiado.')));
    request.send(file);
  });
}

function isManagedR2Image(publicUrl) {
  const baseUrl = String(state.adminStorage.publicUrl || '').replace(/\/+$/, '');
  return Boolean(baseUrl && String(publicUrl).startsWith(`${baseUrl}/products/`));
}

async function deleteR2Images(publicUrls) {
  const managedUrls = [...new Set(publicUrls.filter(isManagedR2Image))];
  if (!managedUrls.length) return [];
  return Promise.allSettled(
    managedUrls.map((publicUrl) =>
      apiRequest('/api/admin/uploads', {
        method: 'DELETE',
        body: JSON.stringify({ publicUrl }),
      }),
    ),
  );
}

async function discardPendingR2Uploads() {
  const pendingUrls = [...state.pendingR2Uploads];
  await deleteR2Images(pendingUrls);
  state.pendingR2Uploads.clear();
}

async function removeAdminImage(index) {
  if (state.adminImageUploading) return;
  const images = normalizeMultilineList(selectors.adminImages.value);
  const publicUrl = images[index];
  if (!publicUrl) return;

  if (state.pendingR2Uploads.has(publicUrl)) {
    const [result] = await deleteR2Images([publicUrl]);
    if (result?.status === 'rejected') {
      setAdminFormMessage('No fue posible retirar la imagen recién cargada. Inténtalo de nuevo.', 'error');
      return;
    }
    state.pendingR2Uploads.delete(publicUrl);
  }

  images.splice(index, 1);
  selectors.adminImages.value = images.join('\n');
  setAdminFormMessage('Imagen retirada de la galería. Guarda el producto para confirmar el cambio.');
  renderAdminImagePreview();
}

async function handleAdminImageFiles(files) {
  const imageFiles = Array.from(files || []);
  if (!imageFiles.length || state.adminImageUploading) return;
  if (!state.adminStorage.configured) {
    setAdminFormMessage('Cloudflare R2 todavía no está disponible en este despliegue.', 'error');
    return;
  }

  const acceptedTypes = new Set(state.adminStorage.acceptedTypes);
  const invalidType = imageFiles.find((file) => !acceptedTypes.has(file.type));
  if (invalidType) {
    setAdminFormMessage(`${invalidType.name} no es JPEG, PNG, WebP ni AVIF.`, 'error');
    return;
  }
  const oversizedFile = imageFiles.find((file) => file.size > state.adminStorage.maxImageSize || file.size < 1);
  if (oversizedFile) {
    setAdminFormMessage(`${oversizedFile.name} supera el límite permitido de 8 MB.`, 'error');
    return;
  }

  const currentImages = normalizeMultilineList(selectors.adminImages.value);
  if (currentImages.length + imageFiles.length > MAX_PRODUCT_IMAGES) {
    setAdminFormMessage(`Cada producto admite un máximo de ${MAX_PRODUCT_IMAGES} imágenes.`, 'error');
    return;
  }

  state.adminImageUploading = true;
  setAdminFormMessage('Preparando la carga segura de imágenes...');
  setAdminUploadProgress(0, `Preparando 1 de ${imageFiles.length}`);
  updateAdminImageUploadState();
  let uploadedCount = 0;

  try {
    for (let index = 0; index < imageFiles.length; index += 1) {
      const file = imageFiles[index];
      setAdminUploadProgress((index / imageFiles.length) * 100, `Subiendo ${index + 1} de ${imageFiles.length}: ${file.name}`);
      const result = await apiRequest('/api/admin/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectors.adminEditId.value || slugify(selectors.adminName.value) || 'nuevo-producto',
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      await uploadFileToSignedUrl(file, result.upload, (fileProgress) => {
        setAdminUploadProgress(
          ((index + fileProgress) / imageFiles.length) * 100,
          `Subiendo ${index + 1} de ${imageFiles.length}: ${file.name}`,
        );
      });
      state.pendingR2Uploads.add(result.upload.publicUrl);
      appendAdminImages([result.upload.publicUrl]);
      uploadedCount += 1;
    }

    setAdminUploadProgress(100, `${uploadedCount} ${uploadedCount === 1 ? 'imagen cargada' : 'imágenes cargadas'}`);
    setAdminFormMessage(
      `${uploadedCount} ${uploadedCount === 1 ? 'imagen fue cargada' : 'imágenes fueron cargadas'} correctamente. Guarda el producto para ${uploadedCount === 1 ? 'publicarla' : 'publicarlas'}.`,
      'success',
    );
    recordAdminActivity(`Carga de ${uploadedCount} ${uploadedCount === 1 ? 'imagen' : 'imágenes'} para el catálogo.`);
  } catch (error) {
    setAdminFormMessage(
      `${uploadedCount ? `Se cargaron ${uploadedCount} imágenes. ` : ''}${error.message || 'No fue posible completar la carga.'}`,
      'error',
    );
  } finally {
    state.adminImageUploading = false;
    updateAdminImageUploadState();
  }
}

function resetAdminForm() {
  if (!selectors.adminProductForm) return;

  state.editingProductId = null;
  state.originalAdminImages = [];
  state.pendingR2Uploads.clear();
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
  selectors.adminMeasurements.value = '';
  selectors.adminMeasurementEntry.value = '';
  selectors.adminDescription.value = '';
  selectors.adminFeatured.checked = false;
  selectors.adminFormMessage.textContent = '';
  selectors.adminFormMessage.classList.remove('error', 'success');
  populateAdminCategoryOptions();
  renderAdminImagePreview();
  renderAdminMeasurements();
}

function fillAdminForm(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !selectors.adminProductForm) return;

  state.editingProductId = product.id;
  state.originalAdminImages = [...getProductImages(product)];
  state.pendingR2Uploads.clear();
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
  renderAdminMeasurements();
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

  if (state.adminImageUploading) {
    setAdminFormMessage('Espera a que termine la carga de imágenes antes de guardar.', 'error');
    return;
  }

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
    selectors.adminMeasurementEntry.focus();
    return;
  }

  if (!product.images.length) {
    selectors.adminFormMessage.textContent = 'Agrega por lo menos una imagen para la galería.';
    selectors.adminFormMessage.classList.add('error');
    selectors.adminImageDrop.focus();
    return;
  }

  if (product.images.length > MAX_PRODUCT_IMAGES) {
    setAdminFormMessage(`Cada producto admite un máximo de ${MAX_PRODUCT_IMAGES} imágenes.`, 'error');
    selectors.adminImageDrop.focus();
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
    const removedManagedImages = state.originalAdminImages.filter(
      (image) => !savedProduct.images.includes(image) && isManagedR2Image(image),
    );
    const cleanupResults = await deleteR2Images(removedManagedImages);
    const cleanupFailed = cleanupResults.some((cleanup) => cleanup.status === 'rejected');
    resetAdminForm();
    refreshCatalogViews();
    setAdminFormMessage(
      cleanupFailed
        ? 'Producto guardado. Una imagen retirada quedó pendiente de limpieza en Cloudflare.'
        : 'Producto guardado en el catálogo y conectado con pagos.',
      'success',
    );
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
    state.activeAdminView = 'overview';
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
  await deleteR2Images([...state.pendingContentUploads]);
  state.pendingContentUploads.clear();
  try {
    await apiRequest('/api/admin/logout', { method: 'POST' });
  } catch {
    // La interfaz debe cerrar la sesión incluso si la solicitud de salida no responde.
  }
  state.adminAuthenticated = false;
  state.adminSessionChecked = true;
  state.adminUser = null;
  state.adminOrders = [];
  state.adminInternationalRequests = [];
  state.adminSummary = null;
  state.adminHeartbeatAt = 0;
  state.editingProductId = null;
  state.activeAdminView = 'overview';
  closeAdminOrderDialog();
  closeAdminInternationalDialog();
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

async function exportCatalogExcel() {
  if (!selectors.adminExportCatalog) return;
  selectors.adminExportCatalog.disabled = true;
  selectors.adminBackupStatus.textContent = 'Preparando archivo de Excel...';
  try {
    const response = await fetch('/api/admin/catalog/export', {
      credentials: 'same-origin',
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      const error = new Error(result.error || 'No fue posible generar el archivo de Excel.');
      error.status = response.status;
      throw error;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `querubim-catalogo-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    localStorage.setItem(ADMIN_BACKUP_KEY, new Date().toISOString());
    updateBackupState();
    recordAdminActivity('Exportación del catálogo en formato Excel.');
  } catch (error) {
    selectors.adminBackupStatus.textContent = error.message;
    if (error.status === 401) await checkAdminSession();
  } finally {
    selectors.adminExportCatalog.disabled = false;
  }
}

async function exportCatalogPdf() {
  if (!selectors.adminExportCatalogPdf) return;
  selectors.adminExportCatalogPdf.disabled = true;
  selectors.adminExportMessage.textContent = 'Preparando el catálogo PDF...';
  try {
    const response = await fetch('/api/admin/catalog/export/pdf', {
      credentials: 'same-origin',
      headers: { Accept: 'application/pdf' },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      const error = new Error(result.error || 'No fue posible generar el catálogo PDF.');
      error.status = response.status;
      throw error;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `querubim-catalogo-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    selectors.adminExportMessage.textContent = 'Catálogo PDF descargado correctamente.';
    recordAdminActivity('Descarga del catálogo comercial en formato PDF.');
  } catch (error) {
    selectors.adminExportMessage.textContent = error.message;
    if (error.status === 401) await checkAdminSession();
  } finally {
    selectors.adminExportCatalogPdf.disabled = false;
  }
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
  if (pathname === '/pago/internacional') return 'international-payment';
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
  document.body.classList.toggle('international-payment-route', route === 'international-payment');
  document.body.classList.toggle('admin-panel-active', route === 'admin' && isAdminLoggedIn());
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

  if (route === 'international-payment') {
    document.title = 'Pago internacional | Joyería Querubim';
    if (push) window.history.pushState({ route }, '', `/pago/internacional${window.location.search}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadInternationalPayment();
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
  document.querySelector('#admin-sidebar-toggle')?.addEventListener('click', () => {
    document.querySelector('#admin-app-sidebar')?.classList.add('open');
    document.body.classList.add('admin-sidebar-open');
  });
  document.querySelector('[data-admin-sidebar-close]')?.addEventListener('click', () => {
    document.querySelector('#admin-app-sidebar')?.classList.remove('open');
    document.body.classList.remove('admin-sidebar-open');
  });

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
  selectors.adminExportCatalog?.addEventListener('click', exportCatalogExcel);
  selectors.adminExportCatalogPdf?.addEventListener('click', exportCatalogPdf);
  selectors.adminProductForm?.addEventListener('submit', saveAdminProduct);
  selectors.adminCommercialForm?.addEventListener('submit', saveAdminCommercialContent);
  selectors.adminOrderForm?.addEventListener('submit', saveAdminOrder);
  selectors.adminInternationalForm?.addEventListener('submit', saveInternationalConditions);
  selectors.adminInternationalGenerate?.addEventListener('click', generateInternationalPayment);
  selectors.adminInternationalCancel?.addEventListener('click', cancelInternationalRequest);
  selectors.adminInternationalClose?.addEventListener('click', closeAdminInternationalDialog);
  selectors.adminOrderClose?.addEventListener('click', closeAdminOrderDialog);
  selectors.adminOrderCancel?.addEventListener('click', closeAdminOrderDialog);
  selectors.adminOrderDelete?.addEventListener('click', deleteAdminOrder);
  selectors.adminOrderSearch?.addEventListener('input', (event) => {
    state.adminOrderQuery = event.target.value;
    state.adminOrderPage = 1;
    renderAdminOrderManagement();
    refreshIcons();
  });
  selectors.adminOrderFilter?.addEventListener('change', (event) => {
    state.adminOrderFilter = event.target.value;
    state.adminOrderPage = 1;
    renderAdminOrderManagement();
    refreshIcons();
  });
  selectors.adminCancelEdit?.addEventListener('click', async () => {
    await discardPendingR2Uploads();
    resetAdminForm();
  });
  selectors.adminImages?.addEventListener('input', renderAdminImagePreview);
  selectors.adminImageFiles?.addEventListener('change', (event) => {
    handleAdminImageFiles(event.target.files);
    event.target.value = '';
  });
  selectors.adminCommercialForm?.addEventListener('change', (event) => {
    const upload = event.target.closest('[data-content-upload]');
    if (!upload) return;
    uploadCommercialImage(upload.dataset.contentUpload, upload.files?.[0]);
    upload.value = '';
  });
  selectors.adminImageDrop?.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!selectors.adminImageFiles.disabled) selectors.adminImageDrop.classList.add('dragging');
  });
  selectors.adminImageDrop?.addEventListener('dragleave', () => {
    selectors.adminImageDrop.classList.remove('dragging');
  });
  selectors.adminImageDrop?.addEventListener('drop', (event) => {
    event.preventDefault();
    selectors.adminImageDrop.classList.remove('dragging');
    handleAdminImageFiles(event.dataTransfer.files);
  });
  selectors.adminImagePreview?.addEventListener('dragstart', (event) => {
    const figure = event.target.closest('[data-admin-image-index]');
    if (!figure || state.adminImageUploading) return;
    state.adminDraggedImageIndex = Number(figure.dataset.adminImageIndex);
    figure.classList.add('drag-source');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', figure.dataset.adminImageIndex);
  });
  selectors.adminImagePreview?.addEventListener('dragover', (event) => {
    const figure = event.target.closest('[data-admin-image-index]');
    if (!figure || state.adminDraggedImageIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    selectors.adminImagePreview.querySelectorAll('.drag-target').forEach((item) => item.classList.remove('drag-target'));
    figure.classList.add('drag-target');
  });
  selectors.adminImagePreview?.addEventListener('drop', (event) => {
    const figure = event.target.closest('[data-admin-image-index]');
    if (!figure || state.adminDraggedImageIndex === null) return;
    event.preventDefault();
    reorderAdminImage(state.adminDraggedImageIndex, Number(figure.dataset.adminImageIndex));
    state.adminDraggedImageIndex = null;
  });
  selectors.adminImagePreview?.addEventListener('dragend', () => {
    state.adminDraggedImageIndex = null;
    selectors.adminImagePreview.querySelectorAll('.drag-source, .drag-target').forEach((item) =>
      item.classList.remove('drag-source', 'drag-target'),
    );
  });
  selectors.adminMeasurementAdd?.addEventListener('click', addAdminMeasurement);
  selectors.adminMeasurementEntry?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addAdminMeasurement();
  });
  selectors.adminMeasurementList?.addEventListener('change', (event) => {
    const input = event.target.closest('[data-admin-measurement-index]');
    if (input) updateAdminMeasurement(Number(input.dataset.adminMeasurementIndex), input.value);
  });
  selectors.adminSearchInput?.addEventListener('input', (event) => {
    state.adminQuery = event.target.value;
    renderAdminProducts();
    refreshIcons();
  });
  selectors.adminCategoryFilter?.addEventListener('change', (event) => {
    state.adminCategoryFilter = event.target.value;
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

  document.addEventListener('click', async (event) => {
    const productButton = event.target.closest('[data-open-product]');
    const imageButton = event.target.closest('[data-image-index]');
    const removeButton = event.target.closest('[data-remove-cart]');
    const routeLink = event.target.closest('[data-route-link]');
    const adminEditButton = event.target.closest('[data-admin-edit]');
    const adminDeleteButton = event.target.closest('[data-admin-delete]');
    const adminImageRemoveButton = event.target.closest('[data-admin-image-remove]');
    const adminImageMoveButton = event.target.closest('[data-admin-image-move]');
    const adminMeasurementRemoveButton = event.target.closest('[data-admin-measurement-remove]');
    const adminOrderButton = event.target.closest('[data-admin-order]');
    const adminOrderPageButton = event.target.closest('[data-admin-order-page]');
    const adminInternationalButton = event.target.closest('[data-admin-international]');
    const contentRemoveButton = event.target.closest('[data-content-remove]');
    const adminViewButton = event.target.closest('[data-admin-view-target]');

    if (routeLink) {
      event.preventDefault();
      if (standaloneRoutes.has(routeLink.dataset.routeLink)) {
        setRoute(routeLink.dataset.routeLink);
      } else setRoute('home', { targetSection: routeLink.dataset.targetSection || 'home' });
      return;
    }

    if (adminViewButton) {
      setAdminView(adminViewButton.dataset.adminViewTarget);
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
    if (adminImageRemoveButton) await removeAdminImage(Number(adminImageRemoveButton.dataset.adminImageRemove));
    if (adminImageMoveButton && !adminImageMoveButton.disabled) {
      const index = Number(adminImageMoveButton.dataset.adminImageMove);
      reorderAdminImage(index, index + Number(adminImageMoveButton.dataset.direction));
    }
    if (adminMeasurementRemoveButton) removeAdminMeasurement(Number(adminMeasurementRemoveButton.dataset.adminMeasurementRemove));
    if (adminEditButton) {
      if (state.pendingR2Uploads.size) {
        const shouldDiscard = window.confirm('Hay imágenes nuevas sin guardar. ¿Deseas descartarlas y editar otro producto?');
        if (!shouldDiscard) return;
        await discardPendingR2Uploads();
      }
      fillAdminForm(adminEditButton.dataset.adminEdit);
    }
    if (adminDeleteButton) deleteAdminProduct(adminDeleteButton.dataset.adminDelete);
    if (adminOrderButton) openAdminOrder(adminOrderButton.dataset.adminOrder);
    if (adminInternationalButton) openAdminInternationalRequest(adminInternationalButton.dataset.adminInternational);
    if (contentRemoveButton) {
      const slot = contentRemoveButton.dataset.contentRemove;
      const field = selectors.adminCommercialForm.querySelector(`[data-content-field="${slot}.imageUrl"]`);
      const currentUrl = field.value;
      if (state.pendingContentUploads.has(currentUrl)) {
        await deleteR2Images([currentUrl]);
        state.pendingContentUploads.delete(currentUrl);
      }
      field.value = '';
      state.siteContent[slot].imageUrl = '';
      renderCommercialPreview(slot, '');
      selectors.adminCommercialMessage.textContent = 'Imagen retirada. Publica los cambios para confirmar.';
      selectors.adminCommercialMessage.className = 'form-message';
      refreshIcons();
    }
    if (adminOrderPageButton && !adminOrderPageButton.disabled) {
      state.adminOrderPage = Number(adminOrderPageButton.dataset.adminOrderPage) || 1;
      renderAdminOrderManagement();
      refreshIcons();
    }
  });

  selectors.detailMeasure.addEventListener('change', () => {
    selectors.detailWhatsapp.href = buildWhatsAppLink(state.activeProduct, selectors.detailMeasure.value);
    selectors.detailMessage.textContent = '';
    selectors.detailMessage.classList.remove('error', 'success');
  });

  selectors.detailAddCart.addEventListener('click', addActiveProductToCart);
  selectors.checkoutDeliveryMethod.addEventListener('change', syncCheckoutDeliveryForm);
  selectors.checkoutDestination.addEventListener('change', syncCheckoutDeliveryForm);
  selectors.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  selectors.paymentResultRefresh.addEventListener('click', () => consultPaymentOrder({ scheduleNext: true }));
  selectors.internationalPaymentOpen.addEventListener('click', openInternationalPayment);

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
updateAdminImageUploadState();
loadPublicCatalog();
loadSiteContent();
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
