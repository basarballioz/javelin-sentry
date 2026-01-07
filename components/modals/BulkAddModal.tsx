
import React, { useState } from 'react';
import { ValidationType, ValidationConfig, UserAgentType } from '../../types';
import { X, Save, Plus, Trash2, Check, Clock, Layers, Dices, Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { url: string; validationConfig: ValidationConfig; intervalSeconds: number; useRandomInterval: boolean; userAgentType: UserAgentType }[]) => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [urls, setUrls] = useState<string[]>(['', '', '', '', '']);
  const [validationType, setValidationType] = useState<ValidationType>(ValidationType.HTTP_STATUS);
  const [userAgentType, setUserAgentType] = useState<UserAgentType>(UserAgentType.SMART);
  
  const [jsonKey, setJsonKey] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [invertKeyword, setInvertKeyword] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [useRandomInterval, setUseRandomInterval] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSave = () => {
    const validUrls = urls.filter(u => u.trim() !== '');
    if (validUrls.length === 0) return;

    const validationConfig: ValidationConfig = {
      type: validationType,
      jsonKey: validationType === ValidationType.JSON_EXACT ? jsonKey : undefined,
      jsonValue: validationType === ValidationType.JSON_EXACT ? jsonValue : undefined,
      keyword: validationType === ValidationType.KEYWORD_MATCH ? keyword : undefined,
      invertKeyword: validationType === ValidationType.KEYWORD_MATCH ? invertKeyword : undefined,
    };

    const payload = validUrls.map(url => ({
      url,
      validationConfig,
      intervalSeconds,
      useRandomInterval,
      userAgentType
    }));

    onSave(payload);
    setUrls(['', '', '', '', '']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center space-x-2 text-white">
            <Layers size={20} className="text-indigo-400" />
            <h2 className="font-semibold text-lg">Bulk Add Targets</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Endpoint URLs</label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={url} onChange={(e) => handleUrlChange(index, e.target.value)} placeholder="https://api.example.com/health" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Interval</label>
              <input type="number" min="5" value={intervalSeconds} onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 60)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Identity (All)</label>
              <select value={userAgentType} onChange={(e) => setUserAgentType(e.target.value as UserAgentType)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200">
                <option value={UserAgentType.SMART}>Smart/Auto</option>
                <option value={UserAgentType.CHROME_DESKTOP}>Chrome Desktop</option>
                <option value={UserAgentType.SAFARI_IOS}>Safari iOS</option>
                <option value={UserAgentType.FIREFOX_DESKTOP}>Firefox Desktop</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50">
               <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Global Strategy</label>
               <select value={validationType} onChange={(e) => setValidationType(e.target.value as ValidationType)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200">
                 <option value={ValidationType.HTTP_STATUS}>Status Only</option>
                 <option value={ValidationType.JSON_EXACT}>JSON Key Match</option>
                 <option value={ValidationType.KEYWORD_MATCH}>Keyword Match</option>
               </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
           <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20">Add {urls.filter(u => u.trim()).length} Targets</button>
        </div>
      </div>
    </div>
  );
};
