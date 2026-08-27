import crypto from 'node:crypto';
import argon2 from 'argon2';
import { verify as verifyTotp } from 'otplib';

const COOKIE_NAME = 'querubim_admin_session';
const SECURE_COOKIE_NAME = '__Host-querubim_admin_session';
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
};

export class AdminAuthError extends Error {
  constructor(message, statusCode = 401, code = 'ADMIN_UNAUTHORIZED') {
    super(message);
    this.name = 'AdminAuthError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

function safeEqual(first, second) {
  const firstBuffer = Buffer.from(String(first));
  const secondBuffer = Buffer.from(String(second));
  if (firstBuffer.length !== secondBuffer.length) return false;
  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function parseCookies(header = '') {
  return String(header)
    .split(';')
    .map((part) => part.trim().split('='))
    .reduce((cookies, [name, ...value]) => {
      if (name) cookies[name] = decodeURIComponent(value.join('='));
      return cookies;
    }, {});
}

function isSecure(config) {
  return /^https:/i.test(config.publicBaseUrl);
}

function cookieName(config) {
  return isSecure(config) ? SECURE_COOKIE_NAME : COOKIE_NAME;
}

function cookieOptions(config) {
  return {
    httpOnly: true,
    secure: isSecure(config),
    sameSite: 'strict',
    path: '/',
    maxAge: config.sessionTtlMs,
    priority: 'high',
  };
}

export function isAdminHardened(config) {
  const totpReady = config?.totpRequired === false
    || String(config?.totpSecret || '').length >= 26;
  return Boolean(
    config?.email
    && String(config.passwordHash || '').startsWith('$argon2id$')
    && String(config.sessionSecret || '').length >= 32
    && totpReady,
  );
}

export function isAdminConfigured(config) {
  const hasPassword = Boolean(
    String(config?.passwordHash || '').startsWith('$argon2id$')
    || (config?.allowLegacyPassword !== false && config?.password),
  );
  if (!config?.email || !hasPassword || !config?.sessionSecret) return false;
  return !config.securityEnforced || isAdminHardened(config);
}

export async function hashAdminPassword(password) {
  const normalized = String(password || '');
  if (normalized.length < 12) {
    throw new AdminAuthError('La contraseña administrativa debe tener al menos 12 caracteres.', 400, 'ADMIN_PASSWORD_WEAK');
  }
  return argon2.hash(normalized, ARGON2_OPTIONS);
}

export async function verifyAdminCredentials(email, password, config) {
  if (!isAdminConfigured(config)) {
    throw new AdminAuthError('El acceso administrativo todavía no está configurado.', 503, 'ADMIN_NOT_CONFIGURED');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPassword = String(password || '');
  if (!normalizedPassword || normalizedPassword.length > 512) return false;

  let passwordMatches = false;
  try {
    if (config.passwordHash) passwordMatches = await argon2.verify(config.passwordHash, normalizedPassword);
    else if (config.allowLegacyPassword !== false) passwordMatches = safeEqual(normalizedPassword, config.password);
  } catch {
    passwordMatches = false;
  }

  return safeEqual(normalizedEmail, config.email) && passwordMatches;
}

export async function verifyAdminTotpCode(token, config, afterTimeStep) {
  if (config.totpRequired === false) return { valid: true, timeStep: undefined };
  if (!config.totpSecret) return { valid: !config.securityEnforced, timeStep: undefined };
  const normalized = String(token || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) return { valid: false, timeStep: undefined };
  try {
    return verifyTotp({
      secret: config.totpSecret,
      token: normalized,
      epochTolerance: 30,
      ...(Number.isInteger(afterTimeStep) ? { afterTimeStep } : {}),
    });
  } catch {
    return { valid: false, timeStep: undefined };
  }
}

export function createAdminSessionId() {
  return crypto.randomBytes(32).toString('base64url');
}

export function createAdminSession(email, config, now = Date.now(), sessionId = createAdminSessionId()) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email, sid: sessionId, exp: now + config.sessionTtlMs, ver: 2 }),
  ).toString('base64url');
  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

export function verifyAdminSession(token, config, now = Date.now()) {
  if (!token || !isAdminConfigured(config)) return null;
  const [payload, signature, extra] = String(token).split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload, config.sessionSecret))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (
      session.ver !== 2
      || session.exp <= now
      || session.sub !== config.email
      || !/^[A-Za-z0-9_-]{40,60}$/.test(session.sid || '')
    ) return null;
    return session;
  } catch {
    return null;
  }
}

export function createAdminCsrfToken(sessionId, config) {
  return sign(`csrf:${sessionId}`, config.sessionSecret);
}

export function createAdminLoginKeys(request, email, config) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const address = String(request.ip || request.socket?.remoteAddress || 'unknown').trim();
  return [
    `account:${sign(normalizedEmail || 'unknown', config.sessionSecret)}`,
    `address:${sign(address, config.sessionSecret)}`,
  ];
}

export function isTrustedAdminOrigin(request, config) {
  const origin = String(request.get('origin') || '').trim();
  if (!origin) return !config.enforceOrigin;
  try {
    return new URL(origin).origin === new URL(config.publicBaseUrl).origin;
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(response, token, config) {
  response.cookie(cookieName(config), token, cookieOptions(config));
}

export function clearAdminSessionCookie(response, config) {
  const { maxAge, ...options } = cookieOptions(config);
  response.clearCookie(cookieName(config), options);
  if (cookieName(config) !== COOKIE_NAME) response.clearCookie(COOKIE_NAME, { ...options, secure: false });
}

export function getAdminSession(request, config) {
  return verifyAdminSession(parseCookies(request.headers.cookie)[cookieName(config)], config);
}

export async function resolveAdminSession(request, config, securityStore, now = Date.now()) {
  const signedSession = getAdminSession(request, config);
  if (!signedSession) return null;
  const storedSession = await securityStore.getSession(signedSession.sid, now);
  if (!storedSession || storedSession.email !== signedSession.sub) return null;
  return signedSession;
}

export function requireAdmin(config, securityStore) {
  return async (request, response, next) => {
    try {
      const session = await resolveAdminSession(request, config, securityStore);
      if (!session) {
        response.status(401).json({ error: 'La sesión administrativa no es válida o expiró.', code: 'ADMIN_UNAUTHORIZED' });
        return;
      }

      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const csrfToken = String(request.get('x-querubim-csrf') || '');
        if (!isTrustedAdminOrigin(request, config) || !safeEqual(csrfToken, createAdminCsrfToken(session.sid, config))) {
          response.status(403).json({ error: 'La solicitud administrativa no pudo verificarse.', code: 'ADMIN_REQUEST_REJECTED' });
          return;
        }
      }

      request.admin = session;
      next();
    } catch {
      response.status(503).json({ error: 'La protección administrativa no está disponible.', code: 'ADMIN_SECURITY_UNAVAILABLE' });
    }
  };
}
