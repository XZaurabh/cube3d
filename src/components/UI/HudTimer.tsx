import React from 'react';
import { useCubeStore } from '../../store/cubeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CubeSize } from '../../engine/types';

export const HudTimer: React.FC = () => {
  const size = useCubeStore((s) => s.size);
  const setSize = useCubeStore((s) => s.setSize);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const sizes: CubeSize[] = [2, 3, 4, 5, 6];

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto flex items-center justify-center z-20 select-none">
      {/* Dimension Selector Bar: Equal 5 Pills */}
      <div
        className={`flex items-center justify-between w-full p-1 rounded-2xl border backdrop-blur-md transition-colors duration-300 shadow-sm ${
          isLight
            ? 'bg-white/90 border-slate-200 shadow-slate-200/50'
            : 'bg-[#10141e]/90 border-white/10 shadow-black/40'
        }`}
      >
        {sizes.map((s) => {
          const isSelected = size === s;
          return (
            <button
              key={s}
              onClick={() => setSize(s)}
              disabled={isSolvingPlaying}
              title={`Switch to ${s}x${s} cube`}
              className={`flex-1 py-1.5 text-xs font-black tracking-wider uppercase rounded-xl transition-all text-center disabled:opacity-40 disabled:pointer-events-none ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s}x{s}
            </button>
          );
        })}
      </div>
    </div>
  );
};
