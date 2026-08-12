import { PersistentJsonStore } from './persistent-json-store.js';

export class OrderStore {
  constructor(filePath, catalogRepository = null) {
    this.store = new PersistentJsonStore(filePath, { orders: {}, events: {} });
    this.catalogRepository = catalogRepository;
  }

  async create(order) {
    return this.store.transaction((data) => {
      if (data.orders[order.id]) throw new Error('La referencia de la orden ya existe.');
      data.orders[order.id] = order;
      return order;
    });
  }

  async createWithReservation(order) {
    if (!this.catalogRepository) return this.create(order);
    await this.catalogRepository.reserveStock(order.items);
    try {
      return await this.create(order);
    } catch (error) {
      await this.catalogRepository.releaseStock(order.items);
      throw error;
    }
  }

  async releaseExpiredReservations(nowIso = new Date().toISOString()) {
    const releasable = await this.store.transaction((data) => {
      const items = [];
      for (const order of Object.values(data.orders)) {
        if (
          order?.inventoryStatus !== 'RESERVED' ||
          order?.status !== 'CREATED' ||
          !order?.expiresAt ||
          Date.parse(order.expiresAt) > Date.parse(nowIso)
        ) continue;
        order.status = 'EXPIRED';
        order.inventoryStatus = 'RELEASED';
        order.fulfillmentStatus = 'CANCELLED';
        order.expiredAt = nowIso;
        items.push(...(order.items || []));
      }
      return items;
    });
    if (releasable.length && this.catalogRepository) await this.catalogRepository.releaseStock(releasable);
    return releasable.length;
  }

  async get(orderId) {
    await this.releaseExpiredReservations();
    const data = await this.store.read();
    return data.orders[orderId] ?? null;
  }

  async list(limit = 100) {
    await this.releaseExpiredReservations();
    const data = await this.store.read();
    return Object.values(data.orders)
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, limit);
  }

  async update(orderId, updateOrder) {
    return this.store.transaction((data) => {
      const order = data.orders[orderId] ?? null;
      if (!order) return null;
      data.orders[orderId] = updateOrder(order);
      return data.orders[orderId];
    });
  }

  async recordEvent(eventId, eventRecord, updateOrder) {
    const result = await this.store.transaction((data) => {
      if (data.events[eventId]) {
        return { duplicate: true, order: data.orders[eventRecord.orderId] ?? null, releasedItems: [] };
      }

      const order = data.orders[eventRecord.orderId] ?? null;
      data.events[eventId] = eventRecord;
      let releasedItems = [];
      if (order && updateOrder) {
        const updated = updateOrder(order);
        if (
          ['RESERVED', 'COMMITTED'].includes(order.inventoryStatus) &&
          updated.inventoryStatus === 'RELEASED'
        ) releasedItems = order.items || [];
        data.orders[eventRecord.orderId] = updated;
      }

      return { duplicate: false, order: data.orders[eventRecord.orderId] ?? null, releasedItems };
    });
    if (result.releasedItems.length && this.catalogRepository) {
      await this.catalogRepository.releaseStock(result.releasedItems);
    }
    return { duplicate: result.duplicate, order: result.order };
  }
}
