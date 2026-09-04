declare module 'redis';
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
  lastActiveDate?: string; // ISO date "YYYY-MM-DD"
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
  readBy?: string[];
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

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;          // emoji string
  category: 'participation' | 'streak' | 'milestone' | 'social';
}

export interface PairingCode {
  userId: string;
  createdAt: number;
}

export interface PhotoUploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
}

export interface MemoryPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  sessionId: string;
  coupleId: string;
  uploadedBy: string;
  uploadedAt: number;
  createdAt: number;
}

export interface Milestone {
  id: string;
  coupleId: string;
  type: 'session_completed' | 'streak_7' | 'streak_30' | 'quiz_milestone' | 'anniversary';
  title: string;
  description?: string;
  date: number;
  relatedSessionId?: string;
  icon?: string;
}
