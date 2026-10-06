// Run tests in a zone east of UTC and far from Asheville so code that leans on the machine's time zone fails here.
process.env.TZ = 'Asia/Tokyo';

export default {
  roots: ['<rootDir>/src/ts'],
  // ts-jest compiles to CommonJS for Jest (node10 resolution is deprecated in TS 6); esbuild builds the browser bundle.
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node10', ignoreDeprecations: '6.0', isolatedModules: true } }],
  },
  testEnvironment: 'node',
};
