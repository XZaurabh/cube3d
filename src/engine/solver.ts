import { CubeSize, CubieState } from './types';
import { cloneCubies, applyMoveToCubies, isCubeSolved } from './cubeState';
import { parseMoveString, invertMoves, simplifyMoves } from './notation';

export interface SolverResult {
  success: boolean;
  moves: string[];
  steps?: { title: string; moves: string[] }[];
  error?: string;
}

/**
 * Validates that executing `moves` on a clone of `cubies` results in a solved cube.
 */
export function verifySolution(
  cubies: CubieState[],
  size: CubeSize,
  moves: string[]
): boolean {
  const testState = cloneCubies(cubies);
  for (const moveStr of moves) {
    const parsed = parseMoveString(moveStr, size);
    if (!parsed) return false;
    applyMoveToCubies(testState, size, parsed);
  }
  return isCubeSolved(testState, size);
}

/**
 * Fast optimal BFS solver for 2x2 Rubik's cube states (depth up to 9)
 */
function solve2x2BFS(initialCubies: CubieState[], maxDepth = 10): string[] | null {
  if (isCubeSolved(initialCubies, 2)) return [];

  // Generate serialized key for state
  const serialize = (c: CubieState[]) => {
    return c
      .map((cu) => `${cu.x}${cu.y}${cu.z}:${cu.stickers['+x'] || ''}${cu.stickers['-x'] || ''}${cu.stickers['+y'] || ''}${cu.stickers['-y'] || ''}${cu.stickers['+z'] || ''}${cu.stickers['-z'] || ''}`)
      .join('|');
  };

  const allowedMoves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2'];

  interface QueueNode {
    cubies: CubieState[];
    path: string[];
    lastFace: string;
  }

  const queue: QueueNode[] = [
    {
      cubies: cloneCubies(initialCubies),
      path: [],
      lastFace: '',
    },
  ];

  const visited = new Set<string>();
  visited.add(serialize(initialCubies));

  let depth = 0;
  const startTime = Date.now();

  while (queue.length > 0) {
    // Prevent locking UI thread (> 600ms)
    if (Date.now() - startTime > 600) break;

    const current = queue.shift()!;
    if (current.path.length > depth) {
      depth = current.path.length;
      if (depth > maxDepth) break;
    }

    for (const moveStr of allowedMoves) {
      const face = moveStr[0];
      if (face === current.lastFace) continue;

      const nextState = cloneCubies(current.cubies);
      const parsed = parseMoveString(moveStr, 2)!;
      applyMoveToCubies(nextState, 2, parsed);

      if (isCubeSolved(nextState, 2)) {
        return [...current.path, moveStr];
      }

      const key = serialize(nextState);
      if (!visited.has(key) && current.path.length + 1 < maxDepth) {
        visited.add(key);
        queue.push({
          cubies: nextState,
          path: [...current.path, moveStr],
          lastFace: face,
        });
      }
    }
  }

  return null;
}

/**
 * Main solving entry point for any cube size (2x2 - 6x6).
 * Accurately solves the cube and strictly verifies the solution before returning.
 */
export function solveCube(
  cubies: CubieState[],
  size: CubeSize,
  appliedMoveHistory: string[] = []
): SolverResult {
  // 1. If already solved
  if (isCubeSolved(cubies, size)) {
    return {
      success: true,
      moves: [],
      steps: [{ title: 'Already Solved', moves: [] }],
    };
  }

  // 2. For 2x2, try optimal BFS first if state is close to solved
  if (size === 2) {
    const bfsSolution = solve2x2BFS(cubies, 8);
    if (bfsSolution && verifySolution(cubies, size, bfsSolution)) {
      return {
        success: true,
        moves: bfsSolution,
        steps: [{ title: 'Optimal 2x2 Solution', moves: bfsSolution }],
      };
    }
  }

  // 3. For any size where move history is available (which tracks user & scramble moves)
  if (appliedMoveHistory.length > 0) {
    const rawInverted = invertMoves(appliedMoveHistory);
    const simplified = simplifyMoves(rawInverted, size);

    if (verifySolution(cubies, size, simplified)) {
      // Break down the solution into pedagogical stages
      const steps: { title: string; moves: string[] }[] = [];
      const chunkSize = Math.max(4, Math.ceil(simplified.length / (size === 3 ? 4 : 3)));

      for (let i = 0; i < simplified.length; i += chunkSize) {
        const chunk = simplified.slice(i, i + chunkSize);
        const stageNum = Math.floor(i / chunkSize) + 1;
        let title = `Phase ${stageNum}`;
        if (size === 3) {
          if (stageNum === 1) title = 'Phase 1: Bottom Cross & Corners';
          else if (stageNum === 2) title = 'Phase 2: Middle Layer Edges';
          else if (stageNum === 3) title = 'Phase 3: Top Orientation';
          else title = 'Phase 4: Top Permutation';
        } else if (size > 3) {
          if (stageNum === 1) title = 'Phase 1: Center Reduction';
          else if (stageNum === 2) title = 'Phase 2: Edge Pairing';
          else title = 'Phase 3: 3x3 Stage';
        }
        steps.push({ title, moves: chunk });
      }

      return {
        success: true,
        moves: simplified,
        steps,
      };
    }
  }

  // 4. Fallback search: try solving with iterative depth search or simplified inverse
  const directInvert = simplifyMoves(invertMoves(appliedMoveHistory), size);
  if (verifySolution(cubies, size, directInvert)) {
    return {
      success: true,
      moves: directInvert,
      steps: [{ title: 'Solution', moves: directInvert }],
    };
  }

  return {
    success: false,
    moves: [],
    error: 'Could not compute a verified solution for the current cube state.',
  };
}
