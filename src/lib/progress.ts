import type { Mission } from '../data/content';

const STORAGE_KEY = 'chessforge.progress.v1';

export type ProgressState = {
  xp: number;
  completedLessons: string[];
  completedMissions: string[];
  solvedPuzzles: string[];
  bestPuzzleSeconds: number | null;
  playedMoves: number;
  streak: number;
  lastActiveDate: string | null;
  missionDate: string | null;
  dailyPuzzleCount: number;
  dailyLessonCount: number;
  dailyMoveCount: number;
};

const initial: ProgressState = {
  xp: 0,
  completedLessons: [],
  completedMissions: [],
  solvedPuzzles: [],
  bestPuzzleSeconds: null,
  playedMoves: 0,
  streak: 0,
  lastActiveDate: null,
  missionDate: null,
  dailyPuzzleCount: 0,
  dailyLessonCount: 0,
  dailyMoveCount: 0,
};

export function readProgress(): ProgressState {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const merged = { ...initial, ...parsed };
    if (merged.missionDate !== todayKey()) {
      return { ...merged, completedMissions: [], missionDate: todayKey(), dailyPuzzleCount: 0, dailyLessonCount: 0, dailyMoveCount: 0 };
    }
    return merged;
  } catch {
    return initial;
  }
}

export function writeProgress(progress: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function awardXp(progress: ProgressState, amount: number): ProgressState {
  const today = todayKey();
  if (progress.lastActiveDate === today) return { ...progress, xp: progress.xp + amount };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const streak = progress.lastActiveDate === todayKey(yesterday) ? progress.streak + 1 : 1;
  return { ...progress, xp: progress.xp + amount, streak, lastActiveDate: today };
}

export function missionProgress(mission: Mission, progress: ProgressState): number {
  if (progress.completedMissions.includes(mission.id)) return mission.goal;
  if (mission.kind === 'puzzles') return Math.min(mission.goal, progress.dailyPuzzleCount);
  if (mission.kind === 'lesson') return Math.min(mission.goal, progress.dailyLessonCount);
  return Math.min(mission.goal, progress.dailyMoveCount);
}

export function playerLevel(xp: number): { level: number; title: string; next: number; current: number } {
  const thresholds = [0, 250, 650, 1200, 2000, 3100, 4600, 6500, 9000];
  let level = 1;
  for (let i = 1; i < thresholds.length; i += 1) if (xp >= thresholds[i]) level = i + 1;
  const current = thresholds[level - 1];
  const next = thresholds[level] ?? current + 2500;
  const titles = ['Newcomer', 'Apprentice', 'Tactician', 'Strategist', 'Analyst', 'Expert', 'Mastermind', 'Candidate Master', 'Grandmaster'];
  return { level, title: titles[level - 1] ?? 'Grandmaster', next, current };
}
