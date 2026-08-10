import { catalogSeed } from './catalog-seed.js';
import { PersistentJsonStore } from './persistent-json-store.js';

export class CatalogRepository {
  constructor(filePath, seed = catalogSeed) {
    this.store = new PersistentJsonStore(filePath, { products: seed });
  }

  async listActive() {
    const data = await this.store.read();
    return data.products.filter((product) => product.active !== false);
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
}
