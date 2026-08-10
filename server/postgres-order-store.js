import { ensurePostgresSchema } from './postgres.js';

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

  async get(orderId) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'SELECT data FROM querubim_payment_orders WHERE id = $1',
      [orderId],
    );
    return result.rows[0]?.data ?? null;
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
        order = updateOrder(order);
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
