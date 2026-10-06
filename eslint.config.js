import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['_site/', '.yarn/'] },
  js.configs.recommended,
  { files: ['src/ts/**/*.ts'], extends: [tseslint.configs.strict], languageOptions: { globals: globals.browser } },
  { files: ['*.js', 'src/_data/**/*.js'], languageOptions: { globals: globals.node } },
);
