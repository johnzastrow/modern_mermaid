import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Pre-existing pragmatic `any` in DOM/Mermaid interop code. Kept as a
      // warning (visible tech debt) rather than a hard error; proper typing is
      // tracked as a separate cleanup task.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Context files intentionally co-export a provider component and its
      // hook; this only affects Fast Refresh DX, not correctness.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // New in react-hooks 7: flags synchronous setState inside effects. The
      // existing patterns work correctly; rewriting effect timing risks
      // behavior changes, so keep as a warning to revisit deliberately.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
