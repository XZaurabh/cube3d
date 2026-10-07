import { CubeSize, FaceName, Move } from './types';
import { formatMove } from './notation';

export interface DragParams {
  faceNormalKey: '+x' | '-x' | '+y' | '-y' | '+z' | '-z';
  cubieX: number;
  cubieY: number;
  cubieZ: number;
  dragAxis: 'x' | 'y' | 'z';
  dragSign: 1 | -1; // +1 or -1 along that axis
  size: CubeSize;
}

export function computeMoveFromDrag(params: DragParams): Move | null {
  const { faceNormalKey, cubieX, cubieY, cubieZ, dragAxis, dragSign, size } = params;

  let face: FaceName | null = null;
  let slice = 0;
  let amount: 1 | -1 = 1;

  if (faceNormalKey === '+z') {
    // FRONT FACE
    if (dragAxis === 'x') {
      // Swiping horizontally along X -> turns horizontal layer around Y
      const y = cubieY;
      if (y >= size / 2) {
        face = 'U';
        slice = size - 1 - y;
        amount = dragSign === 1 ? -1 : 1; // Right (+X) is U', Left (-X) is U
      } else {
        face = 'D';
        slice = y;
        amount = dragSign === 1 ? 1 : -1; // Right (+X) is D, Left (-X) is D'
      }
    } else if (dragAxis === 'y') {
      // Swiping vertically along Y -> turns vertical slice around X
      const x = cubieX;
      if (x >= size / 2) {
        face = 'R';
        slice = size - 1 - x;
        amount = dragSign === 1 ? 1 : -1; // Up (+Y) is R, Down (-Y) is R'
      } else {
        face = 'L';
        slice = x;
        amount = dragSign === 1 ? -1 : 1; // Up (+Y) is L', Down (-Y) is L
      }
    }
  } else if (faceNormalKey === '-z') {
    // BACK FACE
    if (dragAxis === 'x') {
      const y = cubieY;
      if (y >= size / 2) {
        face = 'U';
        slice = size - 1 - y;
        amount = dragSign === 1 ? 1 : -1;
      } else {
        face = 'D';
        slice = y;
        amount = dragSign === 1 ? -1 : 1;
      }
    } else if (dragAxis === 'y') {
      const x = cubieX;
      if (x >= size / 2) {
        face = 'R';
        slice = size - 1 - x;
        amount = dragSign === 1 ? -1 : 1;
      } else {
        face = 'L';
        slice = x;
        amount = dragSign === 1 ? 1 : -1;
      }
    }
  } else if (faceNormalKey === '+x') {
    // RIGHT FACE
    if (dragAxis === 'z') {
      const y = cubieY;
      if (y >= size / 2) {
        face = 'U';
        slice = size - 1 - y;
        amount = dragSign === 1 ? 1 : -1;
      } else {
        face = 'D';
        slice = y;
        amount = dragSign === 1 ? -1 : 1;
      }
    } else if (dragAxis === 'y') {
      const z = cubieZ;
      if (z >= size / 2) {
        face = 'F';
        slice = size - 1 - z;
        amount = dragSign === 1 ? -1 : 1;
      } else {
        face = 'B';
        slice = z;
        amount = dragSign === 1 ? 1 : -1;
      }
    }
  } else if (faceNormalKey === '-x') {
    // LEFT FACE
    if (dragAxis === 'z') {
      const y = cubieY;
      if (y >= size / 2) {
        face = 'U';
        slice = size - 1 - y;
        amount = dragSign === 1 ? -1 : 1;
      } else {
        face = 'D';
        slice = y;
        amount = dragSign === 1 ? 1 : -1;
      }
    } else if (dragAxis === 'y') {
      const z = cubieZ;
      if (z >= size / 2) {
        face = 'F';
        slice = size - 1 - z;
        amount = dragSign === 1 ? 1 : -1;
      } else {
        face = 'B';
        slice = z;
        amount = dragSign === 1 ? -1 : 1;
      }
    }
  } else if (faceNormalKey === '+y') {
    // UP (TOP) FACE
    if (dragAxis === 'x') {
      const z = cubieZ;
      if (z >= size / 2) {
        face = 'F';
        slice = size - 1 - z;
        amount = dragSign === 1 ? 1 : -1;
      } else {
        face = 'B';
        slice = z;
        amount = dragSign === 1 ? -1 : 1;
      }
    } else if (dragAxis === 'z') {
      const x = cubieX;
      if (x >= size / 2) {
        face = 'R';
        slice = size - 1 - x;
        amount = dragSign === 1 ? -1 : 1;
      } else {
        face = 'L';
        slice = x;
        amount = dragSign === 1 ? 1 : -1;
      }
    }
  } else if (faceNormalKey === '-y') {
    // DOWN (BOTTOM) FACE
    if (dragAxis === 'x') {
      const z = cubieZ;
      if (z >= size / 2) {
        face = 'F';
        slice = size - 1 - z;
        amount = dragSign === 1 ? -1 : 1;
      } else {
        face = 'B';
        slice = z;
        amount = dragSign === 1 ? 1 : -1;
      }
    } else if (dragAxis === 'z') {
      const x = cubieX;
      if (x >= size / 2) {
        face = 'R';
        slice = size - 1 - x;
        amount = dragSign === 1 ? 1 : -1;
      } else {
        face = 'L';
        slice = x;
        amount = dragSign === 1 ? -1 : 1;
      }
    }
  }

  if (!face) return null;

  return {
    face,
    slice,
    amount,
    notation: formatMove(face, amount, slice),
  };
}
