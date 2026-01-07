import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  plugins: [
    react(),
    {
      name: 'api-proxy',
      // Local development için /api/proxy endpoint'i
      // Vercel'deki serverless function'ın aynısını burada çalıştırıyoruz
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
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
