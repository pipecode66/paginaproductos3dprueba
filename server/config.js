import path from 'node:path';

function normalizeEnvironment(value) {
  return String(value ?? '').trim().toLowerCase() === 'production' ? 'production' : 'test';
}

function resolveBoldCredentials(env, environment) {
  const prefix = environment === 'production' ? 'BOLD_PRODUCTION' : 'BOLD_TEST';
  const scopedIdentityKey = String(env[`${prefix}_IDENTITY_KEY`] || '').trim();
  const scopedSecretKey = String(env[`${prefix}_SECRET_KEY`] || '').trim();
  const hasScopedCredentials = Boolean(scopedIdentityKey || scopedSecretKey);

  if (hasScopedCredentials) {
    return {
      identityKey: scopedIdentityKey,
      secretKey: scopedSecretKey,
      credentialEnvironment: environment,
      credentialSource: `${environment}_specific`,
    };
  }

  return {
    identityKey: String(env.BOLD_IDENTITY_KEY || '').trim(),
    secretKey: String(env.BOLD_SECRET_KEY || '').trim(),
    credentialEnvironment: 'legacy',
    credentialSource: 'legacy',
  };
}

export function createRuntimeConfig(env = process.env, rootDir = process.cwd()) {
  const port = Number(env.PORT) || 4173;
  const environment = normalizeEnvironment(env.BOLD_ENVIRONMENT);
  const publicBaseUrl = env.PUBLIC_BASE_URL || `http://localhost:${port}`;
  const databaseUrl = String(env.DATABASE_URL || '').trim();
  const isVercel = Boolean(env.VERCEL);
  const adminSecurityEnforced = isVercel || env.ADMIN_SECURITY_ENFORCED === 'true';
  const boldCredentials = resolveBoldCredentials(env, environment);

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
      passwordHash: String(env.ADMIN_PASSWORD_HASH || ''),
      sessionSecret: String(env.ADMIN_SESSION_SECRET || ''),
      totpSecret: String(env.ADMIN_TOTP_SECRET || '').replace(/\s+/g, '').toUpperCase(),
      sessionTtlMs: 15 * 60 * 1000,
      publicBaseUrl,
      allowLegacyPassword: !adminSecurityEnforced,
      securityEnforced: adminSecurityEnforced,
      enforceOrigin: adminSecurityEnforced,
      loginPolicy: {
        windowMs: 15 * 60 * 1000,
        limit: 5,
        lockMs: 15 * 60 * 1000,
      },
    },
    r2: {
      accountId: String(env.CLOUDFLARE_R2_ACCOUNT_ID || '').trim(),
      accessKeyId: String(env.CLOUDFLARE_R2_ACCESS_KEY_ID || '').trim(),
      secretAccessKey: String(env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '').trim(),
      bucket: String(env.CLOUDFLARE_R2_BUCKET || '').trim(),
      publicUrl: String(env.CLOUDFLARE_R2_PUBLIC_URL || '').trim().replace(/\/+$/, ''),
    },
    bold: {
      environment,
      ...boldCredentials,
      publicBaseUrl,
      tax: 'vat-19',
      productionEnabled: env.ALLOW_BOLD_PRODUCTION === 'true',
    },
  };
}
