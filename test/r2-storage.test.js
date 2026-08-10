import assert from 'node:assert/strict';
import test from 'node:test';
import { R2Storage } from '../server/r2-storage.js';

const configuredR2 = {
  accountId: 'account-id-for-tests',
  accessKeyId: 'access-key-for-tests',
  secretAccessKey: 'secret-key-for-tests',
  bucket: 'querubim-images',
  publicUrl: 'https://pub.example.r2.dev',
};

test('informa cuando R2 no está configurado', async () => {
  const storage = new R2Storage({});
  assert.equal(storage.status().configured, false);
  await assert.rejects(
    storage.createPresignedUpload({ productId: 'anillo', contentType: 'image/jpeg', size: 1024 }),
    { code: 'R2_NOT_CONFIGURED', statusCode: 503 },
  );
});

test('genera una carga firmada con una ruta pública por producto', async () => {
  const storage = new R2Storage(configuredR2);
  const upload = await storage.createPresignedUpload({
    productId: 'Anillo Corona Ámbar',
    contentType: 'image/webp',
    size: 2048,
  });

  assert.match(upload.key, /^products\/anillo-corona-ambar\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.webp$/);
  assert.equal(upload.publicUrl, `${configuredR2.publicUrl}/${upload.key}`);
  assert.equal(upload.contentType, 'image/webp');
  assert.equal(upload.expiresIn, 300);
  const signedUrl = new URL(upload.uploadUrl);
  assert.equal(signedUrl.hostname, 'querubim-images.account-id-for-tests.r2.cloudflarestorage.com');
  assert.ok(signedUrl.searchParams.has('X-Amz-Signature'));
});

test('rechaza formatos y tamaños de imagen no permitidos', async () => {
  const storage = new R2Storage(configuredR2);
  await assert.rejects(
    storage.createPresignedUpload({ productId: 'cadena', contentType: 'image/gif', size: 1024 }),
    { code: 'IMAGE_TYPE_NOT_ALLOWED' },
  );
  await assert.rejects(
    storage.createPresignedUpload({ productId: 'cadena', contentType: 'image/png', size: 8 * 1024 * 1024 + 1 }),
    { code: 'IMAGE_SIZE_NOT_ALLOWED' },
  );
});

test('solo elimina objetos que pertenecen a la ruta pública de Querubim', async () => {
  const storage = new R2Storage(configuredR2);
  await assert.rejects(storage.deletePublicObject('https://otro-dominio.example/products/anillo/foto.jpg'), {
    code: 'INVALID_R2_IMAGE_URL',
  });

  let deletedInput;
  storage.client = {
    send: async (command) => {
      deletedInput = command.input;
      return {};
    },
  };
  const deleted = await storage.deletePublicObject(
    `${configuredR2.publicUrl}/products/anillo-corona/2026-08-10/foto%20principal.jpg`,
  );

  assert.deepEqual(deletedInput, {
    Bucket: configuredR2.bucket,
    Key: 'products/anillo-corona/2026-08-10/foto principal.jpg',
  });
  assert.equal(
    deleted.publicUrl,
    `${configuredR2.publicUrl}/products/anillo-corona/2026-08-10/foto%20principal.jpg`,
  );
});
