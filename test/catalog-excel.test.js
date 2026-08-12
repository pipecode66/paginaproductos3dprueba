import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { createCatalogExcel } from '../server/catalog-excel.js';

test('genera un libro de Excel organizado con catálogo e imágenes', async () => {
  const buffer = await createCatalogExcel([{
    id: 'anillo-excel',
    name: 'Anillo Excel',
    category: 'anillos',
    price: 1250000,
    stock: 2,
    material: 'Oro amarillo 18K',
    variants: { metal: 'Oro amarillo', purity: '18K', gemstone: 'Rubí', engraving: 'Disponible' },
    premium: true,
    featured: true,
    measurements: ['Talla 6', 'Talla 7'],
    images: ['https://media.example/anillo-01.jpg', 'https://media.example/anillo-02.jpg'],
    description: 'Pieza de prueba para verificar el archivo de Excel.',
  }], new Date('2026-08-12T20:00:00.000Z'));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ['Catálogo', 'Imágenes']);
  const catalog = workbook.getWorksheet('Catálogo');
  assert.equal(catalog.getCell('B5').value, 'Anillo Excel');
  assert.equal(catalog.getCell('D5').value, 1250000);
  assert.equal(catalog.getCell('D5').numFmt, '$#,##0');
  assert.equal(catalog.autoFilter, 'A4:P5');
  const images = workbook.getWorksheet('Imágenes');
  assert.equal(images.rowCount, 3);
  assert.equal(images.getCell('C3').value, 2);
});
