import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: ['dist/**/*', '.next/**/*', 'node_modules/**/*']
  },
  {
    extends: [...next],
    plugins: {
      'react-hooks': reactHooksPlugin,
      'react': reactPlugin,
    },
    rules: {
      // Re-enable React hook rules to catch dependency issues and side-effect bugs.
      // If specific files need exceptions, use inline eslint-disable comments.
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn"
    }
  },
  firebaseRulesPlugin.configs['flat/recommended']
]);
