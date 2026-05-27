import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  AudioLines,
  BadgeCheck,
  Box,
  Camera,
  CircleDollarSign,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Watch,
  createIcons,
} from 'lucide';

const products = [
  {
    id: 'halo-arc',
    name: 'Halo Arc',
    category: 'Audio inmersivo',
    model: 'AUR-H01',
    tag: 'Nuevo',
    price: '$189',
    description: 'Auriculares de estudio con estructura flotante y capsulas acolchadas.',
    icon: 'audio-lines',
    colors: ['#14b8a6', '#ff4f8b', '#d6f735', '#111217'],
    specs: [
      ['Autonomia', '38 h'],
      ['Peso', '284 g'],
      ['Audio', 'Hi-Fi 48 kHz'],
      ['Carga', 'USB-C'],
    ],
    features: [
      ['Cancelacion activa', 'Aislamiento adaptativo para sesiones extensas.'],
      ['Diadema flexible', 'Arco ligero con memoria de forma.'],
      ['Audio espacial', 'Escena sonora amplia para video y musica.'],
    ],
    build: buildHeadphones,
  },
  {
    id: 'luma-pod',
    name: 'Luma Pod',
    category: 'Hogar conectado',
    model: 'LUM-P08',
    tag: 'Edicion luz',
    price: '$129',
    description: 'Altavoz de mesa con anillo luminoso y cuerpo acustico vertical.',
    icon: 'box',
    colors: ['#7c3aed', '#22c55e', '#f43f5e', '#0f172a'],
    specs: [
      ['Potencia', '42 W'],
      ['Radio', '360 grados'],
      ['Conexion', 'Wi-Fi 6'],
      ['Control', 'Voz + app'],
    ],
    features: [
      ['Sonido circular', 'Difusor acustico para salas medianas.'],
      ['Luz ambiental', 'Corona LED sincronizada con el contenido.'],
      ['Base antideslizante', 'Agarre firme en madera, vidrio y metal.'],
    ],
    build: buildSpeaker,
  },
  {
    id: 'nova-cam',
    name: 'Nova Cam',
    category: 'Creator gear',
    model: 'NVC-M4',
    tag: 'Prototipo',
    price: '$249',
    description: 'Camara compacta para creadores con lente modular y asa magnetica.',
    icon: 'camera',
    colors: ['#2563eb', '#f97316', '#06b6d4', '#18181b'],
    specs: [
      ['Sensor', '1/1.3 in'],
      ['Video', '6K HDR'],
      ['Montura', 'Magnetica'],
      ['Pantalla', 'Articulada'],
    ],
    features: [
      ['Lente modular', 'Anillos de enfoque intercambiables.'],
      ['Grip plano', 'Cuerpo estable para tomas a mano.'],
      ['Perfil creator', 'Color listo para redes y streaming.'],
    ],
    build: buildCamera,
  },
  {
    id: 'pulse-loop',
    name: 'Pulse Loop',
    category: 'Wearable',
    model: 'PLS-W12',
    tag: 'Ligero',
    price: '$159',
    description: 'Reloj deportivo con pantalla curva, correa ventilada y sensor continuo.',
    icon: 'watch',
    colors: ['#ef4444', '#0ea5e9', '#84cc16', '#27272a'],
    specs: [
      ['Bateria', '9 dias'],
      ['Resistencia', '5 ATM'],
      ['Sensor', 'BioPulse'],
      ['Peso', '37 g'],
    ],
    features: [
      ['Correa ventilada', 'Textura flexible para entrenamiento diario.'],
      ['Pantalla curva', 'Cristal elevado con lectura rapida.'],
      ['Lectura continua', 'Metricas de pulso, sueno y recuperacion.'],
    ],
    build: buildWatch,
  },
];

const state = {
  product: products[0],
  color: products[0].colors[0],
  finish: 'matte',
  spinning: true,
  productGroup: null,
};

const iconRegistry = {
  AudioLines,
  BadgeCheck,
  Box,
  Camera,
  CircleDollarSign,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Watch,
};

