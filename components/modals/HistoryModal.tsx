
import React from 'react';
import { ApiEntry, Incident } from '../../types';
import { X, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HistoryModalProps {
  api: ApiEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDuration = (start: number, end: number | null) => {
  const endTime = end || Date.now();
  const diffMs = endTime - start;
  
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
  return `${(diffMs / 3600000).toFixed(1)}h`;
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ api, isOpen, onClose }) => {
  if (!isOpen || !api) return null;

  // Reverse incidents to show newest first
  const incidents = [...(api.incidents || [])].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="font-semibold text-lg text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              Incident History
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{api.url}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          {incidents.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <CheckCircle2 size={48} className="text-emerald-500/20 mb-4" />
                <h3 className="text-base font-medium text-slate-300">No Incidents Recorded</h3>
                <p className="text-xs mt-1">This service has been stable since monitoring began.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-medium uppercase text-xs sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-800">Status</th>
                  <th className="px-6 py-3 border-b border-slate-800">Date & Time</th>
                  <th className="px-6 py-3 border-b border-slate-800">Duration</th>
                  <th className="px-6 py-3 border-b border-slate-800">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       {inc.endTime ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                             RESOLVED
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold bg-rose-950/40 text-rose-500 border border-rose-900/50 animate-pulse">
                             <AlertTriangle size={12} /> ONGOING
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                      <div>{new Date(inc.startTime).toLocaleDateString()}</div>
                      <div className="text-slate-500">{new Date(inc.startTime).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={12} />
                          {formatDuration(inc.startTime, inc.endTime)}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-rose-400 text-xs font-mono break-words max-w-xs">
                         {inc.error}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
           <span>Total Incidents: <strong className="text-white">{incidents.length}</strong></span>
           <span>Last Incident: <strong className="text-white">{incidents[0] ? new Date(incidents[0].startTime).toLocaleDateString() : 'N/A'}</strong></span>
        </div>
      </div>
    </div>
  );
};
