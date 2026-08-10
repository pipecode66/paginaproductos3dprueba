import { ensurePostgresSchema } from './postgres.js';

function mapProduct(row) {
  return {
    ...(row.data || {}),
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    measurements: row.measurements,
    active: row.active,
  };
}

export class PostgresCatalogRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async ready() {
    await ensurePostgresSchema(this.pool);
    await this.pool.query('SELECT 1');
    return true;
  }

  async listActive() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(`
      SELECT id, name, category, price, stock, measurements, active, data
      FROM querubim_catalog_products
      WHERE active = TRUE
      ORDER BY created_at, id
    `);
    return result.rows.map(mapProduct);
  }

  async listAll() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(`
      SELECT id, name, category, price, stock, measurements, active, data
      FROM querubim_catalog_products
      ORDER BY created_at, id
    `);
    return result.rows.map(mapProduct);
  }

  async findById(productId) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT id, name, category, price, stock, measurements, active, data
       FROM querubim_catalog_products
       WHERE id = $1 AND active = TRUE`,
      [productId],
    );
    return result.rows[0] ? mapProduct(result.rows[0]) : null;
  }

  async upsert(product) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `INSERT INTO querubim_catalog_products
        (id, name, category, price, stock, measurements, active, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        measurements = EXCLUDED.measurements,
        active = EXCLUDED.active,
        data = EXCLUDED.data,
        updated_at = NOW()
       RETURNING id, name, category, price, stock, measurements, active, data`,
      [
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        JSON.stringify(product.measurements),
        product.active !== false,
        JSON.stringify(product),
      ],
    );
    return mapProduct(result.rows[0]);
  }

  async deactivate(productId) {
    await ensurePostgresSchema(this.pool);
    const existing = await this.pool.query(
      'SELECT data FROM querubim_catalog_products WHERE id = $1',
      [productId],
    );
    if (!existing.rows[0]) return null;
    const data = { ...(existing.rows[0].data || {}), active: false };
    const result = await this.pool.query(
      `UPDATE querubim_catalog_products
       SET active = FALSE, data = $2::jsonb, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, category, price, stock, measurements, active, data`,
      [productId, JSON.stringify(data)],
    );
    return mapProduct(result.rows[0]);
  }
}
