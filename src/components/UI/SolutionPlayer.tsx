import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Sparkles } from 'lucide-react';
import { useCubeStore } from '../../store/cubeStore';
import { useSettingsStore } from '../../store/settingsStore';

export const SolutionPlayer: React.FC = () => {
  const solutionResult = useCubeStore((s) => s.solutionResult);
  const solutionIndex = useCubeStore((s) => s.solutionIndex);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);
  const isAnimating = useCubeStore((s) => s.isAnimating);
  const toggleSolvePlayback = useCubeStore((s) => s.toggleSolvePlayback);
  const stepSolveForward = useCubeStore((s) => s.stepSolveForward);
  const stepSolveBackward = useCubeStore((s) => s.stepSolveBackward);
  const resetSolution = useCubeStore((s) => s.resetSolution);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';
  const getDurationMs = useSettingsStore((s) => s.getDurationMs);

  // Auto playback interval
  useEffect(() => {
    if (!solutionResult || !isSolvingPlaying) return;

    if (solutionIndex >= solutionResult.moves.length) {
      toggleSolvePlayback();
      return;
    }

    // Wait for current 3D turn animation to finish before stepping
    if (isAnimating) return;

    const delay = Math.max(120, getDurationMs() + 60);
    const timeout = setTimeout(() => {
      stepSolveForward();
    }, delay);

    return () => clearTimeout(timeout);
  }, [
    solutionResult,
    isSolvingPlaying,
    solutionIndex,
    isAnimating,
    getDurationMs,
    stepSolveForward,
    toggleSolvePlayback,
  ]);

  if (!solutionResult) return null;

  const totalMoves = solutionResult.moves.length;

  return (
    <div className="w-full max-w-lg mx-auto px-3 pb-2 z-30 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`backdrop-blur-xl border rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 transition-colors duration-300 ${
          isLight
            ? 'bg-white/95 border-cyan-500/40 shadow-xl'
            : 'bg-slate-900/95 border-cyan-500/30 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-500 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOLVER ACTIVE</span>
          </div>

          <div
            className={`text-xs font-mono font-bold ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            Step <span className="text-cyan-500 font-black">{solutionIndex}</span> / {totalMoves}
          </div>

          <button
            onClick={resetSolution}
            className={`p-1 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Close solution"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Moves Ribbon */}
        <div
          className={`flex items-center gap-1 overflow-x-auto py-1 px-1 rounded-xl border scrollbar-thin transition-colors duration-300 ${
            isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-black/40 border-white/5'
          }`}
        >
          {solutionResult.moves.map((move, idx) => {
            const isCurrent = idx === solutionIndex;
            const isPast = idx < solutionIndex;

            return (
              <span
                key={idx}
                className={`font-mono text-xs px-2 py-0.5 rounded font-bold shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-cyan-400 text-slate-950 scale-105 shadow-sm font-black'
                    : isPast
                    ? isLight
                      ? 'text-slate-400'
                      : 'text-slate-600'
                    : isLight
                    ? 'text-slate-800'
                    : 'text-slate-300'
                }`}
              >
                {move}
              </span>
            );
          })}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {/* Step Back */}
          <button
            onClick={stepSolveBackward}
            disabled={solutionIndex <= 0}
            className={`p-2 disabled:opacity-30 disabled:pointer-events-none rounded-xl active:scale-95 transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-white/5 hover:bg-white/15 text-white'
            }`}
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={toggleSolvePlayback}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-2xl active:scale-95 transition-all shadow-md text-sm"
          >
            {isSolvingPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={stepSolveForward}
            disabled={solutionIndex >= totalMoves}
            className={`p-2 disabled:opacity-30 disabled:pointer-events-none rounded-xl active:scale-95 transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-white/5 hover:bg-white/15 text-white'
            }`}
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
