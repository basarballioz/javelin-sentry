
import React, { useState, useEffect, useMemo } from 'react';
import { MonitorConfig, ApiEntry, ApiStatus } from './types';
import { LogPanel } from './components/dashboard/LogPanel';
import { ConfigModal, ConfigTab } from './components/modals/ConfigModal';
import { EditApiModal } from './components/modals/EditApiModal';
import { BulkAddModal } from './components/modals/BulkAddModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { AddApiConfirmModal } from './components/modals/AddApiConfirmModal'; // Added new modal
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ActionToolbar, FilterStatus, SortOption } from './components/controls/ActionToolbar';
import { MonitorGrid } from './components/dashboard/MonitorGrid';
import { useMonitoring } from './hooks/useMonitoring';

const DEFAULT_CONFIG: MonitorConfig = {
  botToken: '',
  chatId: '',
  defaultIntervalSeconds: 60,
  soundEnabled: false,
  soundVariant: 'classic',
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_preference') !== 'light';
  });

  const [config, setConfig] = useState<MonitorConfig>(() => {
    const saved = localStorage.getItem('monitor_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<ConfigTab>('general');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false); // Added state
  
  const [editingApi, setEditingApi] = useState<ApiEntry | null>(null);
  const [viewingHistoryApi, setViewingHistoryApi] = useState<ApiEntry | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [pendingUrl, setPendingUrl] = useState(''); // Added state
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('SEVERITY');

  const { 
    apis, logs, isMonitoring, setIsMonitoring, 
    addApi, addMultipleApis, removeApi, updateApi, togglePause, togglePauseAll,
    checkNow, checkAll, clearLogs, importData, addLog 
  } = useMonitoring(config);

  useEffect(() => { localStorage.setItem('monitor_config', JSON.stringify(config)); }, [config]);
  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleResetSystem = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ apis, config, timestamp: Date.now() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `javelin-sentinel-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addLog('Configuration exported successfully', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.config) setConfig(parsed.config);
        importData(parsed);
      } catch (err) { addLog('Import failed: Invalid file', 'error'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLoadSlot = (data: { apis: ApiEntry[], config: MonitorConfig }) => {
    if (data.config) setConfig(data.config);
    if (data.apis) importData({ apis: data.apis });
    addLog('Configuration slot loaded successfully', 'success');
  };

  const handleAddApiTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setPendingUrl(newUrl);
    setIsAddConfirmOpen(true);
    setNewUrl('');
  };

  const processedApis = useMemo(() => {
    let result = [...apis];

    if (searchQuery) {
      result = result.filter(api => api.url.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterStatus !== 'ALL') {
      result = result.filter(api => {
        if (filterStatus === 'PAUSED') return api.paused;
        if (api.paused) return false;
        return api.status === filterStatus;
      });
    }

    result.sort((a, b) => {
      if (sortOption === 'SEVERITY') {
        const getWeight = (api: ApiEntry) => {
          if (api.paused) return 4;
          if (api.status === ApiStatus.DOWN) return 0;
          if (api.status === ApiStatus.CHECKING) return 1;
          if (api.status === ApiStatus.PENDING) return 2;
          return 3;
        };
        return getWeight(a) - getWeight(b);
      }
      if (sortOption === 'LATENCY') {
        const getLatency = (api: ApiEntry) => {
          if (api.status !== ApiStatus.UP || !api.history.length) return -1;
          const lastPoint = api.history[api.history.length - 1];
          return lastPoint.latency || 0;
        };
        return getLatency(b) - getLatency(a);
      }
      if (sortOption === 'NAME') {
        return a.url.localeCompare(b.url);
      }
      return 0;
    });

    return result;
  }, [apis, searchQuery, filterStatus, sortOption]);

  const upCount = apis.filter(a => a.status === ApiStatus.UP && !a.paused).length;
  const downCount = apis.filter(a => a.status === ApiStatus.DOWN && !a.paused).length;
  const pausedCount = apis.filter(a => a.paused).length;
  const areAllPaused = apis.length > 0 && apis.every(a => a.paused);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      <div className={`fixed inset-0 pointer-events-none z-0 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}>
         <div className="absolute inset-0 bg-grid-pattern"></div>
         {isDarkMode && <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent"></div>}
      </div>

      <Header 
        isDarkMode={isDarkMode}
        totalCount={apis.length}
        upCount={upCount}
        downCount={downCount}
        isMonitoring={isMonitoring}
        onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
        config={config}
        onOpenConfig={() => { setActiveConfigTab('general'); setIsConfigOpen(true); }}
        onOpenSlots={() => { setActiveConfigTab('slots'); setIsConfigOpen(true); }}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden relative z-10 pb-32">
        <div className="flex-1 flex flex-col min-w-0 space-y-4">
          <ActionToolbar 
            isDarkMode={isDarkMode}
            newUrl={newUrl}
            setNewUrl={setNewUrl}
            onAddApi={handleAddApiTrigger}
            onOpenBulkAdd={() => setIsBulkAddOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onCheckAll={checkAll}
            onTogglePauseAll={togglePauseAll}
            areAllPaused={areAllPaused}
            counts={{ total: apis.length, up: upCount, down: downCount, paused: pausedCount }}
          />

          <MonitorGrid 
            apis={processedApis}
            allApisCount={apis.length}
            isDarkMode={isDarkMode}
            onRemove={removeApi}
            onCheckNow={checkNow}
            onEdit={(api) => { setEditingApi(api); setIsEditOpen(true); }}
            onTogglePause={togglePause}
            onViewHistory={(api) => { setViewingHistoryApi(api); setIsHistoryOpen(true); }}
          />
        </div>

        <div className="w-full lg:w-[420px] h-72 lg:h-[calc(100vh-13rem)] shrink-0 sticky rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <LogPanel logs={logs} onClear={clearLogs} />
        </div>
      </main>

      <Footer 
        isDarkMode={isDarkMode} 
        downCount={downCount} 
        onOpenDocs={() => { setActiveConfigTab('docs'); setIsConfigOpen(true); }}
        onOpenTerms={() => { setActiveConfigTab('terms'); setIsConfigOpen(true); }}
      />

      <ConfigModal 
        isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}
        config={config} onSave={setConfig}
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onResetSystem={handleResetSystem}
        initialTab={activeConfigTab}
        currentApis={apis}
        onLoadSlot={handleLoadSlot}
      />

      <EditApiModal 
        api={editingApi} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}
        onSave={(id, updates) => { updateApi(id, updates); setIsEditOpen(false); }}
      />

      <BulkAddModal 
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSave={addMultipleApis}
      />

      <HistoryModal
        api={viewingHistoryApi}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Added confirmation modal */}
      <AddApiConfirmModal
        url={pendingUrl}
        isOpen={isAddConfirmOpen}
        onClose={() => setIsAddConfirmOpen(false)}
        onConfirm={(data) => {
            addApi(data);
            setIsAddConfirmOpen(false);
        }}
        defaultInterval={config.defaultIntervalSeconds}
      />
    </div>
  );
};

export default App;
