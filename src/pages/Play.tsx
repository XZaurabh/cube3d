import React, { useRef, useEffect } from 'react';
import { Cube3D, CameraViewPreset } from '../components/Cube/Cube3D';
import { HudTimer } from '../components/UI/HudTimer';
import { GameControls } from '../components/UI/GameControls';
import { SolutionPlayer } from '../components/UI/SolutionPlayer';
import { useCubeStore } from '../store/cubeStore';
import { useSettingsStore } from '../store/settingsStore';

interface PlayProps {
  onOpenSettings: () => void;
  onOpenKeyboardHelp?: () => void;
}

export const Play: React.FC<PlayProps> = () => {
  const setCameraViewRef = useRef<((view: CameraViewPreset) => void) | null>(null);

  const startAutoSolve = useCubeStore((s) => s.startAutoSolve);
  const solutionResult = useCubeStore((s) => s.solutionResult);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);
  const enqueueMove = useCubeStore((s) => s.enqueueMove);
  const undo = useCubeStore((s) => s.undo);
  const redo = useCubeStore((s) => s.redo);
  const scramble = useCubeStore((s) => s.scramble);
  const timerState = useCubeStore((s) => s.timerState);
  const startTimer = useCubeStore((s) => s.startTimer);
  const stopTimer = useCubeStore((s) => s.stopTimer);
  const appliedMoves = useCubeStore((s) => s.appliedMoves);

  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  // Keyboard shortcut listener for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Lock keyboard controls while auto-solve is actively solving
      if (isSolvingPlaying) {
        return;
      }

      const key = e.key.toUpperCase();

      // Face moves: U, D, L, R, F, B
      if (['U', 'D', 'L', 'R', 'F', 'B'].includes(key)) {
        const notation = e.shiftKey ? `${key}'` : key;
        enqueueMove(notation);
        return;
      }

      // Space = start/stop timer
      if (e.code === 'Space') {
        e.preventDefault();
        if (timerState === 'running') stopTimer();
        else startTimer();
        return;
      }

      // Undo / Redo
      if (key === 'Z' && !e.ctrlKey && !e.metaKey) {
        undo();
        return;
      }
      if (key === 'Y' && !e.ctrlKey && !e.metaKey) {
        redo();
        return;
      }

      // Scramble
      if (key === 'S' && !e.ctrlKey && !e.metaKey) {
        scramble();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enqueueMove, undo, redo, scramble, timerState, startTimer, stopTimer, isSolvingPlaying]);

  const handleCameraReady = (fn: (view: CameraViewPreset) => void) => {
    setCameraViewRef.current = fn;
  };

  const handleSetCameraView = (view: CameraViewPreset) => {
    if (setCameraViewRef.current) {
      setCameraViewRef.current(view);
    }
  };

  // Recent moves slice
  const recentMoves = appliedMoves.slice(-8);

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#090d14] text-white'
      }`}
    >
      {/* Top HUD Area */}
      <div className="relative z-20 pt-2 pb-1">
        <HudTimer />
      </div>

      {/* Central 3D Cube Canvas (55-65% viewport height) */}
      <div className="relative flex-1 w-full min-h-[320px] my-auto flex items-center justify-center">
        <Cube3D interactive={true} autoRotate={false} onCameraViewReady={handleCameraReady} />

        {/* Desktop Move History Float (PC extra feature) */}
        {recentMoves.length > 0 && (
          <div
            className={`hidden lg:flex flex-col gap-1 absolute top-4 left-6 backdrop-blur-md px-3 py-2 rounded-2xl border shadow-lg pointer-events-none transition-colors duration-300 ${
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

      {/* Bottom Controls Area */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* If auto-solver is active, show the solution player */}
        {solutionResult ? (
          <SolutionPlayer />
        ) : (
          <GameControls
            onSetCameraView={handleSetCameraView}
            onSolveClick={startAutoSolve}
          />
        )}
      </div>
    </div>
  );
};
