import { CubeSize, FaceName, Move, CubieState } from './types';
import { parseMoveString } from './notation';

export type NormalKey = '+x' | '-x' | '+y' | '-y' | '+z' | '-z';

export const NORMAL_TO_FACE: Record<NormalKey, FaceName> = {
  '+y': 'U',
  '-y': 'D',
  '+z': 'F',
  '-z': 'B',
  '-x': 'L',
  '+x': 'R',
};

export const FACE_TO_NORMAL: Record<FaceName, NormalKey> = {
  U: '+y',
  D: '-y',
  F: '+z',
  B: '-z',
  L: '-x',
  R: '+x',
};

export function createSolvedCubies(size: CubeSize): CubieState[] {
  const cubies: CubieState[] = [];
  let id = 0;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        // Only include surface cubies
        const isSurface =
          x === 0 || x === size - 1 ||
          y === 0 || y === size - 1 ||
          z === 0 || z === size - 1;

        if (!isSurface) continue;

        const stickers: CubieState['stickers'] = {};
        if (x === size - 1) stickers['+x'] = 'R';
        if (x === 0) stickers['-x'] = 'L';
        if (y === size - 1) stickers['+y'] = 'U';
        if (y === 0) stickers['-y'] = 'D';
        if (z === size - 1) stickers['+z'] = 'F';
        if (z === 0) stickers['-z'] = 'B';

        cubies.push({
          id: id++,
          x,
          y,
          z,
          stickers,
        });
      }
    }
  }

  return cubies;
}

export function cloneCubies(cubies: CubieState[]): CubieState[] {
  return cubies.map((c) => ({
    id: c.id,
    x: c.x,
    y: c.y,
    z: c.z,
    stickers: { ...c.stickers },
  }));
}

// Rotate a single normal key by a clockwise turn on a given face
function rotateNormalClockwise(face: FaceName, normal: NormalKey): NormalKey {
  switch (face) {
    case 'R':
      if (normal === '+y') return '-z';
      if (normal === '-z') return '-y';
      if (normal === '-y') return '+z';
      if (normal === '+z') return '+y';
      return normal;
    case 'L':
      if (normal === '+y') return '+z';
      if (normal === '+z') return '-y';
      if (normal === '-y') return '-z';
      if (normal === '-z') return '+y';
      return normal;
    case 'U':
      if (normal === '+z') return '-x';
      if (normal === '-x') return '-z';
      if (normal === '-z') return '+x';
      if (normal === '+x') return '+z';
      return normal;
    case 'D':
      if (normal === '+z') return '+x';
      if (normal === '+x') return '-z';
      if (normal === '-z') return '-x';
      if (normal === '-x') return '+z';
      return normal;
    case 'F':
      if (normal === '+y') return '+x';
      if (normal === '+x') return '-y';
      if (normal === '-y') return '-x';
      if (normal === '-x') return '+y';
      return normal;
    case 'B':
      if (normal === '+y') return '-x';
      if (normal === '-x') return '-y';
      if (normal === '-y') return '+x';
      if (normal === '+x') return '+y';
      return normal;
  }
}

// Rotate a single 90 degree clockwise quarter turn for the specified face & slice
function applyQuarterTurnClockwise(cubies: CubieState[], size: CubeSize, face: FaceName, slice = 0): void {
  const c = (size - 1) / 2;

  // Filter which cubies belong to this slice
  for (const cubie of cubies) {
    let inSlice = false;
    switch (face) {
      case 'R':
        inSlice = cubie.x === size - 1 - slice;
        break;
      case 'L':
        inSlice = cubie.x === slice;
        break;
      case 'U':
        inSlice = cubie.y === size - 1 - slice;
        break;
      case 'D':
        inSlice = cubie.y === slice;
        break;
      case 'F':
        inSlice = cubie.z === size - 1 - slice;
        break;
      case 'B':
        inSlice = cubie.z === slice;
        break;
    }

    if (!inSlice) continue;

    // Transform position
    let { x, y, z } = cubie;
    let dx = x - c;
    let dy = y - c;
    let dz = z - c;

    switch (face) {
      case 'R': {
        const newDy = dz;
        const newDz = -dy;
        cubie.y = Math.round(newDy + c);
        cubie.z = Math.round(newDz + c);
        break;
      }
      case 'L': {
        const newDy = -dz;
        const newDz = dy;
        cubie.y = Math.round(newDy + c);
        cubie.z = Math.round(newDz + c);
        break;
      }
      case 'U': {
        const newDx = -dz;
        const newDz = dx;
        cubie.x = Math.round(newDx + c);
        cubie.z = Math.round(newDz + c);
        break;
      }
      case 'D': {
        const newDx = dz;
        const newDz = -dx;
        cubie.x = Math.round(newDx + c);
        cubie.z = Math.round(newDz + c);
        break;
      }
      case 'F': {
        const newDx = dy;
        const newDy = -dx;
        cubie.x = Math.round(newDx + c);
        cubie.y = Math.round(newDy + c);
        break;
      }
      case 'B': {
        const newDx = -dy;
        const newDy = dx;
        cubie.x = Math.round(newDx + c);
        cubie.y = Math.round(newDy + c);
        break;
      }
    }

    // Transform stickers map
    const newStickers: CubieState['stickers'] = {};
    for (const [key, color] of Object.entries(cubie.stickers)) {
      if (!color) continue;
      const rotatedKey = rotateNormalClockwise(face, key as NormalKey);
      newStickers[rotatedKey] = color;
    }
    cubie.stickers = newStickers;
  }
}

export function applyMoveToCubies(cubies: CubieState[], size: CubeSize, move: Move): void {
  const turns = move.amount === 1 ? 1 : move.amount === 2 ? 2 : 3;
  for (let i = 0; i < turns; i++) {
    applyQuarterTurnClockwise(cubies, size, move.face, move.slice);
  }
}

export function applyNotationToCubies(cubies: CubieState[], size: CubeSize, notation: string): boolean {
  const move = parseMoveString(notation, size);
  if (!move) return false;
  applyMoveToCubies(cubies, size, move);
  return true;
}

export function isCubeSolved(cubies: CubieState[], size: CubeSize): boolean {
  // Check all 6 faces: every sticker visible on that face must match the face's reference color
  const faces: { normal: NormalKey; check: (c: CubieState) => boolean }[] = [
    { normal: '+y', check: (c) => c.y === size - 1 },
    { normal: '-y', check: (c) => c.y === 0 },
    { normal: '+z', check: (c) => c.z === size - 1 },
    { normal: '-z', check: (c) => c.z === 0 },
    { normal: '-x', check: (c) => c.x === 0 },
    { normal: '+x', check: (c) => c.x === size - 1 },
  ];

  for (const { normal, check } of faces) {
    let faceColor: FaceName | null = null;
    for (const cubie of cubies) {
      if (check(cubie)) {
        const sticker = cubie.stickers[normal];
        if (!sticker) return false;
        if (faceColor === null) {
          faceColor = sticker;
        } else if (sticker !== faceColor) {
          return false;
        }
      }
    }
  }

  return true;
}
