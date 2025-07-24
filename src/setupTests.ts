// Configuração global para testes
import '@testing-library/jest-dom';

// Mock do Supabase para testes
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }
}));

// Mock do i18next para testes
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn()
    }
  })
}));

// Mock do framer-motion para evitar problemas de animação nos testes
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}));

// Configuração global do window.matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});