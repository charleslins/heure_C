# Supabase MCP (Model Control Protocol)

**Data de Criação:** 23 de Julho de 2024  
**Última Atualização:** 24 de Janeiro de 2025  
**Versão:** 1.0  
**Status:** Documentação Técnica

## Configuração

O projeto utiliza o MCP do Supabase para garantir tipagem forte e validação em tempo real das queries. A configuração está no arquivo `.mcp.json` na raiz do projeto.

## Geração de Tipos

Os tipos são gerados automaticamente a partir do schema do banco de dados:

```bash
# Gerar tipos manualmente
npm run generate-types

# Os tipos são gerados automaticamente durante:
npm run dev    # Desenvolvimento
npm run build  # Build de produção
```

## Uso dos Tipos

### Em Queries do Supabase

```typescript
import { Database } from "../types/supabase";

// Exemplo de query tipada
const { data: users } = await supabase
  .from("users")
  .select("*")
  .returns<Database["public"]["Tables"]["users"]["Row"][]>();

// Exemplo de inserção tipada
const { data: newUser } = await supabase
  .from("users")
  .insert({
    first_name: "João",
    last_name: "Silva",
    email: "joao@example.com",
    role_id: "123",
  })
  .select()
  .returns<Database["public"]["Tables"]["users"]["Row"]>();
```

### Em Componentes React

```typescript
import { Database } from "../types/supabase";

type User = Database["public"]["Tables"]["users"]["Row"];

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  // ...
};
```

## Benefícios

1. **Autocompleção**
   - Nomes de tabelas
   - Nomes de colunas
   - Tipos de dados
   - Relacionamentos

2. **Validação em Tempo Real**
   - Erros de tipo
   - Queries inválidas
   - Dados incorretos

3. **Segurança**
   - Validação de tipos
   - Prevenção de erros
   - Consistência de dados

## Boas Práticas

1. **Sempre Use Tipos**
   - Evite `any`
   - Use os tipos gerados
   - Defina interfaces baseadas nos tipos

2. **Mantenha os Tipos Atualizados**
   - Execute `generate-types` após alterações no schema
   - Verifique os tipos após migrações
   - Atualize componentes que usam tipos alterados

3. **Validação**
   - Use o ESLint para garantir o uso dos tipos
   - Verifique erros de tipo antes do commit
   - Mantenha o MCP atualizado

## Troubleshooting

### Tipos Desatualizados

```bash
# Regenerar tipos
npm run generate-types

# Limpar cache do TypeScript
rm -rf node_modules/.cache/typescript
```

### Erros de Validação

1. Verifique se os tipos estão atualizados
2. Confirme se a query está correta
3. Verifique se o schema do banco corresponde

### Problemas de Conexão

1. Verifique o token do MCP
2. Confirme o project-ref
3. Verifique a conexão com o Supabase

## Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia do TypeScript](https://www.typescriptlang.org/docs/)
- [MCP Reference](https://supabase.com/docs/reference/mcp)
