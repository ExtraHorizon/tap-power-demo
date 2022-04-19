module.exports = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  transform: {
    '\\.ts$': 'ts-jest'
  },
  testRegex: '/tests/.*\\.(ts|js)$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/__helpers__/'
  ],
  reporters: [
    'default',
    'jest-junit'
  ]
}