createIcons({ icons: iconRegistry });

const canvas = document.querySelector('#product-canvas');
const stage = document.querySelector('.viewer-stage');
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
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eef2f5');
scene.fog = new THREE.Fog('#eef2f5', 8, 18);

const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(3.9, 2.25, 5.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.72;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 8.5;
controls.target.set(0, 0.45, 0);

const hemiLight = new THREE.HemisphereLight('#ffffff', '#b9c4cc', 2.3);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight('#ffffff', 4.5);
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

const rimLight = new THREE.PointLight('#ff4f8b', 14, 8);
rimLight.position.set(-3.8, 2.2, -2.4);
scene.add(rimLight);

const cyanLight = new THREE.PointLight('#14b8a6', 10, 7);
cyanLight.position.set(3, 1.4, -3.5);
scene.add(cyanLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4.5, 96),
  new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.58,
    metalness: 0,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.24;
floor.receiveShadow = true;
scene.add(floor);

const floorRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.25, 0.012, 12, 160),
  new THREE.MeshBasicMaterial({ color: '#111217', transparent: true, opacity: 0.22 }),
);
floorRing.rotation.x = -Math.PI / 2;
floorRing.position.y = -1.215;
scene.add(floorRing);

function productMaterial(color, finish = state.finish) {
  const finishMap = {
    matte: { roughness: 0.72, metalness: 0.08, clearcoat: 0.06 },
    gloss: { roughness: 0.18, metalness: 0.1, clearcoat: 0.85 },
    metal: { roughness: 0.32, metalness: 0.78, clearcoat: 0.28 },
  };

  return new THREE.MeshPhysicalMaterial({
    color,
    ...finishMap[finish],
  });
}

function darkMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#17181d',
    roughness: 0.64,
    metalness: 0.16,
  });
}

function softMaterial(color = '#e7ebef') {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.84,
    metalness: 0.02,
  });
}

function glassMaterial(color = '#dff8ff') {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.24,
    transparent: true,
    opacity: 0.72,
    clearcoat: 0.9,
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

function addEdgeOutline(group, mesh, color = '#ffffff', opacity = 0.18) {
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

function buildHeadphones(color, finish) {
  const group = new THREE.Group();
  const main = productMaterial(color, finish);
  const dark = darkMaterial();
  const cushion = softMaterial('#23252c');
  const metal = new THREE.MeshStandardMaterial({ color: '#e6edf2', roughness: 0.28, metalness: 0.72 });

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.32, 0, 0),
    new THREE.Vector3(-1.05, 1.14, -0.05),
    new THREE.Vector3(0, 1.62, -0.16),
    new THREE.Vector3(1.05, 1.14, -0.05),
    new THREE.Vector3(1.32, 0, 0),
  ]);
  addMesh(group, new THREE.TubeGeometry(curve, 80, 0.065, 18, false), main);

  const innerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.05, 0.08, 0.06),
    new THREE.Vector3(-0.72, 1.02, 0),
    new THREE.Vector3(0, 1.3, -0.08),
    new THREE.Vector3(0.72, 1.02, 0),
    new THREE.Vector3(1.05, 0.08, 0.06),
  ]);
  addMesh(group, new THREE.TubeGeometry(innerCurve, 70, 0.035, 14, false), metal);

  [-1, 1].forEach((side) => {
    const cup = addMesh(
      group,
      new THREE.CylinderGeometry(0.5, 0.58, 0.34, 64),
      main,
      { x: side * 1.16, y: -0.12, z: 0, rx: Math.PI / 2 },
    );
    addEdgeOutline(group, cup, '#ffffff', 0.2);

    addMesh(group, new THREE.TorusGeometry(0.39, 0.08, 20, 64), cushion, {
      x: side * 1.16,
      y: -0.12,
      z: 0.2,
    });
    addMesh(group, new THREE.CylinderGeometry(0.3, 0.3, 0.05, 48), dark, {
      x: side * 1.16,
      y: -0.12,
      z: 0.24,
      rx: Math.PI / 2,
    });
    addMesh(group, new RoundedBoxGeometry(0.22, 0.52, 0.16, 5, 0.04), metal, {
      x: side * 1.07,
      y: 0.45,
      z: -0.02,
      rz: side * 0.18,
    });
  });

  group.position.y = -0.1;
  return group;
}

