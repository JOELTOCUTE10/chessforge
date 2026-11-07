import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { openings } from '../src/data/content';
import { puzzles } from '../src/data/puzzles';

describe('opening library', () => {
  it('contains move sequences that are legal from the initial position', () => {
    for (const opening of openings) {
      const game = new Chess();
      for (const san of opening.moves) {
        expect(() => game.move(san), `${opening.name}: ${san}`).not.toThrow();
      }
    }
  });
});

describe('tactics library', () => {
  it('contains legal solutions that reach checkmate', () => {
    for (const puzzle of puzzles) {
      const game = new Chess(puzzle.fen);
      const from = puzzle.solution.slice(0, 2);
      const to = puzzle.solution.slice(2, 4);
      const promotion = puzzle.solution[4] || 'q';
      expect(() => game.move({ from, to, promotion }), puzzle.title).not.toThrow();
      expect(game.isCheckmate(), puzzle.title).toBe(true);
    }
  });
});

describe('chess rules relied on by the board', () => {
  it('rejects an illegal move', () => {
    const game = new Chess();
    expect(() => game.move({ from: 'e2', to: 'e5' })).toThrow();
  });

  it('supports castling', () => {
    const game = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    game.move('O-O');
    expect(game.get('g1')?.type).toBe('k');
    expect(game.get('f1')?.type).toBe('r');
  });

  it('supports en passant', () => {
    const game = new Chess('rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    game.move('exd6');
    expect(game.get('d5')).toBeUndefined();
    expect(game.get('d6')?.type).toBe('p');
  });

  it('supports promotion', () => {
    const game = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');
    game.move({ from: 'a7', to: 'a8', promotion: 'q' });
    expect(game.get('a8')?.type).toBe('q');
  });
});


describe('PGN game records', () => {
  it('exports and imports a game without changing its move history or final position', () => {
    const original = new Chess();
    const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];
    for (const san of moves) original.move(san);

    const exported = original.pgn();
    const imported = new Chess();
    imported.loadPgn(exported, { strict: true });

    expect(imported.history()).toEqual(moves);
    expect(imported.fen()).toBe(original.fen());
  });

  it('rejects invalid PGN moves instead of silently loading a partial game', () => {
    const imported = new Chess();
    expect(() => imported.loadPgn('1. e5', { strict: true })).toThrow();
  });

  it('loads a PGN that starts from a custom FEN position', () => {
    const fen = '7k/8/8/8/8/8/8/K6R w - - 0 1';
    const original = new Chess(fen);
    original.move('Rh7');
    const exported = original.pgn();
    const imported = new Chess();
    imported.loadPgn(exported, { strict: true });
    expect(imported.fen()).toBe(original.fen());
    expect(imported.history()).toEqual(['Rh7']);
  });
});
