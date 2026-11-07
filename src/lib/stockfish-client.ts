export type EngineSearchResult = {
  bestMove: string;
  info: EngineInfo | null;
};

export type EngineInfo = {
  depth: number | null;
  scoreCp: number | null;
  scoreMate: number | null;
  nodes: number | null;
  principalVariation: string[];
};

type ClientCallbacks = {
  onInfo?: (info: EngineInfo) => void;
  onStatus?: (status: string) => void;
};

type PendingSearch = {
  fen: string;
  movetimeMs: number;
  skillLevel: number;
  waitingForReady: boolean;
  cancelled: boolean;
  resolve: (result: EngineSearchResult | null) => void;
  latestInfo: EngineInfo | null;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

export function parseUciInfoLine(line: string): EngineInfo | null {
  const normalized = line.trim();
  if (!normalized.startsWith('info ')) return null;

  const depthMatch = normalized.match(/(?:^|\s)depth\s+(\d+)/);
  const cpMatch = normalized.match(/(?:^|\s)score\s+cp\s+(-?\d+)/);
  const mateMatch = normalized.match(/(?:^|\s)score\s+mate\s+(-?\d+)/);
  const nodesMatch = normalized.match(/(?:^|\s)nodes\s+(\d+)/);
  const pvMatch = normalized.match(/(?:^|\s)pv\s+(.+)$/);

  const info: EngineInfo = {
    depth: depthMatch ? Number(depthMatch[1]) : null,
    scoreCp: cpMatch ? Number(cpMatch[1]) : null,
    scoreMate: mateMatch ? Number(mateMatch[1]) : null,
    nodes: nodesMatch ? Number(nodesMatch[1]) : null,
    principalVariation: pvMatch ? pvMatch[1].trim().split(/\s+/) : [],
  };

  if (info.depth === null && info.scoreCp === null && info.scoreMate === null && info.nodes === null && info.principalVariation.length === 0) {
    return null;
  }
  return info;
}

export function parseUciBestMoveLine(line: string): string | null {
  const match = line.trim().match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)(?:\s|$)/);
  return match ? match[1] : null;
}

export class StockfishClient {
  private worker: Worker | null = null;
  private ready = false;
  private initialization: Promise<void> | null = null;
  private initializationResolve: (() => void) | null = null;
  private initializationReject: ((error: Error) => void) | null = null;
  private initializationTimer: ReturnType<typeof setTimeout> | null = null;
  private pending: PendingSearch | null = null;
  private idleWaiters: Array<() => void> = [];

  constructor(private readonly callbacks: ClientCallbacks = {}) {}

  initialize(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.initialization) return this.initialization;

    this.callbacks.onStatus?.('Loading Stockfish 18');
    this.initialization = new Promise<void>((resolve, reject) => {
      this.initializationResolve = resolve;
      this.initializationReject = reject;

      try {
        const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
        const workerUrl = baseUrl + 'engine/stockfish/stockfish-18-lite-single.js';
        this.worker = new Worker(workerUrl, { name: 'ChessForge Stockfish 18' });
        this.worker.onmessage = (event: MessageEvent<string>) => this.handleMessage(String(event.data));
        this.worker.onerror = (event: ErrorEvent) => {
          this.failWorker(new Error(event.message || 'The Stockfish worker could not be loaded.'));
        };
        this.initializationTimer = setTimeout(() => {
          this.failWorker(new Error('Stockfish did not finish loading. Check your connection and try again.'));
        }, 30000);
        this.worker.postMessage('uci');
      } catch (error) {
        this.failWorker(error instanceof Error ? error : new Error('The Stockfish worker could not be started.'));
      }
    });

