import { describe, expect, it } from 'vitest';
import {
  markActiveDay,
  readProgress,
  recordLessonComplete,
  recordPracticeMove,
  recordPuzzleSolve,
  resetDailyProgress,
  type ProgressState,
} from '../src/lib/progress';

const day = (date: number) => new Date(2026, 10, date, 12, 0, 0);
const fresh = (): ProgressState => ({
  ...readProgress(),
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
});

describe('daily training progress', () => {
  it('counts a solved position only once per day and awards first-time XP once', () => {
    let progress = recordPuzzleSolve(fresh(), 'fork-a', 34, day(6));
    expect(progress.dailyPuzzleCount).toBe(1);
    expect(progress.xp).toBe(80);

    progress = recordPuzzleSolve(progress, 'fork-a', 21, day(6));
    expect(progress.dailyPuzzleCount).toBe(1);
    expect(progress.xp).toBe(80);
    expect(progress.bestPuzzleSeconds).toBe(21);

    progress = recordPuzzleSolve(progress, 'fork-b', 28, day(6));
    expect(progress.dailyPuzzleCount).toBe(2);
    expect(progress.xp).toBe(250);
    expect(progress.completedMissions).toContain('warmup');
  });

  it('resets daily counters but preserves lifetime history on the next day', () => {
    const dayOne = recordPuzzleSolve(fresh(), 'mate-a', 40, day(6));
    const dayTwo = resetDailyProgress(dayOne, day(7));

    expect(dayTwo.dailyPuzzleCount).toBe(0);
    expect(dayTwo.dailySolvedPuzzles).toEqual([]);
    expect(dayTwo.completedMissions).toEqual([]);
    expect(dayTwo.solvedPuzzles).toContain('mate-a');
    expect(dayTwo.xp).toBe(dayOne.xp);
  });

  it('awards lesson and daily lesson mission XP only once', () => {
    let progress = recordLessonComplete(fresh(), 'board-vision', 100, day(6));
    expect(progress.dailyLessonCount).toBe(1);
    expect(progress.xp).toBe(220);
    expect(progress.completedMissions).toContain('learn');

    progress = recordLessonComplete(progress, 'board-vision', 100, day(6));
    expect(progress.xp).toBe(220);
    expect(progress.dailyLessonCount).toBe(1);
  });

  it('completes the practice mission at eight moves without awarding move XP', () => {
    let progress = fresh();
    for (let i = 0; i < 7; i += 1) progress = recordPracticeMove(progress, day(6));
    expect(progress.completedMissions).not.toContain('practice');

    progress = recordPracticeMove(progress, day(6));
    expect(progress.dailyMoveCount).toBe(8);
    expect(progress.playedMoves).toBe(8);
    expect(progress.completedMissions).toContain('practice');
    expect(progress.xp).toBe(100);

    progress = recordPracticeMove(progress, day(6));
    expect(progress.xp).toBe(100);
    expect(progress.dailyMoveCount).toBe(9);
  });

  it('increments a streak on consecutive active days and restarts after a gap', () => {
    let progress = markActiveDay(fresh(), day(6));
    progress = markActiveDay(progress, day(7));
    expect(progress.streak).toBe(2);

    progress = markActiveDay(progress, day(9));
    expect(progress.streak).toBe(1);
  });
});
