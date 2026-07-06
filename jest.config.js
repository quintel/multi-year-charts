const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test
  // environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias'
  // to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // jsdom's default export conditions include "browser", which wins over "require" in jose's
  // package.json exports map and resolves to its ESM-only browser bundle — unusable under Jest's
  // CJS transform. Clearing the custom conditions falls back to plain "require"/"default".
  testEnvironmentOptions: {
    customExportConditions: [],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which
// is async
module.exports = createJestConfig(customJestConfig);
