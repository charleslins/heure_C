import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';

// Mock do supabase
jest.mock('@/utils/supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock do getUserInitials
jest.mock('@/utils/stringUtils', () => ({
  getUserInitials: jest.fn((name: string) => name.charAt(0).toUpperCase())
}));

/**
 * Testes para o hook useAuth
 * Verifica autenticação, carregamento de perfil e logout
 */
describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup padrão do mock
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    });
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
    });
  });

  /**
   * Teste do estado inicial
   */
  it('deve inicializar com estado correto', async () => {
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    expect(result.current.currentUser).toBeNull();
    expect(typeof result.current.logout).toBe('function');
  });

  /**
   * Teste de usuário não autenticado
   */
  it('deve definir currentUser como null quando não há sessão', async () => {
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(result.current.isLoadingAuth).toBe(false);
      });
    });
    
    expect(result.current.currentUser).toBe(null);
  });

  /**
   * Teste de usuário autenticado com perfil
   */
  it('deve carregar usuário quando há sessão válida', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        role: 'user'
      }
    };
    
    const mockProfile = {
      role: 'admin',
      name: 'Test User Profile',
      email: 'test@example.com',
      photo_url: 'https://example.com/photo.jpg'
    };
    
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    });
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      })
    });
    
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(result.current.isLoadingAuth).toBe(false);
      });
    });
    
    expect(result.current.currentUser).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User Profile',
      role: 'admin',
      photoUrl: 'https://example.com/photo.jpg',
      initials: 'T'
    });
  });

  /**
   * Teste de fallback quando perfil não existe
   */
  it('deve usar dados da sessão quando perfil não existe', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        role: 'user'
      }
    };
    
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    });
    
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(result.current.isLoadingAuth).toBe(false);
      });
    });
    
    expect(result.current.currentUser).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      photoUrl: undefined,
      initials: 'T'
    });
  });

  /**
   * Teste da função logout
   */
  it('deve chamar signOut quando logout é executado', async () => {
    mockSupabase.auth.signOut = jest.fn().mockResolvedValue({ error: null });
    
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(result.current.isLoadingAuth).toBe(false);
      });
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  /**
   * Teste de erro no logout
   */
  it('deve lidar com erro no logout', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const logoutError = new Error('Logout failed');
    
    mockSupabase.auth.signOut = jest.fn().mockResolvedValue({ error: logoutError });
    
    let result: any;
    
    await act(async () => {
      const hookResult = renderHook(() => useAuth());
      result = hookResult.result;
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(result.current.isLoadingAuth).toBe(false);
      });
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging out:', logoutError);
    
    consoleErrorSpy.mockRestore();
  });
});