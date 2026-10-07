import React from 'react';
import { Settings, Play, Cpu, Keyboard } from 'lucide-react';
import { useCubeStore } from '../../store/cubeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { SignatureBrand } from './SignatureBrand';

interface TopHeaderProps {
  onOpenSettings: () => void;
  onOpenKeyboardHelp?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSettings,
  onOpenKeyboardHelp,
}) => {
  const activePage = useCubeStore((s) => s.activePage);
  const setActivePage = useCubeStore((s) => s.setActivePage);
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <header
      className={`relative z-30 flex items-center justify-between w-full px-4 sm:px-6 py-2.5 border-b backdrop-blur-md transition-colors duration-300 ${
        isLight
          ? 'bg-white/85 border-slate-200 shadow-sm text-slate-900'
          : 'bg-slate-950/80 border-white/5 text-white'
      }`}
    >
      {/* Zone 1: Exact Signature Wordmark */}
      <button
        onClick={() => setActivePage('home')}
        className="focus:outline-none hover:opacity-90 transition-opacity"
      >
        <SignatureBrand size="normal" metadata="1 . 2   P R O" />
      </button>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setActivePage('play')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activePage === 'play'
              ? isLight
                ? 'bg-slate-200/90 text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
              : isLight
              ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play</span>
        </button>

        <button
          onClick={() => setActivePage('solver')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activePage === 'solver'
              ? isLight
                ? 'bg-slate-200/90 text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
              : isLight
              ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Solver</span>
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5">
        {onOpenKeyboardHelp && (
          <button
            onClick={onOpenKeyboardHelp}
            title="Keyboard shortcuts (PC)"
            className={`p-2 rounded-lg transition-colors hidden md:flex items-center justify-center ${
              isLight
                ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onOpenSettings}
          title="Game Settings"
          className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
            isLight
              ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
