import { ensurePostgresSchema } from './postgres.js';
import { getDefaultSiteContent } from './site-content.js';

export class PostgresSiteContentRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async get() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'SELECT data FROM querubim_site_content WHERE id = $1',
      ['commercial'],
    );
    return result.rows[0]?.data ?? getDefaultSiteContent();
  }

  async save(content) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `INSERT INTO querubim_site_content (id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data`,
      ['commercial', JSON.stringify(content)],
    );
    return result.rows[0].data;
  }
}