function buildSpeaker(color, finish) {
  const group = new THREE.Group();
  const main = productMaterial(color, finish);
  const dark = darkMaterial();
  const pale = softMaterial('#f6f8fb');
  const glow = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: color,
    emissiveIntensity: 0.65,
    roughness: 0.18,
  });

  const body = addMesh(group, new THREE.CylinderGeometry(0.72, 0.82, 1.95, 96), main, { y: 0 });
  addEdgeOutline(group, body, '#ffffff', 0.16);
  addMesh(group, new THREE.CylinderGeometry(0.58, 0.58, 0.08, 96), pale, { y: 1.02 });
  addMesh(group, new THREE.TorusGeometry(0.72, 0.038, 18, 96), glow, { y: 0.98, rx: Math.PI / 2 });
  addMesh(group, new THREE.CylinderGeometry(0.66, 0.72, 0.12, 96), dark, { y: -1.02 });

  const grille = new THREE.Group();
  const dotGeo = new THREE.SphereGeometry(0.025, 10, 10);
  const dotMat = new THREE.MeshStandardMaterial({ color: '#111217', roughness: 0.52 });
  for (let row = -4; row <= 4; row += 1) {
    for (let col = -3; col <= 3; col += 1) {
      if (Math.abs(row) + Math.abs(col) > 7) continue;
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(col * 0.135, row * 0.13, 0.743);
      dot.castShadow = false;
      grille.add(dot);
    }
  }
  group.add(grille);

  const dial = addMesh(group, new THREE.CylinderGeometry(0.2, 0.24, 0.08, 48), dark, { y: 1.1 });
  dial.rotation.y = Math.PI / 7;

  return group;
}

function buildCamera(color, finish) {
  const group = new THREE.Group();
  const main = productMaterial(color, finish);
  const dark = darkMaterial();
  const glass = glassMaterial('#a7f3ff');
  const metal = new THREE.MeshStandardMaterial({ color: '#cbd5df', roughness: 0.25, metalness: 0.82 });

  const body = addMesh(group, new RoundedBoxGeometry(1.86, 1.14, 0.55, 8, 0.12), main, { y: 0.06 });
  addEdgeOutline(group, body, '#ffffff', 0.18);
  addMesh(group, new RoundedBoxGeometry(0.56, 0.28, 0.25, 5, 0.08), dark, {
    x: -0.52,
    y: 0.78,
    z: -0.02,
  });
  addMesh(group, new RoundedBoxGeometry(0.52, 0.15, 0.18, 4, 0.05), metal, {
    x: 0.44,
    y: 0.72,
    z: -0.02,
  });

  addMesh(group, new THREE.CylinderGeometry(0.5, 0.5, 0.28, 72), dark, {
    x: 0.2,
    y: 0.02,
    z: 0.42,
    rx: Math.PI / 2,
  });
  addMesh(group, new THREE.CylinderGeometry(0.38, 0.42, 0.24, 72), metal, {
    x: 0.2,
    y: 0.02,
    z: 0.58,
    rx: Math.PI / 2,
  });
  addMesh(group, new THREE.CylinderGeometry(0.27, 0.3, 0.14, 72), glass, {
    x: 0.2,
    y: 0.02,
    z: 0.78,
    rx: Math.PI / 2,
  });
  addMesh(group, new THREE.TorusGeometry(0.43, 0.025, 16, 72), main, {
    x: 0.2,
    y: 0.02,
    z: 0.73,
  });

  addMesh(group, new THREE.CylinderGeometry(0.1, 0.1, 0.08, 32), glass, {
    x: -0.7,
    y: 0.3,
    z: 0.32,
    rx: Math.PI / 2,
  });
  group.rotation.y = -0.18;
  return group;
}

