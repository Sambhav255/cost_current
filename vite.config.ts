import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadNHCWithCones } from './server/nhcFeed.ts';
async function nhcEndpoint(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify(await loadNHCWithCones()));
  } catch {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'NHC endpoint unavailable' }));
  }
}
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nhc-local-endpoint',
      configureServer(server) {
        server.middlewares.use('/api/nhc', nhcEndpoint);
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api/nhc', nhcEndpoint);
      },
    },
  ],
  test: { include: ['src/**/*.test.ts'] },
  build: { chunkSizeWarningLimit: 1800 },
});
