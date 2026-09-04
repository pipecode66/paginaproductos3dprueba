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
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_site_content (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_international_requests (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS querubim_international_requests_created_at_idx
      ON querubim_international_requests (created_at DESC)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_admin_sessions (
        id_hash TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at BIGINT NOT NULL,
        last_seen_at BIGINT NOT NULL,
        revoked_at BIGINT
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS querubim_admin_sessions_email_idx
      ON querubim_admin_sessions (email, expires_at DESC)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_admin_login_limits (
        key_hash TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL DEFAULT 0,
        window_started_at BIGINT NOT NULL,
        locked_until BIGINT,
        updated_at BIGINT NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_admin_totp_state (
        email TEXT PRIMARY KEY,
        last_time_step BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_business_settings (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS querubim_admin_users (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('master', 'employee')),
        status TEXT NOT NULL CHECK (status IN ('INVITED', 'ACTIVE')),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        password_hash TEXT,
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        invite_token_hash TEXT,
        invite_expires_at BIGINT,
        created_by TEXT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        last_login_at BIGINT
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS querubim_admin_users_role_idx
      ON querubim_admin_users (role, status, active)
    `);

    for (const product of catalogSeed) {
      await client.query(
        `INSERT INTO querubim_catalog_products
          (id, name, category, price, stock, measurements, active, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           data = EXCLUDED.data || querubim_catalog_products.data`,
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
