import { describe, expect, it } from 'vitest';
import { classifyCentipawnLoss, centipawnLoss, moveQualityLabel } from '../src/lib/game-analysis';
import type { EngineInfo } from '../src/lib/stockfish-client';

function info(scoreCp: number): EngineInfo {
  return { depth: 12, scoreCp, scoreMate: null, nodes: 5000, principalVariation: [] };
}

describe('game review evaluation', () => {
  it('normalizes score changes for White and Black using side-to-move UCI scores', () => {
    expect(centipawnLoss(info(30), info(110))).toBe(140);
    expect(centipawnLoss(info(200), info(-200))).toBe(0);
  });

  it('does not invent centipawn loss when a mate score is present', () => {
    const mate: EngineInfo = { ...info(0), scoreCp: null, scoreMate: 3 };
    expect(centipawnLoss(mate, info(100))).toBeNull();
  });

  it('classifies increasing evaluation swings at the documented thresholds', () => {
    expect(classifyCentipawnLoss(20)).toBe('sound');
    expect(classifyCentipawnLoss(70)).toBe('inaccuracy');
    expect(classifyCentipawnLoss(150)).toBe('mistake');
    expect(classifyCentipawnLoss(300)).toBe('blunder');
    expect(classifyCentipawnLoss(null)).toBe('unrated');
    expect(moveQualityLabel('blunder')).toBe('Blunder');
  });
});
