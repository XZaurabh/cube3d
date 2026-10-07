export type CubeSize = 2 | 3 | 4 | 5 | 6;

export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type Axis = 'x' | 'y' | 'z';

export interface FaceColorInfo {
  name: FaceName;
  color: string;
  label: string;
}

export const CUBE_COLORS: Record<FaceName, string> = {
  U: '#F8FAFC', // White (clean off-white for contrast)
  D: '#FACC15', // Yellow
  F: '#22C55E', // Green
  B: '#3B82F6', // Blue
  L: '#F97316', // Orange
  R: '#EF4444', // Red
};

export const INNER_COLOR = '#181E29'; // Dark charcoal core

export interface Move {
  face: FaceName;
  slice: number; // 0 to size - 1 from standard face outward (0 = outer layer of that face)
  amount: 1 | -1 | 2; // 1 = 90 deg clockwise, -1 = 90 deg counter-clockwise (prime), 2 = 180 deg
  notation: string;
}

export interface CubieState {
  id: number;
  // Current 3D grid coordinate in [0, size - 1]
  x: number;
  y: number;
  z: number;
  // Visual faces stickers: maps current normal ('+x', '-x', '+y', '-y', '+z', '-z') to original FaceName
  stickers: {
    '+x'?: FaceName;
    '-x'?: FaceName;
    '+y'?: FaceName;
    '-y'?: FaceName;
    '+z'?: FaceName;
    '-z'?: FaceName;
  };
}

export interface SolveStep {
  move: string;
  description?: string;
}
