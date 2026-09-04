import os

files = [
  'app/providers.tsx',
  'app/page.tsx',
  'app/dashboard/page.tsx',
  'app/stats/page.tsx',
  'hooks/useFirestoreCollection.ts',
  'hooks/useFirestoreDocument.ts',
  'tests/unit/authprovider.test.ts',
]

for rel in files:
  if not os.path.exists(rel):
    continue
  with open(rel, 'r', encoding='utf-8') as f:
    content = f.read()
  original = content
  content = content.replace("from '@/components/AuthProvider'", "from '@/components/providers'")
  content = content.replace("from '@/lib/firebase'", "from '@/lib/firebase/client'")
  if content != original:
    with open(rel, 'w', encoding='utf-8') as f:
      f.write(content)
    print('UPDATED', rel)
  else:
    print('NO CHANGE', rel)