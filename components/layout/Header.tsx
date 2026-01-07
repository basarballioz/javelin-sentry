import React from 'react';
import { Activity, Download, Upload, Zap, Settings2, Database } from 'lucide-react';
import { MonitorConfig } from '../../types';

interface HeaderProps {
  isDarkMode: boolean;
  totalCount: number;
  upCount: number;
  downCount: number;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  config: MonitorConfig;
  onOpenConfig: () => void;
  onOpenSlots: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  totalCount,
  upCount,
  downCount,
  isMonitoring,
  onToggleMonitoring,
  config,
  onOpenConfig,
  onOpenSlots,
  onExport,
  onImport
}) => {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
               <h1 className={`text-2xl font-extrabold tracking-[-0.04em] ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none`}>
                 Javelin
                 <span className="text-indigo-500">.</span>
               </h1>
               <div className="flex items-center space-x-2 text-[10px] font-bold mt-1.5 opacity-80 uppercase tracking-widest">
                  <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                     <span className={`w-1 h-1 rounded-full ${isMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                     <span>{totalCount} Total</span>
                  </div>
                  {upCount > 0 && (
                      <div className="flex items-center space-x-1 text-emerald-500">
                          <span>/</span>
                          <span>{upCount} UP</span>
                      </div>
                  )}
                  {downCount > 0 && (
                      <div className="flex items-center space-x-1 text-rose-500">
                          <span>/</span>
                          <span>{downCount} DOWN</span>
                      </div>
                  )}
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 md:space-x-3">
             <div className="hidden lg:flex items-center mr-4 space-x-2 text-[11px] font-mono text-slate-500 border-r border-slate-700/50 pr-4">
                <ClockIcon size={12} />
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>

             <button onClick={onOpenSlots} title="Save Slots" className={`p-2.5 rounded-xl border transition-all duration-200 group ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-400' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-indigo-600 shadow-sm'}`}>
                <Database size={16} />
             </button>

             <button onClick={onExport} title="Export Config" className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600 shadow-sm'}`}>
                <Download size={16} />
             </button>
             <label title="Import Config" className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600 shadow-sm'}`}>
                <Upload size={16} />
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
             </label>

             <div className="h-6 w-[1px] bg-slate-700/50 mx-1"></div>

             <button
               onClick={onToggleMonitoring}
               className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[11px] font-extrabold tracking-[0.1em] transition-all duration-300 border shadow-sm group ${
                 isMonitoring 
                 ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-emerald-600' 
                 : isDarkMode 
                    ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300' 
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
               }`}
             >
               <Zap size={14} className={`transition-all duration-300 ${isMonitoring ? "fill-white" : "fill-none"}`} />
               <span>{isMonitoring ? 'LIVE' : 'IDLE'}</span>
             </button>
             
             <button
               onClick={onOpenConfig}
               className={`p-2.5 rounded-xl transition-all border shadow-sm relative ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
             >
               <Settings2 size={18} />
               {(!config.botToken || !config.chatId) && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping border-2 border-slate-900" />
               )}
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const ClockIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);