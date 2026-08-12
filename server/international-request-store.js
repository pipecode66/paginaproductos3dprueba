import { PersistentJsonStore } from './persistent-json-store.js';

export class InternationalRequestStore {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, { requests: {} });
  }

  async create(request) {
    return this.store.transaction((data) => {
      if (data.requests[request.id]) throw new Error('La referencia internacional ya existe.');
      data.requests[request.id] = request;
      return request;
    });
  }

  async get(requestId) {
    return (await this.store.read()).requests[requestId] ?? null;
  }

  async list(limit = 100) {
    const data = await this.store.read();
    return Object.values(data.requests)
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, limit);
  }

  async update(requestId, updateRequest) {
    return this.store.transaction((data) => {
      const current = data.requests[requestId] ?? null;
      if (!current) return null;
      data.requests[requestId] = updateRequest(current);
      return data.requests[requestId];
    });
  }
}
