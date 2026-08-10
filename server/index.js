import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { createApp } from './app.js';
import { createRuntimeConfig } from './config.js';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const config = createRuntimeConfig(process.env, rootDir);
const { app } = createApp({ config });
const isDevelopment = process.argv.includes('--dev') || process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  app.use((request, response, next) => {
    if (request.method !== 'GET' || !request.accepts('html')) {
      next();
      return;
    }
    response.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(config.port, '0.0.0.0', () => {
  const mode = config.bold.environment === 'production' ? 'producción' : 'pruebas';
  console.log(`Querubim disponible en http://localhost:${config.port} (Bold: ${mode})`);
});
