export type KnowledgeCheck = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type LessonContent = {
  explanations: string[];
  knowledgeChecks: KnowledgeCheck[];
};

export const lessonContent: Record<string, LessonContent> = {
  'board-vision': {
    explanations: [
      'Files run from a to h and ranks run from 1 to 8. A square is named by combining its file and rank, such as e4. Before calculating, identify where the important pieces and kings are located.',
      'A piece attacks squares according to its movement rules. Pawns attack diagonally, not straight ahead. A piece can be defended even when the defending piece is pinned or overloaded, so always inspect the full position.',
      'A loose piece is one that is not adequately protected. An overloaded defender has too many important jobs. Before moving, ask what your move stops defending and whether your opponent can exploit it.',
      'Use the same scan every turn: checks against your king, captures your opponent threatens, direct threats, and pieces left undefended. Seeing the opponent’s idea before choosing your own move prevents many simple blunders.',
    ],
    knowledgeChecks: [
      {
        question: 'Your opponent attacks one of your pieces. What should you check before moving another piece?',
        options: ['Whether the attacked piece is adequately defended and what happens if it is captured', 'Only whether your next move gives check', 'Whether you can move the queen to the edge of the board'],
        answerIndex: 0,
        explanation: 'Count the attackers and defenders, then calculate the capture. A piece can look protected but still be tactically vulnerable.',
      },
      {
        question: "Which statement about pawn attacks is correct?",
        options: ["Pawns attack diagonally forward, not the square directly ahead", "Pawns attack only the square directly ahead", "Pawns attack backward when defending"],
        answerIndex: 0,
        explanation: "A pawn moves straight ahead but captures one square diagonally forward. This distinction is essential when counting attackers and defenders.",
      },
      {
        question: "What is an overloaded defender?",
        options: ["A piece with too many important defensive tasks", "A piece that attacks the center", "A piece that has not moved from its starting square"],
        answerIndex: 0,
        explanation: "An overloaded piece cannot reliably perform every defensive job at once. A tactic may exploit the moment it is forced to choose.",
      },
    ],
  },
  'forcing-moves': {
    explanations: [
      'A candidate move is a move worth calculating. In sharp positions, start with forcing moves because they limit the opponent’s choices and make variations easier to compare.',
      'A check demands a legal response. List the opponent’s actual replies rather than assuming they must move the king; blocks and captures may also be possible.',
      'Captures change material and can open lines. Before taking a piece, check whether the recapture is safe and whether the capture exposes your king or leaves another piece hanging.',
      'A threat is useful only if it creates a problem the opponent must address. After each candidate, switch sides mentally: what is the strongest reply, and what would you play next?',
    ],
    knowledgeChecks: [
      {
        question: 'Which sequence is the most reliable starting point when calculating a forcing position?',
        options: ['Choose the first quiet move that looks natural', 'Check all reasonable checks, captures, and direct threats, then calculate replies', 'Calculate only your own second move'],
        answerIndex: 1,
        explanation: 'Checks, captures, and threats are forcing candidates. You must still verify the opponent’s strongest legal response.',
      },
      {
        question: "After you find a forcing candidate move, what must you calculate?",
        options: ["The opponent's strongest legal response", "Only the move you hope they play", "The position after your next two moves, ignoring the opponent"],
        answerIndex: 0,
        explanation: "A variation is meaningful only when it includes the opponent's best practical reply, not just the continuation you want.",
      },
      {
        question: "Why are checks, captures, and direct threats useful to examine early?",
        options: ["They often restrict the opponent's replies and make calculation more concrete", "They are always the engine's top three moves", "They guarantee a material win"],
        answerIndex: 0,
        explanation: "Forcing moves narrow the candidate tree, but each still needs to be checked for a sound reply.",
      },
    ],
  },
  'knight-forks': {
    explanations: [
      'A knight moves in an L-shape: two squares in one direction and one perpendicular. It jumps over intervening pieces, which makes its attacks difficult to block.',
      'A fork attacks two or more targets at the same time. Look for targets with different kinds of value, such as a king and queen, or a rook and an unprotected piece.',
      'A fork is not automatically winning. The opponent may move the more valuable target with tempo, capture the knight, or create a stronger counter-threat. Calculate the reply before playing it.',
      'Before committing to a fork, confirm that the knight’s destination square is safe and that the attack cannot be answered by a forcing move. A sound fork wins material or creates a lasting advantage.',
    ],
    knowledgeChecks: [
      {
        question: 'What makes a knight fork effective?',
        options: ['The knight attacks two or more targets at once and the targets cannot all escape safely', 'The knight attacks a pawn that is already protected', 'The knight moves next to the opponent’s king without checking the reply'],
        answerIndex: 0,
        explanation: 'The double attack is the point. The tactic works only when the opponent cannot save every target or create a stronger threat.',
      },
      {
        question: "Before playing a knight fork, what is the most important final safety check?",
        options: ["Whether the knight can be captured or answered by a stronger forcing move", "Whether the knight is near the edge", "Whether the fork attacks two pawns"],
        answerIndex: 0,
        explanation: "A fork is only useful if the knight survives or the resulting exchange is favorable. Always calculate the opponent's forcing resources.",
      },
      {
        question: "Which is an example of a double attack?",
        options: ["One move attacks the enemy king and a rook at the same time", "A rook moves to an open file without attacking anything", "A pawn protects another pawn"],
        answerIndex: 0,
        explanation: "A double attack creates two threats at once. The opponent may be unable to answer both.",
      },
    ],
  },
  'pawn-structures': {
    explanations: [
      'Pawns define long-term territory because they cannot move backward. Their placement controls squares and determines which files and diagonals can open later.',
      'An isolated pawn has no friendly pawn on an adjacent file. Doubled pawns share a file. A backward pawn cannot advance safely and may become a target on a semi-open file.',
      'A strong square is one where your piece can be active and difficult to chase away. An outpost is especially useful when an enemy pawn cannot attack the piece from an adjacent file.',
      'A pawn break is an advance or capture that challenges the opponent’s pawn chain. Prepare it with pieces first; an early break can leave weak squares or an exposed king.',
    ],
    knowledgeChecks: [
      {
        question: 'Why can a pawn break be strategically important?',
        options: ['It always wins a pawn immediately', 'It can change the pawn structure, open lines, and create new squares for pieces', 'It prevents the opponent from castling in every position'],
        answerIndex: 1,
        explanation: 'Pawn breaks reshape the position. Their value depends on timing, piece activity, and the weaknesses created for both sides.',
      },
      {
        question: "What makes a pawn isolated?",
        options: ["It has no friendly pawn on either adjacent file", "It has moved two squares from its starting square", "It is the only pawn on its color complex"],
        answerIndex: 0,
        explanation: "An isolated pawn has no friendly pawn on neighboring files to support or protect it. It can become a long-term target.",
      },
      {
        question: "What is a useful outpost for a knight?",
        options: ["A stable square where the knight is active and enemy pawns cannot easily drive it away", "Any square on the first rank", "A square directly in front of the king, regardless of support"],
        answerIndex: 0,
        explanation: "A strong outpost gives a piece a stable, active post. Pawn control and support from other pieces help make it durable.",
      },
    ],
  },
  'rook-endgames': {
    explanations: [
      'Rooks are strongest on open files and behind passed pawns. Their activity often matters more than holding a pawn that keeps the rook passive.',
      'The king becomes a fighting piece in the endgame. Bring it toward the center and support your pawns, while keeping an eye on checks from the opposing rook.',
      'A rook can cut off the enemy king by controlling a rank or file. This limits the king’s movement and can help your own king approach or support a passed pawn.',
      'A passed pawn has no opposing pawn blocking it on its file or neighboring files. The rook often belongs behind it, where it can support its advance or attack it from behind.',
    ],
    knowledgeChecks: [
      {
        question: 'Where is a rook usually best placed relative to a passed pawn?',
        options: ['Behind the passed pawn, supporting its advance or stopping it', 'In front of its own king, blocking the king', 'On a random file far from the pawn'],
        answerIndex: 0,
        explanation: 'A rook behind a passed pawn gains activity and can influence the pawn’s progress from either side of the board.',
      },
      {
        question: "Why is king activity important in rook endings?",
        options: ["The king becomes a strong supporting piece once immediate mating threats are reduced", "The king can replace the rook on open files", "The king no longer needs protection from checks"],
        answerIndex: 0,
        explanation: "In the endgame the king often helps attack pawns, support passed pawns, and control key squares. Rook checks still need to be respected.",
      },
      {
        question: "What is a common use of a rook on an open file?",
        options: ["Increase activity and create pressure against targets or entry squares", "Block its own passed pawn", "Stay passive so the king can move first"],
        answerIndex: 0,
        explanation: "An open file gives the rook routes into the position. Activity and useful targets matter more than occupying a file without a plan.",
      },
    ],
  },
  'prophylaxis': {
    explanations: [
      'A plan is not only what you want to do. It is also what the opponent is preparing. Identify their most active piece, pawn break, target, or king-side idea.',
      'Find the key square or pawn break that makes the opponent’s plan work. If you can control that square or prevent the break, you may reduce their activity without making a passive move.',
      'Prevention has a cost. A move that stops one threat can create another weakness. Compare the preventive move with an active move that improves your own pieces or creates a counter-threat.',
      'The best prophylactic moves often improve your position at the same time. Improve a piece, protect a weakness, or control an important square while making the opponent’s plan harder to execute.',
    ],
    knowledgeChecks: [
      {
        question: 'Which choice best describes a useful prophylactic move?',
        options: ['A move that prevents every possible opponent move', 'A move that addresses an important opponent plan while also improving or preserving your own position', 'A move that avoids making any plan of your own'],
        answerIndex: 1,
        explanation: 'Prophylaxis is practical prevention, not passivity. The goal is to reduce a real plan while keeping your own position healthy.',
      },
      {
        question: "What question should you ask before choosing your own plan?",
        options: ["What is my opponent trying to achieve?", "Which piece can I move without calculating?", "How can I avoid changing the position?"],
        answerIndex: 0,
        explanation: "A strong plan accounts for the opponent's intentions. You can then prevent a key idea or prepare a more effective counter-plan.",
      },
      {
        question: "Which move is most consistent with useful prophylaxis?",
        options: ["Prevent an important opponent idea while improving a piece or preserving a key square", "Make a passive move that creates a new weakness without a reason", "Try to stop every legal move the opponent has"],
        answerIndex: 0,
        explanation: "Prophylaxis is selective and purposeful. It reduces a real threat while keeping your own position healthy.",
      },
    ],
  },
};
