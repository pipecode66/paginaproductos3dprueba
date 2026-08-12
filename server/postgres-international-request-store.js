import { ensurePostgresSchema } from './postgres.js';

export class PostgresInternationalRequestStore {
  constructor(pool) {
    this.pool = pool;
  }

  async create(request) {
    await ensurePostgresSchema(this.pool);
    try {
      await this.pool.query(
        `INSERT INTO querubim_international_requests (id, data)
         VALUES ($1, $2::jsonb)`,
        [request.id, JSON.stringify(request)],
      );
      return request;
    } catch (error) {
      if (error.code === '23505') throw new Error('La referencia internacional ya existe.');
      throw error;
    }
  }

  async get(requestId) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'SELECT data FROM querubim_international_requests WHERE id = $1',
      [requestId],
    );
    return result.rows[0]?.data ?? null;
  }

  async list(limit = 100) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT data FROM querubim_international_requests
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows.map((row) => row.data);
  }

  async update(requestId, updateRequest) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query(
        'SELECT data FROM querubim_international_requests WHERE id = $1 FOR UPDATE',
        [requestId],
      );
      if (!selected.rows[0]) {
        await client.query('COMMIT');
        return null;
      }
      const request = updateRequest(selected.rows[0].data);
      await client.query(
        `UPDATE querubim_international_requests
         SET data = $2::jsonb, updated_at = NOW()
         WHERE id = $1`,
        [requestId, JSON.stringify(request)],
      );
      await client.query('COMMIT');
      return request;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
