const fs = require('fs');
const path = require('path');

const targets = [
  'components/features/quiz',
  'components/features/session',
  'components/features/chat',
  'components/features/couple',
  'components/features/achievements',
  'components/features/memories',
  'components/shared',
  'components/providers',
  'components/auth',
  'lib/firebase',
  'lib/server',
  'lib/shared',
];

let changed = 0;

for (const dir of targets) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) continue;
  const entries = fs.readdirSync(full, { recursive: true });
  for (const entry of entries) {
    const filePath = path.join(full, entry);
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    content = content.replace(/from\s+['"]\.\.\/global\.d['"]/g, "from '@/types'");
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      changed++;
      console.log(`UPDATED: ${filePath}`);
    }
  }
}

console.log(`Updated ${changed} files.`);