    return this.initialization;
  }

  async findBestMove(fen: string, movetimeMs: number, skillLevel: number): Promise<EngineSearchResult | null> {
    await this.initialize();
    await this.waitUntilIdle();

    if (!this.worker || !this.ready) {
      throw new Error('Stockfish is not ready.');
    }

    return new Promise<EngineSearchResult | null>((resolve, reject) => {
      const clampedTime = Math.max(100, Math.min(5000, Math.round(movetimeMs)));
      const clampedSkill = Math.max(0, Math.min(20, Math.round(skillLevel)));
      const task: PendingSearch = {
        fen,
        movetimeMs: clampedTime,
        skillLevel: clampedSkill,
        waitingForReady: true,
        cancelled: false,
        resolve,
        reject,
        latestInfo: null,
        timeout: setTimeout(() => {
          this.failWorker(new Error('Stockfish search timed out. Try a shorter search or restart the engine.'));
        }, clampedTime + 20000),
      };

      this.pending = task;
      this.worker?.postMessage('setoption name Skill Level value ' + clampedSkill);
      this.worker?.postMessage('ucinewgame');
      this.worker?.postMessage('isready');
    });
  }

  stop(): void {
    if (!this.pending || this.pending.cancelled) return;
    this.pending.cancelled = true;
    this.worker?.postMessage('stop');
  }

  dispose(): void {
    const worker = this.worker;
    this.worker = null;
    worker?.terminate();

    if (this.initializationTimer) clearTimeout(this.initializationTimer);
    this.initializationTimer = null;

    const initReject = this.initializationReject;
    this.initializationResolve = null;
    this.initializationReject = null;
    this.initialization = null;
    this.ready = false;
    initReject?.(new Error('Stockfish was closed.'));

    const pending = this.pending;
    this.pending = null;
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(null);
    }
    this.flushIdleWaiters();
  }

  private handleMessage(line: string): void {
    const message = line.trim();
    if (!message) return;

    if (message === 'uciok') {
      this.worker?.postMessage('isready');
      return;
    }

    if (message === 'readyok') {
      if (!this.ready) {
        this.ready = true;
        if (this.initializationTimer) clearTimeout(this.initializationTimer);
        this.initializationTimer = null;
        this.initialization = Promise.resolve();
        const resolve = this.initializationResolve;
        this.initializationResolve = null;
        this.initializationReject = null;
        resolve?.();
        this.callbacks.onStatus?.('Ready');
      }

      const pending = this.pending;
      if (pending?.waitingForReady) {
        pending.waitingForReady = false;
        this.worker?.postMessage('position fen ' + pending.fen);
        this.worker?.postMessage('go movetime ' + pending.movetimeMs);
      }
      return;
    }

    if (message.startsWith('info ')) {
      const info = parseUciInfoLine(message);
      if (info) {
        const pending = this.pending;
        if (pending) {
          const previous = pending.latestInfo;
          pending.latestInfo = {
            depth: info.depth ?? previous?.depth ?? null,
            scoreCp: info.scoreCp ?? previous?.scoreCp ?? null,
            scoreMate: info.scoreMate ?? previous?.scoreMate ?? null,
            nodes: info.nodes ?? previous?.nodes ?? null,
            principalVariation: info.principalVariation.length
              ? info.principalVariation
              : previous?.principalVariation ?? [],
          };
        }
        this.callbacks.onInfo?.(info);
      }
      return;
    }

    if (message.startsWith('bestmove ')) {
      const pending = this.pending;
      if (!pending) return;
      this.pending = null;
      clearTimeout(pending.timeout);
      if (pending.cancelled) {
        pending.resolve(null);
      } else {
        const move = parseUciBestMoveLine(message);
        if (move) pending.resolve({ bestMove: move, info: pending.latestInfo });
        else pending.reject(new Error('Stockfish did not return a move for this position.'));
      }
      this.flushIdleWaiters();
    }
  }

  private waitUntilIdle(): Promise<void> {
    if (!this.pending) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  private flushIdleWaiters(): void {
    const waiters = this.idleWaiters.splice(0);
    for (const resolve of waiters) resolve();
  }

  private failWorker(error: Error): void {
    const worker = this.worker;
    this.worker = null;
    worker?.terminate();
    this.ready = false;

    if (this.initializationTimer) clearTimeout(this.initializationTimer);
    this.initializationTimer = null;

    const rejectInitialization = this.initializationReject;
    this.initializationResolve = null;
    this.initializationReject = null;
    this.initialization = null;
    rejectInitialization?.(error);

    const pending = this.pending;
    this.pending = null;
    if (pending) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.flushIdleWaiters();
    this.callbacks.onStatus?.('Unavailable');
  }
}
