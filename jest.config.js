/** @type {import('jest').Config} */
export default {
  // Ambiente de teste
  testEnvironment: 'jsdom',
  
  // Configuração do TypeScript
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  
  // Mapeamento de módulos para facilitar imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/setupTests.ts'
  ],
  
  // Ignorar arquivos
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  
  // Configurações adicionais
  clearMocks: true,
  restoreMocks: true
};