import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Check,
  Circle,
  Crown,
  Diamond,
  Download,
  Gem,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  createIcons,
} from 'lucide';

const products = [
  {
    id: 'solara-ring',
    name: 'Solara Ring',
    category: 'Anillos de autor',
    model: 'AUR-R01',
    tag: 'Alta joya',
    price: '$2,480',
    description: 'Anillo escultorico con aro pulido, engaste elevado y gema facetada color esmeralda.',
    icon: 'gem',
    gem: '#0f8f7f',
    reference: '/reference-images/solara-ring.png',
    modelHint: 'solara-ring.glb',
    modelUrl: '/3dmodels/gold ring with emerald 3d model.glb',
    modelFileName: 'gold ring with emerald 3d model.glb',
    colors: ['#d6b35d', '#d9dde1', '#c78b7a', '#1f2328'],
    specs: [
      ['Metal', 'Oro 18K'],
      ['Gema', 'Esmeralda'],
      ['Talla', 'Brillante'],
      ['Peso', '6.2 g'],
    ],
    features: [
      ['Engaste alto', 'La gema queda suspendida para capturar luz lateral.'],
      ['Aro confort', 'Interior redondeado para uso diario.'],
      ['Pulido espejo', 'Superficie brillante con contraste de sombra fina.'],
    ],
    build: buildRing,
  },
  {
    id: 'luna-necklace',
    name: 'Luna Drop',
    category: 'Collares con dije',
    model: 'AUR-N08',
    tag: 'Edicion gala',
    price: '$3,150',
    description: 'Collar de eslabones finos con dije central tipo lagrima y corona de microgemas.',
    icon: 'diamond',
    gem: '#2f5fd0',
    reference: '/reference-images/luna-drop-necklace.png',
    modelHint: 'luna-drop-necklace.glb',
    colors: ['#d9dde1', '#d6b35d', '#e7e2dc', '#111217'],
    specs: [
      ['Largo', '45 cm'],
      ['Dije', 'Zafiro'],
      ['Cierre', 'Invisible'],
      ['Microgemas', '18 piezas'],
    ],
    features: [
      ['Caida precisa', 'Cadena curva pensada para centrar el dije.'],
      ['Dije facetado', 'Volumen de lagrima con brillo profundo.'],
      ['Cierre oculto', 'Sistema posterior limpio para una vista continua.'],
    ],
    build: buildNecklace,
  },
  {
    id: 'rosa-earrings',
    name: 'Rosa Orbit',
    category: 'Aretes colgantes',
    model: 'AUR-E04',
    tag: 'Par firmado',
    price: '$1,920',
    description: 'Aretes dobles con aro delicado, perla superior y gema colgante en tono rubi.',
    icon: 'crown',
    gem: '#b91c45',
    reference: '/reference-images/rosa-orbit-earrings.png',
    modelHint: 'rosa-orbit-earrings.glb',
    colors: ['#c78b7a', '#d6b35d', '#d9dde1', '#2b1f24'],
    specs: [
      ['Largo', '32 mm'],
      ['Gema', 'Rubi'],
      ['Perla', 'Cultivada'],
      ['Par', '7.8 g'],
    ],
    features: [
      ['Movimiento leve', 'Dije inferior separado para reflejos al caminar.'],
      ['Aro oval', 'Silueta fina que enmarca la piedra central.'],
      ['Perla satelital', 'Punto de luz superior con brillo suave.'],
    ],
    build: buildEarrings,
  },
  {
    id: 'astra-bracelet',
    name: 'Astra Cuff',
    category: 'Brazaletes',
    model: 'AUR-B12',
    tag: 'Serie limitada',
    price: '$2,760',
    description: 'Brazalete rigido con perfil ovalado y constelacion de gemas sobre el borde frontal.',
    icon: 'circle',
    gem: '#7c3aed',
    reference: '/reference-images/astra-cuff-bracelet.png',
    modelHint: 'astra-cuff-bracelet.glb',
    modelUrl: '/3dmodels/gold bracelet 3d model.glb',
    modelFileName: 'gold bracelet 3d model.glb',
    colors: ['#d6b35d', '#d9dde1', '#c78b7a', '#13151a'],
    specs: [
      ['Diametro', '58 mm'],
      ['Perfil', 'Ovalado'],
      ['Gemas', 'Amatista'],
      ['Acabado', 'Pulido'],
    ],
    features: [
      ['Cuff rigido', 'Volumen oval que mantiene una forma arquitectonica.'],
      ['Gemas graduales', 'Piedras de distinto tamano sobre el arco frontal.'],
      ['Borde suave', 'Cantos redondeados para una sensacion ligera.'],
    ],
    build: buildBracelet,
  },
];

