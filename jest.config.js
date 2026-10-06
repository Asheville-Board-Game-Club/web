export default {
  roots: ['<rootDir>/src/ts'],
  // ts-jest compiles to CommonJS for Jest (node10 resolution is deprecated in TS 6); esbuild builds the browser bundle.
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node10', ignoreDeprecations: '6.0', isolatedModules: true } }],
  },
  testEnvironment: 'node',
};
