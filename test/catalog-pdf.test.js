import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogSeed } from '../server/catalog-seed.js';
import { createCatalogPdf } from '../server/catalog-pdf.js';

test('genera un catálogo PDF con identidad, productos e imágenes', async () => {
  const buffer = await createCatalogPdf(catalogSeed.slice(0, 2), {
    generatedAt: new Date('2026-08-25T15:00:00.000Z'),
    rootDir: process.cwd(),
  });

  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
  assert.match(buffer.subarray(-16).toString(), /%%EOF/);
  assert.ok(buffer.length > 20_000);
  assert.equal((buffer.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 2);
});
