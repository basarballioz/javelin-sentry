import React, { useState, useEffect } from 'react';
import { ValidationType, UserAgentType, ValidationConfig } from '../../types';
import { X, Check, Clock, Dices, ShieldCheck, Smartphone, Monitor, Globe, Zap, Rocket } from 'lucide-react';

interface AddApiConfirmModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    url: string; 
    validationConfig: ValidationConfig; 
    intervalSeconds: number; 
    userAgentType: UserAgentType; 
    useRandomInterval: boolean 
  }) => void;
  defaultInterval: number;
}

export const AddApiConfirmModal: React.FC<AddApiConfirmModalProps> = ({ 
  url, isOpen, onClose, onConfirm, defaultInterval 
}) => {
  const [validationType, setValidationType] = useState<ValidationType>(ValidationType.HTTP_STATUS);
  const [userAgentType, setUserAgentType] = useState<UserAgentType>(UserAgentType.CHROME_DESKTOP);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(defaultInterval);
  const [useRandomInterval, setUseRandomInterval] = useState(false);
  
  const [jsonKey, setJsonKey] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [invertKeyword, setInvertKeyword] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIntervalSeconds(defaultInterval);
        setValidationType(ValidationType.HTTP_STATUS);
        setUserAgentType(UserAgentType.CHROME_DESKTOP);
        setUseRandomInterval(false);
    }
  }, [isOpen, defaultInterval]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200 animate-in zoom-in-95 duration-300">
        
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Rocket size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tight text-white">Initialize Monitor</h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Final Configuration Check</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* URL Display */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 group transition-all hover:border-indigo-500/30">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Endpoint</label>
                <div className="text-sm font-mono text-indigo-300 break-all bg-slate-900/50 p-3 rounded-xl border border-slate-800 group-hover:bg-slate-900 transition-colors">
                    {url}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interval Selection */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scan Interval</label>
                    <div className="flex flex-col gap-2">
                        <div className="relative">
                            <input 
                                type="number" 
                                min="5" 
                                disabled={useRandomInterval}
                                value={intervalSeconds}
                                onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 60)}
                                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono ${useRandomInterval ? 'opacity-30' : ''}`}
                            />
                            {!useRandomInterval && <Clock size={16} className="absolute right-4 top-3.5 text-slate-600" />}
                        </div>
                        <button 
                            onClick={() => setUseRandomInterval(!useRandomInterval)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${useRandomInterval ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                        >
                            <Dices size={16} />
                            <span>RANDOM JITTER (5-30s)</span>
                        </button>
                    </div>
                </div>

                {/* Identity Selection */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Identity</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: UserAgentType.CHROME_DESKTOP, label: 'Chrome Win', icon: <Monitor size={14}/> },
                            { id: UserAgentType.SAFARI_IOS, label: 'Safari iOS', icon: <Smartphone size={14}/> },
                            { id: UserAgentType.FIREFOX_DESKTOP, label: 'Firefox', icon: <Globe size={14}/> },
                            { id: UserAgentType.GOOGLE_BOT, label: 'Google Bot', icon: <Globe size={14}/> },
                        ].map((ua) => (
                            <button
                                key={ua.id}
                                onClick={() => setUserAgentType(ua.id as UserAgentType)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${userAgentType === ua.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                                {ua.icon}
                                <span className="truncate">{ua.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Validation Strategy */}
            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validation Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: ValidationType.HTTP_STATUS, label: 'Status' },
                        { id: ValidationType.KEYWORD_MATCH, label: 'Keyword' },
                        { id: ValidationType.JSON_EXACT, label: 'JSON' },
                    ].map((vt) => (
                        <button
                            key={vt.id}
                            onClick={() => setValidationType(vt.id as ValidationType)}
                            className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${validationType === vt.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                        >
                            {vt.label}
                        </button>
                    ))}
                </div>

                {/* Strategy Details */}
                {validationType === ValidationType.JSON_EXACT && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                        <div>
                            <input type="text" placeholder="Key (e.g. status)" value={jsonKey} onChange={(e) => setJsonKey(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200" />
                        </div>
                        <div>
                            <input type="text" placeholder="Value" value={jsonValue} onChange={(e) => setJsonValue(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200" />
                        </div>
                    </div>
                )}

                {validationType === ValidationType.KEYWORD_MATCH && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-in slide-in-from-top-2">
                        <input type="text" placeholder="Keyword to find..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200" />
                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="inv-check-add" checked={invertKeyword} onChange={(e) => setInvertKeyword(e.target.checked)} className="rounded bg-slate-900 border-slate-700" />
                            <label htmlFor="inv-check-add" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fail if found</label>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
            <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">CANCEL</button>
            <button 
                onClick={handleConfirm}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2 group"
            >
                <span>CONFIRM & DEPLOY</span>
                <Zap size={16} className="fill-white group-hover:scale-125 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};