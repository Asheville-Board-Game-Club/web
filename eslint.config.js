import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['_site/', '.yarn/'] },
  js.configs.recommended,
  { files: ['src/js/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['*.js', 'src/_data/**/*.js'], languageOptions: { globals: globals.node } },
];
