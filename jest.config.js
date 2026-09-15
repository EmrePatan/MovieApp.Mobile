/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/api/**/*.test.ts',
        '<rootDir>/__tests__/auth/**/*.test.ts',
        '<rootDir>/__tests__/utils/**/*.test.ts',
        '<rootDir>/__tests__/hooks/**/*.test.ts',
        '<rootDir>/__tests__/theme/**/*.test.ts',
        '<rootDir>/__tests__/features/**/*.test.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^expo/virtual/env$': '<rootDir>/__mocks__/expo-virtual-env.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': [
          'babel-jest',
          {
            presets: ['babel-preset-expo'],
          },
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.pnpm|expo|@expo|expo-modules-core|@expo-google-fonts|react-native|@react-native|@react-navigation)/)',
      ],
    },
    {
      displayName: 'ui',
      preset: '@react-native/jest-preset',
      testMatch: [
        '<rootDir>/__tests__/auth/**/*.test.tsx',
        '<rootDir>/__tests__/features/**/*.test.tsx',
        '<rootDir>/__tests__/components/**/*.test.tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/jest.setup.ui.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^expo/virtual/env$': '<rootDir>/__mocks__/expo-virtual-env.js',
        '^react-native/setup-env$': '<rootDir>/__mocks__/react-native-setup-env.js',
      },
    },
  ],
};
