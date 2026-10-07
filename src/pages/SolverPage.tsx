import React, { useState } from 'react';
import { Shuffle, Wand2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Cube3D } from '../components/Cube/Cube3D';
import { SolutionPlayer } from '../components/UI/SolutionPlayer';
import { useCubeStore } from '../store/cubeStore';
import { useSettingsStore } from '../store/settingsStore';
import { parseMoveSequence } from '../engine/notation';

export const SolverPage: React.FC = () => {
  const [algoInput, setAlgoInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const size = useCubeStore((s) => s.size);
  const scramble = useCubeStore((s) => s.scramble);
  const startAutoSolve = useCubeStore((s) => s.startAutoSolve);
  const solutionResult = useCubeStore((s) => s.solutionResult);
  const isSolved = useCubeStore((s) => s.isSolved);
  const applyAlgorithmString = useCubeStore((s) => s.applyAlgorithmString);
  const resetCube = useCubeStore((s) => s.resetCube);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!algoInput.trim()) return;

    const parsed = parseMoveSequence(algoInput, size);
    if (parsed.length === 0) {
      setInputError('No valid moves found. Try: R U R\' U\'');
      return;
    }

    setInputError(null);
    applyAlgorithmString(algoInput);
    setAlgoInput('');
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
        isLight ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#080c13] text-white'
      }`}
    >
      {/* Top Status */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs uppercase font-extrabold tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Cube Solver ({size}x{size})
          </span>
          {isSolved && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" /> Solved
            </span>
          )}
        </div>

        <button
          onClick={resetCube}
          className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          Reset Cube
        </button>
      </div>

      {/* Central 3D Cube */}
      <div className="relative flex-1 w-full min-h-[300px] my-auto flex items-center justify-center">
        <Cube3D interactive={true} autoRotate={false} />
      </div>

      {/* Bottom Panel */}
      <div className="relative z-20 flex flex-col gap-3 w-full max-w-lg mx-auto px-4 pb-4">
        {/* If solution is active, show the playback controls */}
        {solutionResult ? (
          <SolutionPlayer />
        ) : (
          <div
            className={`backdrop-blur-xl border rounded-3xl p-3.5 shadow-2xl flex flex-col gap-3 transition-colors duration-300 ${
              isLight
                ? 'bg-white/90 border-slate-200 shadow-xl'
                : 'bg-slate-950/85 border-white/10 shadow-2xl'
            }`}
          >
            {/* Algorithm Input Box */}
            <form onSubmit={handleApply} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={algoInput}
                  onChange={(e) => {
                    setAlgoInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Enter moves (e.g. R U R' U')..."
                  className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!algoInput.trim()}
                  className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
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

            {/* Scramble and Solve Main Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={scramble}
                className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all border flex items-center justify-center gap-2 shadow-sm ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                }`}
              >
                <Shuffle className="w-4 h-4 text-cyan-500" />
                <span>Scramble</span>
              </button>

              <button
                onClick={startAutoSolve}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Solve</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
