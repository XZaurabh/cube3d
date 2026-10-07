import React, { useRef, useEffect, useState } from 'react';
import {
  Shuffle,
  RotateCcw,
  Undo2,
  Redo2,
  Wand2,
  Loader2,
  CheckCircle2,
  Settings,
  Keyboard,
  Send,
  AlertCircle,
  Terminal,
  Grid3X3,
} from 'lucide-react';
import { Cube3D, CameraViewPreset } from '../components/Cube/Cube3D';
import { SignatureBrand } from '../components/UI/SignatureBrand';
import { HudTimer } from '../components/UI/HudTimer';
import { useCubeStore } from '../store/cubeStore';
import { useSettingsStore } from '../store/settingsStore';
import { parseMoveSequence } from '../engine/notation';

interface HomeProps {
  onOpenSettings: () => void;
  onOpenKeyboardHelp?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenSettings, onOpenKeyboardHelp }) => {
  const setCameraViewRef = useRef<((view: CameraViewPreset) => void) | null>(null);

  // Zustand Store
  const size = useCubeStore((s) => s.size);
  const scramble = useCubeStore((s) => s.scramble);
  const resetCube = useCubeStore((s) => s.resetCube);
  const undo = useCubeStore((s) => s.undo);
  const redo = useCubeStore((s) => s.redo);
  const undoStack = useCubeStore((s) => s.undoStack);
  const redoStack = useCubeStore((s) => s.redoStack);
  const enqueueMove = useCubeStore((s) => s.enqueueMove);
  const startAutoSolve = useCubeStore((s) => s.startAutoSolve);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);
  const isSolved = useCubeStore((s) => s.isSolved);
  const appliedMoves = useCubeStore((s) => s.appliedMoves);
  const applyAlgorithmString = useCubeStore((s) => s.applyAlgorithmString);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  // Local UI States (Drawer popovers that float without pushing layout)
  const [showAlgoInput, setShowAlgoInput] = useState(false);
  const [showQuickMoves, setShowQuickMoves] = useState(false);
  const [algoInput, setAlgoInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const quickMoves = ['U', 'D', 'L', 'R', 'F', 'B'];

  // Keyboard shortcut listener for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (isSolvingPlaying) return;

      const key = e.key.toUpperCase();

      if (['U', 'D', 'L', 'R', 'F', 'B'].includes(key)) {
        const notation = e.shiftKey ? `${key}'` : key;
        enqueueMove(notation);
        return;
      }

      if (key === 'Z' && !e.ctrlKey && !e.metaKey) {
        undo();
        return;
      }
      if (key === 'Y' && !e.ctrlKey && !e.metaKey) {
        redo();
        return;
      }
      if (key === 'S' && !e.ctrlKey && !e.metaKey) {
        scramble();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enqueueMove, undo, redo, scramble, isSolvingPlaying]);

  const handleCameraReady = (fn: (view: CameraViewPreset) => void) => {
    setCameraViewRef.current = fn;
  };

  const handleApplyAlgo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!algoInput.trim()) return;

    const parsed = parseMoveSequence(algoInput, size);
    if (parsed.length === 0) {
      setInputError("No valid moves (e.g. R U R' U')");
      return;
    }

    setInputError(null);
    applyAlgorithmString(algoInput);
    setAlgoInput('');
    setShowAlgoInput(false);
  };

  const recentMoves = appliedMoves.slice(-8);

  return (
    <div
      className={`relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
        isLight ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#07090e] text-white'
      }`}
    >
      {/* Subtle background radial glow */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isLight
            ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.12),transparent_70%)] opacity-70'
            : 'bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.08),transparent_70%)] opacity-100'
        }`}
      />

      {/* UPPER PART: Spacious, Prominent Branding & Dimension Selector */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-5 sm:px-6 pt-4 sm:pt-5 pb-1 flex flex-col gap-2.5 shrink-0">
        {/* Row 1: Signature Wordmark (Dominant & Bold) + Header Actions */}
        <div className="flex items-center justify-between w-full">
          {/* Big App Name with signature typography & byline */}
          <SignatureBrand size="large" metadata="1 . 2   P R O" />

          {/* Settings & Keyboard actions */}
          <div className="flex items-center gap-2">
            {onOpenKeyboardHelp && (
              <button
                onClick={onOpenKeyboardHelp}
                title="Keyboard shortcuts (PC)"
                className={`p-2.5 rounded-xl border shadow-sm transition-all hidden md:flex items-center justify-center ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 shadow-slate-200/50'
                    : 'bg-[#11151f] hover:bg-[#181f2e] text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenSettings}
              title="Game Settings"
              className={`p-2.5 rounded-xl border shadow-sm active:scale-95 transition-all flex items-center justify-center ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 shadow-slate-200/50'
                  : 'bg-[#11151f] hover:bg-[#181f2e] text-slate-300 hover:text-white border-white/10'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Row 2: Clean Dimension Selector (2x2 to 6x6) */}
        <HudTimer />
      </div>

      {/* CENTER 3D CUBE STAGE: Maximum Viewport Presence & Absolutely Stable Position */}
      <div className="relative flex-1 w-full min-h-[300px] flex items-center justify-center overflow-hidden">
        <Cube3D interactive={true} autoRotate={false} onCameraViewReady={handleCameraReady} />

        {/* Desktop Move History Float */}
        {recentMoves.length > 0 && (
          <div
            className={`hidden lg:flex flex-col gap-1 absolute top-2 left-6 backdrop-blur-md px-3 py-2 rounded-2xl border shadow-lg pointer-events-none transition-colors duration-300 ${
              isLight
                ? 'bg-white/85 border-slate-200 text-slate-800'
                : 'bg-slate-950/70 border-white/10 text-slate-200'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Recent Moves
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm text-cyan-500 font-bold">
              {recentMoves.map((m, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded ${
                    isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/5 text-cyan-300'
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PART: Fixed-Height, Rock-Solid 5-Button Console (Zero Shifting) */}
      <div className="relative z-30 flex flex-col items-center gap-2 w-full max-w-lg mx-auto px-4 pb-4 sm:pb-5 shrink-0">
        {/* Floating Quick Face Buttons */}
        {showQuickMoves && !isSolvingPlaying && (
          <div
            className={`flex items-center justify-center gap-1.5 p-1.5 backdrop-blur-md rounded-xl border shadow-lg mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors duration-300 ${
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

        {/* Floating Custom Algorithm Input Drawer */}
        {showAlgoInput && !isSolvingPlaying && (
          <form
            onSubmit={handleApplyAlgo}
            className={`flex flex-col gap-1 w-full p-2.5 rounded-2xl border shadow-lg mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors duration-300 ${
              isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={algoInput}
                onChange={(e) => {
                  setAlgoInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Enter moves (e.g. R U R' U')..."
                className={`flex-1 border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border-white/10 text-white placeholder-slate-500'
                }`}
              />
              <button
                type="submit"
                disabled={!algoInput.trim()}
                className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
            {inputError && (
              <div className="flex items-center gap-1 text-[11px] text-red-500 px-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{inputError}</span>
              </div>
            )}
          </form>
        )}

        {/* EQUAL-SIZED 5-BUTTON CONSOLE: Scramble, Undo, Redo, Reset, Solve */}
        <div
          className={`flex items-stretch justify-between gap-1.5 w-full p-2 rounded-3xl border shadow-2xl backdrop-blur-xl transition-colors duration-300 ${
            isLight
              ? 'bg-white/90 border-slate-200 shadow-xl'
              : 'bg-[#10141e]/90 border-white/10 shadow-2xl'
          }`}
        >
          {/* 1. SCRAMBLE */}
          <button
            onClick={scramble}
            disabled={isSolvingPlaying}
            title="Random Scramble (S)"
            className={`flex-1 min-w-0 h-[52px] sm:h-14 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-all border shadow-sm disabled:opacity-40 disabled:pointer-events-none ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/10'
            }`}
          >
            <Shuffle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
              Scramble
            </span>
          </button>

          {/* 2. UNDO */}
          <button
            onClick={undo}
            disabled={isSolvingPlaying || undoStack.length === 0}
            title="Undo move (Z)"
            className={`flex-1 min-w-0 h-[52px] sm:h-14 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-all border shadow-sm disabled:opacity-30 disabled:pointer-events-none ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            <Undo2 className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
              Undo
            </span>
          </button>

          {/* 3. REDO */}
          <button
            onClick={redo}
            disabled={isSolvingPlaying || redoStack.length === 0}
            title="Redo move (Y)"
            className={`flex-1 min-w-0 h-[52px] sm:h-14 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-all border shadow-sm disabled:opacity-30 disabled:pointer-events-none ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            <Redo2 className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
              Redo
            </span>
          </button>

          {/* 4. RESET */}
          <button
            onClick={resetCube}
            disabled={isSolvingPlaying}
            title="Reset cube to solved state"
            className={`flex-1 min-w-0 h-[52px] sm:h-14 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-all border shadow-sm disabled:opacity-40 disabled:pointer-events-none ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
              Reset
            </span>
          </button>

          {/* 5. SOLVE / STOP (Equal width, rock-solid, direct smooth execution) */}
          <button
            onClick={startAutoSolve}
            title={
              isSolvingPlaying
                ? 'Stop solving'
                : isSolved
                ? 'Already solved'
                : 'Automatic Solver'
            }
            className={`flex-1 min-w-0 h-[52px] sm:h-14 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-all shadow-lg ${
              isSolvingPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-400/25 animate-pulse'
                : isSolved
                ? isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black shadow-cyan-400/20'
            }`}
          >
            {isSolvingPlaying ? (
              <>
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                <span className="text-[10px] font-black tracking-tight uppercase leading-none">
                  Stop
                </span>
              </>
            ) : isSolved ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
                  Solved
                </span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="text-[10px] font-black tracking-tight uppercase leading-none">
                  Solve
                </span>
              </>
            )}
          </button>
        </div>

        {/* Minimal Auxiliary Links: Algorithm Input & Face Turns */}
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider text-slate-500 select-none pt-0.5">
          <button
            onClick={() => setShowAlgoInput((p) => !p)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Terminal className="w-3 h-3" />
            <span>Algo Input</span>
          </button>
          <span>·</span>
          <button
            onClick={() => setShowQuickMoves((p) => !p)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Grid3X3 className="w-3 h-3" />
            <span>Face Helpers</span>
          </button>
          <span>·</span>
          <span className="text-slate-600">BUILD 1.2.0</span>
        </div>
      </div>
    </div>
  );
};
