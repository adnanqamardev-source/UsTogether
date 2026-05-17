import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: ['dist/**/*', '.next/**/*', 'node_modules/**/*']
  },
  {
    extends: [...next],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off"
    }
  },
  firebaseRulesPlugin.configs['flat/recommended']
]);
