import { readFile } from 'node:fs/promises';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

const COLORS = {
  ink: '#241a15',
  muted: '#736658',
  gold: '#a77a2f',
  goldSoft: '#ead6aa',
  surface: '#fffaf0',
  line: '#ded1bd',
  burgundy: '#6f2f43',
};

const CATEGORY_LABELS = {
  cadenas: 'Cadenas',
  dijes: 'Dijes',
  herrajes: 'Herrajes',
  candongas: 'Candongas',
  brazaletes: 'Brazaletes',
  'dijes-para-manillas': 'Dijes para manillas',
  manillas: 'Manillas',
  topos: 'Topos',
  pulsos: 'Pulsos',
  tobilleras: 'Tobilleras',
  anillos: 'Anillos',
  aros: 'Aros',
  rosarios: 'Rosarios',
  'tejidos-especiales': 'Tejidos especiales',
  balines: 'Balines',
  'argollas-matrimonio': 'Argollas de matrimonio',
  fabricaciones: 'Fabricaciones',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(value);
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || String(category || 'Joyería');
}

function safeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

async function fetchImage(url, { fetchImpl, allowedOrigins }) {
  if (!allowedOrigins.has(safeOrigin(url))) return null;
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(4_000) });
  if (!response.ok) return null;
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > 8 * 1024 * 1024) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.length <= 8 * 1024 * 1024 ? buffer : null;
}

async function loadImage(source, options) {
  if (!source) return null;
  let buffer = null;

  if (source.startsWith('/')) {
    const publicDir = path.resolve(options.rootDir, 'public');
    const filePath = path.resolve(publicDir, source.replace(/^\/+/, ''));
    if (filePath.startsWith(`${publicDir}${path.sep}`)) {
      buffer = await readFile(filePath).catch(() => null);
    }
    if (!buffer && options.publicBaseUrl) {
      buffer = await fetchImage(new URL(source, options.publicBaseUrl).href, options).catch(() => null);
    }
  } else if (/^https:\/\//i.test(source)) {
    buffer = await fetchImage(source, options).catch(() => null);
  }

  if (!buffer) return null;
  return sharp(buffer, { limitInputPixels: 25_000_000 })
    .rotate()
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
    .catch(() => null);
}

function drawBrandHeader(doc, logo) {
  if (logo) doc.image(logo, 42, 24, { fit: [112, 56], align: 'left', valign: 'center' });
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text('JOYERÍA QUERUBIM', 174, 33, { characterSpacing: 0.6 });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(8.5)
    .text('ORO DE 18 QUILATES · CÚCUTA, COLOMBIA', 174, 55, { characterSpacing: 0.35 });
  doc.moveTo(42, 91).lineTo(553, 91).lineWidth(0.7).strokeColor(COLORS.goldSoft).stroke();
}

function drawCover(doc, { logo, products, generatedAt }) {
  drawBrandHeader(doc, logo);
  doc
    .fillColor(COLORS.gold)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('CATÁLOGO COMERCIAL', 42, 154, { characterSpacing: 1.4 });
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica-Bold')
    .fontSize(34)
    .text('Joyas creadas para\nmomentos que perduran.', 42, 178, { width: 470, lineGap: 4 });
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(12)
    .text(
      'Una selección de piezas en oro de 18 quilates con información de medidas, disponibilidad y precios vigentes en el catálogo Querubim.',
      42,
      294,
      { width: 455, lineGap: 5 },
    );

  doc.roundedRect(42, 390, 511, 146, 8).fill(COLORS.surface).strokeColor(COLORS.line).lineWidth(0.8).stroke();
  const premium = products.filter((product) => product.premium).length;
  const available = products.filter((product) => Number(product.stock) > 0).length;
  const stats = [
    ['Piezas', products.length],
    ['Disponibles', available],
    ['Premium', premium],
  ];
  stats.forEach(([label, value], index) => {
    const x = 72 + index * 162;
    doc.fillColor(COLORS.gold).font('Helvetica-Bold').fontSize(24).text(String(value), x, 425, { width: 120, align: 'center' });
    doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8.5).text(label.toUpperCase(), x, 463, { width: 120, align: 'center', characterSpacing: 0.8 });
  });

  doc
    .fillColor(COLORS.ink)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(`Actualizado el ${formatDate(generatedAt)}`, 42, 615);
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(9)
    .text('Precios y existencias sujetos a confirmación. Para asesoría personalizada, comunícate al +57 322 543 5618.', 42, 638, { width: 450, lineGap: 4 });
}

