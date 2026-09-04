import { doc, serverTimestamp, collection, query, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { AchievementDefinition } from '@/types';
const ACHIEVEMENT_DEFS: AchievementDefinition[] = [
  { id: 'first_quiz',      title: 'First Quiz',       description: 'Complete your first quiz together', icon: '🎯', category: 'participation' },
  { id: 'five_quizzes',    title: 'Quiz Marathon',    description: 'Complete 5 quizzes',               icon: '🏃', category: 'participation' },
  { id: 'ten_quizzes',    title: 'Quiz Masters',     description: 'Complete 10 quizzes',              icon: '👑', category: 'participation' },
  { id: 'streak_3',        title: 'Getting Started', description: 'Maintain a 3-day streak',          icon: '🔥', category: 'streak' },
  { id: 'streak_7',        title: 'Weekly Warrior',   description: 'Maintain a 7-day streak',         icon: '⭐', category: 'streak' },
  { id: 'streak_30',       title: 'Unstoppable',      description: 'Maintain a 30-day streak',         icon: '🏆', category: 'streak' },
  { id: 'first_session',   title: 'Team Players',     description: 'Finish your first session',        icon: '🤝', category: 'milestone' },
  { id: 'partner_paired',  title: 'Two of Us',        description: 'Pair with your partner',           icon: '💑', category: 'social' },
];

type AchievementContext = {
  quizzesCompleted?: number;
  currentStreak?: number;
  sessionsFinished?: number;
  paired?: boolean;
};

function meetsCondition(def: AchievementDefinition, ctx: AchievementContext): boolean {
  switch (def.id) {
    case 'first_quiz':
      return (ctx.quizzesCompleted ?? 0) >= 1;
    case 'five_quizzes':
      return (ctx.quizzesCompleted ?? 0) >= 5;
    case 'ten_quizzes':
      return (ctx.quizzesCompleted ?? 0) >= 10;
    case 'streak_3':
      return (ctx.currentStreak ?? 0) >= 3;
    case 'streak_7':
      return (ctx.currentStreak ?? 0) >= 7;
    case 'streak_30':
      return (ctx.currentStreak ?? 0) >= 30;
    case 'first_session':
      return (ctx.sessionsFinished ?? 0) >= 1;
    case 'partner_paired':
      return (ctx.paired ?? false) === true;
    default:
      return false;
  }
}

export async function getEligibleAchievements(userId: string, ctx: AchievementContext): Promise<AchievementDefinition[]> {
  const q = query(collection(db, 'achievements', userId, 'items'));
  const snapshot = await getDocs(q);
  const existingIds = new Set(snapshot.docs.map((d) => d.id));

  return ACHIEVEMENT_DEFS.filter((def) => meetsCondition(def, ctx) && !existingIds.has(def.id));
}

export async function checkAndAwardAchievements(userId: string, ctx: AchievementContext): Promise<string[]> {
  return runTransaction(db, async (transaction) => {
    const col = collection(db, 'achievements', userId, 'items');
    const snapshot = await getDocs(query(col));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));

    const eligible = ACHIEVEMENT_DEFS.filter((def) => meetsCondition(def, ctx) && !existingIds.has(def.id));

    const unlocked: string[] = [];
    for (const def of eligible) {
      const itemRef = doc(db, 'achievements', userId, 'items', def.id);
      transaction.set(itemRef, {
        title: def.title,
        description: def.description,
        unlockedAt: serverTimestamp(),
      });
      unlocked.push(def.id);
    }
    return unlocked;
  });
}