const state = {
  product: products[0],
  color: products[0].colors[0],
  finish: 'polished',
  spinning: true,
  productGroup: null,
  customModels: new Map(),
  loadingModels: new Set(),
  modelLoadErrors: new Set(),
};

const iconRegistry = {
  ArrowRight,
  BadgeCheck,
  Box,
  Check,
  Circle,
  Crown,
  Diamond,
  Download,
  Gem,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
};

createIcons({ icons: iconRegistry });

const heroCanvas = document.querySelector('#hero-canvas');
const heroStage = document.querySelector('.hero-section');
const canvas = document.querySelector('#product-canvas');
const stage = document.querySelector('.viewer-stage');
const gltfLoader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#edf3f1');
scene.fog = new THREE.Fog('#edf3f1', 8, 18);

const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(3.9, 2.25, 5.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.82;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 8.5;
controls.minPolarAngle = Math.PI * 0.28;
controls.maxPolarAngle = Math.PI * 0.58;
controls.target.set(0, 0.34, 0);

const hemiLight = new THREE.HemisphereLight('#ffffff', '#b7c7c1', 2.45);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight('#ffffff', 4.8);
keyLight.position.set(4, 6, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 16;
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
scene.add(keyLight);

const goldLight = new THREE.PointLight('#d6b35d', 9, 8);
goldLight.position.set(-3.5, 2.3, -2.2);
scene.add(goldLight);

const emeraldLight = new THREE.PointLight('#0f8f7f', 7, 7);
emeraldLight.position.set(3.2, 1.4, -3.4);
scene.add(emeraldLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4.5, 96),
  new THREE.MeshStandardMaterial({
    color: '#fbfcfa',
    roughness: 0.5,
    metalness: 0,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.24;
floor.receiveShadow = true;
scene.add(floor);

const floorRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.25, 0.012, 12, 160),
  new THREE.MeshBasicMaterial({ color: '#b99a4d', transparent: true, opacity: 0.34 }),
);
floorRing.rotation.x = -Math.PI / 2;
floorRing.position.y = -1.215;
scene.add(floorRing);

function productMaterial(color, finish = state.finish) {
  const finishMap = {
    satin: { roughness: 0.42, metalness: 0.88, clearcoat: 0.18 },
    polished: { roughness: 0.16, metalness: 0.92, clearcoat: 0.7 },
    signature: { roughness: 0.22, metalness: 1, clearcoat: 0.92 },
  };

  return new THREE.MeshPhysicalMaterial({
    color,
    ...finishMap[finish],
  });
}

function darkMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#17181d',
    roughness: 0.56,
    metalness: 0.24,
  });
}

function pearlMaterial(color = '#f5f1ea') {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.76,
    sheen: 0.35,
  });
}

function gemMaterial(color = '#0f8f7f') {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.28,
    transparent: true,
    opacity: 0.84,
    clearcoat: 1,
    ior: 1.68,
  });
}

function addMesh(group, geometry, material, options = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(options.x ?? 0, options.y ?? 0, options.z ?? 0);
  mesh.rotation.set(options.rx ?? 0, options.ry ?? 0, options.rz ?? 0);
  mesh.scale.set(options.sx ?? 1, options.sy ?? 1, options.sz ?? 1);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  group.add(mesh);
  return mesh;
}

