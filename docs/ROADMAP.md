# Product roadmap

## Release 0.1 — playable foundation

- [x] Responsive application shell and dashboard
- [x] Legal local chessboard and move history
- [x] Promotion selection, undo, board flip, and reset
- [x] Starter tactical puzzle interactions and hints
- [x] Opening line playback
- [x] Six guided lessons with concept explanations and three-question knowledge checks
- [x] Local XP, levels, daily missions, and progress
- [x] Automated chess-content validation

## Release 0.2 — complete practice loop

- [x] Stockfish 18 Lite Single WebAssembly worker integration and engine settings
- [x] Human versus engine practice with adjustable strength, plus a CI UCI runtime smoke test
- [x] PGN import/export for local practice games
- [ ] Saved-game library with tags, search, and cloud sync
- [ ] Full puzzle attempt records, themes, difficulty, and accuracy metrics
- [ ] Interactive lesson positions with guided move trees
- [x] Local spaced-review scheduling, self-rated recall, and dashboard due-review queue
- [ ] Adaptive question variants and skill-based question selection
- [ ] Daily mission rotation and richer session summaries

## Release 0.3 — opening and game intelligence

- [ ] Searchable opening encyclopedia with ECO and transpositions
- [ ] Repertoire builder for White and Black
- [ ] Opening position recall and variation testing
- [ ] Game analysis with move classification and explanation
- [ ] Weakness taxonomy linking game mistakes to targeted exercises
- [ ] Endgame tablebase integration and endgame curriculum

## Release 0.4 — motivation and mastery

- [ ] Skill ratings with confidence and sample-size indicators
- [ ] Adaptive difficulty and unseen-position transfer checks
- [ ] Weekly events, personal bests, and achievements
- [ ] Optional friend challenges and moderated clubs
- [ ] Accessibility, reduced-motion, and expanded keyboard support

## Release 1.0 — durable chess academy

- [ ] Accounts and cloud synchronization
- [ ] Complete structured curriculum from beginner to advanced
- [ ] Large, legally sourced and attributed exercise library
- [ ] Cross-device progress and privacy controls
- [ ] Performance and learning-outcome evaluation

## Quality gates

Every release must pass:

1. Chess-rule tests for legal moves and special moves.
2. Content tests for legal opening lines and valid puzzle solutions.
3. Production build and responsive layout checks.
4. Manual keyboard, screen-reader-label, and mobile checks.
5. A clear distinction between measured results and estimated skill indicators.
