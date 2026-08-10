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
}
