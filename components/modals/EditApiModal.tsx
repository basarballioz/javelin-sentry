
import React, { useState, useEffect } from 'react';
import { ApiEntry, ValidationType, UserAgentType } from '../../types';
import { Save, X, Settings, Check, Clock, Dices, Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react';

interface EditApiModalProps {
  api: ApiEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ApiEntry>) => void;
}

export const EditApiModal: React.FC<EditApiModalProps> = ({ api, isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [validationType, setValidationType] = useState<ValidationType>(ValidationType.HTTP_STATUS);
  const [userAgentType, setUserAgentType] = useState<UserAgentType>(UserAgentType.SMART);
  
  const [jsonKey, setJsonKey] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [invertKeyword, setInvertKeyword] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [useRandomInterval, setUseRandomInterval] = useState(false);

  useEffect(() => {
    if (api) {
      setUrl(api.url);
      setValidationType(api.validationConfig.type);
      setUserAgentType(api.userAgentType || UserAgentType.SMART);
      setJsonKey(api.validationConfig.jsonKey || '');
      setJsonValue(api.validationConfig.jsonValue || '');
      setKeyword(api.validationConfig.keyword || '');
      setInvertKeyword(api.validationConfig.invertKeyword || false);
      setIntervalSeconds(api.intervalSeconds || 60);
      setUseRandomInterval(api.useRandomInterval || false);
    }
  }, [api]);

  const handleSave = () => {
    if (!api) return;
    onSave(api.id, {
      url,
      intervalSeconds,
      useRandomInterval,
      userAgentType,
      validationConfig: {
        type: validationType,
        jsonKey: validationType === ValidationType.JSON_EXACT ? jsonKey : undefined,
        jsonValue: validationType === ValidationType.JSON_EXACT ? jsonValue : undefined,
        keyword: validationType === ValidationType.KEYWORD_MATCH ? keyword : undefined,
        invertKeyword: validationType === ValidationType.KEYWORD_MATCH ? invertKeyword : undefined,
      }
    });
    onClose();
  };

  if (!isOpen || !api) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2 text-white">
            <Settings size={20} className="text-indigo-400" />
            <h2 className="font-semibold text-lg">Configure Monitor</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Endpoint URL</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Check Interval</label>
            <div className="flex items-center gap-3">
              <input type="number" min="5" disabled={useRandomInterval} value={intervalSeconds} onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 60)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200" />
              <button onClick={() => setUseRandomInterval(!useRandomInterval)} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${useRandomInterval ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Random (5-30s)</button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/50">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Client Identity (Bypass WAF)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: UserAgentType.SMART, label: 'Smart/Auto', icon: <ShieldCheck size={14}/> },
                { id: UserAgentType.CHROME_DESKTOP, label: 'Chrome Win', icon: <Monitor size={14}/> },
                { id: UserAgentType.SAFARI_IOS, label: 'Safari iOS', icon: <Smartphone size={14}/> },
                { id: UserAgentType.FIREFOX_DESKTOP, label: 'Firefox Win', icon: <Globe size={14}/> },
                { id: UserAgentType.GOOGLE_BOT, label: 'Google Bot', icon: <Globe size={14}/> },
              ].map((ua) => (
                <button
                  key={ua.id}
                  onClick={() => setUserAgentType(ua.id as UserAgentType)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${userAgentType === ua.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  {ua.icon}
                  <span>{ua.label}</span>
                  {userAgentType === ua.id && <Check size={12} className="ml-auto text-indigo-500" />}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">Safari iOS genellikle Cloudflare High-Security engellerini aşmak için en iyi seçenektir.</p>
          </div>

          <div className="pt-2 border-t border-slate-800/50">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Validation Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: ValidationType.HTTP_STATUS, label: 'Status Only' },
                { id: ValidationType.KEYWORD_MATCH, label: 'Keyword' },
                { id: ValidationType.JSON_EXACT, label: 'JSON Match' },
              ].map((vt) => (
                <button
                  key={vt.id}
                  onClick={() => setValidationType(vt.id as ValidationType)}
                  className={`px-2 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all ${validationType === vt.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  {vt.label}
                </button>
              ))}
            </div>
          </div>

          {validationType === ValidationType.JSON_EXACT && (
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 grid grid-cols-2 gap-3">
              <input type="text" placeholder="Key (e.g. status)" value={jsonKey} onChange={(e) => setJsonKey(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" />
              <input type="text" placeholder="Value" value={jsonValue} onChange={(e) => setJsonValue(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" />
            </div>
          )}

          {validationType === ValidationType.KEYWORD_MATCH && (
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 space-y-3">
              <input type="text" placeholder="Keyword..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="inv-check" checked={invertKeyword} onChange={(e) => setInvertKeyword(e.target.checked)} />
                <label htmlFor="inv-check" className="text-[10px] text-slate-500 font-bold uppercase">Fail if keyword found</label>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
           <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