function addEdgeOutline(group, mesh, color = '#ffffff', opacity = 0.2) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, 24),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  group.add(edges);
  return edges;
}

function addGem(group, color, options = {}) {
  const gem = addMesh(group, new THREE.OctahedronGeometry(options.size ?? 0.28, 0), gemMaterial(color), options);
  addEdgeOutline(group, gem, '#ffffff', 0.28);
  return gem;
}

function buildRing(color, finish, product) {
  const group = new THREE.Group();
  const metal = productMaterial(color, finish);
  const shadow = darkMaterial();

  const band = addMesh(group, new THREE.TorusGeometry(0.88, 0.085, 32, 128), metal, {
    y: -0.08,
    sx: 1.04,
    sy: 0.86,
  });
  addEdgeOutline(group, band, '#ffffff', 0.16);

  addMesh(group, new THREE.TorusGeometry(0.66, 0.018, 18, 96), shadow, {
    y: -0.08,
    z: 0.02,
    sx: 1.04,
    sy: 0.86,
  });

  const setting = addMesh(group, new THREE.CylinderGeometry(0.34, 0.44, 0.2, 8), metal, {
    y: 0.76,
    z: 0,
    rx: Math.PI / 2,
    rz: Math.PI / 8,
  });
  addEdgeOutline(group, setting, '#ffffff', 0.2);

  addGem(group, product.gem, {
    size: 0.38,
    y: 0.93,
    z: 0.1,
    sx: 0.95,
    sy: 1.08,
    sz: 0.72,
    rz: Math.PI / 4,
  });

  [-0.24, 0.24].forEach((x) => {
    addMesh(group, new THREE.CylinderGeometry(0.032, 0.032, 0.28, 16), metal, {
      x,
      y: 0.78,
      z: 0.12,
      rx: 0.42,
      rz: x > 0 ? -0.18 : 0.18,
    });
  });

  group.position.y = -0.12;
  return group;
}

function buildNecklace(color, finish, product) {
  const group = new THREE.Group();
  const metal = productMaterial(color, finish);
  const gem = gemMaterial(product.gem);
  const pearl = pearlMaterial('#faf6ed');

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.36, 0.95, 0),
    new THREE.Vector3(-1.03, 0.18, 0.02),
    new THREE.Vector3(-0.38, -0.42, 0.03),
    new THREE.Vector3(0, -0.58, 0.04),
    new THREE.Vector3(0.38, -0.42, 0.03),
    new THREE.Vector3(1.03, 0.18, 0.02),
    new THREE.Vector3(1.36, 0.95, 0),
  ]);

  addMesh(group, new THREE.TubeGeometry(curve, 120, 0.027, 14, false), metal);

  for (let i = 0; i <= 22; i += 1) {
    const point = curve.getPoint(i / 22);
    addMesh(group, new THREE.SphereGeometry(i % 2 === 0 ? 0.045 : 0.034, 14, 14), metal, {
      x: point.x,
      y: point.y,
      z: point.z + 0.045,
    });
  }

  addMesh(group, new THREE.TorusGeometry(0.2, 0.022, 16, 64), metal, { y: -0.55, z: 0.04 });
  addMesh(group, new THREE.SphereGeometry(0.075, 20, 20), pearl, { y: -0.73, z: 0.07 });

  const pendant = addMesh(group, new THREE.OctahedronGeometry(0.42, 1), gem, {
    y: -1.02,
    z: 0.08,
    sx: 0.78,
    sy: 1.18,
    sz: 0.58,
  });
  addEdgeOutline(group, pendant, '#ffffff', 0.24);

  [-0.26, -0.13, 0, 0.13, 0.26].forEach((x, index) => {
    addMesh(group, new THREE.SphereGeometry(0.045 + index * 0.003, 16, 16), gemMaterial('#ffffff'), {
      x,
      y: -0.72 + Math.abs(x) * 0.22,
      z: 0.16,
    });
  });

  group.position.y = 0.05;
  return group;
}

