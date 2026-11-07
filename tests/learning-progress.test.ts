import { describe, expect, it } from 'vitest';
import { modules } from '../src/data/content';
import { lessonContent } from '../src/data/lesson-content';
import { dueReviewCards, scheduleReviewCard } from '../src/lib/spaced-repetition';
import { recordLessonComplete, recordLessonReview, type ProgressState } from '../src/lib/progress';

const start = new Date('2026-11-06T12:00:00.000Z');
const emptyProgress: ProgressState = {
  xp: 0,
  completedLessons: [],
  completedMissions: [],
  solvedPuzzles: [],
  dailySolvedPuzzles: [],
  reviewCards: [],
  bestPuzzleSeconds: null,
  playedMoves: 0,
  streak: 0,
  lastActiveDate: null,
  missionDate: null,
  dailyPuzzleCount: 0,
  dailyLessonCount: 0,
  dailyMoveCount: 0,
};

describe('lesson retrieval content', () => {
  it('has explanations for every section and three valid knowledge checks', () => {
    for (const module of modules) {
      const content = lessonContent[module.id];
      expect(content, module.id).toBeDefined();
      expect(content.explanations).toHaveLength(module.lessons.length);
      expect(content.knowledgeChecks).toHaveLength(3);
      for (const check of content.knowledgeChecks) {
        expect(check.options.length).toBeGreaterThanOrEqual(3);
        expect(check.answerIndex).toBeGreaterThanOrEqual(0);
        expect(check.answerIndex).toBeLessThan(check.options.length);
        expect(check.explanation.length).toBeGreaterThan(20);
      }
    }
  });
});

describe('spaced review scheduler', () => {
  it('schedules an easy first review three days later', () => {
    const card = scheduleReviewCard(undefined, 'knight-forks', 'easy', start);
    expect(card.intervalDays).toBe(3);
    expect(card.dueAt).toBe('2026-11-09T12:00:00.000Z');
    expect(card.repetitions).toBe(1);
  });

  it('brings a difficult recall back sooner and records a lapse', () => {
    const first = scheduleReviewCard(undefined, 'board-vision', 'good', start);
    const again = scheduleReviewCard(first, 'board-vision', 'again', new Date('2026-11-07T12:00:00.000Z'));
    expect(again.intervalDays).toBe(1);
    expect(again.repetitions).toBe(0);
    expect(again.lapses).toBe(1);
    expect(again.easeFactor).toBeLessThan(first.easeFactor);
  });

  it('filters and orders only reviews that are due', () => {
    const due = scheduleReviewCard(undefined, 'pawn-structures', 'good', start);
    const later = scheduleReviewCard(undefined, 'rook-endgames', 'easy', start);
    const cards = [later, due];
    expect(dueReviewCards(cards, new Date('2026-11-07T12:00:00.000Z')).map((card) => card.lessonId)).toEqual(['pawn-structures']);
    expect(dueReviewCards(cards, new Date('2026-11-10T12:00:00.000Z')).map((card) => card.lessonId)).toEqual(['pawn-structures', 'rook-endgames']);
  });

  it('stores the first lesson review card and updates it without duplicate XP', () => {
    const completed = recordLessonComplete(emptyProgress, 'forcing-moves', 120, start, 'good');
    expect(completed.completedLessons).toContain('forcing-moves');
    expect(completed.reviewCards).toHaveLength(1);
    const xp = completed.xp;
    const reviewed = recordLessonReview(completed, 'forcing-moves', 'easy', new Date('2026-11-07T12:00:00.000Z'));
    expect(reviewed.xp).toBe(xp);
    expect(reviewed.reviewCards).toHaveLength(1);
    expect(reviewed.reviewCards[0].lastGrade).toBe('easy');
    expect(reviewed.reviewCards[0].intervalDays).toBeGreaterThan(1);
  });
});
