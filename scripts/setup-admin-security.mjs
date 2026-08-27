import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { hashAdminPassword } from '../server/admin-auth.js';

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function envLine(name, value) {
  return `${name}=${JSON.stringify(String(value))}`;
}

const sourcePath = path.resolve(argumentValue('--env') || '.env.local');
const outputDir = path.resolve(argumentValue('--output') || 'artifacts/admin-security');
const shouldGeneratePassword = process.argv.includes('--generate-password');

let source;
try {
  source = dotenv.parse(await readFile(sourcePath, 'utf8'));
} catch {
  throw new Error(`No fue posible leer ${sourcePath}. Usa --env para indicar el archivo que contiene ADMIN_EMAIL y ADMIN_PASSWORD.`);
}

const email = String(source.ADMIN_EMAIL || '').trim().toLowerCase();
const password = shouldGeneratePassword
  ? crypto.randomBytes(18).toString('base64url')
  : String(source.ADMIN_PASSWORD || '');
if (!email || !password) {
  throw new Error('El archivo de origen debe contener ADMIN_EMAIL y ADMIN_PASSWORD, o debes usar --generate-password.');
}

const passwordHash = await hashAdminPassword(password);
const totpSecret = generateSecret();
const sessionSecret = crypto.randomBytes(48).toString('base64url');
const otpUri = generateURI({
  issuer: 'Joyería Querubim',
  label: email,
  secret: totpSecret,
});

await mkdir(outputDir, { recursive: true });
const envOutputPath = path.join(outputDir, 'admin-security.env');
const qrOutputPath = path.join(outputDir, 'querubim-admin-2fa.png');
const instructionsPath = path.join(outputDir, 'LEEME.txt');
const credentialsPath = path.join(outputDir, 'credenciales-iniciales.txt');

await writeFile(envOutputPath, [
  '# Archivo confidencial generado localmente. No compartir ni subir a Git.',
  envLine('ADMIN_EMAIL', email),
  envLine('ADMIN_PASSWORD_HASH', passwordHash),
  envLine('ADMIN_SESSION_SECRET', sessionSecret),
  envLine('ADMIN_TOTP_SECRET', totpSecret),
  'ADMIN_TOTP_REQUIRED=true',
  'ADMIN_SECURITY_ENFORCED=true',
  '',
].join('\n'), { mode: 0o600 });
await QRCode.toFile(qrOutputPath, otpUri, {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 720,
  color: { dark: '#211711', light: '#ffffff' },
});
await writeFile(instructionsPath, [
  'CONFIGURACIÓN CONFIDENCIAL DEL PANEL QUERUBIM',
  '',
  '1. Escanea querubim-admin-2fa.png con una aplicación autenticadora.',
  '2. Verifica un código de seis dígitos antes de activar estas variables en Vercel.',
  '3. Conserva una copia cifrada del QR como recuperación y elimina copias innecesarias.',
  '4. No subas ninguno de estos archivos a GitHub ni los envíes por mensajería.',
  '',
].join('\n'), { mode: 0o600 });
if (shouldGeneratePassword) {
  await writeFile(credentialsPath, [
    'CREDENCIALES INICIALES DEL PANEL QUERUBIM',
    '',
    `Correo: ${email}`,
    `Contraseña: ${password}`,
    '',
    'Guarda estos datos en un gestor de contraseñas y elimina este archivo cuando termines.',
    '',
  ].join('\n'), { mode: 0o600 });
}

console.log('Configuración administrativa generada sin mostrar secretos.');
console.log(`Variables: ${envOutputPath}`);
console.log(`QR del autenticador: ${qrOutputPath}`);
console.log(`Instrucciones: ${instructionsPath}`);
if (shouldGeneratePassword) console.log(`Credenciales iniciales: ${credentialsPath}`);
