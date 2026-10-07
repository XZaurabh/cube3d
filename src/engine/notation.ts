import { CubeSize, FaceName, Move } from './types';

export function parseMoveString(notation: string, size: CubeSize = 3): Move | null {
  const trimmed = notation.trim();
  if (!trimmed) return null;

  // Regex to match:
  // Optional slice number (e.g. "2"), face letter (U, D, L, R, F, B), optional 'w', optional modifier (' or 2 or 2' or ')
  const match = trimmed.match(/^(\d+)?([UDLFBR])(w)?(['2])?$/i);
  if (!match) return null;

  const prefixNum = match[1] ? parseInt(match[1], 10) : 1;
  const faceChar = match[2].toUpperCase() as FaceName;
  const isWide = !!match[3];
  const suffix = match[4] || '';

  let amount: 1 | -1 | 2 = 1;
  if (suffix === "'") amount = -1;
  else if (suffix === '2') amount = 2;

  // Outer slice index is 0
  let slice = 0;
  if (match[1]) {
    // e.g. 2R means 2nd layer from R (slice index 1)
    slice = Math.min(size - 1, Math.max(0, prefixNum - 1));
  }

  return {
    face: faceChar,
    slice,
    amount,
    notation: trimmed,
  };
}

export function formatMove(face: FaceName, amount: 1 | -1 | 2, slice = 0): string {
  const prefix = slice > 0 ? `${slice + 1}` : '';
  const suffix = amount === 1 ? '' : amount === -1 ? "'" : '2';
  return `${prefix}${face}${suffix}`;
}

export function invertMoveNotation(move: string): string {
  const trimmed = move.trim();
  if (!trimmed) return '';
  if (trimmed.endsWith('2')) return trimmed; // 180 deg reverse is same
  if (trimmed.endsWith("'")) return trimmed.slice(0, -1);
  return `${trimmed}'`;
}

export function invertMoves(moves: string[]): string[] {
  return moves.slice().reverse().map(invertMoveNotation);
}

// Reduce consecutive moves on the same face & slice (e.g., R R -> R2, R R' -> cancelled)
export function simplifyMoves(moves: string[], size: CubeSize = 3): string[] {
  const parsed = moves
    .map((m) => parseMoveString(m, size))
    .filter((m): m is Move => m !== null);

  const simplified: Move[] = [];

  for (const move of parsed) {
    if (simplified.length === 0) {
      simplified.push(move);
      continue;
    }

    const last = simplified[simplified.length - 1];
    if (last.face === move.face && last.slice === move.slice) {
      // Combine rotations mod 4:
      // 1 = +90, -1 = -90 (3), 2 = 180 (2)
      const toQuarterTurns = (amt: 1 | -1 | 2) => (amt === -1 ? 3 : amt);
      const totalQuarter = (toQuarterTurns(last.amount) + toQuarterTurns(move.amount)) % 4;

      simplified.pop(); // remove last

      if (totalQuarter === 1) {
        simplified.push({
          face: last.face,
          slice: last.slice,
          amount: 1,
          notation: formatMove(last.face, 1, last.slice),
        });
      } else if (totalQuarter === 2) {
        simplified.push({
          face: last.face,
          slice: last.slice,
          amount: 2,
          notation: formatMove(last.face, 2, last.slice),
        });
      } else if (totalQuarter === 3) {
        simplified.push({
          face: last.face,
          slice: last.slice,
          amount: -1,
          notation: formatMove(last.face, -1, last.slice),
        });
      }
      // if 0, moves cancel completely!
    } else {
      simplified.push(move);
    }
  }

  return simplified.map((m) => m.notation);
}

export function parseMoveSequence(input: string, size: CubeSize = 3): string[] {
  // Split on whitespace or commas
  const tokens = input.split(/[\s,]+/);
  const result: string[] = [];

  for (const token of tokens) {
    if (!token) continue;
    const parsed = parseMoveString(token, size);
    if (parsed) {
      result.push(parsed.notation);
    }
  }

  return result;
}
