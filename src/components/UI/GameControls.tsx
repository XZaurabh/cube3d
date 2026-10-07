import React, { useState } from 'react';
import {
  Shuffle,
  RotateCcw,
  Undo2,
  Redo2,
  Wand2,
  Camera,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useCubeStore } from '../../store/cubeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CameraViewPreset } from '../Cube/Cube3D';

interface GameControlsProps {
  onSetCameraView?: (view: CameraViewPreset) => void;
  onSolveClick: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onSetCameraView,
  onSolveClick,
}) => {
  const scramble = useCubeStore((s) => s.scramble);
  const resetCube = useCubeStore((s) => s.resetCube);
  const undo = useCubeStore((s) => s.undo);
  const redo = useCubeStore((s) => s.redo);
  const undoStack = useCubeStore((s) => s.undoStack);
  const redoStack = useCubeStore((s) => s.redoStack);
  const enqueueMove = useCubeStore((s) => s.enqueueMove);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showQuickButtons, setShowQuickButtons] = useState(false);

  const cameraAngles: { label: string; view: CameraViewPreset }[] = [
    { label: 'Front', view: 'front' },
    { label: 'Back', view: 'back' },
    { label: 'Left', view: 'left' },
    { label: 'Right', view: 'right' },
    { label: 'Top', view: 'top' },
    { label: 'Bottom', view: 'bottom' },
    { label: 'Default', view: 'default' },
  ];

  const quickMoves = ['U', 'D', 'L', 'R', 'F', 'B'];

  return (
    <div className="relative flex flex-col items-center gap-2 w-full max-w-lg mx-auto px-3 pb-3 z-30 select-none">
      {/* Quick Camera Angle Bar (Collapsible) */}
      {showCameraMenu && (
        <div
          className={`flex flex-wrap items-center justify-center gap-1.5 p-2 backdrop-blur-md rounded-2xl border shadow-xl mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors duration-300 ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-slate-900/90 border-white/10 text-slate-200'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase px-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            View:
          </span>
          {cameraAngles.map((angle) => (
            <button
              key={angle.view}
              onClick={() => {
                if (onSetCameraView) onSetCameraView(angle.view);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg active:scale-95 transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white'
              }`}
            >
              {angle.label}
            </button>
          ))}
        </div>
      )}

      {/* Quick Move Buttons (Disabled during auto-solve) */}
      {showQuickButtons && !isSolvingPlaying && (
        <div
          className={`flex items-center justify-center gap-1.5 p-1.5 backdrop-blur-md rounded-xl border shadow-lg mb-1 transition-colors duration-300 ${
            isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/85 border-white/10'
          }`}
        >
          {quickMoves.map((m) => (
            <button
              key={m}
              onClick={() => enqueueMove(m)}
              className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-sm active:scale-90 rounded-lg transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-cyan-400 hover:text-slate-950 text-slate-800'
                  : 'bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Main Action Bar */}
      <div
        className={`flex items-center justify-between gap-1.5 sm:gap-2 w-full backdrop-blur-xl p-2 sm:p-2.5 rounded-3xl border shadow-2xl transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-200 shadow-xl'
            : 'bg-slate-950/85 border-white/15 shadow-2xl'
        }`}
      >
        {/* Scramble */}
        <button
          onClick={scramble}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-2 rounded-2xl active:scale-95 transition-all border shadow-sm font-bold text-xs sm:text-sm ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white border-white/10'
          }`}
        >
          <Shuffle className="w-4 h-4 text-cyan-500" />
          <span>Scramble</span>
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo move (Z)"
          className={`w-11 h-11 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none rounded-2xl active:scale-95 transition-all border shadow-sm ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo move (Y)"
          className={`w-11 h-11 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none rounded-2xl active:scale-95 transition-all border shadow-sm ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={resetCube}
          title="Reset cube to solved state"
          className={`w-11 h-11 flex items-center justify-center rounded-2xl active:scale-95 transition-all border shadow-sm ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Camera Toggle Button */}
        <button
          onClick={() => setShowCameraMenu((prev) => !prev)}
          title="Camera angles"
          className={`w-11 h-11 flex items-center justify-center rounded-2xl active:scale-95 transition-all border shadow-sm ${
            showCameraMenu
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40'
              : isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Solve */}
        <button
          onClick={onSolveClick}
          className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
        >
          <Wand2 className="w-4 h-4" />
          <span>Solve</span>
        </button>
      </div>

      {/* Mini toggle for quick face buttons */}
      <button
        onClick={() => setShowQuickButtons((p) => !p)}
        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-0.5"
      >
        <span>Face Turn Helpers</span>
        {showQuickButtons ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
    </div>
  );
};
