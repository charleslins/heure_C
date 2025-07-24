# Estrutura do Projeto Refatorada

**Data da Refatoração:** 23 de Julho de 2024  
**Última Atualização:** 24 de Janeiro de 2025  
**Versão:** 1.1  
**Status:** Implementado e Testado

## 📁 Estrutura Atual

```
heure_C/
├── src/
│   ├── assets/           # Recursos utilizados pela aplicação
│   ├── components/       # Componentes React reutilizáveis
│   ├── contexts/         # Contextos React para estado global
│   ├── hooks/           # Hooks personalizados
│   ├── models/          # Modelos de dados
│   ├── pages/           # Páginas da aplicação
│   ├── presenters/      # Lógica de apresentação
│   ├── services/        # Serviços de API e integrações
│   ├── store/           # Gerenciamento de estado global
│   ├── styles/          # Estilos globais e temas
│   ├── supabase/        # Configuração e tipos do Supabase
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Funções utilitárias
│   ├── collections/     # Coleções de dados
│   ├── App.tsx          # Componente principal da aplicação
│   ├── index.tsx        # Ponto de entrada da aplicação
│   └── i18n.ts          # Configuração de internacionalização
├── tests/               # Testes automatizados
├── public/              # Arquivos públicos estáticos
├── locales/             # Arquivos de tradução
├── docs/                # Documentação
└── [arquivos de configuração]
```

## 🔄 Mudanças Realizadas

### 1. **Arquivos Movidos da Raiz para `src/`**

- `App.tsx` → `src/App.tsx`
- `index.tsx` → `src/index.tsx`
- `i18n.ts` → `src/i18n.ts`
- `AdminDashboardPage.tsx` → `src/pages/AdminDashboardPage.tsx`

### 2. **Arquivos Movidos para `src/utils/`**

- `constants.ts` → `src/utils/constants.ts`
- `i18nSimple.ts` → `src/utils/i18nSimple.ts`

### 3. **Arquivos Movidos para `src/styles/`**

- `index.css` → `src/styles/index.css`

### 4. **Novos Diretórios Criados**

- `src/assets/` - Para recursos como imagens, ícones, fontes
- `src/pages/` - Para componentes que representam páginas inteiras
- `src/store/` - Para gerenciamento de estado global
- `src/styles/` - Para estilos globais e temas
- `tests/` - Para testes automatizados (fora do src)

### 5. **Imports Atualizados**

- Todos os imports relativos foram atualizados para usar aliases `@/`
- Exemplo: `from "./constants"` → `from "@/utils/constants"`

### 6. **Configurações Atualizadas**

- `index.html` atualizado para apontar para `src/index.tsx`
- `index.html` atualizado para apontar para `src/styles/index.css`

## 📋 Benefícios da Refatoração

### ✅ **Organização Melhorada**

- Separação clara entre diferentes tipos de arquivos
- Estrutura mais intuitiva e fácil de navegar
- Seguindo padrões da comunidade React/Vite

### ✅ **Manutenibilidade**

- Imports mais limpos usando aliases
- Facilita a localização de arquivos
- Reduz duplicação e confusão

### ✅ **Escalabilidade**

- Estrutura preparada para crescimento do projeto
- Fácil adição de novos recursos
- Organização que suporta equipes maiores

### ✅ **Padrões da Comunidade**

- Seguindo convenções estabelecidas
- Facilita onboarding de novos desenvolvedores
- Compatível com ferramentas e IDEs

## 🚀 Como Usar a Nova Estrutura

### Para Adicionar Novos Componentes:

```typescript
// Componentes reutilizáveis
src / components / MyComponent.tsx;

// Páginas completas
src / pages / MyPage.tsx;
```

### Para Adicionar Novos Utilitários:

```typescript
// Funções utilitárias
src / utils / myUtils.ts;

// Constantes
src / utils / constants.ts;
```

### Para Adicionar Novos Hooks:

```typescript
// Hooks personalizados
src / hooks / useMyHook.ts;
```

### Para Adicionar Novos Contextos:

```typescript
// Contextos React
src / contexts / MyContext.tsx;
```

## 🔧 Configuração de Aliases

O projeto usa aliases configurados no `vite.config.ts`:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@components": path.resolve(__dirname, "./src/components"),
    "@contexts": path.resolve(__dirname, "./src/contexts"),
    "@utils": path.resolve(__dirname, "./src/utils"),
    "@hooks": path.resolve(__dirname, "./src/hooks"),
    "@types": path.resolve(__dirname, "./src/types"),
  },
}
```

## 📝 Próximos Passos

1. **Testar a aplicação** para garantir que tudo funciona
2. **Atualizar documentação** conforme necessário
3. **Revisar imports** em outros arquivos que possam ter sido afetados
4. **Considerar migração** de outros arquivos para a nova estrutura conforme necessário
