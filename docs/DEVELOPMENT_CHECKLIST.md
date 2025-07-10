# Checklist de Desenvolvimento

## Antes de Começar uma Nova Feature/Fix

1. **Verificar Cursorrules**
   - [ ] Ler `.cursorrules` relacionadas ao tipo de alteração
   - [ ] Verificar exemplos e padrões recomendados
   - [ ] Identificar regras específicas para o tipo de código

2. **Verificar MCP Supabase**
   - [ ] Verificar tipos disponíveis em `src/types/supabase.ts`
   - [ ] Entender estrutura das tabelas envolvidas
   - [ ] Identificar relacionamentos necessários

3. **Estrutura do Código**
   - [ ] Collection para acesso ao banco
   - [ ] Presenter para lógica de negócios
   - [ ] Componentes React usando tipos corretos
   - [ ] Hooks personalizados quando necessário

## Durante o Desenvolvimento

1. **Tipagem**
   ```typescript
   // Sempre usar tipos do Supabase
   import { Database } from '../types/supabase';
   type DbEntity = Database['public']['Tables']['table_name']['Row'];
   ```

2. **Queries**
   ```typescript
   // Sempre usar retornos tipados
   const { data, error } = await supabase
     .from('table')
     .select('*')
     .returns<DbEntity[]>();
   ```

3. **Tratamento de Erros**
   ```typescript
   try {
     // Operação
     if (error) throw error;
   } catch (err) {
     console.error('Descrição clara:', err);
     throw err;
   }
   ```

## Antes do Commit

1. **Verificação de Tipos**
   - [ ] Executar `npm run type-check`
   - [ ] Resolver todos os erros de tipagem
   - [ ] Verificar warnings do TypeScript

2. **Linting**
   - [ ] Executar `npm run lint`
   - [ ] Resolver todos os erros de lint
   - [ ] Seguir padrões de código

3. **Testes**
   - [ ] Executar testes unitários
   - [ ] Executar testes de integração
   - [ ] Verificar cobertura

## Padrões de Código

1. **Nomes de Tipos**
   - Prefixo `Db` para tipos do Supabase
   - Sufixo `Props` para props de componentes
   - Sufixo `DTO` para objetos de transferência

2. **Estrutura de Arquivos**
   ```
   src/
   ├── collections/    # Acesso ao banco
   ├── presenters/    # Lógica de negócios
   ├── hooks/         # Hooks React
   └── components/    # Componentes UI
   ```

3. **Importações**
   - Imports absolutos para módulos
   - Imports relativos para arquivos locais
   - Agrupar imports por tipo

## Recursos

1. **Documentação**
   - [Supabase MCP](docs/SUPABASE_MCP.md)
   - [Cursorrules](docs/CURSORRULES.md)
   - [TypeScript](https://www.typescriptlang.org/docs/)

2. **Ferramentas**
   - VS Code com extensões recomendadas
   - ESLint + Prettier
   - TypeScript 