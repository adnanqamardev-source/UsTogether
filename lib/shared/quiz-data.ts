import type { StaticQuizQuestion, QuizQuestion } from '@/global.d.ts';
import sampleQuestions from '@/data/quiz-questions-sample.json';
import allQuestions from '@/data/quiz-questions.json';

const staticQuestions: StaticQuizQuestion[] = allQuestions as StaticQuizQuestion[];
const sampleStaticQuestions: StaticQuizQuestion[] = sampleQuestions as StaticQuizQuestion[];

function getStaticQuizQuestions(limit?: number): StaticQuizQuestion[] {
  if (limit) {
    return staticQuestions.slice(0, limit);
  }
  return staticQuestions;
}

function getSampleQuestions(): StaticQuizQuestion[] {
  return sampleStaticQuestions;
}

function getAllQuestions(): StaticQuizQuestion[] {
  return staticQuestions;
}

function getQuestionById(id: number): StaticQuizQuestion | undefined {
  return staticQuestions.find(q => q.id === id);
}

function toFirestoreQuiz(sq: StaticQuizQuestion): QuizQuestion {
  const mapped: QuizQuestion = {
    q: sq.question,
    type: 'multiple',
  };

  if (sq.options && sq.options.length > 0) {
    mapped.options = sq.options;
  }

  return mapped;
}

export function toFirestoreQuizBatch(
  staticQuestions: StaticQuizQuestion[],
  title: string,
  description: string,
  creatorId: string,
  isPublic: boolean = true
): { title: string; description: string; creatorId: string; isPublic: boolean; questions: QuizQuestion[] } {
  return {
    title,
    description,
    creatorId,
    isPublic,
    questions: staticQuestions.map(sq => toFirestoreQuiz(sq)),
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomQuestions(count: number, excludeIds: number[] = []): StaticQuizQuestion[] {
  const available = staticQuestions.filter(q => !excludeIds.includes(q.id));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getQuestionsByCategory(category: string): StaticQuizQuestion[] {
  return staticQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

function getRandomCategories(count: number): string[] {
  const categories = Array.from(new Set(staticQuestions.map(q => q.category)));
  const shuffled = shuffleArray(categories);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getQuestionsByCategories(categories: string[], count: number): StaticQuizQuestion[] {
  const filtered = staticQuestions.filter(q => categories.includes(q.category));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

const categoryTitleMap: Record<string, string> = {
  "Food & Dates": "Food & Dates",
  "Daily Habits": "Daily Habits",
  "Communication": "Communication",
  "Romance & Affection": "Romance",
  "Spicy & Bold": "Spicy",
  "Travel Together": "Travel",
  "Money & Spending": "Money",
};

const titleFragments: Record<string, string[]> = {
  "Food & Dates": ["Taste Test", "Flavors of Love", "Dinner Date Questions"],
  "Daily Habits": ["Routine Check", "Daily Rituals", "Lazy Sunday Quiz"],
  "Communication": ["Talk It Out", "Word Riddles", "Silent Signals"],
  "Romance & Affection": ["Heart Check", "Love Languages", "Sweet Moments"],
  "Spicy & Bold": ["Dare to Know", "Bold Confessions", "Heat Check"],
  "Travel Together": ["Trip Vibe", "Wanderlust Quiz", "Passport Buddies"],
  "Money & Spending": ["Budget Buddies", "Spending Habits", "Wallet Watch"],
};

const descriptionFragments: Record<string, string[]> = {
  "Food & Dates": ["How well do you know each other's food cravings and date preferences?"],
  "Daily Habits": ["From morning routines to Sunday vibes — see who knows who better."],
  "Communication": ["Text habits, fight styles, and who says sorry first."],
  "Romance & Affection": ["Small gestures, big feelings, and the things that make hearts skip."],
  "Spicy & Bold": ["A little saucy, a lot of fun — how well can you read each other?"],
  "Travel Together": ["Packing lists, trip styles, and who gets lost more."],
  "Money & Spending": ["Who budgets better and who splurges without guilt?"],
};

const genericTitlePool = [
  "Couples Quiz",
  "Know Each Other Better",
  "Relationship Check-in",
  "Partner Challenge",
  "Love Quirks Quiz",
];

const genericDescPool = [
  "Fun questions for you both",
  "Test how well you really know each other",
  "Lighthearted couple questions for a cozy evening",
  "Discover new things about your partner",
  "A playful quiz about your relationship",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFallbackQuizMetadata(questions: StaticQuizQuestion[]): { title: string; description: string } {
  if (!questions || questions.length === 0) {
    return {
      title: pickRandom(genericTitlePool),
      description: pickRandom(genericDescPool),
    };
  }

  const categories = Array.from(new Set(questions.map(q => q.category)));
  if (categories.length === 1) {
    const key = categories[0];
    const titleOptions = titleFragments[key] || [`${key} Quiz`];
    const descOptions = descriptionFragments[key] || [pickRandom(genericDescPool)];
    return { title: pickRandom(titleOptions), description: pickRandom(descOptions) };
  }

  if (categories.length === 2) {
    const t1 = pickRandom(titleFragments[categories[0]] || [`${categories[0]}`]);
    const t2 = pickRandom(titleFragments[categories[1]] || [`${categories[1]}`]);
    const title = pickRandom([
      `${t1} & ${t2}`,
      `${categories[0]} Meets ${categories[1]}`,
      `The ${t1} Edition`,
    ]);
    const desc = pickRandom([
      descriptionFragments[categories[0]]?.[0] || genericDescPool[0],
      descriptionFragments[categories[1]]?.[0] || genericDescPool[0],
    ]);
    return { title, description: desc };
  }

  const title = pickRandom([
    `${categories[0]} Mix`,
    `The ${pickRandom(genericTitlePool)}`,
    `Mixed Bag Quiz`,
    `Random Couples Quiz`,
  ]);
  const description = pickRandom(genericDescPool);

  return { title, description };
}
