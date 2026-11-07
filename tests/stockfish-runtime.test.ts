import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Stockfish 18 runtime', () => {
  it('starts, completes the UCI handshake, and returns a move', async () => {
    const engineDirectory = resolve(process.cwd(), 'node_modules', 'stockfish', 'bin');
    const enginePath = resolve(engineDirectory, 'stockfish-18-lite-single.js');
    const wasmPath = resolve(engineDirectory, 'stockfish-18-lite-single.wasm');

    await access(enginePath);
    await access(wasmPath);

    const child = spawn(process.execPath, [enginePath], {
      cwd: engineDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => { output += chunk; });
    child.stderr.on('data', (chunk: string) => { stderr += chunk; });

    const waitFor = (pattern: RegExp, timeoutMs: number): Promise<void> =>
      new Promise((resolvePromise, rejectPromise) => {
        const cleanup = () => {
          clearTimeout(timer);
          child.stdout.off('data', onData);
          child.off('exit', onExit);
          child.off('error', onError);
        };
        const check = () => {
          if (pattern.test(output)) {
            cleanup();
            resolvePromise();
          }
        };
        const onData = () => check();
        const onExit = (code: number | null) => {
          cleanup();
          rejectPromise(new Error('Stockfish exited before replying (code ' + code + '). Output: ' + output + ' ' + stderr));
        };
        const onError = (error: Error) => {
          cleanup();
          rejectPromise(error);
        };
        const timer = setTimeout(() => {
          cleanup();
          rejectPromise(new Error('Timed out waiting for ' + pattern + '. Output: ' + output + ' ' + stderr));
        }, timeoutMs);

        child.stdout.on('data', onData);
        child.on('exit', onExit);
        child.on('error', onError);
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
      if (child.exitCode === null && child.signalCode === null) {
        child.stdin.write('quit\n');
        child.kill();
      }
    }
  }, 30000);
});
