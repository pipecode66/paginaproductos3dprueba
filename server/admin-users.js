import crypto from 'node:crypto';

export const ADMIN_PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  FINANCIALS_VIEW: 'financials.view',
  CATALOG_MANAGE: 'catalog.manage',
  CATEGORIES_MANAGE: 'categories.manage',
  GOLD_MANAGE: 'gold.manage',
  ORDERS_MANAGE: 'orders.manage',
  INTERNATIONAL_MANAGE: 'international.manage',
  CONTENT_MANAGE: 'content.manage',
  CATALOG_EXPORT: 'catalog.export',
  TEAM_MANAGE: 'team.manage',
});

export const ADMIN_PERMISSION_OPTIONS = Object.freeze([
  { key: ADMIN_PERMISSIONS.DASHBOARD_VIEW, label: 'Ver resumen del negocio' },
  { key: ADMIN_PERMISSIONS.FINANCIALS_VIEW, label: 'Ver ingresos y estadísticas financieras' },
  { key: ADMIN_PERMISSIONS.CATALOG_MANAGE, label: 'Administrar productos e inventario' },
  { key: ADMIN_PERMISSIONS.CATEGORIES_MANAGE, label: 'Administrar categorías y plantillas' },
  { key: ADMIN_PERMISSIONS.GOLD_MANAGE, label: 'Actualizar el precio del oro' },
  { key: ADMIN_PERMISSIONS.ORDERS_MANAGE, label: 'Administrar pedidos y entregas' },
  { key: ADMIN_PERMISSIONS.INTERNATIONAL_MANAGE, label: 'Administrar ventas internacionales' },
  { key: ADMIN_PERMISSIONS.CONTENT_MANAGE, label: 'Administrar contenido comercial' },
  { key: ADMIN_PERMISSIONS.CATALOG_EXPORT, label: 'Exportar el catálogo' },
]);

const PERMISSION_SET = new Set(Object.values(ADMIN_PERMISSIONS));
export const ALL_ADMIN_PERMISSIONS = Object.freeze([...PERMISSION_SET]);
export const DEFAULT_EMPLOYEE_PERMISSIONS = Object.freeze([
  ADMIN_PERMISSIONS.DASHBOARD_VIEW,
  ADMIN_PERMISSIONS.CATALOG_MANAGE,
  ADMIN_PERMISSIONS.ORDERS_MANAGE,
]);

export class AdminUserError extends Error {
  constructor(message, code = 'INVALID_ADMIN_USER', statusCode = 400) {
    super(message);
    this.name = 'AdminUserError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

export function normalizeAdminEmail(value) {
  return String(value ?? '').trim().toLowerCase().slice(0, 160);
}

export function validateAdminEmail(value) {
  const email = normalizeAdminEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminUserError('Ingresa un correo válido para el perfil administrativo.', 'INVALID_ADMIN_EMAIL');
  }
  return email;
}

export function normalizePermissions(value, role = 'employee') {
  if (role === 'master') return [...ALL_ADMIN_PERMISSIONS];
  if (!Array.isArray(value)) return [...DEFAULT_EMPLOYEE_PERMISSIONS];
  return [...new Set(value.map(String).filter((permission) => PERMISSION_SET.has(permission) && permission !== ADMIN_PERMISSIONS.TEAM_MANAGE))];
}

export function hasAdminPermission(user, permission) {
  return user?.role === 'master' || user?.role === 'bootstrap' || user?.permissions?.includes(permission);
}

export function sanitizeAdminUser(user) {
  if (!user) return null;
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    active: user.active !== false,
    permissions: normalizePermissions(user.permissions, user.role),
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    lastLoginAt: user.lastLoginAt || null,
    invitationExpiresAt: user.inviteExpiresAt ? new Date(Number(user.inviteExpiresAt)).toISOString() : null,
  };
}

export function createInvitationToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashInvitationToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

export function invitationTokenMatches(token, expectedHash) {
  const received = Buffer.from(hashInvitationToken(token));
  const expected = Buffer.from(String(expectedHash || ''));
  return received.length === expected.length && received.length > 0 && crypto.timingSafeEqual(received, expected);
}

export function buildInvitedAdminUser({
  email,
  name,
  role = 'employee',
  permissions,
  tokenHash,
  createdBy,
  now = Date.now(),
  expiresAt = now + 24 * 60 * 60 * 1000,
}) {
  const normalizedRole = role === 'master' ? 'master' : 'employee';
  const normalizedName = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  if (!normalizedName) throw new AdminUserError('El nombre del usuario administrativo es obligatorio.', 'ADMIN_NAME_REQUIRED');
  return {
    email: validateAdminEmail(email),
    name: normalizedName,
    role: normalizedRole,
    status: 'INVITED',
    active: true,
    passwordHash: null,
    permissions: normalizePermissions(permissions, normalizedRole),
    inviteTokenHash: String(tokenHash || ''),
    inviteExpiresAt: Number(expiresAt),
    createdBy: normalizeAdminEmail(createdBy),
    createdAt: Number(now),
    updatedAt: Number(now),
    lastLoginAt: null,
  };
}
