import os

shims = {
    'components/AuthProvider.tsx': "export { default } from '@/components/providers/AuthProvider';\nexport { useAuth } from '@/components/providers';\n",
    'components/AuthWrapper.tsx': "export { default } from '@/components/auth/AuthWrapper';\n",
    'components/ErrorBoundary.tsx': "export { default } from '@/components/shared/ErrorBoundary';\n",
    'components/Skeletons.tsx': "export * from '@/components/shared/Skeletons';\n",
    'components/BottomNav.tsx': "export { default } from '@/components/shared/BottomNav';\n",
    'components/ChatFAB.tsx': "export { default } from '@/components/shared/ChatFAB';\n",
    'components/LandingSections.tsx': "export { default } from '@/components/shared/LandingSections';\n",
    'components/CoupleDashboard.tsx': "export { default } from '@/components/features/couple/CoupleDashboard';\n",
    'components/Dashboard.tsx': "export { default } from '@/components/features/couple/Dashboard';\n",
    'components/StreakCounter.tsx': "export { default } from '@/components/features/couple/StreakCounter';\n",
    'components/AchievementsPanel.tsx': "export { default } from '@/components/features/achievements/AchievementsPanel';\n",
    'components/MemoryBoard.tsx': "export { default } from '@/components/features/memories/MemoryBoard';\n",
    'components/ActiveSession.tsx': "export { default } from '@/components/features/session/ActiveSession';\n",
    'components/ChatDrawer.tsx': "export { default } from '@/components/features/chat/ChatDrawer';\n",
    'components/QuizList.tsx': "export { default } from '@/components/features/quiz/QuizList';\n",
    'components/QuizCard.tsx': "export { default } from '@/components/features/quiz/QuizCard';\n",
    'components/QuizCardSkeleton.tsx': "export { default } from '@/components/features/quiz/QuizCardSkeleton';\n",
    'lib/firebase.ts': "export * from './firebase';\n",
    'lib/admin.ts': "export * from './server/admin';\n",
    'lib/api-auth.ts': "export * from './server/api-auth';\n",
    'lib/ratelimit.ts': "export * from './server/ratelimit';\n",
    'lib/firestore-helpers.ts': "export * from './shared/firestore-helpers';\n",
    'lib/streak.ts': "export * from './shared/streak';\n",
    'lib/achievements.ts': "export * from './shared/achievements';\n",
    'lib/quiz-data.ts': "export * from './shared/quiz-data';\n",
    'lib/storage.ts': "export * from './shared/storage';\n",
    'lib/input-validation.ts': "export * from './shared/input-validation';\n",
    'lib/firestore-errors.ts': "export * from './shared/firestore-errors';\n",
}

for path, content in shims.items():
    with open(path, 'w') as f:
        f.write(content)
print('Updated shims.')