export interface NotificationResult {
  success: boolean;
  error?: string;
}

const postViaProxy = async (targetUrl: string, body: any): Promise<{ ok: boolean; status: number; text: string }> => {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const contentType = response.headers.get('content-type');
        if (response.status === 404 && contentType?.includes('text/html')) {
            return {
                ok: false,
                status: 404,
                text: "Internal Proxy Error: Backend not running."
            };
        }

        return {
            ok: response.ok,
            status: response.status,
            text: await response.text()
        };
    } catch (e: any) {
        return {
            ok: false,
            status: 0,
            text: e.message || "Network Error"
        };
    }
};

export const sendTelegramAlert = async (
  botToken: string,
  chatId: string,
  message: string
): Promise<NotificationResult> => {
  if (!botToken || !chatId) {
    return { success: false, error: 'Missing Credentials' };
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      return { success: false, error: data.description || `API Error ${data.error_code}` };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network Error' };
  }
};

export const sendSlackAlert = async (
  webhookUrl: string,
  message: string,
  isUp: boolean
): Promise<NotificationResult> => {
  if (!webhookUrl) return { success: false, error: 'Missing Webhook URL' };

  try {
    const result = await postViaProxy(webhookUrl, {
        text: message,
        attachments: [
            {
                color: isUp ? "#36a64f" : "#d90000",
                text: isUp ? "Service Restored" : "Service Outage"
            }
        ]
    });

    if (!result.ok) {
        return { success: false, error: `HTTP ${result.status}: ${result.text}` };
    }

    if (result.text !== 'ok') {
       return { success: false, error: `API Error: ${result.text}` };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network Error' };
  }
};

export const sendDiscordAlert = async (
    webhookUrl: string,
    message: string,
    isUp: boolean
): Promise<NotificationResult> => {
    if (!webhookUrl) return { success: false, error: 'Missing Webhook URL' };

    try {
        const result = await postViaProxy(webhookUrl, {
            username: "Javelin",
            avatar_url: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/rocket.svg",
            embeds: [
                {
                    title: isUp ? "System Operational" : "System Critical",
                    description: message,
                    color: isUp ? 5763719 : 15548997, 
                    timestamp: new Date().toISOString()
                }
            ]
        });

        if (result.status === 204 || result.status === 200) {
            return { success: true };
        }

        return { success: false, error: `HTTP ${result.status}: ${result.text}` };

    } catch (error: any) {
        return { success: false, error: error.message || 'Network Error' };
    }
};