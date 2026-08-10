import path from 'node:path';

function normalizeEnvironment(value) {
  return String(value ?? '').trim().toLowerCase() === 'production' ? 'production' : 'test';
}

export function createRuntimeConfig(env = process.env, rootDir = process.cwd()) {
  const port = Number(env.PORT) || 4173;
  const environment = normalizeEnvironment(env.BOLD_ENVIRONMENT);
  const publicBaseUrl = env.PUBLIC_BASE_URL || `http://localhost:${port}`;
  const databaseUrl = String(env.DATABASE_URL || '').trim();
  const isVercel = Boolean(env.VERCEL);

  return {
    port,
    rootDir,
    runtimeDir: path.resolve(rootDir, env.RUNTIME_DATA_DIR || 'var'),
    storage: {
      databaseUrl,
      mode: databaseUrl ? 'postgresql' : isVercel ? 'unconfigured' : 'json',
    },
    admin: {
      email: String(env.ADMIN_EMAIL || '').trim().toLowerCase(),
      password: String(env.ADMIN_PASSWORD || ''),
      sessionSecret: String(env.ADMIN_SESSION_SECRET || ''),
      sessionTtlMs: 15 * 60 * 1000,
      publicBaseUrl,
    },
    bold: {
      environment,
      identityKey: String(env.BOLD_IDENTITY_KEY || '').trim(),
      secretKey: String(env.BOLD_SECRET_KEY || '').trim(),
      publicBaseUrl,
      tax: String(env.BOLD_TAX || '').trim(),
      productionEnabled: env.ALLOW_BOLD_PRODUCTION === 'true',
    },
  };
}
