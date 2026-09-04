import crypto from 'node:crypto';
import { ensurePostgresSchema } from './postgres.js';

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export class PostgresAdminSecurityStore {
  constructor(pool) {
    this.pool = pool;
  }

  async ready() {
    await ensurePostgresSchema(this.pool);
    return true;
  }

  async getLoginLock(keys, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    let lockedUntil = 0;
    for (const key of keys) {
      const result = await this.pool.query(
        'SELECT locked_until FROM querubim_admin_login_limits WHERE key_hash = $1',
        [key],
      );
      lockedUntil = Math.max(lockedUntil, Number(result.rows[0]?.locked_until || 0));
    }
    return lockedUntil > now ? lockedUntil : 0;
  }

  async recordLoginFailure(keys, policy, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    let latestLock = 0;
    try {
      await client.query('BEGIN');
      for (const key of keys) {
        const result = await client.query(
          'SELECT attempts, window_started_at, locked_until FROM querubim_admin_login_limits WHERE key_hash = $1 FOR UPDATE',
          [key],
        );
        const current = result.rows[0];
        const inWindow = current && Number(current.window_started_at) + policy.windowMs > now;
        const attempts = inWindow ? Number(current.attempts) + 1 : 1;
        const lockedUntil = Number(current?.locked_until || 0) > now
          ? Number(current.locked_until)
          : attempts >= policy.limit ? now + policy.lockMs : 0;
        await client.query(
          `INSERT INTO querubim_admin_login_limits
            (key_hash, attempts, window_started_at, locked_until, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (key_hash) DO UPDATE SET
             attempts = EXCLUDED.attempts,
             window_started_at = EXCLUDED.window_started_at,
             locked_until = EXCLUDED.locked_until,
             updated_at = EXCLUDED.updated_at`,
          [key, attempts, inWindow ? Number(current.window_started_at) : now, lockedUntil || null, now],
        );
        latestLock = Math.max(latestLock, lockedUntil);
      }
      await client.query('COMMIT');
      return { lockedUntil: latestLock };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async clearLoginFailures(keys) {
    await ensurePostgresSchema(this.pool);
    for (const key of keys) {
      await this.pool.query('DELETE FROM querubim_admin_login_limits WHERE key_hash = $1', [key]);
    }
  }

  async createSession({ id, email, expiresAt, createdAt = Date.now() }) {
    await ensurePostgresSchema(this.pool);
    await this.pool.query(
      `INSERT INTO querubim_admin_sessions
        (id_hash, email, expires_at, created_at, last_seen_at, revoked_at)
       VALUES ($1, $2, $3, $4, $4, NULL)`,
      [digest(id), email, expiresAt, createdAt],
    );
    await this.pool.query(
      'DELETE FROM querubim_admin_sessions WHERE expires_at < $1',
      [createdAt - 86_400_000],
    );
    return true;
  }

  async getSession(id, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT email, expires_at, created_at, last_seen_at, revoked_at
       FROM querubim_admin_sessions
       WHERE id_hash = $1 AND revoked_at IS NULL AND expires_at > $2`,
      [digest(id), now],
    );
    const session = result.rows[0];
    if (!session) return null;
    return {
      email: session.email,
      expiresAt: Number(session.expires_at),
      createdAt: Number(session.created_at),
      lastSeenAt: Number(session.last_seen_at),
      revokedAt: session.revoked_at ? Number(session.revoked_at) : null,
    };
  }

  async touchSession(id, expiresAt, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `UPDATE querubim_admin_sessions
       SET expires_at = $2, last_seen_at = $3
       WHERE id_hash = $1 AND revoked_at IS NULL AND expires_at > $3
       RETURNING email, expires_at, created_at, last_seen_at, revoked_at`,
      [digest(id), expiresAt, now],
    );
    const session = result.rows[0];
    return session ? {
      email: session.email,
      expiresAt: Number(session.expires_at),
      createdAt: Number(session.created_at),
      lastSeenAt: Number(session.last_seen_at),
      revokedAt: session.revoked_at ? Number(session.revoked_at) : null,
    } : null;
  }

  async revokeSession(id, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'UPDATE querubim_admin_sessions SET revoked_at = $2 WHERE id_hash = $1 AND revoked_at IS NULL',
      [digest(id), now],
    );
    return result.rowCount > 0;
  }

  async revokeSessionsByEmail(email, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'UPDATE querubim_admin_sessions SET revoked_at = $2 WHERE email = $1 AND revoked_at IS NULL',
      [email, now],
    );
    return result.rowCount;
  }

  async revokeAllSessions(now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'UPDATE querubim_admin_sessions SET revoked_at = $1 WHERE revoked_at IS NULL',
      [now],
    );
    return result.rowCount;
  }

  async getLastTotpStep(email) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      'SELECT last_time_step FROM querubim_admin_totp_state WHERE email = $1',
      [email],
    );
    return result.rows[0] ? Number(result.rows[0].last_time_step) : undefined;
  }

  async consumeTotpStep(email, timeStep, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const current = await this.getLastTotpStep(email);
    if (Number.isInteger(current) && timeStep <= current) return false;

    const result = await this.pool.query(
      `INSERT INTO querubim_admin_totp_state (email, last_time_step, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         last_time_step = EXCLUDED.last_time_step,
         updated_at = EXCLUDED.updated_at
       WHERE querubim_admin_totp_state.last_time_step < EXCLUDED.last_time_step
       RETURNING last_time_step`,
      [email, timeStep, now],
    );
    return result.rowCount > 0;
  }
}
