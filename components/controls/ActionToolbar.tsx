import React from 'react';
import { Search, PlayCircle, Layers, AlertCircle, CheckCircle2, PauseCircle, ArrowUpDown, Pause, Play, ListPlus } from 'lucide-react';

export type FilterStatus = 'ALL' | 'UP' | 'DOWN' | 'PAUSED';
export type SortOption = 'SEVERITY' | 'NAME' | 'LATENCY';

interface ActionToolbarProps {
  isDarkMode: boolean;
  newUrl: string;
  setNewUrl: (val: string) => void;
  onAddApi: (e: React.FormEvent) => void;
  onOpenBulkAdd: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (val: FilterStatus) => void;
  onCheckAll: () => void;
  onTogglePauseAll: () => void;
  areAllPaused: boolean;
  counts: { total: number; up: number; down: number; paused: number };
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  isDarkMode,
  newUrl,
  setNewUrl,
  onAddApi,
  onOpenBulkAdd,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  filterStatus,
  setFilterStatus,
  onCheckAll,
  onTogglePauseAll,
  areAllPaused,
  counts
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <form onSubmit={onAddApi} className="flex gap-3 flex-1">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://api.example.com/health"
              className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${isDarkMode ? 'bg-slate-900/50 backdrop-blur-sm border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-500'}`}
            />
          </div>
          <button 
            type="submit" 
            disabled={!newUrl} 
            className={`bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-900/20 transition-all flex items-center whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Add Target
          </button>
        </form>
        
        <button 
          onClick={onOpenBulkAdd}
          className={`px-4 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'}`}
          title="Bulk Add Targets"
        >
          <ListPlus size={20} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg px-3 py-2 pl-9 text-xs border focus:outline-none focus:ring-1 transition-all ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'}`}>
            <ArrowUpDown size={14} className="text-slate-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent border-none focus:outline-none text-slate-500 font-semibold cursor-pointer appearance-none pr-4"
            >
              <option value="SEVERITY">Priority (Down First)</option>
              <option value="NAME">Name (A-Z)</option>
              <option value="LATENCY">Latency (Slowest First)</option>
            </select>
          </div>

          <button onClick={onTogglePauseAll}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-amber-400' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600'}`}
            title={areAllPaused ? "Resume All Monitors" : "Pause All Monitors"}
          >
             {areAllPaused ? <Play size={14} /> : <Pause size={14} />} 
             <span className="hidden sm:inline">{areAllPaused ? 'Resume All' : 'Pause All'}</span>
          </button>

          <button onClick={onCheckAll}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-emerald-400' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-600'}`}
          >
            <PlayCircle size={14} /> <span className="hidden sm:inline">Check All</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        <FilterButton 
            active={filterStatus === 'ALL'} 
            onClick={() => setFilterStatus('ALL')} 
            isDarkMode={isDarkMode} 
            icon={<Layers size={12}/>} 
            label="All" 
            count={counts.total} 
            colorClass="slate"
        />
        <FilterButton 
            active={filterStatus === 'DOWN'} 
            onClick={() => setFilterStatus('DOWN')} 
            isDarkMode={isDarkMode} 
            icon={<AlertCircle size={12}/>} 
            label="Down" 
            count={counts.down} 
            colorClass="rose"
        />
        <FilterButton 
            active={filterStatus === 'UP'} 
            onClick={() => setFilterStatus('UP')} 
            isDarkMode={isDarkMode} 
            icon={<CheckCircle2 size={12}/>} 
            label="Up" 
            count={counts.up} 
            colorClass="emerald"
        />
        <FilterButton 
            active={filterStatus === 'PAUSED'} 
            onClick={() => setFilterStatus('PAUSED')} 
            isDarkMode={isDarkMode} 
            icon={<PauseCircle size={12}/>} 
            label="Paused" 
            count={counts.paused} 
            colorClass="amber"
        />
      </div>
    </div>
  );
};

const FilterButton: React.FC<{active: boolean, onClick: () => void, isDarkMode: boolean, icon: React.ReactNode, label: string, count: number, colorClass: string}> = ({
    active, onClick, isDarkMode, icon, label, count, colorClass
}) => {
    const colors: any = {
        slate: { activeBg: 'bg-slate-800', activeText: 'text-white', activeBorder: 'border-slate-700', hoverText: 'text-slate-500' },
        rose: { activeBg: 'bg-rose-500/10', activeText: 'text-rose-500', activeBorder: 'border-rose-500/20', hoverText: 'text-rose-400' },
        emerald: { activeBg: 'bg-emerald-500/10', activeText: 'text-emerald-500', activeBorder: 'border-emerald-500/20', hoverText: 'text-emerald-400' },
        amber: { activeBg: 'bg-amber-500/10', activeText: 'text-amber-500', activeBorder: 'border-amber-500/20', hoverText: 'text-amber-400' },
    };
    
    const theme = colors[colorClass];
    const baseClass = `flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer`;
    const activeClass = `${theme.activeBg} ${theme.activeText} ${theme.activeBorder}`;
    const inactiveDark = `bg-slate-900/30 text-slate-500 border-slate-800 hover:${theme.hoverText}`;
    const inactiveLight = `bg-white text-slate-500 border-slate-200 hover:bg-slate-50`;

    return (
        <button onClick={onClick} className={`${baseClass} ${active ? activeClass : isDarkMode ? inactiveDark : inactiveLight}`}>
            {icon}
            <span>{label}</span>
            <span className="opacity-50 ml-1 bg-slate-700/50 px-1.5 rounded-full text-[9px]">{count}</span>
        </button>
    );
}