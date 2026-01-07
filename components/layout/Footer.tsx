import React from 'react';
import { Code2, Github, Book, Gavel } from 'lucide-react';

interface FooterProps {
  isDarkMode: boolean;
  downCount: number;
  onOpenDocs: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode, downCount, onOpenDocs, onOpenTerms }) => {
  return (
    <footer className={`fixed bottom-0 w-full z-50 border-t py-5 backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? 'border-slate-900 bg-slate-950/90' : 'border-slate-200 bg-white/90'}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-medium tracking-wide uppercase">
        <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="flex items-center space-x-1.5">
            <span className={`font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>JAVELIN</span>
            <span className="text-indigo-500 font-black">.</span>
          </div>
          <span className="opacity-30">|</span>
          <span className="font-mono lowercase opacity-60">v2.5.0-stable</span>
        </div>

        <div className={`flex items-center space-x-3 px-4 py-2 rounded-full border transition-all duration-500 ${
          downCount === 0
            ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${downCount === 0 ? 'bg-emerald-500' : 'bg-rose-500'} ${downCount > 0 ? 'animate-pulse' : ''}`}></span>
          <span className="font-extrabold">
            {downCount === 0 ? 'Systems Operational' : `${downCount} Service Critical`}
          </span>
        </div>

        <div className={`flex items-center space-x-5 ${isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>
           <button onClick={onOpenTerms} className="transition-colors hover:text-indigo-500">
            Terms
          </button>
          <button onClick={onOpenDocs} className="transition-colors hover:text-indigo-500">
            Docs
          </button>
          <a href="#" className="transition-colors hover:text-indigo-500">
            Github
          </a>
        </div>
      </div>
    </footer>
  );
};