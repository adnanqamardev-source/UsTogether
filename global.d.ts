declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

export interface UserProfile {
  email: string;
  displayName?: string;
  points: number;
  pairedCoupleId?: string;
  streak?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Couple {
  user1Id: string;
  user2Id: string;
  coupleName?: string;
  status: 'pending' | 'active';
  totalScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  q: string;
  type: 'text' | 'multiple';
  options?: string[];
}

export interface StaticQuizQuestion {
  id: number;
  category: string;
  question: string;
  type: 'mcq';
  options: string[];
  text_fallback_allowed: boolean;
}

export interface Quiz {
  creatorId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  isPublic: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Session {
  coupleId: string;
  type: 'quiz' | 'minigame';
  status: 'waiting' | 'playing' | 'finished';
  state: Record<string, any>;
  quizTitle?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
}

export interface PairingCode {
  userId: string;
  createdAt: number;
}