/* eslint-disable */
export default {
  displayName: 'c4-model',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['/node_modules/.pnpm/(?!@faker-js\\+faker)'],
  coverageDirectory: '../../coverage/libs/c4-model',
};
