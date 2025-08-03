module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Disable strict rules for this project
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'off', // TypeScript handles this
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'dist/',
    'web-build/',
    '*.d.ts',
    '**/*.ts',
    '**/*.tsx',
    '__tests__/**',
    'src/**/*.ts',
    'src/**/*.tsx',
    'jest.setup.js',
    'metro.config.js',
    'babel.config.js',
  ],
  globals: {
    React: 'readonly',
    JSX: 'readonly',
    require: 'readonly',
    module: 'readonly',
    process: 'readonly',
    __DEV__: 'readonly',
  },
};