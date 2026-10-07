import { CubeSize, FaceName } from './types';

const OPPOSITE_FACE: Record<FaceName, FaceName> = {
  U: 'D',
  D: 'U',
  L: 'R',
  R: 'L',
  F: 'B',
  B: 'F',
};

const BASE_FACES: FaceName[] = ['U', 'D', 'L', 'R', 'F', 'B'];
const AMOUNTS: string[] = ['', "'", '2'];

export function generateScramble(size: CubeSize): string[] {
  const moves: string[] = [];

  if (size === 2) {
    // 2x2 standard: ~11 moves using only U, R, F faces
    const faces2x2: FaceName[] = ['U', 'R', 'F'];
    let lastFace: FaceName | null = null;
    const length = 11;

    for (let i = 0; i < length; i++) {
      const candidates = faces2x2.filter((f) => f !== lastFace);
      const face = candidates[Math.floor(Math.random() * candidates.length)];
      const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
      moves.push(`${face}${amount}`);
      lastFace = face;
    }
    return moves;
  }

  // Length based on cube size
  let length = 22;
  if (size === 4) length = 38;
  else if (size === 5) length = 52;
  else if (size === 6) length = 65;

  let lastFace: FaceName | null = null;
  let secondLastFace: FaceName | null = null;

  for (let i = 0; i < length; i++) {
    const candidates = BASE_FACES.filter((face) => {
      if (face === lastFace) return false;
      // Prevent A B A sequences where A and B are opposite (e.g., R L R)
      if (lastFace && OPPOSITE_FACE[face] === lastFace && face === secondLastFace) {
        return false;
      }
      return true;
    });

    const face = candidates[Math.floor(Math.random() * candidates.length)];
    const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];

    // For size >= 4, randomly add slice moves (e.g. 2R, 2U, 2F)
    let prefix = '';
    if (size >= 4 && Math.random() < 0.4) {
      // Pick an inner slice: e.g. for 4x4, slice index 2 (2nd layer)
      // for 5x5: slice index 2
      // for 6x6: slice index 2 or 3
      const maxSlice = Math.floor(size / 2);
      const sliceNum = 2 + Math.floor(Math.random() * (maxSlice - 1));
      prefix = `${sliceNum}`;
    }

    moves.push(`${prefix}${face}${amount}`);
    secondLastFace = lastFace;
    lastFace = face;
  }

  return moves;
}
