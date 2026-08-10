import { ensurePostgresSchema } from './postgres.js';

function mapProduct(row) {
  return {
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
      SELECT id, name, category, price, stock, measurements, active
      FROM querubim_catalog_products
      WHERE active = TRUE
      ORDER BY created_at, id
    `);
    return result.rows.map(mapProduct);
  }

  async findById(productId) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT id, name, category, price, stock, measurements, active
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
        (id, name, category, price, stock, measurements, active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
       ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        measurements = EXCLUDED.measurements,
        active = EXCLUDED.active,
        updated_at = NOW()
       RETURNING id, name, category, price, stock, measurements, active`,
      [
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        JSON.stringify(product.measurements),
        product.active !== false,
      ],
    );
    return mapProduct(result.rows[0]);
  }
}
