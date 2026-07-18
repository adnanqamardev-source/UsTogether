import os

replacements = [
  # Auth
  ("from './AuthProvider'", "from '@/components/providers'"),
  ("from \"@/components/AuthProvider\"", "from '@/components/providers'"),
  # Firebase direct
  ("from '@/lib/firebase'", "from '@/lib/firebase/client'"),
  # Shared components relative paths in feature dirs
  ("from '../shared/ErrorBoundary'", "from '@/components/shared/ErrorBoundary'"),
  ("from '../shared/BottomNav'", "from '@/components/shared/BottomNav'"),
  ("from '../shared/ChatFAB'", "from '@/components/shared/ChatFAB'"),
  ("from '../shared/Skeletons'", "from '@/components/shared/Skeletons'"),
  ("from '../quiz/QuizList'", "from '@/components/features/quiz/QuizList'"),
  ("from '../achievements/AchievementsPanel'", "from '@/components/features/achievements/AchievementsPanel'"),
  ("from '../chat/ChatDrawer'", "from '@/components/features/chat/ChatDrawer'"),
  ("from '../memories/MemoryBoard'", "from '@/components/features/memories/MemoryBoard'"),
  ("from '../session/ActiveSession'", "from '@/components/features/session/ActiveSession'"),
]

targets = []
for root, dirs, files in os.walk('.'):
  if 'node_modules' in root or root.startswith('./.git'):
    continue
  for f in files:
    if f.endswith('.tsx') or f.endswith('.ts'):
      targets.append(os.path.join(root, f))

for path in targets:
  with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
  original = content
  for old, new in replacements:
    content = content.replace(old, new)
  if content != original:
    with open(path, 'w', encoding='utf-8') as f:
      f.write(content)
    print('UPDATED', path)