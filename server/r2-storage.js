import crypto from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const UPLOAD_EXPIRATION_SECONDS = 5 * 60;
const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export class R2StorageError extends Error {
  constructor(message, statusCode = 400, code = 'INVALID_IMAGE_UPLOAD') {
    super(message);
    this.name = 'R2StorageError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

function normalizePublicUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function normalizeFolder(value) {
  const folder = String(value || 'nuevo-producto')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return folder || 'nuevo-producto';
}

function encodeObjectKey(key) {
  return key.split('/').map(encodeURIComponent).join('/');
}

export function isR2Configured(config) {
  return Boolean(
    config?.accountId &&
    config?.accessKeyId &&
    config?.secretAccessKey &&
    config?.bucket &&
    normalizePublicUrl(config?.publicUrl),
  );
}

export class R2Storage {
  constructor(config = {}) {
    this.config = { ...config, publicUrl: normalizePublicUrl(config.publicUrl) };
    this.client = isR2Configured(this.config)
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
          },
        })
      : null;
  }

  status() {
    return {
      configured: Boolean(this.client),
      publicUrl: this.client ? this.config.publicUrl : '',
      maxImageSize: MAX_IMAGE_SIZE,
      acceptedTypes: Object.keys(EXTENSION_BY_TYPE),
    };
  }

  assertConfigured() {
    if (!this.client) {
      throw new R2StorageError(
        'Cloudflare R2 todavía no está configurado en el servidor.',
        503,
        'R2_NOT_CONFIGURED',
      );
    }
  }

  async createPresignedUpload({ productId, contentType, size }) {
    this.assertConfigured();
    const normalizedType = String(contentType || '').trim().toLowerCase();
    const extension = EXTENSION_BY_TYPE[normalizedType];
    if (!extension) {
      throw new R2StorageError('La imagen debe ser JPEG, PNG, WebP o AVIF.', 400, 'IMAGE_TYPE_NOT_ALLOWED');
    }
    const numericSize = Number(size);
    if (!Number.isInteger(numericSize) || numericSize < 1 || numericSize > MAX_IMAGE_SIZE) {
      throw new R2StorageError('Cada imagen debe pesar entre 1 byte y 8 MB.', 400, 'IMAGE_SIZE_NOT_ALLOWED');
    }

    const date = new Date().toISOString().slice(0, 10);
    const key = `products/${normalizeFolder(productId)}/${date}/${crypto.randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: normalizedType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: UPLOAD_EXPIRATION_SECONDS });

    return {
      key,
      uploadUrl,
      publicUrl: `${this.config.publicUrl}/${encodeObjectKey(key)}`,
      expiresIn: UPLOAD_EXPIRATION_SECONDS,
      contentType: normalizedType,
    };
  }

  async deletePublicObject(publicUrl) {
    this.assertConfigured();
    let base;
    let target;
    let objectPath;
    try {
      base = new URL(`${this.config.publicUrl}/`);
      target = new URL(String(publicUrl || ''));
      objectPath = decodeURIComponent(target.pathname);
    } catch {
      throw new R2StorageError('La URL de la imagen no es válida.', 400, 'INVALID_R2_IMAGE_URL');
    }

    const basePath = base.pathname.replace(/\/+$/, '');
    if (target.origin !== base.origin || !objectPath.startsWith(`${basePath}/products/`)) {
      throw new R2StorageError('La imagen no pertenece al almacenamiento de Querubim.', 400, 'INVALID_R2_IMAGE_URL');
    }
    const key = objectPath.slice(basePath.length + 1);
    if (!key || key.includes('..')) {
      throw new R2StorageError('La ruta de la imagen no es válida.', 400, 'INVALID_R2_IMAGE_URL');
    }

    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    return { key, publicUrl: `${this.config.publicUrl}/${encodeObjectKey(key)}` };
  }
}
