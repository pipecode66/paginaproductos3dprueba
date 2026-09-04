import {
  buildInvitedAdminUser,
  invitationTokenMatches,
  normalizeAdminEmail,
  normalizePermissions,
} from './admin-users.js';
import { ensurePostgresSchema } from './postgres.js';

function mapUser(row) {
  if (!row) return null;
  return {
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    active: row.active,
    passwordHash: row.password_hash,
    permissions: row.permissions || [],
    inviteTokenHash: row.invite_token_hash,
    inviteExpiresAt: row.invite_expires_at == null ? null : Number(row.invite_expires_at),
    createdBy: row.created_by,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    lastLoginAt: row.last_login_at == null ? null : Number(row.last_login_at),
  };
}

const USER_COLUMNS = `email, name, role, status, active, password_hash, permissions,
  invite_token_hash, invite_expires_at, created_by, created_at, updated_at, last_login_at`;

export class PostgresAdminUserStore {
  constructor(pool) {
    this.pool = pool;
  }

  async ready() {
    await ensurePostgresSchema(this.pool);
    return true;
  }

  async list() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(`SELECT ${USER_COLUMNS} FROM querubim_admin_users ORDER BY created_at, email`);
    return result.rows.map(mapUser);
  }

  async findByEmail(email) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT ${USER_COLUMNS} FROM querubim_admin_users WHERE email = $1`,
      [normalizeAdminEmail(email)],
    );
    return mapUser(result.rows[0]);
  }

  async hasActiveMaster() {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `SELECT 1 FROM querubim_admin_users
       WHERE role = 'master' AND status = 'ACTIVE' AND active = TRUE LIMIT 1`,
    );
    return result.rowCount > 0;
  }

  async createInvitation(input) {
    await ensurePostgresSchema(this.pool);
    const invited = buildInvitedAdminUser(input);
    const existing = await this.findByEmail(invited.email);
    if (existing?.status === 'ACTIVE') return null;
    const result = await this.pool.query(
      `INSERT INTO querubim_admin_users
        (email, name, role, status, active, password_hash, permissions, invite_token_hash,
         invite_expires_at, created_by, created_at, updated_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, NULL, $6::jsonb, $7, $8, $9, $10, $10, NULL)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status, active = TRUE,
         password_hash = NULL, permissions = EXCLUDED.permissions,
         invite_token_hash = EXCLUDED.invite_token_hash, invite_expires_at = EXCLUDED.invite_expires_at,
         created_by = EXCLUDED.created_by, updated_at = EXCLUDED.updated_at
       RETURNING ${USER_COLUMNS}`,
      [
        invited.email,
        invited.name,
        invited.role,
        invited.status,
        invited.active,
        JSON.stringify(invited.permissions),
        invited.inviteTokenHash,
        invited.inviteExpiresAt,
        invited.createdBy,
        invited.createdAt,
      ],
    );
    return mapUser(result.rows[0]);
  }

  async activate(email, token, passwordHash, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const current = await client.query(
        `SELECT ${USER_COLUMNS} FROM querubim_admin_users WHERE email = $1 FOR UPDATE`,
        [normalizeAdminEmail(email)],
      );
      const user = mapUser(current.rows[0]);
      if (
        !user
        || user.status !== 'INVITED'
        || user.active === false
        || Number(user.inviteExpiresAt || 0) <= now
        || !invitationTokenMatches(token, user.inviteTokenHash)
      ) {
        await client.query('ROLLBACK');
        return null;
      }
      const result = await client.query(
        `UPDATE querubim_admin_users SET
          status = 'ACTIVE', password_hash = $2, invite_token_hash = NULL,
          invite_expires_at = NULL, updated_at = $3, last_login_at = $3
         WHERE email = $1 RETURNING ${USER_COLUMNS}`,
        [user.email, passwordHash, now],
      );
      await client.query('COMMIT');
      return mapUser(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(email, input = {}, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const current = await this.findByEmail(email);
    if (!current) return null;
    const name = typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().replace(/\s+/g, ' ').slice(0, 100)
      : current.name;
    const permissions = current.role === 'master'
      ? normalizePermissions([], 'master')
      : Array.isArray(input.permissions) ? normalizePermissions(input.permissions) : current.permissions;
    const active = current.role === 'master' ? true : typeof input.active === 'boolean' ? input.active : current.active;
    const result = await this.pool.query(
      `UPDATE querubim_admin_users SET name = $2, permissions = $3::jsonb, active = $4, updated_at = $5
       WHERE email = $1 RETURNING ${USER_COLUMNS}`,
      [current.email, name, JSON.stringify(permissions), active, now],
    );
    return mapUser(result.rows[0]);
  }

  async recordLogin(email, now = Date.now()) {
    await ensurePostgresSchema(this.pool);
    const result = await this.pool.query(
      `UPDATE querubim_admin_users SET last_login_at = $2, updated_at = $2
       WHERE email = $1 RETURNING ${USER_COLUMNS}`,
      [normalizeAdminEmail(email), now],
    );
    return mapUser(result.rows[0]);
  }
}
