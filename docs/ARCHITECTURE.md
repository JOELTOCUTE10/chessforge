# Technical architecture

## Current release

- React + TypeScript + Vite provide a client-side single-page application.
- `chess.js` is the rules authority for legal moves, move application, SAN, FEN, special moves, and terminal-position checks.
- The board UI renders 64 interactive squares and delegates legality to `chess.js`; it does not implement chess rules itself.
- Browser local storage currently holds XP, completed lessons, spaced-review cards, puzzle records, streak state, and mission progress.
- Stockfish 18.0.8 Lite Single is served as a version-pinned JavaScript/WebAssembly pair from public/engine/stockfish/ and runs in a dedicated browser Worker. The typed UCI client performs the handshake, applies a bounded skill level and move-time setting, streams evaluation information, stops obsolete searches, and validates engine moves through chess.js.
- The Stockfish engine has a separate GPL-3.0 license; the application remains MIT-licensed. See docs/ENGINE-LICENSES.md and the generated engine NOTICE.txt.
- Lesson, opening, puzzle, and mission content is separated from the view layer so it can be validated and expanded independently.

## Current engine boundary

Stockfish 18.0.8 Lite Single runs in a browser Web Worker using its paired JavaScript and WebAssembly files. The React UI communicates through a typed UCI client. Search times are bounded and the worker is terminated when engine mode is left. The engine response is parsed from UCI messages, and the returned move is applied only after chess.js confirms it is legal. CI tests both UCI parsing and a short real-engine search from the starting position.

The browser engine assets are copied from the pinned npm package by scripts/copy-stockfish-engine.mjs during both development startup and production builds. Before upgrading the engine, re-check package file names, browser compatibility, search behavior, and GPLv3 source/notice obligations.

## Planned learning-data model

A position exercise should include:

- Stable exercise ID and source/license metadata.
- FEN and side to move.
- Accepted solution line(s), not only one guessed UCI move.
- Theme tags and prerequisite concepts.
- Difficulty estimate and evidence/sample count.
- Explanation of the idea and common incorrect candidates.
- Review history and next-due timestamp per learner.

A game-analysis record should preserve the original PGN, engine settings, critical positions, classified mistakes, and the learner's own explanation before engine feedback.

## Product measurement

Track accuracy and elapsed time separately. Use new or held-out positions to measure transfer. Show skill estimates with sample sizes and confidence; do not present a small number of exercises as a definitive chess rating.
