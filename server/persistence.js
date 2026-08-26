import path from 'node:path';
import { AdminSecurityStore } from './admin-security-store.js';
import { CatalogRepository } from './catalog-repository.js';
import { InternationalRequestStore } from './international-request-store.js';
import { OrderStore } from './order-store.js';
import { PostgresCatalogRepository } from './postgres-catalog-repository.js';
import { PostgresAdminSecurityStore } from './postgres-admin-security-store.js';
import { PostgresInternationalRequestStore } from './postgres-international-request-store.js';
import { PostgresOrderStore } from './postgres-order-store.js';
import { PostgresSiteContentRepository } from './postgres-site-content-repository.js';
import { getPostgresPool } from './postgres.js';
import { SiteContentRepository } from './site-content-repository.js';

export class StorageConfigurationError extends Error {
  constructor() {
    super('El almacenamiento de pagos todavía no está configurado en el servidor.');
    this.name = 'StorageConfigurationError';
    this.statusCode = 503;
    this.code = 'STORAGE_NOT_CONFIGURED';
    this.expose = true;
  }
}

class UnavailableRepository {
  async ready() {
    return false;
  }

  async listActive() {
    throw new StorageConfigurationError();
  }

  async listAll() {
    throw new StorageConfigurationError();
  }

  async findById() {
    throw new StorageConfigurationError();
  }

  async upsert() {
    throw new StorageConfigurationError();
  }

  async save() {
    throw new StorageConfigurationError();
  }

  async deactivate() {
    throw new StorageConfigurationError();
  }

  async list() {
    throw new StorageConfigurationError();
  }

  async update() {
    throw new StorageConfigurationError();
  }

  async create() {
    throw new StorageConfigurationError();
  }

  async get() {
    throw new StorageConfigurationError();
  }

  async recordEvent() {
    throw new StorageConfigurationError();
  }

  async getLoginLock() {
    throw new StorageConfigurationError();
  }

  async recordLoginFailure() {
    throw new StorageConfigurationError();
  }

  async clearLoginFailures() {
    throw new StorageConfigurationError();
  }

  async createSession() {
    throw new StorageConfigurationError();
  }

  async getSession() {
    throw new StorageConfigurationError();
  }

  async touchSession() {
    throw new StorageConfigurationError();
  }

  async revokeSession() {
    throw new StorageConfigurationError();
  }

  async getLastTotpStep() {
    throw new StorageConfigurationError();
  }

  async consumeTotpStep() {
    throw new StorageConfigurationError();
  }
}

export function createPersistence(config) {
  if (config.storage.mode === 'postgresql') {
    const pool = getPostgresPool(config.storage.databaseUrl);
    const catalogRepository = new PostgresCatalogRepository(pool);
    return {
      catalogRepository,
      orderStore: new PostgresOrderStore(pool),
      siteContentRepository: new PostgresSiteContentRepository(pool),
      internationalRequestStore: new PostgresInternationalRequestStore(pool),
      adminSecurityStore: new PostgresAdminSecurityStore(pool),
      storage: {
        mode: 'postgresql',
        configured: true,
        ready: () => catalogRepository.ready(),
      },
    };
  }

  if (config.storage.mode === 'unconfigured') {
    const unavailable = new UnavailableRepository();
    return {
      catalogRepository: unavailable,
      orderStore: unavailable,
      siteContentRepository: unavailable,
      internationalRequestStore: unavailable,
      adminSecurityStore: unavailable,
      storage: { mode: 'unconfigured', configured: false, ready: () => Promise.resolve(false) },
    };
  }

  const catalogRepository = new CatalogRepository(path.join(config.runtimeDir, 'catalog.json'));
  return {
    catalogRepository,
    orderStore: new OrderStore(path.join(config.runtimeDir, 'orders.json'), catalogRepository),
    siteContentRepository: new SiteContentRepository(path.join(config.runtimeDir, 'site-content.json')),
    internationalRequestStore: new InternationalRequestStore(path.join(config.runtimeDir, 'international-requests.json')),
    adminSecurityStore: new AdminSecurityStore(path.join(config.runtimeDir, 'admin-security.json')),
    storage: { mode: 'json', configured: true, ready: () => Promise.resolve(true) },
  };
}
