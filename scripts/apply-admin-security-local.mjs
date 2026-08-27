import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function replaceEnvValue(contents, name, value) {
  const line = `${name}=${JSON.stringify(String(value))}`;
  const pattern = new RegExp(`^${name}=.*$`, 'm');
  return pattern.test(contents) ? contents.replace(pattern, line) : `${contents.trimEnd()}\n${line}\n`;
}

const targetPath = path.resolve(argumentValue('--target') || '.env.local');
const securityPath = path.resolve(argumentValue('--env') || 'artifacts/admin-security/admin-security.env');
const credentialsPath = path.resolve(argumentValue('--credentials') || 'artifacts/admin-security/credenciales-iniciales.txt');
const security = dotenv.parse(await readFile(securityPath, 'utf8'));
const credentials = await readFile(credentialsPath, 'utf8');
const password = credentials.match(/^Contraseña: (.+)$/m)?.[1];
if (!password) throw new Error(`No fue posible leer la contraseña inicial desde ${credentialsPath}.`);

const updates = {
  ADMIN_EMAIL: security.ADMIN_EMAIL,
  ADMIN_PASSWORD: password,
  ADMIN_PASSWORD_HASH: security.ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_SECRET: security.ADMIN_SESSION_SECRET,
  ADMIN_TOTP_SECRET: security.ADMIN_TOTP_SECRET,
  ADMIN_TOTP_REQUIRED: security.ADMIN_TOTP_REQUIRED || 'true',
  ADMIN_SECURITY_ENFORCED: 'true',
};

let target = await readFile(targetPath, 'utf8');
for (const [name, value] of Object.entries(updates)) {
  if (!value) throw new Error(`Falta ${name} en los archivos de seguridad.`);
  target = replaceEnvValue(target, name, value);
}
await writeFile(targetPath, target, { mode: 0o600 });
console.log(`Configuración local reforzada en ${targetPath} sin mostrar secretos.`);
