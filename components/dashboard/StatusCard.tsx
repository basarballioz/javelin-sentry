import React from 'react';
import { ApiEntry, ApiStatus, ValidationType, UserAgentType } from '../../types';
import { Globe, Trash2, Edit2, Play, CheckCircle2, XCircle, Clock, AlertTriangle, Pause, PlayCircle, History, Dices, Activity, Monitor, Smartphone, Search, Braces } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

interface StatusCardProps {
  api: ApiEntry;
  onRemove: (id: string) => void;
  onCheckNow: (url: string) => void;
  onEdit: (api: ApiEntry) => void;
  onTogglePause: (id: string) => void;
  onViewHistory: (api: ApiEntry) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isDown = data.status === ApiStatus.DOWN;
    return (
      <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-2xl text-xs z-50 ring-1 ring-white/10">
        <div className="flex items-center justify-between mb-2 space-x-6">
            <span className="text-slate-400 font-mono">{data.displayTime}</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${isDown ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {data.status}
            </span>
        </div>
        {!isDown ? (
            <div className="text-slate-200 flex items-center justify-between space-x-4">
                <span className="text-slate-400">Latency</span>
                <span className="font-mono text-emerald-300 font-bold text-sm">{data.latency}ms</span>
            </div>
        ) : (
            <div className="text-rose-400 font-medium flex items-center space-x-2">
                <AlertTriangle size={12} />
                <span>Connection Failed</span>
            </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomizedDot = (props: any) => {
  const { cx, cy, payload, height } = props; 
  if (payload.status === ApiStatus.DOWN) {
    return (
      <g>
        <line x1={cx} y1={cy} x2={cx} y2={height} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
        <circle cx={cx} cy={cy} r={6} fill="#f43f5e" opacity={0.4}>
           <animate attributeName="r" from="6" to="18" dur="1.5s" repeatCount="indefinite" />
           <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={4} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
      </g>
    );
  }
  return null;
};

export const StatusCard: React.FC<StatusCardProps> = React.memo(({ api, onRemove, onCheckNow, onEdit, onTogglePause, onViewHistory }) => {
  const isUp = api.status === ApiStatus.UP;
  const isDown = api.status === ApiStatus.DOWN;
  const isChecking = api.status === ApiStatus.CHECKING;
  const isPaused = api.paused;
  
  let hostname = api.url;
  let pathname = '';
  try {
      const parsed = new URL(api.url);
      hostname = parsed.hostname;
      pathname = parsed.pathname === '/' ? '' : parsed.pathname;
  } catch (e) {}

  const getUAIcon = () => {
    switch (api.userAgentType) {
      case UserAgentType.SAFARI_IOS: return <Smartphone size={10} />;
      case UserAgentType.CHROME_DESKTOP: return <Monitor size={10} />;
      case UserAgentType.FIREFOX_DESKTOP: return <Globe size={10} />;
      case UserAgentType.GOOGLE_BOT: return <Globe size={10} />;
      default: return <Monitor size={10} />;
    }
  };

  const getValidationIcon = () => {
    switch (api.validationConfig.type) {
      case ValidationType.KEYWORD_MATCH: return <Search size={10} />;
      case ValidationType.JSON_EXACT: return <Braces size={10} />;
      default: return null;
    }
  };

  const chartData = api.history.map(point => ({
    time: point.timestamp,
    latency: point.status === ApiStatus.UP ? point.latency : 0,
    status: point.status,
    isDown: point.status === ApiStatus.DOWN,
    displayTime: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const validLatencies = api.history.filter(h => h.status === ApiStatus.UP && h.latency !== null).map(h => h.latency as number);
  const avgLatency = validLatencies.length > 0 
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) 
    : 0;

  const total = api.totalChecks || 0;
  const downCount = api.totalDown || 0;
  const uptimePercentage = total === 0 ? "100.0" : (((total - downCount) / total) * 100).toFixed(1);

  return (
    <div className={`
      relative group flex flex-col rounded-[2.5rem] border transition-all duration-500 shadow-xl overflow-hidden min-h-[220px] sm:min-h-[260px]
      ${isPaused ? 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75' : ''}
      ${isChecking && !isPaused ? 'bg-white dark:bg-slate-900/90 border-indigo-500/50 dark:border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : ''}
      ${!isPaused && !isChecking && isUp ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30' : ''}
      ${!isPaused && !isChecking && isDown ? 'bg-white dark:bg-slate-900/80 border-rose-200 dark:border-rose-900/30 hover:border-rose-500/50 shadow-rose-500/5' : ''}
    `}>
      <div className="p-6 sm:p-7 relative z-10 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4 min-w-0 pr-12">
            <div className={`relative p-3 rounded-[1.25rem] shrink-0 shadow-inner ring-1 ring-inset transition-all duration-300
              ${isPaused ? 'bg-slate-100 text-slate-400 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-600' : 
                isChecking ? 'bg-indigo-500/10 text-indigo-500 ring-indigo-500/20' : 
                isUp ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' : 
                isDown ? 'bg-rose-500/10 text-rose-500 ring-rose-500/20' : 'bg-slate-100'
              }`}>
               {isChecking && !isPaused && <span className="absolute inset-0 rounded-[1.25rem] bg-indigo-500/20 animate-ping"></span>}
               <div className={isChecking && !isPaused ? 'animate-heartbeat' : ''}>
                 {isPaused ? <PlayCircle size={28} /> : 
                  isChecking ? <Activity size={28} /> : 
                  isUp ? <CheckCircle2 size={28} /> : 
                  <XCircle size={28} />}
               </div>
            </div>
            <div className="flex flex-col min-w-0 pt-0.5">
               <div className="flex items-center gap-2">
                 <h3 className={`font-black text-xl tracking-tight truncate leading-none ${isPaused ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`} title={api.url}>
                   {hostname}
                 </h3>
                 <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700" title="User Agent">
                        {getUAIcon()}
                    </span>
                    {getValidationIcon() && (
                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50" title="Strategy">
                            {getValidationIcon()}
                        </span>
                    )}
                 </div>
               </div>
               <div className="flex items-center space-x-2 mt-2">
                 <span className="text-[10px] text-slate-500 font-mono opacity-70 truncate max-w-[200px]">{pathname}</span>
               </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 absolute top-5 right-5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
            <div className="flex items-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-20">
                <button onClick={() => onTogglePause(api.id)} className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" title="Pause/Resume">{isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}</button>
                <button onClick={() => onCheckNow(api.url)} disabled={isChecking} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" title="Check Now"><Play size={18} className={isChecking ? "animate-spin" : ""} fill="currentColor" /></button>
                <button onClick={() => onViewHistory(api)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" title="History"><History size={18} /></button>
                <button onClick={() => onEdit(api)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" title="Edit"><Edit2 size={18} /></button>
                <button onClick={() => onRemove(api.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" title="Remove"><Trash2 size={18} /></button>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-500 ${isPaused ? 'opacity-40 grayscale scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-slate-50 dark:bg-slate-950/40 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">LATENCY</div>
                <div className="text-lg sm:text-xl font-mono font-black text-slate-700 dark:text-slate-200 leading-none">{avgLatency}<span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">ms</span></div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">UPTIME</div>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-500 leading-none">{uptimePercentage}<span className="text-[10px] font-bold text-emerald-500/50 ml-0.5">%</span></div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">CHECKS</div>
                <div className={`text-lg sm:text-xl font-mono font-black ${api.failureCount > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'} leading-none`}>{total}</div>
            </div>
        </div>
        <div className="flex items-center justify-between min-h-[40px]">
             <div className="flex items-center space-x-3">
                <span className={`px-4 py-1.5 rounded-full border font-black text-[10px] tracking-widest uppercase transition-colors duration-300 ${
                    isPaused ? 'bg-slate-800 text-slate-500 border-slate-700' :
                    isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    isDown ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800'
                }`}>
                    {isPaused ? 'PAUSED' : isChecking ? 'SCANNING' : api.status}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                   {api.useRandomInterval ? <Dices size={12}/> : <Clock size={12}/>} {api.useRandomInterval ? '5-30s' : `${api.intervalSeconds}s`}
                </span>
             </div>
             {api.lastResponse && isDown && !isPaused && (
                 <div className="text-[10px] px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-900/50 max-w-[220px] truncate font-bold" title={api.lastResponse}>
                    {api.lastResponse.length > 50 ? api.lastResponse.substring(0, 50) + '...' : api.lastResponse}
                 </div>
             )}
        </div>
      </div>
      <div className={`h-24 sm:h-28 w-full mt-auto select-none transition-all duration-700 ${isPaused ? 'grayscale opacity-20' : 'opacity-60 group-hover:opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorLatency-${api.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDown ? "#f43f5e" : "#10b981"} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={isDown ? "#f43f5e" : "#10b981"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            {!isPaused && <Tooltip content={<CustomTooltip />} />}
            <Area type="monotone" dataKey="latency" stroke={isDown ? "#f43f5e" : "#10b981"} strokeWidth={3} fill={`url(#colorLatency-${api.id})`} isAnimationActive={false} dot={<CustomizedDot />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});