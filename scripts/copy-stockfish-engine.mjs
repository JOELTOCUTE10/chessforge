import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const packageRoot = path.join(root, 'node_modules', 'stockfish');
const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));

if (packageJson.version !== '18.0.8') {
  throw new Error('ChessForge expects stockfish@18.0.8, but found ' + packageJson.version + '.');
}

const sourceDirectory = path.join(packageRoot, 'bin');
const destinationDirectory = path.join(root, 'public', 'engine', 'stockfish');
const assets = [
  'stockfish-18-lite-single.js',
  'stockfish-18-lite-single.wasm',
];

await mkdir(destinationDirectory, { recursive: true });

for (const filename of assets) {
  const source = path.join(sourceDirectory, filename);
  const destination = path.join(destinationDirectory, filename);
  await access(source);
  await copyFile(source, destination);
}

const notice = [
  'ChessForge browser engine notice',
  '',
  'Engine: Stockfish 18 Lite Single (single-threaded WebAssembly)',
  'Browser distribution: Stockfish.js by Nathan Rugg and contributors',
  'npm package: stockfish@18.0.8',
  'License: GNU General Public License version 3 (GPL-3.0)',
  '',
  'The engine is distributed as a separate worker and WebAssembly asset.',
  'Its license is separate from the MIT license for ChessForge application code.',
  'License text: https://www.gnu.org/licenses/gpl-3.0.html',
  'Browser distribution source: https://github.com/nmrugg/stockfish.js',
  'Upstream engine source: https://github.com/official-stockfish/Stockfish',
  '',
  'See docs/ENGINE-LICENSES.md in this repository for package and source details.',
].join('\n');

await writeFile(path.join(destinationDirectory, 'NOTICE.txt'), notice + '\n', 'utf8');
console.log('Prepared pinned Stockfish 18.0.8 Lite Single assets for the browser worker.');
