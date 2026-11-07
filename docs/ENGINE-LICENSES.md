# Engine licensing and source notices

ChessForge application code is licensed under the repository MIT license. The browser chess engine is a separate component and is not relicensed under MIT.

## Stockfish browser engine

- Distribution: Stockfish.js by Nathan Rugg and contributors.
- Pinned npm package: stockfish@18.0.8.
- Selected build: stockfish-18-lite-single.js and stockfish-18-lite-single.wasm.
- License: GNU General Public License version 3 (GPL-3.0).
- Package distribution: https://www.npmjs.com/package/stockfish
- Browser distribution source and build scripts: https://github.com/nmrugg/stockfish.js
- Upstream Stockfish source: https://github.com/official-stockfish/Stockfish
- GPLv3 license text: https://www.gnu.org/licenses/gpl-3.0.html

The version is pinned at 18.0.8 because the upstream issue tracker documents a reproducible search that hangs in the Stockfish 19.0.0 and 19.0.1 lite builds, while 18.0.8 lite single-thread completed the same position. This is an engineering stability choice, not a claim that 18.0.8 is newer. See https://github.com/nmrugg/stockfish.js/issues/124.

The selected single-threaded WebAssembly build is approximately 7.3 MB and does not require cross-origin isolation headers, which makes it suitable for static hosting such as GitHub Pages. It runs in a dedicated browser Worker so engine calculation does not run on the main UI thread.

Keep the Stockfish files, notices, license, and corresponding source availability separate from the MIT-licensed application code. Refer to the upstream package and source repositories for the corresponding source and build inputs.
