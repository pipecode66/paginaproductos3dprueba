import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createApp } from '../server/app.js';
import { createRuntimeConfig } from '../server/config.js';
import { normalizeVercelRewrite } from '../server/vercel-request.js';

const apiDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(apiDir, '..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const config = createRuntimeConfig(process.env, rootDir);
const { app } = createApp({ config });

export default function handler(request, response) {
  normalizeVercelRewrite(request);
  return app(request, response);
}
