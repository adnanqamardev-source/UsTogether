import os
import sys

roots = ['components', 'lib']
removed = []
for root_dir in roots:
  if not os.path.isdir(root_dir):
    continue
  for entry in os.listdir(root_dir):
    path = os.path.join(root_dir, entry)
    if not os.path.isfile(path):
      continue
    if not (path.endswith('.tsx') or path.endswith('.ts') or path.endswith('.json')):
      continue
    if path == 'lib/firebase-applet-config.json':
      continue
    # Only remove shim-like top-level files that shadow moved modules
    if entry.endswith('.tsx') or (entry.endswith('.ts') and entry != 'tsconfig.json'):
      os.remove(path)
      removed.append(path)
      print(f'REMOVED: {path}')

print('Removed:', removed)