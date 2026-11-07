export type KnowledgeCheck = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type LessonContent = {
  explanations: string[];
  knowledgeCheck: KnowledgeCheck;
};

export const lessonContent: Record<string, LessonContent> = {
  'board-vision': {
    explanations: [
      'Files run from a to h and ranks run from 1 to 8. A square is named by combining its file and rank, such as e4. Before calculating, identify where the important pieces and kings are located.',
      'A piece attacks squares according to its movement rules. Pawns attack diagonally, not straight ahead. A piece can be defended even when the defending piece is pinned or overloaded, so always inspect the full position.',
      'A loose piece is one that is not adequately protected. An overloaded defender has too many important jobs. Before moving, ask what your move stops defending and whether your opponent can exploit it.',
      'Use the same scan every turn: checks against your king, captures your opponent threatens, direct threats, and pieces left undefended. Seeing the opponent’s idea before choosing your own move prevents many simple blunders.',
    ],
    knowledgeCheck: {
      question: 'Your opponent attacks one of your pieces. What should you check before moving another piece?',
      options: ['Whether the attacked piece is adequately defended and what happens if it is captured', 'Only whether your next move gives check', 'Whether you can move the queen to the edge of the board'],
      answerIndex: 0,
      explanation: 'Count the attackers and defenders, then calculate the capture. A piece can look protected but still be tactically vulnerable.',
    },
  },
  'forcing-moves': {
    explanations: [
      'A candidate move is a move worth calculating. In sharp positions, start with forcing moves because they limit the opponent’s choices and make variations easier to compare.',
      'A check demands a legal response. List the opponent’s actual replies rather than assuming they must move the king; blocks and captures may also be possible.',
      'Captures change material and can open lines. Before taking a piece, check whether the recapture is safe and whether the capture exposes your king or leaves another piece hanging.',
      'A threat is useful only if it creates a problem the opponent must address. After each candidate, switch sides mentally: what is the strongest reply, and what would you play next?',
    ],
    knowledgeCheck: {
      question: 'Which sequence is the most reliable starting point when calculating a forcing position?',
      options: ['Choose the first quiet move that looks natural', 'Check all reasonable checks, captures, and direct threats, then calculate replies', 'Calculate only your own second move'],
      answerIndex: 1,
      explanation: 'Checks, captures, and threats are forcing candidates. You must still verify the opponent’s strongest legal response.',
    },
  },
  'knight-forks': {
    explanations: [
      'A knight moves in an L-shape: two squares in one direction and one perpendicular. It jumps over intervening pieces, which makes its attacks difficult to block.',
      'A fork attacks two or more targets at the same time. Look for targets with different kinds of value, such as a king and queen, or a rook and an unprotected piece.',
      'A fork is not automatically winning. The opponent may move the more valuable target with tempo, capture the knight, or create a stronger counter-threat. Calculate the reply before playing it.',
      'Before committing to a fork, confirm that the knight’s destination square is safe and that the attack cannot be answered by a forcing move. A sound fork wins material or creates a lasting advantage.',
    ],
    knowledgeCheck: {
      question: 'What makes a knight fork effective?',
      options: ['The knight attacks two or more targets at once and the targets cannot all escape safely', 'The knight attacks a pawn that is already protected', 'The knight moves next to the opponent’s king without checking the reply'],
      answerIndex: 0,
      explanation: 'The double attack is the point. The tactic works only when the opponent cannot save every target or create a stronger threat.',
    },
  },
  'pawn-structures': {
    explanations: [
      'Pawns define long-term territory because they cannot move backward. Their placement controls squares and determines which files and diagonals can open later.',
      'An isolated pawn has no friendly pawn on an adjacent file. Doubled pawns share a file. A backward pawn cannot advance safely and may become a target on a semi-open file.',
      'A strong square is one where your piece can be active and difficult to chase away. An outpost is especially useful when an enemy pawn cannot attack the piece from an adjacent file.',
      'A pawn break is an advance or capture that challenges the opponent’s pawn chain. Prepare it with pieces first; an early break can leave weak squares or an exposed king.',
    ],
    knowledgeCheck: {
      question: 'Why can a pawn break be strategically important?',
      options: ['It always wins a pawn immediately', 'It can change the pawn structure, open lines, and create new squares for pieces', 'It prevents the opponent from castling in every position'],
      answerIndex: 1,
      explanation: 'Pawn breaks reshape the position. Their value depends on timing, piece activity, and the weaknesses created for both sides.',
    },
  },
  'rook-endgames': {
    explanations: [
      'Rooks are strongest on open files and behind passed pawns. Their activity often matters more than holding a pawn that keeps the rook passive.',
      'The king becomes a fighting piece in the endgame. Bring it toward the center and support your pawns, while keeping an eye on checks from the opposing rook.',
      'A rook can cut off the enemy king by controlling a rank or file. This limits the king’s movement and can help your own king approach or support a passed pawn.',
      'A passed pawn has no opposing pawn blocking it on its file or neighboring files. The rook often belongs behind it, where it can support its advance or attack it from behind.',
    ],
    knowledgeCheck: {
      question: 'Where is a rook usually best placed relative to a passed pawn?',
      options: ['Behind the passed pawn, supporting its advance or stopping it', 'In front of its own king, blocking the king', 'On a random file far from the pawn'],
      answerIndex: 0,
      explanation: 'A rook behind a passed pawn gains activity and can influence the pawn’s progress from either side of the board.',
    },
  },
  'prophylaxis': {
    explanations: [
      'A plan is not only what you want to do. It is also what the opponent is preparing. Identify their most active piece, pawn break, target, or king-side idea.',
      'Find the key square or pawn break that makes the opponent’s plan work. If you can control that square or prevent the break, you may reduce their activity without making a passive move.',
      'Prevention has a cost. A move that stops one threat can create another weakness. Compare the preventive move with an active move that improves your own pieces or creates a counter-threat.',
      'The best prophylactic moves often improve your position at the same time. Improve a piece, protect a weakness, or control an important square while making the opponent’s plan harder to execute.',
    ],
    knowledgeCheck: {
      question: 'Which choice best describes a useful prophylactic move?',
      options: ['A move that prevents every possible opponent move', 'A move that addresses an important opponent plan while also improving or preserving your own position', 'A move that avoids making any plan of your own'],
      answerIndex: 1,
      explanation: 'Prophylaxis is practical prevention, not passivity. The goal is to reduce a real plan while keeping your own position healthy.',
    },
  },
};