function buildEarrings(color, finish, product) {
  const group = new THREE.Group();
  const metal = productMaterial(color, finish);
  const pearl = pearlMaterial();

  [-0.62, 0.62].forEach((side) => {
    const hookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side - 0.12, 0.98, 0),
      new THREE.Vector3(side + 0.02, 1.18, 0.03),
      new THREE.Vector3(side + 0.18, 1.02, 0.02),
      new THREE.Vector3(side + 0.08, 0.82, 0),
    ]);
    addMesh(group, new THREE.TubeGeometry(hookCurve, 42, 0.023, 12, false), metal);

    addMesh(group, new THREE.SphereGeometry(0.14, 24, 24), pearl, { x: side, y: 0.62, z: 0.06 });

    const hoop = addMesh(group, new THREE.TorusGeometry(0.36, 0.031, 20, 96), metal, {
      x: side,
      y: 0.14,
      z: 0,
      sy: 1.16,
    });
    addEdgeOutline(group, hoop, '#ffffff', 0.14);

    addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.38, 14), metal, {
      x: side,
      y: -0.36,
      z: 0.06,
    });

    addGem(group, product.gem, {
      size: 0.27,
      x: side,
      y: -0.66,
      z: 0.09,
      sx: 0.82,
      sy: 1.18,
      sz: 0.58,
      rz: Math.PI / 4,
    });
  });

  group.position.y = -0.05;
  return group;
}

function buildBracelet(color, finish, product) {
  const group = new THREE.Group();
  const metal = productMaterial(color, finish);
  const inner = darkMaterial();

  const cuff = addMesh(group, new THREE.TorusGeometry(0.96, 0.1, 32, 160), metal, {
    y: 0.05,
    sx: 1.46,
    sy: 0.66,
    rx: -0.08,
  });
  addEdgeOutline(group, cuff, '#ffffff', 0.14);

  addMesh(group, new THREE.TorusGeometry(0.73, 0.017, 18, 140), inner, {
    y: 0.05,
    z: 0.04,
    sx: 1.46,
    sy: 0.66,
    rx: -0.08,
  });

  const gemAngles = [38, 56, 74, 92, 110, 128, 146];
  gemAngles.forEach((degree, index) => {
    const angle = THREE.MathUtils.degToRad(degree);
    const size = index === 3 ? 0.14 : 0.095 + Math.abs(3 - index) * -0.006;
    addGem(group, product.gem, {
      size,
      x: Math.cos(angle) * 1.38,
      y: Math.sin(angle) * 0.64 + 0.05,
      z: 0.16,
      sx: 1,
      sy: 0.92,
      sz: 0.72,
      rz: angle,
    });
  });

  [-1, 1].forEach((side) => {
    addMesh(group, new THREE.SphereGeometry(0.13, 24, 24), metal, {
      x: side * 1.42,
      y: 0.07,
      z: 0.04,
    });
  });

  group.position.y = -0.08;
  return group;
}

