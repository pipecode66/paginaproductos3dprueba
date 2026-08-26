import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function runVercel(args, input, sensitiveValue = '') {
  return new Promise((resolve, reject) => {
    const executable = process.platform === 'win32'
      ? ['npx.cmd', 'vercel', ...args, '--no-color'].join(' ')
      : 'npx';
    const childArgs = process.platform === 'win32' ? [] : ['vercel', ...args, '--no-color'];
    const child = spawn(executable, childArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      shell: process.platform === 'win32',
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const sanitized = sensitiveValue
        ? output.replaceAll(sensitiveValue, '[valor protegido]')
        : output;
      reject(new Error(`Vercel no pudo completar la operación.\n${sanitized.trim()}`));
    });
    child.stdin.end(input === undefined ? undefined : `${input}\n`);
  });
}

const sourcePath = path.resolve(argumentValue('--env') || 'artifacts/admin-security/admin-security.env');
const removeLegacyPassword = process.argv.includes('--remove-legacy-password');
const values = dotenv.parse(await readFile(sourcePath, 'utf8'));
const variableNames = [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
  'ADMIN_TOTP_SECRET',
  'ADMIN_SECURITY_ENFORCED',
];

for (const name of variableNames) {
  if (!values[name]) throw new Error(`Falta ${name} en ${sourcePath}.`);
  await runVercel(
    ['env', 'add', name, 'production,preview', '--force', '--sensitive', '--yes'],
    values[name],
    values[name],
  );
  console.log(`${name}: configurada en Production y Preview.`);
}

if (removeLegacyPassword) {
  for (const environment of ['production', 'preview']) {
    try {
      await runVercel(['env', 'rm', 'ADMIN_PASSWORD', environment, '--yes']);
    } catch (error) {
      if (!String(error.message).includes('env_not_found')) throw error;
    }
  }
  console.log('ADMIN_PASSWORD: retirada de Production y Preview.');
}

console.log('La configuración segura quedó aplicada. El siguiente despliegue activará el acceso reforzado.');
