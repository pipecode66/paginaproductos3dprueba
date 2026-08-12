import { catalogSeed } from './catalog-seed.js';
import { PersistentJsonStore } from './persistent-json-store.js';

export class CatalogRepository {
  constructor(filePath, seed = catalogSeed) {
    this.store = new PersistentJsonStore(filePath, { products: seed });
  }

  async listActive() {
    return (await this.listAll()).filter((product) => product.active !== false);
  }

  async listAll() {
    const data = await this.store.read();
    return data.products;
  }

  async findById(productId) {
    const products = await this.listActive();
    return products.find((product) => product.id === productId) ?? null;
  }

  async upsert(product) {
    return this.store.transaction((data) => {
      const index = data.products.findIndex((item) => item.id === product.id);
      if (index >= 0) data.products[index] = product;
      else data.products.push(product);
      return product;
    });
  }

  async deactivate(productId) {
    return this.store.transaction((data) => {
      const index = data.products.findIndex((item) => item.id === productId);
      if (index < 0) return null;
      data.products[index] = { ...data.products[index], active: false };
      return data.products[index];
    });
  }

  async reserveStock(items = []) {
    return this.store.transaction((data) => {
      for (const item of items) {
        const product = data.products.find((candidate) => candidate.id === item.productId && candidate.active !== false);
        const quantity = Number(item.quantity);
        if (!product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) {
          const error = new Error(`No hay existencias suficientes de ${item.name || 'una de las joyas'}.`);
          error.statusCode = 409;
          error.code = 'INSUFFICIENT_STOCK';
          error.expose = true;
          throw error;
        }
      }
      for (const item of items) {
        const product = data.products.find((candidate) => candidate.id === item.productId);
        product.stock -= Number(item.quantity);
      }
      return true;
    });
  }

  async releaseStock(items = []) {
    return this.store.transaction((data) => {
      for (const item of items) {
        const product = data.products.find((candidate) => candidate.id === item.productId);
        if (product) product.stock += Number(item.quantity) || 0;
      }
      return true;
    });
  }
}
