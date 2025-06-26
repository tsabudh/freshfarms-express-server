// jest.config.ts
import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

export default {
  testEnvironment: 'node',
  // testEnvironment: '<rootDir>/jest/mongo-environment.ts',
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  globalSetup: "<rootDir>/jest/jestGlobalSetup.ts",
  globalTeardown: "<rootDir>/jest/jestGlobalTeardown.ts",
  // setupFilesAfterEnv: ["<rootDir>/jest/setup.ts"],

};
