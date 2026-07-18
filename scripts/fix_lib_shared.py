import os

files = [
  'lib/shared/achievements.ts',
  'lib/shared/firestore-helpers.ts',
  'lib/shared/storage.ts',
  'lib/shared/streak.ts',
]

for rel in files:
  with open(rel, 'r', encoding='utf-8') as f:
    content = f.read()
  content = content.replace("from './firebase'", "from '@/lib/firebase'")
  with open(rel, 'w', encoding='utf-8') as f:
    f.write(content)
  print('UPDATED', rel)