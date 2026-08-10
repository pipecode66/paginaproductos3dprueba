import { attachDatabasePool } from '@vercel/functions';
import pg from 'pg';
import { catalogSeed } from './catalog-seed.js';

const { Pool } = pg;
let sharedPool;
let sharedConnectionString;
const schemaPromises = new WeakMap();

export function getPostgresPool(connectionString) {
  if (sharedPool && sharedConnectionString === connectionString) return sharedPool;

  sharedPool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  sharedConnectionString = connectionString;
  attachDatabasePool(sharedPool);
  return sharedPool;
}

async function createSchema(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_catalog_products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        measurements JSONB NOT NULL DEFAULT '[]'::jsonb,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      ALTER TABLE querubim_catalog_products
      ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_payment_orders (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_payment_events (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS querubim_payment_events_order_id_idx
      ON querubim_payment_events (order_id)
    `);

    for (const product of catalogSeed) {
      await client.query(
        `INSERT INTO querubim_catalog_products
          (id, name, category, price, stock, measurements, active, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb)
         ON CONFLICT (id) DO NOTHING`,
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
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function ensurePostgresSchema(pool) {
  if (!schemaPromises.has(pool)) {
    const schemaPromise = createSchema(pool).catch((error) => {
      schemaPromises.delete(pool);
      throw error;
    });
    schemaPromises.set(pool, schemaPromise);
  }
  return schemaPromises.get(pool);
}
