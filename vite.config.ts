import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Vite dev server'da bu proxy kullanılmayacak
            // Bunun yerine custom middleware kullanacağız
          });
        }
      }
    }
  },
  plugins: [
    react(),
    {
      name: 'api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          const url = new URL(req.url || '', 'http://localhost').searchParams.get('url');
          
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }
          
          if (!url) {
            res.end(JSON.stringify({ ok: false, error: 'URL eksik' }));
            return;
          }
          
          let targetUrl = url.trim();
          if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
          
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(targetUrl, {
              method: 'GET',
              signal: controller.signal,
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
              }
            });
            
            clearTimeout(timeout);
            
            res.end(JSON.stringify({
              ok: response.status >= 200 && response.status < 400,
              status: response.status
            }));
          } catch (error: any) {
            res.end(JSON.stringify({
              ok: false,
              status: 0,
              error: error.name === 'AbortError' ? 'Timeout' : 'Connection Failed'
            }));
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
