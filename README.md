# ChessForge

**An adaptive chess academy for learning, practicing, and improving every day.**

Live preview: https://joeltocute10.github.io/chessforge/

ChessForge is an early-stage chess learning platform. Its long-term goal is to combine a complete chess curriculum, legal play, tactics, opening study, game analysis, spaced repetition, and engaging daily challenges in one coherent experience.

## Current status

This repository contains the first playable foundation (v0.1):

- Responsive dashboard and navigation.
- Legal chess move handling through `chess.js`.
- Practice board with move history, undo, reset, board flip, promotion selection, and PGN import/export.
- Starter tactics set with solution feedback and hints.
- Starter opening explorer with move-by-move board playback.
- Lesson catalogue with checkpoint completion.
- Daily missions, XP, player levels, and local progress persistence.
- Player progress dashboard.
- GitHub Actions build, chess-content checks, npm security audit, and Pages deployment.

This is not yet a complete chess platform. Stockfish-powered analysis, engine play, full opening coverage, a large puzzle database, adaptive spaced repetition, game review, a saved-game library, and social/tournament features remain planned work.

## Run locally

Requirements: Node.js 22.12 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Validate

```bash
npm run build
npm test
npm audit --audit-level=high
```

## Project structure

```text
src/
  components/ChessBoard.tsx   Interactive legal chessboard
  data/content.ts             Starter lessons, opening lines, daily missions
  data/puzzles.ts             Curated starter tactical positions
  lib/progress.ts             Local progress, XP, streak, level calculations
  App.tsx                     Application pages and experience
  styles.css                  Responsive visual system
```

## Product principles

1. Teach transferable chess understanding, not just move memorization.
2. Track accuracy and learning quality alongside solving speed.
3. Reward meaningful practice without punishing missed days.
4. Personalize training based on mistakes and retention.
5. Keep essential learning features available without pay-to-win mechanics.
6. Verify opening sequences and puzzle solutions with legal chess rules before shipping content.

## Data and licensing

- `chess.js` is used for chess rules and move validation under its BSD-2-Clause license.
- The opening and puzzle examples currently in this repository are original, small teaching examples. Additional datasets must be reviewed for source attribution, redistribution permissions, and license compatibility before being bundled.
- Any future Stockfish integration must comply with Stockfish's GPLv3 distribution requirements.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/CURRICULUM.md`](docs/CURRICULUM.md) for the planned product architecture and learning scope.