function createHeroExperience() {
  if (!heroCanvas || !heroStage) return null;

  const heroRenderer = new THREE.WebGLRenderer({
    canvas: heroCanvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.setSize(heroStage.clientWidth, heroStage.clientHeight);
  heroRenderer.outputColorSpace = THREE.SRGBColorSpace;
  heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  heroRenderer.toneMappingExposure = 1.16;
  heroRenderer.shadowMap.enabled = true;
  heroRenderer.shadowMap.type = THREE.PCFShadowMap;

  const heroScene = new THREE.Scene();
  heroScene.background = new THREE.Color('#eef5f1');
  heroScene.fog = new THREE.Fog('#eef5f1', 8, 18);

  const heroCamera = new THREE.PerspectiveCamera(34, heroStage.clientWidth / heroStage.clientHeight, 0.1, 100);
  heroCamera.position.set(3.5, 2.1, 5.6);
  heroCamera.lookAt(0.42, -0.05, 0);

  heroScene.add(new THREE.HemisphereLight('#ffffff', '#b8c5bd', 2.2));

  const heroKey = new THREE.DirectionalLight('#ffffff', 4.7);
  heroKey.position.set(4, 5.8, 4.5);
  heroKey.castShadow = true;
  heroKey.shadow.mapSize.set(2048, 2048);
  heroKey.shadow.camera.near = 0.5;
  heroKey.shadow.camera.far = 16;
  heroKey.shadow.camera.left = -5;
  heroKey.shadow.camera.right = 5;
  heroKey.shadow.camera.top = 5;
  heroKey.shadow.camera.bottom = -5;
  heroScene.add(heroKey);

  const warm = new THREE.PointLight('#d6b35d', 8, 8);
  warm.position.set(-3.2, 2.4, -2.2);
  heroScene.add(warm);

  const cool = new THREE.PointLight('#0f8f7f', 6, 7);
  cool.position.set(3.1, 1.6, -3.4);
  heroScene.add(cool);

  const heroFloor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 96),
    new THREE.MeshStandardMaterial({ color: '#fbfcfa', roughness: 0.55, metalness: 0 }),
  );
  heroFloor.rotation.x = -Math.PI / 2;
  heroFloor.position.y = -1.25;
  heroFloor.receiveShadow = true;
  heroScene.add(heroFloor);

  const heroRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.18, 0.014, 12, 160),
    new THREE.MeshBasicMaterial({ color: '#d6b35d', transparent: true, opacity: 0.34 }),
  );
  heroRing.rotation.x = -Math.PI / 2;
  heroRing.position.y = -1.22;
  heroScene.add(heroRing);

  const heroGroup = new THREE.Group();
  const ring = products[0].build('#d6b35d', 'signature', products[0]);
  ring.position.set(-0.92, -0.18, 0.18);
  ring.rotation.set(-0.18, 0.24, -0.28);
  ring.scale.set(1.16, 1.16, 1.16);
  heroGroup.add(ring);

  const earrings = products[2].build('#c78b7a', 'polished', products[2]);
  earrings.position.set(1.02, -0.05, -0.24);
  earrings.rotation.set(0.08, -0.28, 0.18);
  earrings.scale.set(0.92, 0.92, 0.92);
  heroGroup.add(earrings);

  const cuff = products[3].build('#d9dde1', 'satin', products[3]);
  cuff.position.set(0.28, -0.92, -0.72);
  cuff.rotation.set(0.34, 0.18, -0.08);
  cuff.scale.set(0.9, 0.9, 0.9);
  heroGroup.add(cuff);

  heroScene.add(heroGroup);

  const heroResizeObserver = new ResizeObserver(() => {
    const width = heroStage.clientWidth;
    const height = heroStage.clientHeight;
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(width, height);
  });
  heroResizeObserver.observe(heroStage);

  return {
    camera: heroCamera,
    floorRing: heroRing,
    group: heroGroup,
    renderer: heroRenderer,
    scene: heroScene,
  };
}

function setProduct(product) {
  state.product = product;
  state.color = product.colors[0];
  camera.position.set(3.9, 2.25, 5.2);
  controls.target.set(0, 0.34, 0);
  controls.update();
  renderProduct();
  renderUI();
}

function disposeObject(group) {
  group.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => material.dispose());
      } else {
        node.material.dispose();
      }
    }
  });
}

function clearCurrentProduct() {
  if (!state.productGroup) return;
  scene.remove(state.productGroup);
  if (state.productGroup.userData.disposeOnRemove) {
    disposeObject(state.productGroup);
  }
  state.productGroup = null;
}

function renderProduct() {
  clearCurrentProduct();

  if (state.customModels.has(state.product.id)) {
    state.productGroup = state.customModels.get(state.product.id).group;
    state.productGroup.userData.disposeOnRemove = false;
  } else {
    state.productGroup = state.product.build(state.color, state.finish, state.product);
    state.productGroup.userData.disposeOnRemove = true;
  }
  state.productGroup.rotation.y = -0.35;
  scene.add(state.productGroup);

  if (state.product.modelUrl && !state.customModels.has(state.product.id)) {
    loadBuiltInModel(state.product);
  }
}

