
import React from 'react';
import { ApiEntry, UserAgentType } from '../../types';
import { StatusCard } from './StatusCard';
import { Shield, Filter } from 'lucide-react';

interface MonitorGridProps {
  apis: ApiEntry[];
  allApisCount: number; 
  isDarkMode: boolean;
  onRemove: (id: string) => void;
  // Updated onCheckNow signature to include uaType parameter
  onCheckNow: (id: string, url: string, validationConfig: any, uaType: UserAgentType) => void;
  onEdit: (api: ApiEntry) => void;
  onTogglePause: (id: string) => void;
  onViewHistory: (api: ApiEntry) => void;
}

export const MonitorGrid: React.FC<MonitorGridProps> = React.memo(({
  apis,
  allApisCount,
  isDarkMode,
  onRemove,
  onCheckNow,
  onEdit,
  onTogglePause,
  onViewHistory
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
      {apis.map(api => (
        <StatusCard
          key={api.id}
          api={api}
          onRemove={onRemove}
          // Pass userAgentType as the 4th argument to onCheckNow
          onCheckNow={(url) => onCheckNow(api.id, url, api.validationConfig, api.userAgentType)}
          onEdit={onEdit}
          onTogglePause={onTogglePause}
          onViewHistory={onViewHistory}
        />
      ))}

      {allApisCount === 0 && (
        <div className={`col-span-full border-2 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-500' : 'border-gray-200 bg-gray-50/50 text-gray-400'}`}>
          <div className="bg-slate-800/50 p-4 rounded-full mb-4">
            <Shield size={32} className="opacity-40" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Active Monitors</h3>
          <p className="text-xs opacity-70">Add a target URL above to start monitoring.</p>
        </div>
      )}

      {allApisCount > 0 && apis.length === 0 && (
        <div className={`col-span-full border-2 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-500' : 'border-gray-200 bg-gray-50/50 text-gray-400'}`}>
          <Filter size={24} className="opacity-40 mb-2" />
          <h3 className="text-sm font-medium">No results match filters</h3>
        </div>
      )}
    </div>
  );
});
