import React, { useState, useEffect } from 'react';
import { MonitorConfig, SoundVariant, ApiEntry, SavedSlot } from '../../types';
import { Settings, Save, X, Bell, Moon, Sun, AlertOctagon, Monitor, Volume2, VolumeX, Music, BookOpen, CheckCircle2, ShieldAlert, Zap, Gavel, Slack, Send, Loader2, Gamepad2, Dices, Clock, Database, Trash2, Download, Upload } from 'lucide-react';
import { playSystemSound } from '../../services/audio';
import { sendSlackAlert, sendTelegramAlert, sendDiscordAlert } from '../../services/notifier';

export type ConfigTab = 'general' | 'notifications' | 'slots' | 'danger' | 'docs' | 'terms';

interface ConfigModalProps {
  config: MonitorConfig;
  currentApis: ApiEntry[];
  onSave: (config: MonitorConfig) => void;
  onLoadSlot: (data: { apis: ApiEntry[], config: MonitorConfig }) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onResetSystem: () => void;
  initialTab?: ConfigTab;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ 
  config, 
  currentApis,
  onSave, 
  onLoadSlot,
  isOpen, 
  onClose,
  isDarkMode,
  toggleTheme,
  onResetSystem,
  initialTab = 'general'
}) => {
  const [formData, setFormData] = useState<MonitorConfig>(config);
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [slots, setSlots] = useState<SavedSlot[]>([]);

  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [slackErrorMessage, setSlackErrorMessage] = useState<string>('');

  const [isTestingDiscord, setIsTestingDiscord] = useState(false);
  const [discordTestStatus, setDiscordTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [discordErrorMessage, setDiscordErrorMessage] = useState<string>('');

  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [telegramErrorMessage, setTelegramErrorMessage] = useState<string>('');

  useEffect(() => {
    setFormData(config);
  }, [config]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadSlots();
      
      setSlackTestStatus('idle');
      setSlackErrorMessage('');
      setDiscordTestStatus('idle');
      setDiscordErrorMessage('');
      setTelegramTestStatus('idle');
      setTelegramErrorMessage('');
    }
  }, [isOpen, initialTab]);

  const loadSlots = () => {
    const saved = localStorage.getItem('javelin_save_slots');
    if (saved) {
      setSlots(JSON.parse(saved));
    } else {
      const initialSlots: SavedSlot[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        timestamp: null,
        label: `Slot ${i + 1}`,
        data: null
      }));
      setSlots(initialSlots);
      localStorage.setItem('javelin_save_slots', JSON.stringify(initialSlots));
    }
  };

  const handleSaveToSlot = (slotId: number) => {
    const updatedSlots = slots.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          timestamp: Date.now(),
          data: {
            apis: currentApis,
            config: formData 
          }
        };
      }
      return slot;
    });
    setSlots(updatedSlots);
    localStorage.setItem('javelin_save_slots', JSON.stringify(updatedSlots));
    playSystemSound('modern', 'success');
  };

  const handleLoadFromSlot = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot && slot.data) {
      onLoadSlot(slot.data);
      onClose();
    }
  };

  const handleClearSlot = (slotId: number) => {
    if (!window.confirm("Are you sure you want to clear this slot?")) return;
    const updatedSlots = slots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, timestamp: null, data: null };
      }
      return slot;
    });
    setSlots(updatedSlots);
    localStorage.setItem('javelin_save_slots', JSON.stringify(updatedSlots));
  };

  const handleTestSlack = async () => {
    if (!formData.slackWebhookUrl) return;

    setIsTestingSlack(true);
    setSlackTestStatus('idle');
    setSlackErrorMessage('');

    const result = await sendSlackAlert(
      formData.slackWebhookUrl,
      "🔔 This is a test message from Javelin. Your integration is working!",
      true
    );

    if (result.success) {
        setSlackTestStatus('success');
        setTimeout(() => setSlackTestStatus('idle'), 3000);
    } else {
        setSlackTestStatus('error');
        setSlackErrorMessage(result.error || 'Unknown error occurred');
    }
    
    setIsTestingSlack(false);
  };

  const handleTestDiscord = async () => {
    if (!formData.discordWebhookUrl) return;

    setIsTestingDiscord(true);
    setDiscordTestStatus('idle');
    setDiscordErrorMessage('');

    const result = await sendDiscordAlert(
      formData.discordWebhookUrl,
      "🔔 This is a test message from Javelin. Your integration is working!",
      true
    );

    if (result.success) {
        setDiscordTestStatus('success');
        setTimeout(() => setDiscordTestStatus('idle'), 3000);
    } else {
        setDiscordTestStatus('error');
        setDiscordErrorMessage(result.error || 'Unknown error occurred');
    }
    
    setIsTestingDiscord(false);
  };

  const handleTestTelegram = async () => {
    if (!formData.botToken || !formData.chatId) return;

    setIsTestingTelegram(true);
    setTelegramTestStatus('idle');
    setTelegramErrorMessage('');

    const result = await sendTelegramAlert(
        formData.botToken,
        formData.chatId,
        "🔔 This is a test message from Javelin. Your integration is working!"
    );

    if (result.success) {
        setTelegramTestStatus('success');
        setTimeout(() => setTelegramTestStatus('idle'), 3000);
    } else {
        setTelegramTestStatus('error');
        setTelegramErrorMessage(result.error || 'Unknown error occurred');
    }

    setIsTestingTelegram(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px] text-slate-200 animate-in zoom-in-95 duration-200">
        
        <div className="w-full md:w-48 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-visible scrollbar-hide">
          
          <div className="hidden md:flex p-4 border-b border-slate-800 font-semibold text-white items-center space-x-2">
            <Settings size={18} className="text-indigo-400" />
            <span>Settings</span>
          </div>

          <div className="flex flex-row md:flex-col p-2 space-x-2 md:space-x-0 md:space-y-1 min-w-max md:min-w-0">
             <button 
                onClick={() => setActiveTab('general')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
             >
                <Monitor size={16} />
                <span>General</span>
             </button>
             <button 
                onClick={() => setActiveTab('notifications')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
             >
                <Bell size={16} />
                <span>Notifications</span>
             </button>
             <button 
                onClick={() => setActiveTab('slots')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'slots' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
             >
                <Database size={16} />
                <span>Save Slots</span>
             </button>
             <button 
                onClick={() => setActiveTab('docs')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'docs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
             >
                <BookOpen size={16} />
                <span>Docs</span>
             </button>
             <button 
                onClick={() => setActiveTab('terms')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'terms' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
             >
                <Gavel size={16} />
                <span>Terms</span>
             </button>
             
             <div className="hidden md:block my-2 border-t border-slate-800/50"></div>
             <div className="md:hidden w-px h-6 bg-slate-800 mx-1 self-center"></div>
             
             <button 
                onClick={() => setActiveTab('danger')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === 'danger' ? 'bg-rose-950/30 text-rose-400' : 'text-slate-400 hover:bg-rose-950/10 hover:text-rose-400'}`}
             >
                <AlertOctagon size={16} />
                <span>Danger Zone</span>
             </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
            <h2 className="font-semibold text-lg text-white capitalize flex items-center gap-2">
              {activeTab === 'docs' && <BookOpen size={18} className="text-indigo-400"/>}
              {activeTab === 'terms' && <Gavel size={18} className="text-indigo-400"/>}
              {activeTab === 'general' && <Monitor size={18} className="text-indigo-400"/>}
              {activeTab === 'notifications' && <Bell size={18} className="text-indigo-400"/>}
              {activeTab === 'slots' && <Database size={18} className="text-indigo-400"/>}
              {activeTab === 'danger' && <AlertOctagon size={18} className="text-rose-500"/>}
              {activeTab === 'danger' ? 'System Reset' : activeTab === 'docs' ? 'Documentation' : activeTab === 'terms' ? 'Terms of Use' : activeTab === 'slots' ? 'Configuration Slots' : activeTab}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <h3 className="text-sm font-medium text-white">Appearance</h3>
                      <p className="text-xs text-slate-500 mt-1">Toggle between light and dark themes</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
                    >
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                 </div>

                 <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                      <div>
                        <h3 className="text-sm font-medium text-white">Sound Effects</h3>
                        <p className="text-xs text-slate-500 mt-1">Play alert sounds when status changes</p>
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                        className={`p-2 rounded-lg border transition-all ${formData.soundEnabled ? 'bg-indigo-900/50 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                      >
                        {formData.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      </button>
                    </div>
                    {formData.soundEnabled && (
                      <div className="p-4 bg-slate-900/50 flex items-center justify-between">
                         <div className="flex items-center space-x-2 text-slate-400">
                           <Music size={16} />
                           <span className="text-xs font-medium">Sound Profile</span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <select 
                             value={formData.soundVariant}
                             onChange={(e) => {
                               const newVariant = e.target.value as SoundVariant;
                               setFormData(prev => ({ ...prev, soundVariant: newVariant }));
                               playSystemSound(newVariant, 'success');
                             }}
                             className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                           >
                             <option value="classic">Classic</option>
                             <option value="retro">Retro (8-bit)</option>
                             <option value="modern">Modern (Soft)</option>
                             <option value="scifi">Sci-Fi</option>
                             <option value="subtle">Subtle</option>
                           </select>
                         </div>
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Global Default Interval (Seconds)
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                            type="number"
                            min="5"
                            disabled={formData.useRandomInterval}
                            value={formData.defaultIntervalSeconds}
                            onChange={(e) => setFormData(prev => ({ ...prev, defaultIntervalSeconds: parseInt(e.target.value) || 60 }))}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pl-10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${formData.useRandomInterval ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <Clock size={16} className="absolute left-3 top-2.5 text-slate-600" />
                        </div>
                        <div 
                            onClick={() => setFormData(prev => ({ ...prev, useRandomInterval: !prev.useRandomInterval }))}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.useRandomInterval ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                            <Dices size={18} />
                            <span className="text-xs font-medium whitespace-nowrap">Random (5-30s)</span>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'slots' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        Use save slots to quickly switch between different monitoring configurations. 
                        Slots persist in your browser's local storage.
                    </p>
                    <div className="grid gap-3">
                        {slots.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Database size={16} className={slot.data ? "text-indigo-400" : "text-slate-600"} />
                                        <span className={`font-semibold ${slot.data ? 'text-white' : 'text-slate-500'}`}>
                                            {slot.label}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 pl-6">
                                        {slot.data ? (
                                            <span className="flex items-center gap-1">
                                                <span>{slot.data.apis.length} Targets</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                <span>Saved: {new Date(slot.timestamp!).toLocaleDateString()}</span>
                                            </span>
                                        ) : (
                                            "Empty Slot"
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {slot.data && (
                                        <button 
                                            onClick={() => handleLoadFromSlot(slot.id)}
                                            className="p-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center gap-2"
                                            title="Load Slot"
                                        >
                                            <Upload size={14} />
                                            <span className="text-xs font-medium hidden sm:inline">Load</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleSaveToSlot(slot.id)}
                                        className="p-2 bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-900/50 hover:text-indigo-300 hover:border-indigo-500/50 transition-all flex items-center gap-2"
                                        title="Save Current to Slot"
                                    >
                                        <Download size={14} />
                                        <span className="text-xs font-medium hidden sm:inline">Save</span>
                                    </button>
                                    {slot.data && (
                                        <button 
                                            onClick={() => handleClearSlot(slot.id)}
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                            title="Clear Slot"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="bg-sky-900/20 border border-sky-500/20 p-4 rounded-lg flex items-start space-x-3">
                        <Bell className="text-sky-400 shrink-0 mt-0.5" size={18} />
                        <div>
                        <h4 className="text-sm font-semibold text-sky-300">Telegram Integration</h4>
                        <p className="text-xs text-sky-200/70 mt-1">
                            Receive notifications via Telegram Bot.
                        </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Telegram Bot Token
                        </label>
                        <input
                        type="password"
                        value={formData.botToken}
                        onChange={(e) => setFormData(prev => ({ ...prev, botToken: e.target.value }))}
                        placeholder="123456:ABC-..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Telegram Chat ID
                        </label>
                        <div className="flex gap-2">
                            <input
                            type="text"
                            value={formData.chatId}
                            onChange={(e) => setFormData(prev => ({ ...prev, chatId: e.target.value }))}
                            placeholder="123456789"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                            />
                            <button
                                onClick={handleTestTelegram}
                                disabled={isTestingTelegram || !formData.botToken || !formData.chatId}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all w-24 justify-center
                                ${isTestingTelegram || (!formData.botToken || !formData.chatId) ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                                    telegramTestStatus === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                                    telegramTestStatus === 'error' ? 'bg-rose-900/30 text-rose-400 border-rose-500/30' :
                                    'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {isTestingTelegram ? (
                                <Loader2 size={14} className="animate-spin" />
                                ) : telegramTestStatus === 'success' ? (
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 size={14} />
                                    <span>Sent</span>
                                </div>
                                ) : telegramTestStatus === 'error' ? (
                                <div className="flex items-center gap-1">
                                    <ShieldAlert size={14} />
                                    <span>Error</span>
                                </div>
                                ) : (
                                <div className="flex items-center gap-1">
                                    <Send size={14} />
                                    <span>Test</span>
                                </div>
                                )}
                            </button>
                        </div>
                        {telegramTestStatus === 'error' && telegramErrorMessage && (
                            <div className="mt-2 text-xs text-rose-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                                <AlertOctagon size={12} className="shrink-0 mt-0.5" />
                                <span>{telegramErrorMessage}</span>
                            </div>
                        )}
                    </div>
              </div>
                  
                  <div className="border-t border-slate-800"></div>

                  <div className="space-y-4">
                     <div className="bg-fuchsia-900/20 border border-fuchsia-500/20 p-4 rounded-lg flex items-start space-x-3">
                        <Slack className="text-fuchsia-400 shrink-0 mt-0.5" size={18} />
                        <div>
                        <h4 className="text-sm font-semibold text-fuchsia-300">Slack Integration</h4>
                        <p className="text-xs text-fuchsia-200/70 mt-1">
                            Receive rich alerts to a Channel via Incoming Webhook.
                        </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Slack Webhook URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={formData.slackWebhookUrl || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                            placeholder="https://hooks.slack.com/services/..."
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                          />
                          <button
                            onClick={handleTestSlack}
                            disabled={isTestingSlack || !formData.slackWebhookUrl}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all w-24 justify-center
                              ${isTestingSlack || !formData.slackWebhookUrl ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                                slackTestStatus === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                                slackTestStatus === 'error' ? 'bg-rose-900/30 text-rose-400 border-rose-500/30' :
                                'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                          >
                            {isTestingSlack ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : slackTestStatus === 'success' ? (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Sent</span>
                              </>
                            ) : slackTestStatus === 'error' ? (
                              <>
                                <ShieldAlert size={14} />
                                <span>Error</span>
                              </>
                            ) : (
                              <>
                                <Send size={14} />
                                <span>Test</span>
                              </>
                            )}
                          </button>
                        </div>
                        {slackTestStatus === 'error' && slackErrorMessage && (
                            <div className="mt-2 text-xs text-rose-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                                <AlertOctagon size={12} className="shrink-0 mt-0.5" />
                                <span>{slackErrorMessage}</span>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800"></div>

                  <div className="space-y-4">
                     <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg flex items-start space-x-3">
                        <Gamepad2 className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                        <div>
                        <h4 className="text-sm font-semibold text-indigo-300">Discord Integration</h4>
                        <p className="text-xs text-indigo-200/70 mt-1">
                            Receive rich embed alerts via Discord Webhook.
                        </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Discord Webhook URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={formData.discordWebhookUrl || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, discordWebhookUrl: e.target.value }))}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                          />
                          <button
                            onClick={handleTestDiscord}
                            disabled={isTestingDiscord || !formData.discordWebhookUrl}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all w-24 justify-center
                              ${isTestingDiscord || !formData.discordWebhookUrl ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                                discordTestStatus === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                                discordTestStatus === 'error' ? 'bg-rose-900/30 text-rose-400 border-rose-500/30' :
                                'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                          >
                            {isTestingDiscord ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : discordTestStatus === 'success' ? (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Sent</span>
                              </>
                            ) : discordTestStatus === 'error' ? (
                              <>
                                <ShieldAlert size={14} />
                                <span>Error</span>
                              </>
                            ) : (
                              <>
                                <Send size={14} />
                                <span>Test</span>
                              </>
                            )}
                          </button>
                        </div>
                        {discordTestStatus === 'error' && discordErrorMessage && (
                            <div className="mt-2 text-xs text-rose-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                                <AlertOctagon size={12} className="shrink-0 mt-0.5" />
                                <span>{discordErrorMessage}</span>
                            </div>
                        )}
                    </div>
                  </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-8 text-sm text-slate-300">
                 
                 <section>
                    <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                       <Zap size={16} className="text-indigo-500" />
                       Core Concepts
                    </h3>
                    <p className="leading-relaxed text-slate-400 mb-3">
                       Javelin Sentinel is a client-side dashboard. It sends requests from your browser to your APIs. 
                       To bypass CORS restrictions (which prevent browsers from fetching data from different domains), 
                       it uses an <strong>Internal Serverless Proxy</strong> powered by Vercel Functions.
                    </p>
                    <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-200/80">
                        <strong>Local Development:</strong> You must use <code>vercel dev</code> to run this project locally. 
                        Standard <code>npm run dev</code> will not start the required proxy backend.
                    </div>
                 </section>

                 <section>
                    <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-emerald-500" />
                       Validation Strategies
                    </h3>
                    <div className="space-y-4">
                       <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <span className="text-indigo-400 font-bold text-xs uppercase block mb-1">Status Only (Recommended)</span>
                          <p className="text-xs text-slate-400">
                             Simply checks if the server returns an HTTP Status Code between 200 and 299. 
                             Best for simple health checks.
                          </p>
                       </div>
                       <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <span className="text-indigo-400 font-bold text-xs uppercase block mb-1">JSON Match (Advanced)</span>
                          <p className="text-xs text-slate-400">
                             Parses the JSON response and checks if a specific key equals a specific value. 
                             Useful if your API returns 200 OK even on logical errors (e.g. <code>{"{ success: false }"}</code>).
                          </p>
                       </div>
                       <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <span className="text-indigo-400 font-bold text-xs uppercase block mb-1">Keyword Match</span>
                          <p className="text-xs text-slate-400">
                             Scans the raw HTML or Text body of the response for a specific phrase. 
                             Useful for checking if a specific error message appears or if a welcome message is missing.
                          </p>
                       </div>
                    </div>
                 </section>

                 <section>
                    <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                       <ShieldAlert size={16} className="text-rose-500" />
                       Troubleshooting
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-xs text-slate-400">
                       <li>
                          <strong>Google/Big Tech APIs:</strong> Monitoring <code>google.com</code> might result in "429 Too Many Requests" 
                          because these companies block proxy IP addresses. This is normal.
                       </li>
                       <li>
                          <strong>Localhost:</strong> You cannot monitor <code>localhost</code> addresses because the requests 
                          are routed through public internet proxies. Use a tunneling service like Ngrok.
                       </li>
                    </ul>
                 </section>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6 text-sm text-slate-300">
                 <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Last Updated: October 2023</p>
                    <h3 className="text-white font-bold text-lg mb-4">Terms of Use & Disclaimer</h3>
                    
                    <div className="space-y-4 text-xs leading-relaxed">
                       <p>
                          <strong>1. Acceptance of Terms:</strong> By using "Javelin Sentinel" (the "Service"), you agree to be bound by these terms. If you do not agree, please do not use the Service.
                       </p>
                       
                       <p>
                          <strong>2. "As Is" and "As Available" Disclaimer:</strong> The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The creator and maintainers of Javelin Sentinel make no representations or warranties of any kind, express or implied, regarding the operation of the Service, the accuracy of the data, or the reliability of the notifications.
                       </p>

                       <p>
                          <strong>3. Limitation of Liability:</strong> In no event shall the creators, developers, or affiliates of Javelin Sentinel be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                          <ul className="list-disc list-inside ml-2 mt-1 opacity-80">
                             <li>Your access to or use of or inability to access or use the Service;</li>
                             <li>Any conduct or content of any third party on the Service;</li>
                             <li>Any content obtained from the Service; and</li>
                             <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                          </ul>
                       </p>

                       <p>
                          <strong>4. No Warranty:</strong> We do not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
                       </p>

                       <p>
                          <strong>5. User Responsibility:</strong> You are solely responsible for the configuration of your monitoring targets. You agree not to use this Service to monitor services for which you do not have authorization. You agree to indemnify and hold harmless the Service creators from any claims resulting from your use of the Service.
                       </p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                 <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-rose-400 mb-2">Reset Application</h4>
                    <p className="text-xs text-rose-300/70 mb-4">
                      This will delete all monitored APIs, logs, and settings. This action cannot be undone.
                    </p>
                    {!resetConfirm ? (
                       <button 
                         onClick={() => setResetConfirm(true)}
                         className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                       >
                         Reset Everything
                       </button>
                    ) : (
                       <div className="flex items-center space-x-3">
                          <button 
                            onClick={onResetSystem}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded text-xs font-bold transition-colors animate-pulse"
                          >
                            Yes, I am sure
                          </button>
                          <button 
                             onClick={() => setResetConfirm(false)}
                             className="text-slate-400 hover:text-white text-xs underline"
                          >
                             Cancel
                          </button>
                       </div>
                    )}
                 </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end shrink-0">
            {(activeTab !== 'docs' && activeTab !== 'terms') && (
               <button
               onClick={() => {
                 onSave(formData);
                 onClose();
               }}
               className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-900/20"
             >
               <Save size={16} />
               <span>Save Configuration</span>
             </button>
            )}
            {(activeTab === 'docs' || activeTab === 'terms') && (
               <button
               onClick={onClose}
               className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
             >
               Close
             </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};