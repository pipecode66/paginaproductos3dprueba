import path from 'node:path';
import { CatalogRepository } from './catalog-repository.js';
import { OrderStore } from './order-store.js';
import { PostgresCatalogRepository } from './postgres-catalog-repository.js';
import { PostgresOrderStore } from './postgres-order-store.js';
import { getPostgresPool } from './postgres.js';

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
}

export function createPersistence(config) {
  if (config.storage.mode === 'postgresql') {
    const pool = getPostgresPool(config.storage.databaseUrl);
    const catalogRepository = new PostgresCatalogRepository(pool);
    return {
      catalogRepository,
      orderStore: new PostgresOrderStore(pool),
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
      storage: { mode: 'unconfigured', configured: false, ready: () => Promise.resolve(false) },
    };
  }

  const catalogRepository = new CatalogRepository(path.join(config.runtimeDir, 'catalog.json'));
  return {
    catalogRepository,
    orderStore: new OrderStore(path.join(config.runtimeDir, 'orders.json')),
    storage: { mode: 'json', configured: true, ready: () => Promise.resolve(true) },
  };
}
