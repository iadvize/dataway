// @see https://jestjs.io/docs/en/configuration.html

module.exports = {
    roots: [
      '<rootDir>',
    ],
    testEnvironment: 'node',
    testRegex: [
      'tests-api/.*\\.ts$',
    ],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
  };