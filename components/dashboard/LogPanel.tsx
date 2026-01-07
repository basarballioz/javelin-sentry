import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../../types';
import { Activity, Trash2, Search, ArrowDown, X, Filter, Clock } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogPanel: React.FC<LogPanelProps> = React.memo(({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isNearBottom);
    }
  };

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
      setSearchQuery('');
    } else {
      setConfirmClear(true);
      timeoutRef.current = window.setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans">
      
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">System Activity</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {searchQuery ? `${filteredLogs.length} matching events` : `${logs.length} events logged`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             {!autoScroll && logs.length > 0 && (
                <button 
                  onClick={() => setAutoScroll(true)}
                  className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Scroll to bottom"
                >
                  <ArrowDown size={16} className="animate-bounce" />
                </button>
             )}
             
             {logs.length > 0 && (
               <button
                 onClick={handleClear}
                 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                   confirmClear
                     ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                     : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200'
                 }`}
               >
                 <Trash2 size={14} />
                 <span>{confirmClear ? 'Confirm?' : 'Clear'}</span>
               </button>
             )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..." 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50 dark:bg-slate-950 relative"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
               <Activity size={24} className="opacity-50" />
            </div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs opacity-60">System is ready and monitoring</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <Filter size={24} className="mb-2 opacity-50" />
            <p className="text-sm">No logs match your search</p>
          </div>
        ) : (
          <div className="relative pl-2">
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-slate-800 rounded-full"></div>

            {filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const isSuccess = log.type === 'success';
              const isError = log.type === 'error';
              const isInfo = log.type === 'info';

              return (
                <div key={log.id} className="relative pl-6 py-2 group">
                  
                  <div className={`absolute left-0 top-3.5 w-4 h-4 rounded-full border-2 z-10 bg-white dark:bg-slate-950 transition-colors ${
                    isSuccess ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]' :
                    isError ? 'border-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.1)]' :
                    'border-indigo-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                       isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-indigo-400'
                    }`}></div>
                  </div>

                  <div className={`rounded-xl p-3 border transition-all ${
                    isError 
                      ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30' 
                      : 'hover:bg-white dark:hover:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSuccess ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          isError ? 'text-rose-700 bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400' :
                          'text-indigo-700 bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                           <Clock size={10} />
                           {date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-xs font-medium leading-relaxed ${
                      isError ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});