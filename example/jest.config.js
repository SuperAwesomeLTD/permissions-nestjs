module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*\\.(test|spec|e2e-spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
