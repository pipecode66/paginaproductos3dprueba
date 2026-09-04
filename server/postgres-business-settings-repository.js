import { cloneDefaultBusinessSettings, normalizeBusinessSettings } from './business-settings.js';
import { ensurePostgresSchema } from './postgres.js';

export class PostgresBusinessSettingsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async ready() {
    await ensurePostgresSchema(this.pool);
    return true;
  }

  async get() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'SELECT data FROM querubim_business_settings WHERE id = $1',
      ['commerce'],
    );
    return normalizeBusinessSettings(result.rows[0]?.data || cloneDefaultBusinessSettings());
  }

  async save(settings) {
    await ensurePostgresSchema(this.pool);
    const normalized = normalizeBusinessSettings(settings);
    const result = await this.pool.query(
      `INSERT INTO querubim_business_settings (id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data`,
      ['commerce', JSON.stringify(normalized)],
    );
    return normalizeBusinessSettings(result.rows[0].data);
  }
}
