import type { StaticQuizQuestion, QuizQuestion } from '@/global.d.ts';
import sampleQuestions from '@/data/quiz-questions-sample.json';
import allQuestions from '@/data/quiz-questions.json';

const staticQuestions: StaticQuizQuestion[] = allQuestions as StaticQuizQuestion[];
const sampleStaticQuestions: StaticQuizQuestion[] = sampleQuestions as StaticQuizQuestion[];

export function getStaticQuizQuestions(limit?: number): StaticQuizQuestion[] {
  if (limit) {
    return staticQuestions.slice(0, limit);
  }
  return staticQuestions;
}

export function getSampleQuestions(): StaticQuizQuestion[] {
  return sampleStaticQuestions;
}

export function getAllQuestions(): StaticQuizQuestion[] {
  return staticQuestions;
}

export function getQuestionById(id: number): StaticQuizQuestion | undefined {
  return staticQuestions.find(q => q.id === id);
}

export function toFirestoreQuiz(sq: StaticQuizQuestion): QuizQuestion {
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

export function shuffleArray<T>(array: T[]): T[] {
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

export function getQuestionsByCategory(category: string): StaticQuizQuestion[] {
  return staticQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

export function getRandomCategories(count: number): string[] {
  const categories = Array.from(new Set(staticQuestions.map(q => q.category)));
  const shuffled = shuffleArray(categories);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getQuestionsByCategories(categories: string[], count: number): StaticQuizQuestion[] {
  const filtered = staticQuestions.filter(q => categories.includes(q.category));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}