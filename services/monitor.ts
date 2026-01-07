import { ApiResponse } from '../types';

export const checkApi = async (
  url: string
): Promise<{ isUp: boolean; responseData?: ApiResponse; error?: string; latency: number }> => {
  const start = performance.now();

  try {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    const end = performance.now();
    const latency = Math.round(end - start);

    // Proxy'den gelen basit sonuç: { ok: true/false, status: 200, error?: "..." }
    if (data.ok) {
      return { isUp: true, responseData: { status: data.status }, latency };
    } else {
      return { isUp: false, error: data.error || `HTTP ${data.status}`, latency };
    }

  } catch (err: any) {
    return { isUp: false, error: err.message || 'Network Error', latency: 0 };
  }
};