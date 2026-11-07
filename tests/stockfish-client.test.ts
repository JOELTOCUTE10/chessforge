import { describe, expect, it } from 'vitest';
import { parseUciBestMoveLine, parseUciInfoLine } from '../src/lib/stockfish-client';

describe('Stockfish UCI parsing', () => {
  it('parses depth, centipawn evaluation, node count, and principal variation', () => {
    const info = parseUciInfoLine('info depth 18 seldepth 24 multipv 1 score cp 37 nodes 123456 nps 98765 time 125 pv e2e4 e7e5 g1f3');
    expect(info).toEqual({
      depth: 18,
      scoreCp: 37,
      scoreMate: null,
      nodes: 123456,
      principalVariation: ['e2e4', 'e7e5', 'g1f3'],
    });
  });

  it('parses mate scores', () => {
    const info = parseUciInfoLine('info depth 22 score mate -3 nodes 9000 pv h2h1q');
    expect(info?.scoreMate).toBe(-3);
    expect(info?.scoreCp).toBeNull();
  });

  it('ignores non-info messages', () => {
    expect(parseUciInfoLine('bestmove e2e4')).toBeNull();
    expect(parseUciInfoLine('readyok')).toBeNull();
  });

  it('parses ordinary and promotion best moves', () => {
    expect(parseUciBestMoveLine('bestmove e2e4 ponder e7e5')).toBe('e2e4');
    expect(parseUciBestMoveLine('bestmove a7a8q')).toBe('a7a8q');
    expect(parseUciBestMoveLine('bestmove (none)')).toBeNull();
  });
});