function drawProduct(doc, product, image, y) {
  const x = 42;
  const width = 511;
  const height = 205;
  doc.roundedRect(x, y, width, height, 7).fill(COLORS.surface).strokeColor(COLORS.line).lineWidth(0.7).stroke();

  const imageX = x + 14;
  const imageY = y + 14;
  const imageSize = 177;
  doc.roundedRect(imageX, imageY, imageSize, imageSize, 5).fill('#f3eee5');
  if (image) {
    doc.image(image, imageX, imageY, { fit: [imageSize, imageSize], align: 'center', valign: 'center' });
  } else {
    doc.fillColor(COLORS.gold).font('Helvetica-Bold').fontSize(11).text('QUERUBIM', imageX, imageY + 79, { width: imageSize, align: 'center', characterSpacing: 1 });
  }

  const contentX = x + 211;
  const contentWidth = 320;
  doc.fillColor(product.premium ? COLORS.burgundy : COLORS.gold).font('Helvetica-Bold').fontSize(8.5)
    .text(`${product.premium ? 'PREMIUM · ' : ''}${categoryLabel(product.category).toUpperCase()}`, contentX, y + 18, { width: contentWidth, characterSpacing: 0.8 });
  doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(17)
    .text(product.name || 'Joya Querubim', contentX, y + 38, { width: contentWidth, height: 45, ellipsis: true });
  const displayedPrice = `${product.pricing?.requiresSelection ? 'Desde ' : ''}${formatCurrency(product.price)}`;
  doc.fillColor(COLORS.gold).font('Helvetica-Bold').fontSize(13)
    .text(displayedPrice, contentX, y + 88, { width: contentWidth });
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8.5)
    .text(product.description || 'Pieza seleccionada por Joyería Querubim.', contentX, y + 113, { width: contentWidth, height: 38, ellipsis: true, lineGap: 2 });

  const stock = Number(product.stock) || 0;
  const stockLabel = stock > 0 ? `${stock} ${stock === 1 ? 'unidad' : 'unidades'} disponibles` : 'Agotado temporalmente';
  const material = product.material || `${product.variants?.metal || 'Oro amarillo'} ${product.variants?.purity || '18K'}`;
  doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(8.5)
    .text(material, contentX, y + 162, { width: 180 });
  doc.fillColor(stock > 0 ? '#246d50' : COLORS.burgundy).font('Helvetica-Bold').fontSize(8)
    .text(stockLabel, contentX + 178, y + 162, { width: 142, align: 'right' });
  const measures = (product.measurements || []).slice(0, 4).join(' · ');
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7.7)
    .text(measures ? `Medidas: ${measures}${product.measurements.length > 4 ? ' · …' : ''}` : 'Medidas disponibles bajo asesoría.', contentX, y + 180, { width: contentWidth, height: 15, ellipsis: true });
}

export async function createCatalogPdf(products, {
  generatedAt = new Date(),
  rootDir = process.cwd(),
  publicBaseUrl = '',
  allowedImageOrigins = [],
  fetchImpl = fetch,
} = {}) {
  const activeProducts = products.filter((product) => product.active !== false);
  const allowedOrigins = new Set([safeOrigin(publicBaseUrl), ...allowedImageOrigins.map(safeOrigin)].filter(Boolean));
  const imageOptions = { rootDir, publicBaseUrl, allowedOrigins, fetchImpl };
  const logo = await readFile(path.resolve(rootDir, 'public/logo/querubim-logo-full.png')).catch(() => null);
  const images = await Promise.all(activeProducts.map((product) => loadImage(product.images?.[0], imageOptions)));

  const document = new PDFDocument({
    size: 'A4',
    margins: { top: 36, right: 42, bottom: 42, left: 42 },
    bufferPages: true,
    info: {
      Title: 'Catálogo Joyería Querubim',
      Author: 'Joyería Querubim S.A.S.',
      Subject: 'Catálogo comercial de joyas',
    },
  });
  const chunks = [];
  document.on('data', (chunk) => chunks.push(chunk));
  const completion = new Promise((resolve, reject) => {
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });

  drawCover(document, { logo, products: activeProducts, generatedAt });
  activeProducts.forEach((product, index) => {
    if (index % 3 === 0) {
      document.addPage();
      drawBrandHeader(document, logo);
    }
    drawProduct(document, product, images[index], 112 + (index % 3) * 222);
  });

  const range = document.bufferedPageRange();
  for (let index = 0; index < range.count; index += 1) {
    document.switchToPage(range.start + index);
    document.fillColor(COLORS.muted).font('Helvetica').fontSize(7.5)
      .text(`Joyería Querubim · Página ${index + 1} de ${range.count}`, 42, 786, { width: 511, align: 'center', lineBreak: false });
  }

  document.end();
  return completion;
}
