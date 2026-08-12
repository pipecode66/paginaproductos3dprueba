import { ensurePostgresSchema } from './postgres.js';

function inventoryError(productName = 'una de las joyas') {
  const error = new Error(`No hay existencias suficientes de ${productName}.`);
  error.statusCode = 409;
  error.code = 'INSUFFICIENT_STOCK';
  error.expose = true;
  return error;
}

async function changeInventory(client, items = [], direction) {
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw inventoryError(item.name);
    if (direction === 'reserve') {
      const result = await client.query(
        `UPDATE querubim_catalog_products
         SET stock = stock - $2::integer, updated_at = NOW()
         WHERE id = $1 AND active = TRUE AND stock >= $2::integer
         RETURNING id`,
        [item.productId, quantity],
      );
      if (!result.rows[0]) throw inventoryError(item.name);
    } else {
      await client.query(
        `UPDATE querubim_catalog_products
         SET stock = stock + $2::integer, updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [item.productId, quantity],
      );
    }
  }
}

export class PostgresOrderStore {
  constructor(pool) {
    this.pool = pool;
  }

  async create(order) {
    await ensurePostgresSchema(this.pool);
    try {
      await this.pool.query(
        `INSERT INTO querubim_payment_orders (id, data)
         VALUES ($1, $2::jsonb)`,
        [order.id, JSON.stringify(order)],
      );
      return order;
    } catch (error) {
      if (error.code === '23505') throw new Error('La referencia de la orden ya existe.');
      throw error;
    }
  }

  async createWithReservation(order) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await changeInventory(client, order.items, 'reserve');
      await client.query(
        `INSERT INTO querubim_payment_orders (id, data)
         VALUES ($1, $2::jsonb)`,
        [order.id, JSON.stringify(order)],
      );
      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') throw new Error('La referencia de la orden ya existe.');
      throw error;
    } finally {
      client.release();
    }
  }

  async releaseExpiredReservations(nowIso = new Date().toISOString()) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    let released = 0;
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT id, data FROM querubim_payment_orders FOR UPDATE');
      for (const row of result.rows) {
        const order = row.data;
        if (
          order?.inventoryStatus !== 'RESERVED' ||
          order?.status !== 'CREATED' ||
          !order?.expiresAt ||
          Date.parse(order.expiresAt) > Date.parse(nowIso)
        ) continue;

        await changeInventory(client, order.items, 'release');
        const expired = {
          ...order,
          status: 'EXPIRED',
          inventoryStatus: 'RELEASED',
          fulfillmentStatus: 'CANCELLED',
          expiredAt: nowIso,
        };
        await client.query(
          `UPDATE querubim_payment_orders SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
          [row.id, JSON.stringify(expired)],
        );
        released += 1;
      }
      await client.query('COMMIT');
      return released;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async get(orderId) {
    await ensurePostgresSchema(this.pool);
    await this.releaseExpiredReservations();
    const result = await this.pool.query(
      'SELECT data FROM querubim_payment_orders WHERE id = $1',
      [orderId],
    );
    return result.rows[0]?.data ?? null;
  }

  async list(limit = 100) {
    await ensurePostgresSchema(this.pool);
    await this.releaseExpiredReservations();
    const result = await this.pool.query(
      `SELECT data FROM querubim_payment_orders
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows.map((row) => row.data);
  }

  async update(orderId, updateOrder) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query(
        'SELECT data FROM querubim_payment_orders WHERE id = $1 FOR UPDATE',
        [orderId],
      );
      if (!selected.rows[0]) {
        await client.query('COMMIT');
        return null;
      }
      const order = updateOrder(selected.rows[0].data);
      await client.query(
        `UPDATE querubim_payment_orders
         SET data = $2::jsonb, updated_at = NOW()
         WHERE id = $1`,
        [orderId, JSON.stringify(order)],
      );
      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordEvent(eventId, eventRecord, updateOrder) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const existingEvent = await client.query(
        'SELECT id FROM querubim_payment_events WHERE id = $1',
        [eventId],
      );
      if (existingEvent.rows.length > 0) {
        const existing = await client.query(
          'SELECT data FROM querubim_payment_orders WHERE id = $1',
          [eventRecord.orderId],
        );
        await client.query('COMMIT');
        return { duplicate: true, order: existing.rows[0]?.data ?? null };
      }

      await client.query(
        `INSERT INTO querubim_payment_events (id, order_id, data)
         VALUES ($1, $2, $3::jsonb)`,
        [eventId, eventRecord.orderId, JSON.stringify(eventRecord)],
      );

      const selected = await client.query(
        'SELECT data FROM querubim_payment_orders WHERE id = $1 FOR UPDATE',
        [eventRecord.orderId],
      );
      let order = selected.rows[0]?.data ?? null;
      if (order && updateOrder) {
        const currentOrder = order;
        order = updateOrder(currentOrder);
        const releasesInventory =
          ['RESERVED', 'COMMITTED'].includes(currentOrder.inventoryStatus) &&
          order.inventoryStatus === 'RELEASED';
        if (releasesInventory) await changeInventory(client, currentOrder.items, 'release');
        await client.query(
          `UPDATE querubim_payment_orders
           SET data = $2::jsonb, updated_at = NOW()
           WHERE id = $1`,
          [eventRecord.orderId, JSON.stringify(order)],
        );
      }

      await client.query('COMMIT');
      return { duplicate: false, order };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        const existing = await this.pool.query(
          'SELECT data FROM querubim_payment_orders WHERE id = $1',
          [eventRecord.orderId],
        );
        return { duplicate: true, order: existing.rows[0]?.data ?? null };
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
