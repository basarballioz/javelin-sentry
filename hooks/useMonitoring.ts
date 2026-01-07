
import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiEntry, ApiStatus, LogEntry, MonitorConfig, Incident } from '../types';
import { checkApi } from '../services/monitor';
import { sendTelegramAlert, sendSlackAlert, sendDiscordAlert } from '../services/notifier';
import { playSystemSound } from '../services/audio';

const generateId = () => Math.random().toString(36).substring(2, 9);

const normalizeUrl = (url: string): string => {
    let trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (trimmed.startsWith('http://')) {
        return trimmed.replace('http://', 'https://');
    }
    if (!trimmed.startsWith('https://')) {
        return 'https://' + trimmed;
    }
    return trimmed;
};

export const useMonitoring = (config: MonitorConfig) => {
  const [apis, setApis] = useState<ApiEntry[]>(() => {
    const saved = localStorage.getItem('monitored_apis');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.map((api: any) => ({
                ...api,
                url: normalizeUrl(api.url),
                userAgentType: api.userAgentType || UserAgentType.SMART,
                history: Array.isArray(api.history) ? api.history : [],
                incidents: Array.isArray(api.incidents) ? api.incidents : [],
                validationConfig: api.validationConfig || { type: ValidationType.HTTP_STATUS },
                intervalSeconds: api.intervalSeconds || 60,
                paused: api.paused ?? false
            }));
        } catch (e) {}
    }
    return [];
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  const tickRef = useRef<number | null>(null);
  const apisRef = useRef(apis);
  
  useEffect(() => { apisRef.current = apis; }, [apis]);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('monitored_apis', JSON.stringify(apis));
    }, 1000); 
    return () => clearTimeout(handler);
  }, [apis]);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success') => {
    setLogs(prev => [...prev.slice(-100), { id: generateId(), timestamp: Date.now(), message, type }]);
  }, []);

  const playAlert = useCallback((type: 'success' | 'error') => {
    if (config.soundEnabled) playSystemSound(config.soundVariant, type);
  }, [config.soundEnabled, config.soundVariant]);

  const performCheck = useCallback(async (apiId: string, url: string) => {
    setApis(prev => prev.map(a => a.id === apiId ? { ...a, status: ApiStatus.CHECKING } : a));
    
    const normalized = normalizeUrl(url);
    const { isUp, responseData, error, latency } = await checkApi(normalized);
    const now = Date.now();

    setApis(prev => prev.map(a => {
      if (a.id !== apiId) return a;
      
      const wasDown = a.status === ApiStatus.DOWN;
      const newStatus = isUp ? ApiStatus.UP : ApiStatus.DOWN;
      const newHistory = [...a.history, { timestamp: now, latency: isUp ? latency : null, status: newStatus }].slice(-300);
      
      const newTotalChecks = (a.totalChecks || 0) + 1;
      const newTotalDown = (isUp ? (a.totalDown || 0) : (a.totalDown || 0) + 1);

      if (newStatus === ApiStatus.UP) {
        if (wasDown) {
            const msg = `✅ [${normalized}] is BACK UP!`;
            addLog(`✔ [${normalized}] is BACK UP`, 'success');
            playAlert('success');
            
            if (config.botToken && config.chatId) {
                sendTelegramAlert(config.botToken, config.chatId, msg).then(res => {
                    if (!res.success) addLog(`Telegram Failed: ${res.error}`, 'error');
                });
            }
        }
        
        return { 
            ...a, 
            status: ApiStatus.UP, 
            lastChecked: now, 
            lastResponse: JSON.stringify(responseData), 
            failureCount: 0, 
            totalChecks: newTotalChecks,
            totalDown: newTotalDown,
            history: newHistory
        };

      } else {
        if (!wasDown) {
            const msg = `❌ [${normalized}] is DOWN: ${error}`;
            addLog(msg, 'error');
            playAlert('error');
            
            if (config.botToken && config.chatId) {
                sendTelegramAlert(config.botToken, config.chatId, `❌ [${normalized}] is DOWN.\nError: ${error}`).then(res => {
                    if (!res.success) addLog(`Telegram Failed: ${res.error}`, 'error');
                });
            }
        }
        
        return { 
            ...a, 
            status: ApiStatus.DOWN, 
            lastChecked: now, 
            lastResponse: error, 
            failureCount: a.failureCount + 1,
            totalChecks: newTotalChecks,
            totalDown: newTotalDown, 
            history: newHistory
        };
      }
    }));
  }, [addLog, config, playAlert]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (isMonitoring) {
      tickRef.current = window.setInterval(() => {
        const now = Date.now();
        apisRef.current.forEach(api => {
          if (api.status === ApiStatus.CHECKING || api.paused) return;
          const interval = api.intervalSeconds;
          if (!api.lastChecked || (now - api.lastChecked >= (interval * 1000))) {
            performCheck(api.id, api.url);
          }
        });
      }, 1000);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isMonitoring, performCheck]);

  // addApi now takes a full configuration object
  const addApi = useCallback((data: { 
    url: string; 
    validationConfig: ValidationConfig; 
    intervalSeconds: number; 
    userAgentType: UserAgentType; 
    useRandomInterval: boolean 
  }) => {
    setApis(prev => [...prev, {
      id: generateId(), 
      url: normalizeUrl(data.url), 
      status: ApiStatus.PENDING, 
      createdAt: Date.now(), 
      lastChecked: null, 
      failureCount: 0,
      totalChecks: 0,
      totalDown: 0, 
      history: [], 
      incidents: [],
      validationConfig: data.validationConfig, 
      intervalSeconds: data.intervalSeconds,
      userAgentType: data.userAgentType,
      useRandomInterval: data.useRandomInterval,
      paused: false
    }]);
    addLog(`Added monitor for ${normalizeUrl(data.url)}`, 'info');
  }, [addLog]);

  const addMultipleApis = useCallback((newApis: { url: string; validationConfig: ValidationConfig; intervalSeconds: number; userAgentType: UserAgentType; useRandomInterval: boolean }[]) => {
    const now = Date.now();
    const entries: ApiEntry[] = newApis.map(item => ({
      id: generateId(),
      url: normalizeUrl(item.url),
      status: ApiStatus.PENDING,
      createdAt: now,
      lastChecked: null, 
      failureCount: 0,
      totalChecks: 0,
      totalDown: 0, 
      history: [], 
      incidents: [],
      validationConfig: item.validationConfig,
      intervalSeconds: item.intervalSeconds,
      userAgentType: item.userAgentType,
      useRandomInterval: item.useRandomInterval,
      paused: false
    }));
    setApis(prev => [...prev, ...entries]);
    addLog(`Batch added ${entries.length} monitors`, 'info');
  }, [addLog]);

  const removeApi = useCallback((id: string) => {
    setApis(prev => prev.filter(a => a.id !== id));
    addLog('Removed monitor', 'info');
  }, [addLog]);

  const updateApi = useCallback((id: string, updates: Partial<ApiEntry>) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addLog('Updated monitor', 'info');
  }, [addLog]);

  const togglePause = useCallback((id: string) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, paused: !a.paused } : a));
    addLog('Toggled pause', 'info');
  }, [addLog]);

  const togglePauseAll = useCallback(() => {
    setApis(prev => {
        const allPaused = prev.every(a => a.paused);
        return prev.map(a => ({ ...a, paused: !allPaused }));
    });
  }, [addLog]);

  const checkAll = useCallback(() => {
      apisRef.current.filter(a => !a.paused).forEach(api => performCheck(api.id, api.url));
  }, [performCheck]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const importData = useCallback((data: { apis: any[] }) => {
      if (data.apis) {
          setApis(data.apis.map((a: any) => ({ 
              ...a, 
              userAgentType: a.userAgentType || UserAgentType.SMART,
              validationConfig: a.validationConfig || { type: ValidationType.HTTP_STATUS }
          })));
      }
  }, []);

  return { apis, logs, isMonitoring, setIsMonitoring, addApi, addMultipleApis, removeApi, updateApi, togglePause, togglePauseAll, checkNow: performCheck, checkAll, clearLogs, importData, addLog };
};