function buildWatch(color, finish) {
  const group = new THREE.Group();
  const main = productMaterial(color, finish);
  const dark = darkMaterial();
  const glass = glassMaterial('#d8fbff');

  addMesh(group, new RoundedBoxGeometry(0.78, 2.2, 0.22, 8, 0.16), main, { y: 0.02, z: -0.06 });
  const face = addMesh(group, new RoundedBoxGeometry(1.14, 1.18, 0.28, 10, 0.22), dark, { y: 0.02, z: 0.06 });
  addEdgeOutline(group, face, '#ffffff', 0.22);
  addMesh(group, new RoundedBoxGeometry(0.88, 0.86, 0.055, 9, 0.16), glass, { y: 0.02, z: 0.24 });
  addMesh(group, new THREE.TorusGeometry(0.25, 0.012, 12, 64), main, { x: -0.18, y: 0.05, z: 0.285 });
  addMesh(group, new THREE.BoxGeometry(0.36, 0.035, 0.035), softMaterial('#ffffff'), {
    x: 0.18,
    y: 0.12,
    z: 0.292,
  });
  addMesh(group, new THREE.BoxGeometry(0.24, 0.035, 0.035), softMaterial('#d6f735'), {
    x: 0.12,
    y: -0.08,
    z: 0.292,
  });

  [-0.72, 0.72].forEach((y) => {
    for (let x = -0.21; x <= 0.21; x += 0.21) {
      addMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 18), dark, {
        x,
        y,
        z: 0.08,
        rx: Math.PI / 2,
      });
    }
  });

  group.rotation.x = -0.08;
  return group;
}

function setProduct(product) {
  state.product = product;
  state.color = product.colors[0];
  renderProduct();
  renderUI();
}

function renderProduct() {
  if (state.productGroup) {
    scene.remove(state.productGroup);
    state.productGroup.traverse((node) => {
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

  state.productGroup = state.product.build(state.color, state.finish);
  state.productGroup.rotation.y = -0.35;
  scene.add(state.productGroup);
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
          <span class="product-thumb" style="--thumb-color: ${product.colors[0]}">
            <i data-lucide="${product.icon}"></i>
          </span>
          <span class="product-copy">
            <strong>${product.name}</strong>
            <span>${product.category}</span>
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
          aria-label="Color ${color}"
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
  const icons = ['shield-check', 'layers-3', 'scan-line'];
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

function renderUI() {
  document.querySelector('#active-category').textContent = state.product.category;
  document.querySelector('#active-model').textContent = state.product.model;
  document.querySelector('#product-tag').textContent = state.product.tag;
  document.querySelector('#active-name').textContent = state.product.name;
  document.querySelector('#active-description').textContent = state.product.description;
  document.querySelector('#active-price').textContent = state.product.price;
  document.querySelector('#toggle-spin').setAttribute('aria-label', state.spinning ? 'Pausar rotacion' : 'Activar rotacion');
  document.querySelector('#toggle-spin').innerHTML = `<i data-lucide="${state.spinning ? 'pause' : 'play'}"></i>`;

  renderProductList();
  renderSwatches();
  renderSpecs();
  renderFeatures();
  renderFinishOptions();
  createIcons({ icons: iconRegistry });
}

document.querySelector('#reset-view').addEventListener('click', () => {
  camera.position.set(3.9, 2.25, 5.2);
  controls.target.set(0, 0.45, 0);
  controls.update();
});

document.querySelector('#toggle-spin').addEventListener('click', () => {
  state.spinning = !state.spinning;
  controls.autoRotate = state.spinning;
  renderUI();
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

function animate() {
  requestAnimationFrame(animate);
  if (state.productGroup) {
    state.productGroup.position.y = Math.sin(performance.now() * 0.0014) * 0.035;
    floorRing.rotation.z += 0.003;
  }
  controls.update();
  renderer.render(scene, camera);
}

renderProduct();
renderUI();
animate();
