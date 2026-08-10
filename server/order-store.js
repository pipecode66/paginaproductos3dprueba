import { PersistentJsonStore } from './persistent-json-store.js';

export class OrderStore {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, { orders: {}, events: {} });
  }

  async create(order) {
    return this.store.transaction((data) => {
      if (data.orders[order.id]) throw new Error('La referencia de la orden ya existe.');
      data.orders[order.id] = order;
      return order;
    });
  }

  async get(orderId) {
    const data = await this.store.read();
    return data.orders[orderId] ?? null;
  }

  async list(limit = 100) {
    const data = await this.store.read();
    return Object.values(data.orders)
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, limit);
  }

  async recordEvent(eventId, eventRecord, updateOrder) {
    return this.store.transaction((data) => {
      if (data.events[eventId]) {
        return { duplicate: true, order: data.orders[eventRecord.orderId] ?? null };
      }

      const order = data.orders[eventRecord.orderId] ?? null;
      data.events[eventId] = eventRecord;
      if (order && updateOrder) data.orders[eventRecord.orderId] = updateOrder(order);

      return { duplicate: false, order: data.orders[eventRecord.orderId] ?? null };
    });
  }
}
