import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { CubeSize, CubieState, Move } from '../engine/types';
import { createSolvedCubies, cloneCubies, applyMoveToCubies, isCubeSolved } from '../engine/cubeState';
import { parseMoveString, parseMoveSequence } from '../engine/notation';
import { generateScramble } from '../engine/scramble';
import { solveCube, SolverResult } from '../engine/solver';
import { soundEngine } from '../engine/sound';

export type AppPage = 'home' | 'play' | 'solver' | 'settings';

export interface MoveQueueItem {
  move: Move;
  onComplete?: () => void;
}

interface CubeStateStore {
  size: CubeSize;
  cubies: CubieState[];
  isSolved: boolean;
  activePage: AppPage;

  // History & Undo/Redo
  appliedMoves: string[]; // List of notations applied since last solve/reset
  undoStack: { cubies: CubieState[]; appliedMoves: string[] }[];
  redoStack: { cubies: CubieState[]; appliedMoves: string[] }[];

  // Timer & Moves
  moveCount: number;
  timerState: 'idle' | 'running' | 'stopped';
  timerStartTime: number | null;
  timerElapsedMs: number;
  recentScramble: string[] | null;

  // Auto solver
  solutionResult: SolverResult | null;
  solutionIndex: number;
  isSolvingPlaying: boolean;

  // Queue for 3D animation
  moveQueue: MoveQueueItem[];
  isAnimating: boolean;
  syncCounter: number;

  // Actions
  setActivePage: (page: AppPage) => void;
  setSize: (size: CubeSize) => void;
  executeMove: (notation: string, recordUndo?: boolean) => boolean;
  enqueueMove: (notation: string, onComplete?: () => void) => boolean;
  dequeueMove: () => MoveQueueItem | null;
  setIsAnimating: (animating: boolean) => void;
  undo: () => void;
  redo: () => void;
  scramble: () => void;
  resetCube: () => void;
  applyAlgorithmString: (algo: string) => void;

  // Timer controls
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;

  // Solver controls
  startAutoSolve: () => void;
  stopAutoSolve: () => void;
  stepSolveForward: () => void;
  stepSolveBackward: () => void;
  toggleSolvePlayback: () => void;
  resetSolution: () => void;
}