function renderProductList() {
  const list = document.querySelector('#product-list');
  list.innerHTML = products
    .map(
      (product) => `
        <button
          class="product-card ${product.id === state.product.id ? 'active' : ''}"
          type="button"
          role="option"
          aria-selected="${product.id === state.product.id}"
          data-product="${product.id}"
        >
          <span class="product-thumb product-image-thumb" style="--thumb-color: ${product.gem}">
            <img src="${product.reference}" alt="" />
          </span>
          <span class="product-copy">
            <strong>${product.name}</strong>
            <span>${product.category}</span>
            <small>${getProductModelLabel(product)}</small>
          </span>
        </button>
      `,
    )
    .join('');

  list.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = products.find((item) => item.id === button.dataset.product);
      setProduct(product);
    });
  });
}

function renderReferenceGallery() {
  const grid = document.querySelector('#reference-grid');
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (product) => `
        <article class="reference-card">
          <a href="${product.reference}" download>
            <img src="${product.reference}" alt="Referencia de ${product.name}" />
          </a>
          <div>
            <span>${product.category}</span>
            <strong>${product.name}</strong>
            <a href="${product.reference}" download>
              <i data-lucide="download"></i>
              Descargar PNG
            </a>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderSwatches() {
  const swatches = document.querySelector('#color-swatches');
  swatches.innerHTML = state.product.colors
    .map(
      (color) => `
        <button
          class="swatch ${color === state.color ? 'active' : ''}"
          type="button"
          style="--swatch-color: ${color}"
          data-color="${color}"
          aria-label="Metal ${color}"
        ></button>
      `,
    )
    .join('');

  swatches.querySelectorAll('[data-color]').forEach((button) => {
    button.addEventListener('click', () => {
      state.color = button.dataset.color;
      renderProduct();
      renderUI();
    });
  });
}

function renderSpecs() {
  const specs = document.querySelector('#spec-grid');
  specs.innerHTML = state.product.specs
    .map(
      ([label, value]) => `
        <div class="spec-item">
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `,
    )
    .join('');
}

function renderFeatures() {
  const icons = ['shield-check', 'sparkles', 'badge-check'];
  const featureList = document.querySelector('#feature-list');
  featureList.innerHTML = state.product.features
    .map(
      ([title, copy], index) => `
        <div class="feature-item">
          <span class="feature-icon">
            <i data-lucide="${icons[index] ?? 'sparkles'}"></i>
          </span>
          <span class="feature-copy">
            <strong>${title}</strong>
            <span>${copy}</span>
          </span>
        </div>
      `,
    )
    .join('');
}

function renderFinishOptions() {
  document.querySelectorAll('[data-finish]').forEach((button) => {
    button.classList.toggle('active', button.dataset.finish === state.finish);
  });
}

function getProductModelLabel(product) {
  const model = state.customModels.get(product.id);
  if (model?.source === 'built-in') return 'Vision 360 lista';
  if (model) return 'Modelo personalizado';
  if (state.loadingModels.has(product.id)) return 'Cargando 360';
  if (product.modelUrl) return 'Vision 360 disponible';
  return 'Referencia lista';
}

function renderModelStatus() {
  const modelStatus = document.querySelector('#model-status');
  const uploadInput = document.querySelector('#model-upload');
  const model = state.customModels.get(state.product.id);
  const compactStatus = window.matchMedia('(max-width: 560px)').matches;
  if (modelStatus) {
    if (model?.source === 'built-in') {
      modelStatus.textContent = compactStatus ? 'Vision 360 lista' : `Vision 360 lista: ${model.fileName}`;
    } else if (model) {
      modelStatus.textContent = compactStatus ? 'Modelo personalizado' : `Modelo personalizado: ${model.fileName}`;
    } else if (state.loadingModels.has(state.product.id)) {
      modelStatus.textContent = 'Cargando vision 360...';
    } else if (state.modelLoadErrors.has(state.product.id)) {
      modelStatus.textContent = 'No se pudo cargar el modelo base.';
    } else if (state.product.modelUrl) {
      modelStatus.textContent = `Preparando ${state.product.modelFileName}`;
    } else {
      modelStatus.textContent = `Demo provisional: ${state.product.modelHint}`;
    }
  }
  if (uploadInput) {
    uploadInput.value = '';
  }
}

function renderUI() {
  document.querySelector('#active-category').textContent = state.product.category;
  document.querySelector('#active-model').textContent = state.product.model;
  document.querySelector('#product-tag').textContent = state.product.tag;
  document.querySelector('#active-name').textContent = state.product.name;
  document.querySelector('#active-description').textContent = state.product.description;
  document.querySelector('#active-price').textContent = state.product.price;
  document.querySelector('#active-reference').src = state.product.reference;
  document.querySelector('#active-reference').alt = `Referencia de ${state.product.name}`;
  document.querySelector('#download-reference').href = state.product.reference;
  document.querySelector('#download-reference').setAttribute('download', `${state.product.id}-reference.png`);
  document.querySelector('#toggle-spin').setAttribute('aria-label', state.spinning ? 'Pausar rotacion' : 'Activar rotacion');
  document.querySelector('#toggle-spin').innerHTML = `<i data-lucide="${state.spinning ? 'pause' : 'play'}"></i>`;

  renderProductList();
  renderReferenceGallery();
  renderSwatches();
  renderSpecs();
  renderFeatures();
  renderFinishOptions();
  renderModelStatus();
  createIcons({ icons: iconRegistry });
}

function normalizeImportedModel(model) {
  const wrapper = new THREE.Group();
  wrapper.add(model);

  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          material.needsUpdate = true;
        });
      }
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.45 / maxDimension;
  model.scale.setScalar(scale);
  model.position.copy(center).multiplyScalar(-scale);
  wrapper.userData.disposeOnRemove = false;
  return wrapper;
}

function replaceCustomModel(productId, fileName, objectUrl, group, source = 'upload') {
  const previous = state.customModels.get(productId);
  if (previous) {
    scene.remove(previous.group);
    disposeObject(previous.group);
    if (previous.objectUrl) URL.revokeObjectURL(previous.objectUrl);
  }

  state.customModels.set(productId, { fileName, objectUrl, group, source });
}

function loadBuiltInModel(product) {
  if (!product.modelUrl || state.customModels.has(product.id) || state.loadingModels.has(product.id)) return;

  state.loadingModels.add(product.id);
  state.modelLoadErrors.delete(product.id);
  renderModelStatus();
  renderProductList();

  gltfLoader.load(
    product.modelUrl,
    (gltf) => {
      const group = normalizeImportedModel(gltf.scene);
      state.loadingModels.delete(product.id);
      replaceCustomModel(product.id, product.modelFileName, null, group, 'built-in');

      if (state.product.id === product.id) {
        renderProduct();
      }
      renderUI();
    },
    undefined,
    () => {
      state.loadingModels.delete(product.id);
      state.modelLoadErrors.add(product.id);
      renderUI();
    },
  );
}

function loadModelFile(file) {
  if (!file) return;
  const extension = file.name.split('.').pop().toLowerCase();
  const modelStatus = document.querySelector('#model-status');
  if (!['glb', 'gltf'].includes(extension)) {
    if (modelStatus) modelStatus.textContent = 'Formato no compatible. Usa GLB o GLTF.';
    return;
  }

  if (modelStatus) modelStatus.textContent = `Cargando ${file.name}...`;
  const objectUrl = URL.createObjectURL(file);
  const productId = state.product.id;

  gltfLoader.load(
    objectUrl,
    (gltf) => {
      const group = normalizeImportedModel(gltf.scene);
      replaceCustomModel(productId, file.name, objectUrl, group, 'upload');
      renderProduct();
      renderUI();
    },
    undefined,
    () => {
      URL.revokeObjectURL(objectUrl);
      if (modelStatus) {
        modelStatus.textContent = 'No se pudo cargar. Recomendado: exporta un GLB con texturas embebidas.';
      }
    },
  );
}

function setSpinState(spinning) {
  state.spinning = spinning;
  controls.autoRotate = spinning;
  const button = document.querySelector('#toggle-spin');
  if (!button) return;
  button.setAttribute('aria-label', spinning ? 'Pausar rotacion' : 'Activar rotacion');
  button.innerHTML = `<i data-lucide="${spinning ? 'pause' : 'play'}"></i>`;
  createIcons({ icons: iconRegistry });
}

function updateAngleIndicator() {
  const angleValue = document.querySelector('#angle-value');
  const badge = document.querySelector('.vision-badge');
  if (!angleValue || !badge) return;

  const rawDegrees = THREE.MathUtils.radToDeg(controls.getAzimuthalAngle());
  const degrees = Math.round(((rawDegrees % 360) + 360) % 360);
  angleValue.textContent = `${String(degrees).padStart(3, '0')} grados`;
  badge.style.setProperty('--angle-progress', `${(degrees / 360) * 100}%`);
}

function setupModelLoader() {
  const uploadInput = document.querySelector('#model-upload');
  const dropzone = document.querySelector('#model-dropzone');
  if (!uploadInput || !dropzone) return;

  uploadInput.addEventListener('change', (event) => {
    loadModelFile(event.target.files?.[0]);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragging');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    loadModelFile(event.dataTransfer?.files?.[0]);
  });
}

function setupPageInteractions() {
  document.querySelectorAll('#palette-grid [data-color]').forEach((button) => {
    button.addEventListener('click', async () => {
      const color = button.dataset.color;
      try {
        await navigator.clipboard.writeText(color);
        button.classList.add('copied');
        setTimeout(() => button.classList.remove('copied'), 1200);
      } catch {
        button.classList.add('copied');
        setTimeout(() => button.classList.remove('copied'), 1200);
      }
    });
  });

  const reserveAction = document.querySelector('#reserve-action');
  if (reserveAction) {
    reserveAction.addEventListener('click', () => {
      reserveAction.classList.add('is-confirmed');
      reserveAction.innerHTML = '<i data-lucide="check"></i> Muestra reservada';
      createIcons({ icons: iconRegistry });
      setTimeout(() => {
        reserveAction.classList.remove('is-confirmed');
        reserveAction.innerHTML = '<i data-lucide="shopping-bag"></i> Reservar muestra';
        createIcons({ icons: iconRegistry });
      }, 1800);
    });
  }
}

document.querySelector('#reset-view').addEventListener('click', () => {
  camera.position.set(3.9, 2.25, 5.2);
  controls.target.set(0, 0.34, 0);
  controls.update();
});

document.querySelector('#toggle-spin').addEventListener('click', () => {
  setSpinState(!state.spinning);
});

controls.addEventListener('start', () => {
  if (state.spinning) setSpinState(false);
});

document.querySelectorAll('[data-finish]').forEach((button) => {
  button.addEventListener('click', () => {
    state.finish = button.dataset.finish;
    renderProduct();
    renderUI();
  });
});

const resizeObserver = new ResizeObserver(() => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
resizeObserver.observe(stage);

const heroExperience = createHeroExperience();
setupModelLoader();
setupPageInteractions();

function animate() {
  requestAnimationFrame(animate);
  if (heroExperience) {
    heroExperience.group.rotation.y += 0.0018;
    heroExperience.group.position.y = Math.sin(performance.now() * 0.0011) * 0.026;
    heroExperience.floorRing.rotation.z -= 0.0017;
    heroExperience.renderer.render(heroExperience.scene, heroExperience.camera);
  }
  if (state.productGroup) {
    state.productGroup.position.y = Math.sin(performance.now() * 0.0014) * 0.035;
    floorRing.rotation.z += 0.003;
  }
  controls.update();
  updateAngleIndicator();
  renderer.render(scene, camera);
}

renderProduct();
renderUI();
animate();
