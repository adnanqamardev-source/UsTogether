const fs = require('fs');
const path = require('path');

const moves = [
  ['components/AchievementsPanel.tsx', 'components/features/achievements/AchievementsPanel.tsx'],
  ['components/ActiveSession.tsx', 'components/features/session/ActiveSession.tsx'],
  ['components/ChatDrawer.tsx', 'components/features/chat/ChatDrawer.tsx'],
  ['components/CoupleDashboard.tsx', 'components/features/couple/CoupleDashboard.tsx'],
  ['components/Dashboard.tsx', 'components/features/couple/Dashboard.tsx'],
  ['components/MemoryBoard.tsx', 'components/features/memories/MemoryBoard.tsx'],
  ['components/QuizCard.tsx', 'components/features/quiz/QuizCard.tsx'],
  ['components/QuizCardSkeleton.tsx', 'components/features/quiz/QuizCardSkeleton.tsx'],
  ['components/QuizList.tsx', 'components/features/quiz/QuizList.tsx'],
  ['components/StreakCounter.tsx', 'components/features/couple/StreakCounter.tsx'],
  ['components/ErrorBoundary.tsx', 'components/shared/ErrorBoundary.tsx'],
  ['components/Skeletons.tsx', 'components/shared/Skeletons.tsx'],
  ['components/BottomNav.tsx', 'components/shared/BottomNav.tsx'],
  ['components/ChatFAB.tsx', 'components/shared/ChatFAB.tsx'],
  ['components/LandingSections.tsx', 'components/shared/LandingSections.tsx'],
  ['components/AuthProvider.tsx', 'components/providers/AuthProvider.tsx'],
  ['components/AuthWrapper.tsx', 'components/auth/AuthWrapper.tsx'],
  ['lib/admin.ts', 'lib/server/admin.ts'],
  ['lib/api-auth.ts', 'lib/server/api-auth.ts'],
  ['lib/ratelimit.ts', 'lib/server/ratelimit.ts'],
  ['lib/firebase.ts', 'lib/firebase/client.ts'],
  ['lib/firestore-helpers.ts', 'lib/shared/firestore-helpers.ts'],
  ['lib/streak.ts', 'lib/shared/streak.ts'],
  ['lib/achievements.ts', 'lib/shared/achievements.ts'],
  ['lib/quiz-data.ts', 'lib/shared/quiz-data.ts'],
  ['lib/storage.ts', 'lib/shared/storage.ts'],
  ['lib/input-validation.ts', 'lib/shared/input-validation.ts'],
  ['lib/firestore-errors.ts', 'lib/shared/firestore-errors.ts'],
];

for (const [from, to] of moves) {
  const src = path.join(process.cwd(), from);
  const dest = path.join(process.cwd(), to);
  if (!fs.existsSync(src)) {
    console.error(`MISSING: ${from}`);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log(`MOVED: ${from} -> ${to}`);
}

console.log('Done.');