export const useCubeStore = create<CubeStateStore>((set, get) => ({
  size: 3,
  cubies: createSolvedCubies(3),
  isSolved: true,
  activePage: 'home',

  appliedMoves: [],
  undoStack: [],
  redoStack: [],

  moveCount: 0,
  timerState: 'idle',
  timerStartTime: null,
  timerElapsedMs: 0,
  recentScramble: null,

  solutionResult: null,
  solutionIndex: 0,
  isSolvingPlaying: false,

  moveQueue: [],
  isAnimating: false,
  syncCounter: 0,

  setActivePage: (page) => set({ activePage: page }),

  setSize: (size) => {
    set({
      size,
      cubies: createSolvedCubies(size),
      isSolved: true,
      appliedMoves: [],
      undoStack: [],
      redoStack: [],
      moveCount: 0,
      timerState: 'idle',
      timerStartTime: null,
      timerElapsedMs: 0,
      recentScramble: null,
      solutionResult: null,
      solutionIndex: 0,
      isSolvingPlaying: false,
      moveQueue: [],
      isAnimating: false,
      syncCounter: get().syncCounter + 1,
    });
  },

  enqueueMove: (notation, onComplete) => {
    const { size } = get();
    const move = parseMoveString(notation, size);
    if (!move) return false;

    set((state) => ({
      moveQueue: [...state.moveQueue, { move, onComplete }],
    }));
    return true;
  },

  dequeueMove: () => {
    const { moveQueue } = get();
    if (moveQueue.length === 0) return null;
    const item = moveQueue[0];
    set({ moveQueue: moveQueue.slice(1) });
    return item;
  },

  setIsAnimating: (animating) => set({ isAnimating: animating }),

  executeMove: (notation, recordUndo = true) => {
    const {
      size,
      cubies,
      appliedMoves,
      undoStack,
      timerState,
      recentScramble,
      moveCount,
    } = get();

    const move = parseMoveString(notation, size);
    if (!move) return false;

    // Snapshot for undo
    const newUndo = recordUndo
      ? [...undoStack, { cubies: cloneCubies(cubies), appliedMoves: [...appliedMoves] }]
      : undoStack;

    const nextCubies = cloneCubies(cubies);
    applyMoveToCubies(nextCubies, size, move);

    const nextApplied = [...appliedMoves, move.notation];
    const solved = isCubeSolved(nextCubies, size);

    soundEngine.playTurnSound();

    let nextTimerState = timerState;
    let nextStartTime = get().timerStartTime;

    // Start timer on first move if previously scrambled and idle
    if (recentScramble && timerState === 'idle') {
      nextTimerState = 'running';
      nextStartTime = Date.now();
    }

    // Stop timer and celebrate if solved while timer was running
    if (solved && timerState === 'running') {
      nextTimerState = 'stopped';
      soundEngine.playSolvedSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22C55E', '#3B82F6', '#EF4444', '#FACC15', '#F97316'],
        });
      } catch {
        // Ignored
      }
    }

    set({
      cubies: nextCubies,
      appliedMoves: nextApplied,
      undoStack: newUndo,
      redoStack: recordUndo ? [] : get().redoStack,
      moveCount: moveCount + 1,
      isSolved: solved,
      timerState: nextTimerState,
      timerStartTime: nextStartTime,
    });

    return true;
  },

  undo: () => {
    const { undoStack, redoStack, cubies, appliedMoves, size } = get();
    if (undoStack.length === 0) return;

    const prev = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const newRedo = [
      ...redoStack,
      { cubies: cloneCubies(cubies), appliedMoves: [...appliedMoves] },
    ];

    const solved = isCubeSolved(prev.cubies, size);
    soundEngine.playTurnSound();

    set({
      cubies: prev.cubies,
      appliedMoves: prev.appliedMoves,
      undoStack: newUndo,
      redoStack: newRedo,
      moveCount: Math.max(0, get().moveCount - 1),
      isSolved: solved,
      syncCounter: get().syncCounter + 1,
    });
  },

  redo: () => {
    const { redoStack, undoStack, cubies, appliedMoves, size } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newUndo = [
      ...undoStack,
      { cubies: cloneCubies(cubies), appliedMoves: [...appliedMoves] },
    ];

    const solved = isCubeSolved(next.cubies, size);
    soundEngine.playTurnSound();

    set({
      cubies: next.cubies,
      appliedMoves: next.appliedMoves,
      undoStack: newUndo,
      redoStack: newRedo,
      moveCount: get().moveCount + 1,
      isSolved: solved,
      syncCounter: get().syncCounter + 1,
    });
  },

  scramble: () => {
    const { size } = get();
    const scrambleMoves = generateScramble(size);

    // Apply moves to solved state
    const freshCubies = createSolvedCubies(size);
    for (const moveStr of scrambleMoves) {
      const parsed = parseMoveString(moveStr, size);
      if (parsed) {
        applyMoveToCubies(freshCubies, size, parsed);
      }
    }

    soundEngine.playTurnSound();

    set({
      cubies: freshCubies,
      appliedMoves: scrambleMoves,
      undoStack: [],
      redoStack: [],
      moveCount: 0,
      timerState: 'running',
      timerStartTime: Date.now(),
      timerElapsedMs: 0,
      recentScramble: scrambleMoves,
      isSolved: false,
      solutionResult: null,
      solutionIndex: 0,
      isSolvingPlaying: false,
      moveQueue: [],
      syncCounter: get().syncCounter + 1,
    });
  },

  resetCube: () => {
    const { size } = get();
    set({
      cubies: createSolvedCubies(size),
      appliedMoves: [],
      undoStack: [],
      redoStack: [],
      moveCount: 0,
      timerState: 'idle',
      timerStartTime: null,
      timerElapsedMs: 0,
      recentScramble: null,
      isSolved: true,
      solutionResult: null,
      solutionIndex: 0,
      isSolvingPlaying: false,
      moveQueue: [],
      isAnimating: false,
      syncCounter: get().syncCounter + 1,
    });
  },

  applyAlgorithmString: (algo) => {
    const { size } = get();
    const moves = parseMoveSequence(algo, size);
    for (const moveStr of moves) {
      get().enqueueMove(moveStr);
    }
  },

  startTimer: () => {
    set({
      timerState: 'running',
      timerStartTime: Date.now() - get().timerElapsedMs,
    });
  },

  stopTimer: () => {
    set({ timerState: 'stopped' });
  },

  tickTimer: () => {
    const { timerState, timerStartTime } = get();
    if (timerState === 'running' && timerStartTime) {
      set({ timerElapsedMs: Date.now() - timerStartTime });
    }
  },

  startAutoSolve: () => {
    const { cubies, size, appliedMoves, isSolved, isSolvingPlaying } = get();
    if (isSolvingPlaying) {
      get().stopAutoSolve();
      return;
    }
    if (isSolved) {
      soundEngine.playSolvedSound();
      return;
    }

    const result = solveCube(cubies, size, appliedMoves);
    if (result.success && result.moves.length > 0) {
      set({
        solutionResult: result,
        solutionIndex: 0,
        isSolvingPlaying: true,
        moveQueue: [],
      });

      const total = result.moves.length;
      result.moves.forEach((moveStr, idx) => {
        const isLast = idx === total - 1;
        get().enqueueMove(moveStr, () => {
          set({ solutionIndex: idx + 1 });
          if (isLast) {
            set({
              isSolvingPlaying: false,
              solutionResult: null,
              timerState: 'stopped',
            });
            soundEngine.playSolvedSound();
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22C55E', '#3B82F6', '#EF4444', '#FACC15', '#F97316'],
              });
            } catch {
              // Ignored
            }
          }
        });
      });
    } else {
      set({ solutionResult: result, isSolvingPlaying: false });
    }
  },

  stopAutoSolve: () => {
    set({
      isSolvingPlaying: false,
      solutionResult: null,
      moveQueue: [],
    });
  },

  stepSolveForward: () => {
    const { solutionResult, solutionIndex } = get();
    if (!solutionResult || solutionIndex >= solutionResult.moves.length) return;

    const moveStr = solutionResult.moves[solutionIndex];
    get().enqueueMove(moveStr);
    set({ solutionIndex: solutionIndex + 1 });
  },

  stepSolveBackward: () => {
    const { solutionResult, solutionIndex } = get();
    if (!solutionResult || solutionIndex <= 0) return;

    get().undo();
    set({ solutionIndex: solutionIndex - 1 });
  },

  toggleSolvePlayback: () => {
    set((state) => ({ isSolvingPlaying: !state.isSolvingPlaying }));
  },

  resetSolution: () => {
    set({
      solutionResult: null,
      solutionIndex: 0,
      isSolvingPlaying: false,
    });
  },
}));
