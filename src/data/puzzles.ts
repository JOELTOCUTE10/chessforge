export type Puzzle = {
  id: string;
  title: string;
  theme: string;
  difficulty: string;
  fen: string;
  solution: string;
  explanation: string;
  hint: string;
};

// Curated starter position. The solution is checked against chess.js in the test suite.
export const puzzles: Puzzle[] = [
  {
    id: 'queen-mate-one',
    title: 'The quiet mating net',
    theme: 'Checkmate in one',
    difficulty: 'Starter',
    fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
    solution: 'g6g7',
    explanation: 'Qg7 is checkmate. The queen checks along the diagonal to h8, while the white king protects g7 and controls the escape squares.',
    hint: 'Look for a queen move that gives check while staying protected by your king.',
  },
  {
    id: 'mirrored-mating-net',
    title: 'Find the protected check',
    theme: 'Checkmate in one',
    difficulty: 'Starter',
    fen: '8/8/8/8/8/1qk5/8/K7 b - - 0 1',
    solution: 'b3b2',
    explanation: 'Qb2 is checkmate. The queen checks the king on a1 along the diagonal, and the black king protects the queen on b2.',
    hint: 'Your queen can give a diagonal check. Make sure the destination square is protected.',
  },
];
