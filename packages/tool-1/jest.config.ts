const jestConfig = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', {}],
  }
}

export default jestConfig
