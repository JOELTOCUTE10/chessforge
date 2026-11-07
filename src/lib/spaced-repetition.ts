export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export type ReviewCard = {
  lessonId: string;
  dueAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string;
  lastGrade: ReviewGrade;
};

const MIN_EASE = 1.3;
const MAX_EASE = 3.2;

export function scheduleReviewCard(
  previous: ReviewCard | undefined,
  lessonId: string,
  grade: ReviewGrade,
  reviewedAt = new Date(),
): ReviewCard {
  let easeFactor = previous?.easeFactor ?? 2.5;
  let repetitions = previous?.repetitions ?? 0;
  let intervalDays = previous?.intervalDays ?? 0;
  let lapses = previous?.lapses ?? 0;

  if (grade === 'again') {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else if (grade === 'hard') {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : Math.max(2, Math.round(intervalDays * 1.2));
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
  } else if (grade === 'good') {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(1, Math.round(intervalDays * easeFactor));
  } else {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 3 : repetitions === 2 ? 7 : Math.max(1, Math.round(intervalDays * easeFactor * 1.3));
    easeFactor = Math.min(MAX_EASE, easeFactor + 0.1);
  }

  const due = new Date(reviewedAt);
  due.setDate(due.getDate() + intervalDays);

  return {
    lessonId,
    dueAt: due.toISOString(),
    intervalDays,
    easeFactor,
    repetitions,
    lapses,
    lastReviewedAt: reviewedAt.toISOString(),
    lastGrade: grade,
  };
}

export function dueReviewCards(cards: ReviewCard[], now = new Date()): ReviewCard[] {
  const timestamp = now.getTime();
  return cards
    .filter((card) => Number.isFinite(Date.parse(card.dueAt)) && Date.parse(card.dueAt) <= timestamp)
    .slice()
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}
