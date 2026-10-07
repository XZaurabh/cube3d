import React from 'react';
import { X, Keyboard, Hand } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative transition-colors duration-300 ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200 shadow-2xl'
            : 'bg-slate-900 text-white border-white/10'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold">Controls & Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
          {/* Mouse & Touch */}
          <div>
            <h4
              className={`text-xs uppercase font-extrabold tracking-wider mb-2 flex items-center gap-1.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Mouse & Touch</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/60 border-white/5'
                }`}
              >
                <span className="font-bold text-cyan-500 block mb-0.5">Drag Cube Face</span>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  Rotates that layer smoothly
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/60 border-white/5'
                }`}
              >
                <span className="font-bold text-cyan-500 block mb-0.5">Drag Background</span>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  Orbits 3D camera around cube
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border col-span-2 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/60 border-white/5'
                }`}
              >
                <span className="font-bold text-cyan-500 block mb-0.5">
                  Mouse Scroll / Pinch
                </span>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  Zoom camera in and out
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard Keys */}
          <div>
            <h4
              className={`text-xs uppercase font-extrabold tracking-wider mb-2 flex items-center gap-1.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts (PC)</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <span>Face Turns (Clockwise)</span>
                <span className="font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  U, D, L, R, F, B
                </span>
              </div>
              <div
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <span>Counter-Clockwise (Prime)</span>
                <span className="font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Shift + Key
                </span>
              </div>
              <div
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <span>Scramble Cube</span>
                <span className="font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  S
                </span>
              </div>
              <div
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <span>Undo / Redo</span>
                <span className="font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Z / Y
                </span>
              </div>
              <div
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <span>Timer Start / Stop</span>
                <span className="font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Space
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pt-4 mt-2 border-t flex justify-end ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 active:scale-95 font-bold text-xs rounded-xl transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
