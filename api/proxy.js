export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(200).json({ ok: false, error: 'URL eksik' });

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

    return res.status(200).json({
      ok: response.status >= 200 && response.status < 400,
      status: response.status
    });

  } catch (error) {
    return res.status(200).json({
      ok: false,
      status: 0,
      error: error.name === 'AbortError' ? 'Timeout' : 'Connection Failed'
    });
  }
}