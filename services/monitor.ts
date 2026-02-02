import { ApiResponse } from "../types";

import { UserAgentType } from "../types";

export const checkApi = async (
  url: string,
  userAgentType: UserAgentType = UserAgentType.SMART,
): Promise<{
  isUp: boolean;
  responseData?: ApiResponse;
  error?: string;
  latency: number;
  body?: string;
}> => {
  const start = performance.now();

  try {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}&ua=${encodeURIComponent(userAgentType)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    const end = performance.now();
    const latency = Math.round(end - start);

    if (data.ok) {
      return {
        isUp: true,
        responseData: { status: data.status },
        latency,
        body: data.body,
      };
    } else {
      return {
        isUp: false,
        error: data.error || `HTTP ${data.status}`,
        latency,
        body: data.body,
      };
    }
  } catch (err: any) {
    return { isUp: false, error: err.message || "Network Error", latency: 0 };
  }
};
