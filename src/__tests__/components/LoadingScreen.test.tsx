import React from 'react';
import { render } from '@testing-library/react';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Testes para o componente LoadingScreen
 * Verifica se o componente renderiza corretamente com diferentes props
 */
describe('LoadingScreen', () => {
  /**
   * Teste básico de renderização
   */
  it('deve renderizar sem erros', () => {
    const { container } = render(<LoadingScreen />);
    
    // Verifica se o container principal existe
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveAttribute('aria-live', 'polite');
    expect(mainDiv).toHaveAttribute('aria-busy', 'true');
  });

  /**
   * Teste com mensagem customizada
   */
  it('deve renderizar com mensagem customizada quando fornecida', () => {
    const customMessage = 'Carregando dados...';
    const { container } = render(<LoadingScreen message={customMessage} />);
    
    // Verifica se a mensagem customizada está presente
    expect(container.textContent).toContain(customMessage);
  });

  /**
   * Teste de acessibilidade
   */
  it('deve ter atributos de acessibilidade corretos', () => {
    const { container } = render(<LoadingScreen />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveAttribute('aria-live', 'polite');
    expect(mainDiv).toHaveAttribute('aria-busy', 'true');
    
    // Verifica se o SVG tem aria-hidden
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  /**
   * Teste de classes CSS
   */
  it('deve ter as classes CSS corretas', () => {
    const { container } = render(<LoadingScreen />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'bg-slate-100',
      'p-4'
    );
  });

  /**
   * Teste de animação do spinner
   */
  it('deve ter animação de spin no ícone', () => {
    const { container } = render(<LoadingScreen />);
    
    // Busca o SVG pela classe animate-spin
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });
});