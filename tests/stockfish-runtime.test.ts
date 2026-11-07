import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const stockfish = require('stockfish') as { findEngine: (flavor: string) => string };

describe('Stockfish 18 runtime', () => {
  it('starts, completes the UCI handshake, and returns a move', async () => {
    const enginePath = stockfish.findEngine('lite-single');
    const child = spawn(process.execPath, [enginePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => { output += chunk; });
    child.stderr.on('data', (chunk: string) => { stderr += chunk; });

    const waitFor = (pattern: RegExp, timeoutMs: number): Promise<void> =>
      new Promise((resolve, reject) => {
        const check = () => {
          if (pattern.test(output)) {
            clearTimeout(timer);
            child.stdout.off('data', onData);
            child.off('exit', onExit);
            resolve();
          }
        };
        const onData = () => check();
        const onExit = (code: number | null) => {
          clearTimeout(timer);
          child.stdout.off('data', onData);
          reject(new Error('Stockfish exited before replying (code ' + code + '). Output: ' + output + ' ' + stderr));
        };
        const timer = setTimeout(() => {
          child.stdout.off('data', onData);
          child.off('exit', onExit);
          reject(new Error('Timed out waiting for ' + pattern + '. Output: ' + output + ' ' + stderr));
        }, timeoutMs);

        child.stdout.on('data', onData);
        child.on('exit', onExit);
        check();
      });

    try {
      const uciReady = waitFor(/^uciok$/m, 10000);
      child.stdin.write('uci\n');
      await uciReady;

      const engineReady = waitFor(/^readyok$/m, 10000);
      child.stdin.write('isready\n');
      await engineReady;

      const bestMove = waitFor(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)(?:\s|$)/m, 15000);
      child.stdin.write('position startpos\n');
      child.stdin.write('go movetime 250\n');
      await bestMove;

      const match = output.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)(?:\s|$)/m);
      expect(match?.[1]).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
    } finally {
      if (child.exitCode === null) {
        child.stdin.write('quit\n');
        child.kill();
      }
    }
  }, 30000);
});
