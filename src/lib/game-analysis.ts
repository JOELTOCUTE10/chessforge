import type { EngineInfo } from './stockfish-client';

export type MoveQuality = 'sound' | 'inaccuracy' | 'mistake' | 'blunder' | 'unrated';

export function centipawnLoss(before: EngineInfo | null, after: EngineInfo | null): number | null {
  if (!before || !after) return null;
  if (before.scoreCp === null || after.scoreCp === null) return null;
  if (before.scoreMate !== null || after.scoreMate !== null) return null;
  // UCI scores are from side-to-move POV. The move changes the side to move,
  // so their sum measures the mover's evaluation loss in centipawns.
  return before.scoreCp + after.scoreCp;
}

export function classifyCentipawnLoss(loss: number | null): MoveQuality {
  if (loss === null || !Number.isFinite(loss)) return 'unrated';
  if (loss >= 300) return 'blunder';
  if (loss >= 150) return 'mistake';
  if (loss >= 70) return 'inaccuracy';
  return 'sound';
}

export function moveQualityLabel(quality: MoveQuality): string {
  switch (quality) {
    case 'blunder': return 'Blunder';
    case 'mistake': return 'Mistake';
    case 'inaccuracy': return 'Inaccuracy';
    case 'sound': return 'No major swing';
    default: return 'Not rated';
  }
}

export function moveQualityExplanation(quality: MoveQuality, loss: number | null): string {
  if (loss === null) return 'A centipawn comparison was unavailable for this position.';
  if (quality === 'blunder') return 'The engine estimate shifted by at least 3.00 pawns from the mover’s perspective.';
  if (quality === 'mistake') return 'The engine estimate shifted by at least 1.50 pawns from the mover’s perspective.';
  if (quality === 'inaccuracy') return 'The engine estimate shifted by at least 0.70 pawns from the mover’s perspective.';
  return 'The engine did not find a large evaluation swing at this search setting.';
}
