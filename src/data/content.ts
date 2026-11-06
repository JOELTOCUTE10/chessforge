export type Module = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  minutes: number;
  xp: number;
  description: string;
  lessons: string[];
  color: string;
};

export const modules: Module[] = [
  {
    id: 'board-vision', title: 'See the whole board', subtitle: 'Board vision & piece safety', category: 'Foundations', level: 'Beginner', minutes: 8, xp: 100, color: 'mint',
    description: 'Build the habit of scanning the entire position before choosing a move. Strong decisions start with seeing what every piece attacks, defends, and leaves unprotected.',
    lessons: ['Name files, ranks, diagonals, and square colors', 'Find every attacked and defended square', 'Spot loose and overloaded pieces', 'Scan your opponent’s threats before moving'],
  },
  {
    id: 'forcing-moves', title: 'Checks, captures & threats', subtitle: 'A reliable calculation starting point', category: 'Calculation', level: 'Beginner', minutes: 10, xp: 120, color: 'gold',
    description: 'When a position is sharp, look for forcing moves first. Checks, captures, and direct threats narrow the number of replies you need to calculate.',
    lessons: ['Generate forcing candidate moves', 'List the opponent’s legal replies', 'Compare the resulting positions', 'Know when the forcing line ends'],
  },
  {
    id: 'knight-forks', title: 'Knight forks', subtitle: 'Attack two targets at once', category: 'Tactics', level: 'Beginner', minutes: 7, xp: 110, color: 'violet',
    description: 'A fork is a double attack. Knights are especially dangerous because their attacks cannot be blocked and can jump over other pieces.',
    lessons: ['Recognize the knight’s attack pattern', 'Identify valuable fork targets', 'Check whether the forked piece can move safely', 'Find the opponent’s defensive resource'],
  },
  {
    id: 'pawn-structures', title: 'Read the pawn structure', subtitle: 'Find the long-term story of a position', category: 'Strategy', level: 'Intermediate', minutes: 12, xp: 150, color: 'blue',
    description: 'Pawn structure shapes plans. Learn to identify pawn weaknesses, strong squares, open files, and the pawn breaks that can change the position.',
    lessons: ['Spot isolated, doubled, and backward pawns', 'Find weak squares and outposts', 'Identify open and half-open files', 'Choose a useful pawn break'],
  },
  {
    id: 'rook-endgames', title: 'Rook endings: activity first', subtitle: 'Activate the rook and king', category: 'Endgames', level: 'Intermediate', minutes: 14, xp: 170, color: 'orange',
    description: 'Rook endings are common and demand active pieces. Learn why rook activity, king activity, and passed-pawn support matter so much.',
    lessons: ['Place the rook behind a passed pawn', 'Activate the king', 'Cut off the opposing king', 'Recognize basic drawing resources'],
  },
  {
    id: 'prophylaxis', title: 'Ask what your opponent wants', subtitle: 'Prophylaxis & prevention', category: 'Strategy', level: 'Advanced', minutes: 15, xp: 190, color: 'rose',
    description: 'Prophylaxis means anticipating and reducing the opponent’s plans. It is one of the habits that separates reactive play from strategic control.',
    lessons: ['Identify the opponent’s best plan', 'Find the key square or pawn break', 'Compare prevention with active play', 'Choose a move that improves your position too'],
  },
];

export type Opening = {
  id: string;
  name: string;
  eco: string;
  side: string;
  moves: string[];
  summary: string;
  ideas: string[];
  difficulty: string;
};

export const openings: Opening[] = [
  {
    id: 'italian', name: 'Italian Game', eco: 'C50–C59', side: '1. e4 e5', difficulty: 'Beginner friendly',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    summary: 'A classical opening that develops quickly and places the bishop on an active diagonal aimed toward f7.',
    ideas: ['Develop knights before launching an attack', 'Castle to bring the king to safety', 'Prepare d3 or c3 and a central break', 'Watch the tension around the center'],
  },
  {
    id: 'ruy', name: 'Ruy López', eco: 'C60–C99', side: '1. e4 e5', difficulty: 'Intermediate',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6'],
    summary: 'A rich classical opening. White pressures the c6-knight, which supports the e5-pawn, while both sides fight for central control.',
    ideas: ['Understand the point of Bb5', 'Know when to exchange on c6', 'Prepare central expansion carefully', 'Black can challenge the center with ...d5'],
  },
  {
    id: 'sicilian', name: 'Sicilian Defense', eco: 'B20–B99', side: '1. e4 c5', difficulty: 'Advanced',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6'],
    summary: 'An asymmetrical defense that fights for the center from the flank and often creates dynamic, unbalanced positions.',
    ideas: ['Understand the fight for d4 and e5', 'Expect different pawn majorities', 'Develop quickly before counterattacking', 'Learn the pawn structures of your chosen variation'],
  },
  {
    id: 'french', name: 'French Defense', eco: 'C00–C19', side: '1. e4 e6', difficulty: 'Intermediate',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'],
    summary: 'A solid counterattacking defense. Black challenges White’s center and often plays around the tension between the e4- and d5-pawns.',
    ideas: ['Understand the light-squared bishop problem', 'Choose a plan for the central pawn tension', 'Use ...c5 to challenge d4', 'Watch for kingside space and counterplay'],
  },
];

export type Mission = { id: string; title: string; detail: string; reward: number; kind: 'puzzles' | 'lesson' | 'play'; goal: number };
export const dailyMissions: Mission[] = [
  { id: 'warmup', title: 'Tactical warm-up', detail: 'Solve both positions in today’s set.', reward: 90, kind: 'puzzles', goal: 2 },
  { id: 'learn', title: 'Learn one new idea', detail: 'Finish a short interactive lesson.', reward: 120, kind: 'lesson', goal: 1 },
  { id: 'practice', title: 'Touch the board', detail: 'Make 8 legal moves in the practice board.', reward: 100, kind: 'play', goal: 8 },
];
