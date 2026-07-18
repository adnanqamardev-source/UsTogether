const fs = require('fs');
const path = require('path');

const shims = {
  components: [
    ['AuthWrapper.tsx', "export { default } from '@/components/auth/AuthWrapper';"],
    ['ErrorBoundary.tsx', "export { default } from '@/components/shared/ErrorBoundary';"],
    ['Skeletons.tsx', "export * from '@/components/shared/Skeletons';"],
    ['BottomNav.tsx', "export { default } from '@/components/shared/BottomNav';"],
    ['ChatFAB.tsx', "export { default } from '@/components/shared/ChatFAB';"],
    ['LandingSections.tsx', "export { default } from '@/components/shared/LandingSections';"],
    ['CoupleDashboard.tsx', "export { default } from '@/components/features/couple/CoupleDashboard';"],
    ['Dashboard.tsx', "export { default } from '@/components/features/couple/Dashboard';"],
    ['StreakCounter.tsx', "export { default } from '@/components/features/couple/StreakCounter';"],
    ['AchievementsPanel.tsx', "export { default } from '@/components/features/achievements/AchievementsPanel';"],
    ['MemoryBoard.tsx', "export { default } from '@/components/features/memories/MemoryBoard';"],
    ['ActiveSession.tsx', "export { default } from '@/components/features/session/ActiveSession';"],
    ['ChatDrawer.tsx', "export { default } from '@/components/features/chat/ChatDrawer';"],
    ['QuizList.tsx', "export { default } from '@/components/features/quiz/QuizList';"],
    ['QuizCard.tsx', "export { default } from '@/components/features/quiz/QuizCard';"],
    ['QuizCardSkeleton.tsx', "export { default } from '@/components/features/quiz/QuizCardSkeleton';"],
  ],
  lib: [
    ['firebase.ts', "export * from '@/lib/firebase';"],
    ['admin.ts', "export * from '@/lib/server/admin';"],
    ['api-auth.ts', "export * from '@/lib/server/api-auth';"],
    ['ratelimit.ts', "export * from '@/lib/server/ratelimit';"],
    ['firestore-helpers.ts', "export * from '@/lib/shared/firestore-helpers';"],
    ['streak.ts', "export * from '@/lib/shared/streak';"],
    ['achievements.ts', "export * from '@/lib/shared/achievements';"],
    ['quiz-data.ts', "export * from '@/lib/shared/quiz-data';"],
    ['storage.ts', "export * from '@/lib/shared/storage';"],
    ['input-validation.ts', "export * from '@/lib/shared/input-validation';"],
    ['firestore-errors.ts', "export * from '@/lib/shared/firestore-errors';"],
  ],
};

for (const [folder, entries] of Object.entries(shims)) {
  for (const [name, content] of entries) {
    const filePath = path.join(process.cwd(), folder, name);
    fs.writeFileSync(filePath, content + '\n');
    console.log(`WROTE: ${folder}/${name}`);
  }
}

console.log('Done.');