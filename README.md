# ChessForge

**An adaptive chess academy for learning, practicing, and improving every day.**

Live preview: https://joeltocute10.github.io/chessforge/

ChessForge is an early-stage chess learning platform. Its goal is to combine a broad chess curriculum, legal play, tactics, opening study, game analysis, spaced review, and engaging daily challenges in one coherent experience.

## Current status

The current playable foundation includes:

- Responsive dashboard and navigation.
- Legal chess move handling through chess.js.
- Local two-player practice with move history, undo, reset, board flip, and promotion selection.
- Play against Stockfish 18 Lite Single in a browser Web Worker with three adjustable thinking levels.
- PGN import/export for local practice games.
- Starter tactical puzzles with solution feedback and hints.
- Starter opening explorer with move-by-move board playback.
- Six guided lessons with concept explanations and three knowledge checks each.
- Local spaced-review scheduling, self-rated recall, and a due-review queue.
- Daily missions, XP, player levels, and local progress persistence.
- GitHub Actions build, chess-content checks, npm security audit, and Pages deployment.

This is not yet a complete chess platform. Full opening coverage, a large puzzle database, engine analysis of imported games, endgame tablebase integration, cloud accounts, and social/tournament features remain planned work. The current review scheduler is a local heuristic, not a validated chess-strength rating and not cloud-synchronized.

## Run locally

Requirements: Node.js 22.12 or later and npm.

1. Run npm install.
2. Run npm run dev.
3. Open the local URL printed by Vite.

The predev hook copies the pinned Stockfish worker and WebAssembly assets into the public engine directory.

## Validate

Run npm run build, npm test, and npm audit --audit-level=high.

The production build runs a prebuild hook that prepares the Stockfish assets before Vite bundles the app.

## Project structure

- src/components/ChessBoard.tsx: interactive legal chessboard
- src/data/content.ts: starter lessons, opening lines, and daily missions
- src/data/lesson-content.ts: lesson explanations and knowledge checks
- src/data/puzzles.ts: curated starter tactical positions
- src/lib/progress.ts: local progress, XP, streak, and review scheduling
- src/lib/spaced-repetition.ts: self-rated recall intervals and due-review selection
- src/lib/stockfish-client.ts: browser Worker UCI client
- scripts/copy-stockfish-engine.mjs: copies pinned engine assets for dev/build
- src/App.tsx: application pages and experience
- src/styles.css: responsive visual system

## Product principles

1. Teach transferable chess understanding, not just move memorization.
2. Track accuracy and learning quality alongside solving speed.
3. Reward meaningful practice without punishing missed days.
4. Personalize training based on mistakes and retention.
5. Keep essential learning features available without pay-to-win mechanics.
6. Verify opening sequences and puzzle solutions with legal chess rules before shipping content.

## Data and licensing

- chess.js is used for chess rules and move validation under BSD-2-Clause.
- The Stockfish 18 Lite Single browser engine is distributed separately under GPL-3.0. See docs/ENGINE-LICENSES.md and the notice copied alongside the engine assets.
- Additional puzzle/opening datasets must be reviewed for attribution, redistribution permissions, and license compatibility before bundling.

See docs/ROADMAP.md and docs/CURRICULUM.md for the planned product architecture and learning scope.
