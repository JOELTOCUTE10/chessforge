# Technical architecture

## Current release

- React + TypeScript + Vite provide a client-side single-page application.
- `chess.js` is the rules authority for legal moves, move application, SAN, FEN, special moves, and terminal-position checks.
- The board UI renders 64 interactive squares and delegates legality to `chess.js`; it does not implement chess rules itself.
- Browser local storage currently holds XP, completed lessons, puzzle records, streak state, and mission progress.
- Lesson, opening, puzzle, and mission content is separated from the view layer so it can be validated and expanded independently.

## Planned engine boundary

Stockfish should run in a Web Worker using a version-pinned WebAssembly distribution. The React UI should communicate through a narrow typed interface (start, stop, set options, analyze FEN, play strength-limited move). Engine output should be parsed from UCI messages. Do not run deep engine searches on the main UI thread.

Before distributing Stockfish or a derived binary, review the exact release's GPLv3 obligations and include the corresponding source and notices as required.

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
