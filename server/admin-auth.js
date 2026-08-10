import crypto from 'node:crypto';

const COOKIE_NAME = 'querubim_admin_session';

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

function cookieOptions(config) {
  return {
    httpOnly: true,
    secure: /^https:/i.test(config.publicBaseUrl),
    sameSite: 'strict',
    path: '/',
    maxAge: config.sessionTtlMs,
  };
}

export function isAdminConfigured(config) {
  return Boolean(config?.email && config?.password && config?.sessionSecret);
}

export function verifyAdminCredentials(email, password, config) {
  if (!isAdminConfigured(config)) {
    throw new AdminAuthError('El acceso administrativo todavía no está configurado.', 503, 'ADMIN_NOT_CONFIGURED');
  }

  return safeEqual(String(email).trim().toLowerCase(), config.email) && safeEqual(password, config.password);
}

export function createAdminSession(email, config, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email, exp: now + config.sessionTtlMs, nonce: crypto.randomBytes(12).toString('hex') }),
  ).toString('base64url');
  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

export function verifyAdminSession(token, config, now = Date.now()) {
  if (!token || !isAdminConfigured(config)) return null;
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload, config.sessionSecret))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.exp <= now || session.sub !== config.email) return null;
    return session;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response, email, config) {
  response.cookie(COOKIE_NAME, createAdminSession(email, config), cookieOptions(config));
}

export function clearAdminSessionCookie(response, config) {
  const { maxAge, ...options } = cookieOptions(config);
  response.clearCookie(COOKIE_NAME, options);
}

export function getAdminSession(request, config) {
  return verifyAdminSession(parseCookies(request.headers.cookie)[COOKIE_NAME], config);
}

export function requireAdmin(config) {
  return (request, response, next) => {
    const session = getAdminSession(request, config);
    if (!session) {
      response.status(401).json({ error: 'La sesión administrativa no es válida o expiró.', code: 'ADMIN_UNAUTHORIZED' });
      return;
    }

    if (request.method !== 'GET' && request.get('x-querubim-admin') !== '1') {
      response.status(403).json({ error: 'La solicitud administrativa no pudo verificarse.', code: 'ADMIN_REQUEST_REJECTED' });
      return;
    }

    request.admin = session;
    next();
  };
}
