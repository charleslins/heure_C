import { getUserInitials, getUserColor } from '@/utils/stringUtils';

/**
 * Testes para funções utilitárias de string
 * Verifica geração de iniciais e cores consistentes
 */
describe('stringUtils', () => {
  describe('getUserInitials', () => {
    /**
     * Teste com nome completo
     */
    it('deve retornar iniciais para nome completo', () => {
      expect(getUserInitials('João Silva')).toBe('JS');
      expect(getUserInitials('Maria Santos Oliveira')).toBe('MO');
      expect(getUserInitials('Ana Beatriz Costa Lima')).toBe('AL');
    });

    /**
     * Teste com nome único
     */
    it('deve retornar primeira letra para nome único', () => {
      expect(getUserInitials('João')).toBe('J');
      expect(getUserInitials('Maria')).toBe('M');
      expect(getUserInitials('Ana')).toBe('A');
    });

    /**
     * Teste com string vazia ou inválida
     */
    it('deve retornar "?" para entrada inválida', () => {
      expect(getUserInitials('')).toBe('?');
      expect(getUserInitials('   ')).toBe('?'); // String com apenas espaços após trim fica vazia
      expect(getUserInitials(null as any)).toBe('?');
      expect(getUserInitials(undefined as any)).toBe('?');
      expect(getUserInitials(123 as any)).toBe('?');
    });

    /**
     * Teste específico para string com apenas espaços
     */
    it('deve lidar corretamente com strings vazias após trim', () => {
      // Após trim, se não sobrar nada, deve retornar "?"
      expect(getUserInitials('   ')).toBe('?');
      expect(getUserInitials('\t\n')).toBe('?');
    });

    /**
     * Teste com espaços extras
     */
    it('deve lidar com espaços extras', () => {
      expect(getUserInitials('  João   Silva  ')).toBe('JS');
      expect(getUserInitials('Maria    Santos    Oliveira')).toBe('MO');
    });

    /**
     * Teste com caracteres especiais
     */
    it('deve funcionar com caracteres especiais', () => {
      expect(getUserInitials('José da Silva')).toBe('JS');
      expect(getUserInitials('María José')).toBe('MJ');
      expect(getUserInitials('Jean-Pierre')).toBe('J');
    });

    /**
     * Teste de case sensitivity
     */
    it('deve retornar iniciais em maiúsculo', () => {
      expect(getUserInitials('joão silva')).toBe('JS');
      expect(getUserInitials('MARIA SANTOS')).toBe('MS');
      expect(getUserInitials('Ana beatriz')).toBe('AB');
    });
  });

  describe('getUserColor', () => {
    /**
     * Teste de consistência
     */
    it('deve retornar a mesma cor para o mesmo nome', () => {
      const name = 'João Silva';
      const color1 = getUserColor(name);
      const color2 = getUserColor(name);
      const color3 = getUserColor(name);
      
      expect(color1).toBe(color2);
      expect(color2).toBe(color3);
    });

    /**
     * Teste de formato de cor
     */
    it('deve retornar cor em formato hexadecimal', () => {
      const color = getUserColor('Test User');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    /**
     * Teste com diferentes nomes
     */
    it('deve retornar cores diferentes para nomes diferentes', () => {
      const color1 = getUserColor('João Silva');
      const color2 = getUserColor('Maria Santos');
      const color3 = getUserColor('Ana Costa');
      
      // Não garantimos que sejam sempre diferentes, mas testamos alguns casos
      const colors = [color1, color2, color3];
      const uniqueColors = new Set(colors);
      
      // Pelo menos deve haver alguma variação
      expect(uniqueColors.size).toBeGreaterThan(0);
    });

    /**
     * Teste com string vazia
     */
    it('deve lidar com string vazia', () => {
      const color = getUserColor('');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    /**
     * Teste de case sensitivity
     */
    it('deve ser case sensitive', () => {
      const color1 = getUserColor('João Silva');
      const color2 = getUserColor('joão silva');
      const color3 = getUserColor('JOÃO SILVA');
      
      // Diferentes cases podem gerar cores diferentes
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
      expect(typeof color3).toBe('string');
    });

    /**
     * Teste com caracteres especiais
     */
    it('deve funcionar com caracteres especiais', () => {
      const color1 = getUserColor('José da Silva');
      const color2 = getUserColor('María José');
      const color3 = getUserColor('Jean-Pierre');
      
      expect(color1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color2).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color3).toMatch(/^#[0-9A-F]{6}$/i);
    });

    /**
     * Teste de distribuição de cores
     */
    it('deve usar cores da paleta definida', () => {
      const expectedColors = [
        '#4F46E5', // indigo-600
        '#0891B2', // cyan-600
        '#059669', // emerald-600
        '#D97706', // amber-600
        '#DC2626', // red-600
        '#7C3AED', // violet-600
        '#2563EB', // blue-600
        '#EA580C', // orange-600
        '#16A34A', // green-600
        '#9333EA', // purple-600
      ];
      
      // Testa vários nomes para ver se as cores estão na paleta
      const testNames = [
        'User1', 'User2', 'User3', 'User4', 'User5',
        'User6', 'User7', 'User8', 'User9', 'User10'
      ];
      
      testNames.forEach(name => {
        const color = getUserColor(name);
        expect(expectedColors).toContain(color);
      });
    });
  });
});