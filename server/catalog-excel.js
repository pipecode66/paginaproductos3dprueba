import ExcelJS from 'exceljs';

const HEADER_FILL = 'FF6E2638';
const GOLD_FILL = 'FFD9B86F';
const LIGHT_FILL = 'FFF7F4EE';
const BORDER_COLOR = 'FFD9D2C7';

function getCategoryLabel(category) {
  return String(category || '')
    .split('-')
    .map((word) => word ? `${word[0].toUpperCase()}${word.slice(1)}` : '')
    .join(' ');
}

function productRow(product) {
  const variants = product.variants || {};
  const priceOptions = new Map((product.pricing?.options || []).map((option) => [option.measure, option.price]));
  const weights = new Map((product.measurementWeights || []).map((entry) => [entry.measure, entry]));
  const measurementDetails = (product.measurements || []).map((measure) => {
    const weight = weights.get(measure);
    const finalPrice = priceOptions.get(measure);
    const parts = [measure];
    if (weight) parts.push(`${weight.value} ${weight.unit}`);
    if (Number.isSafeInteger(finalPrice)) parts.push(new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(finalPrice));
    return parts.join(' · ');
  });
  return [
    product.id,
    product.name,
    getCategoryLabel(product.category),
    Number(product.price || 0),
    Number(product.pricing?.startingPrice ?? product.price ?? 0),
    Number(product.stock || 0),
    Number(product.stock || 0) > 0 ? 'Disponible' : 'Agotado',
    product.material,
    variants.metal || '',
    variants.purity || '',
    variants.gemstone || '',
    variants.engraving || '',
    product.premium ? 'Premium' : 'Catálogo general',
    product.featured ? 'Sí' : 'No',
    measurementDetails.join('\n'),
    (product.images || []).length,
    product.description,
  ];
}

function styleHeader(row) {
  row.height = 30;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: GOLD_FILL } } };
  });
}

export async function createCatalogExcel(products, generatedAt = new Date()) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Joyería Querubim';
  workbook.company = 'QUERUBIM S.A.S.';
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  const sheet = workbook.addWorksheet('Catálogo', {
    views: [{ state: 'frozen', ySplit: 4 }],
    properties: { defaultRowHeight: 20 },
  });
  sheet.columns = [
    { key: 'id', width: 28 },
    { key: 'name', width: 32 },
    { key: 'category', width: 22 },
    { key: 'garmentPrice', width: 20 },
    { key: 'startingPrice', width: 20 },
    { key: 'stock', width: 12 },
    { key: 'availability', width: 16 },
    { key: 'material', width: 24 },
    { key: 'metal', width: 18 },
    { key: 'purity', width: 13 },
    { key: 'gemstone', width: 24 },
    { key: 'engraving', width: 26 },
    { key: 'line', width: 18 },
    { key: 'featured', width: 14 },
    { key: 'measurements', width: 42 },
    { key: 'images', width: 18 },
    { key: 'description', width: 60 },
  ];

  sheet.mergeCells('A1:Q1');
  const title = sheet.getCell('A1');
  title.value = 'CATÁLOGO DE PRODUCTOS · JOYERÍA QUERUBIM';
  title.font = { bold: true, size: 16, color: { argb: 'FF211B17' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_FILL } };
  title.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 38;

  sheet.mergeCells('A2:Q2');
  const generated = sheet.getCell('A2');
  generated.value = `Generado el ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(generatedAt)}`;
  generated.font = { italic: true, color: { argb: 'FF6D665F' } };
  sheet.getRow(3).height = 8;

  const headers = [
    'Referencia', 'Producto', 'Categoría', 'Precio de la prenda COP', 'Precio público desde COP', 'Stock', 'Disponibilidad', 'Material',
    'Metal', 'Pureza', 'Piedra o gema', 'Grabado', 'Línea', 'Destacado', 'Medidas o tallas',
    'Cantidad de imágenes', 'Descripción',
  ];
  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  styleHeader(headerRow);

  products.forEach((product, index) => {
    const row = sheet.addRow(productRow(product));
    row.height = 34;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'hair', color: { argb: BORDER_COLOR } } };
      if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_FILL } };
    });
    row.getCell(4).numFmt = '$#,##0';
    row.getCell(5).numFmt = '$#,##0';
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(16).alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const lastRow = Math.max(4, sheet.rowCount);
  sheet.autoFilter = { from: 'A4', to: `Q${lastRow}` };
  sheet.getColumn(2).font = { bold: true, color: { argb: 'FF211B17' } };

  const imageSheet = workbook.addWorksheet('Imágenes');
  imageSheet.columns = [
    { header: 'Referencia', key: 'id', width: 30 },
    { header: 'Producto', key: 'name', width: 34 },
    { header: 'Posición', key: 'position', width: 12 },
    { header: 'URL de la imagen', key: 'url', width: 90 },
  ];
  styleHeader(imageSheet.getRow(1));
  products.forEach((product) => {
    (product.images || []).forEach((url, index) => {
      const row = imageSheet.addRow({ id: product.id, name: product.name, position: index + 1, url });
      row.getCell(4).value = { text: url, hyperlink: url };
      row.getCell(4).font = { color: { argb: 'FF6E2638' }, underline: true };
    });
  });
  imageSheet.views = [{ state: 'frozen', ySplit: 1 }];
  imageSheet.autoFilter = `A1:D${Math.max(1, imageSheet.rowCount)}`;

  return workbook.xlsx.writeBuffer();
}
