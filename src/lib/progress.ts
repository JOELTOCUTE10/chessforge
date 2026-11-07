import type { Mission } from '../data/content';

const STORAGE_KEY = 'chessforge.progress.v1';

export type ProgressState = {
  xp: number;
  completedLessons: string[];
  completedMissions: string[];
  solvedPuzzles: string[];
  dailySolvedPuzzles: string[];
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
  dailySolvedPuzzles: [],
  bestPuzzleSeconds: null,
  playedMoves: 0,
  streak: 0,
  lastActiveDate: null,
  missionDate: null,
  dailyPuzzleCount: 0,
  dailyLessonCount: 0,
  dailyMoveCount: 0,
};

export function todayKey(date = new Date()): string {
  return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

export function resetDailyProgress(progress: ProgressState, date = new Date()): ProgressState {
  const today = todayKey(date);
  if (progress.missionDate === today) return progress;
  return {
    ...progress,
    completedMissions: [],
    missionDate: today,
    dailyPuzzleCount: 0,
    dailyLessonCount: 0,
    dailyMoveCount: 0,
    dailySolvedPuzzles: [],
  };
}

export function markActiveDay(progress: ProgressState, date = new Date()): ProgressState {
  const today = todayKey(date);
  if (progress.lastActiveDate === today) return progress;
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const streak = progress.lastActiveDate === todayKey(yesterday) ? progress.streak + 1 : 1;
  return { ...progress, streak, lastActiveDate: today };
}

export function readProgress(): ProgressState {
  if (typeof window === 'undefined') return resetDailyProgress(initial);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return resetDailyProgress(initial);
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const merged: ProgressState = {
      ...initial,
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      solvedPuzzles: Array.isArray(parsed.solvedPuzzles) ? parsed.solvedPuzzles : [],
      dailySolvedPuzzles: Array.isArray(parsed.dailySolvedPuzzles) ? parsed.dailySolvedPuzzles : [],
    };
    return resetDailyProgress(merged);
  } catch {
    return resetDailyProgress(initial);
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

export function awardXp(progress: ProgressState, amount: number, date = new Date()): ProgressState {
  const active = markActiveDay(progress, date);
  return { ...active, xp: active.xp + amount };
}

function awardMission(progress: ProgressState, id: string, reward: number, date: Date): ProgressState {
  if (progress.completedMissions.includes(id)) return progress;
  const earned = awardXp(progress, reward, date);
  return { ...earned, completedMissions: [...earned.completedMissions, id] };
}

export function recordLessonComplete(progress: ProgressState, lessonId: string, xp: number, date = new Date()): ProgressState {
  let next = markActiveDay(resetDailyProgress(progress, date), date);
  if (next.completedLessons.includes(lessonId)) return next;
  next = {
    ...next,
    completedLessons: [...next.completedLessons, lessonId],
    dailyLessonCount: next.dailyLessonCount + 1,
  };
  next = awardXp(next, xp, date);
  if (next.dailyLessonCount >= 1) next = awardMission(next, 'learn', 120, date);
  return next;
}

export function recordPuzzleSolve(progress: ProgressState, puzzleId: string, seconds: number, date = new Date()): ProgressState {
  let next = markActiveDay(resetDailyProgress(progress, date), date);
  const isFirstEver = !next.solvedPuzzles.includes(puzzleId);
  const isFirstToday = !next.dailySolvedPuzzles.includes(puzzleId);
  next = {
    ...next,
    solvedPuzzles: isFirstEver ? [...next.solvedPuzzles, puzzleId] : next.solvedPuzzles,
    dailySolvedPuzzles: isFirstToday ? [...next.dailySolvedPuzzles, puzzleId] : next.dailySolvedPuzzles,
    dailyPuzzleCount: next.dailyPuzzleCount + (isFirstToday ? 1 : 0),
    bestPuzzleSeconds: next.bestPuzzleSeconds === null ? seconds : Math.min(next.bestPuzzleSeconds, seconds),
  };
  if (isFirstEver) next = awardXp(next, 80, date);
  if (next.dailyPuzzleCount >= 2) next = awardMission(next, 'warmup', 90, date);
  return next;
}

export function recordPracticeMove(progress: ProgressState, date = new Date()): ProgressState {
  let next = markActiveDay(resetDailyProgress(progress, date), date);
  next = { ...next, playedMoves: next.playedMoves + 1, dailyMoveCount: next.dailyMoveCount + 1 };
  if (next.dailyMoveCount >= 8) next = awardMission(next, 'practice', 100, date);
  return next;
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
