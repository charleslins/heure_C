# Estrutura de Projeto

## 📁 node_modules - Diretório de dependências

1. Contém todas as dependências do projeto instaladas via `npm` ou `yarn`.
2. Gerenciado automaticamente pelos gerenciadores de pacotes (`npm`/`yarn`/`pnpm`).
3. Normalmente ignorado no controle de versão através do `.gitignore`.
4. **Não deve ser modificado manualmente**, pois as alterações podem ser sobrescritas.

---

## 📁 public - Arquivos públicos estáticos

1. Contém arquivos estáticos que serão copiados para a pasta de build **sem processamento**.
2. Ideal para imagens, fontes, ícones e outros ativos estáticos que **não precisam passar pelo processo de build**.
3. O `favicon.ico` geralmente fica nesta pasta.
4. Arquivos nesta pasta são referenciados a partir da raiz do servidor: `/arquivo.ext` (não precisa do caminho relativo).

---

## 📁 src - Código-fonte da aplicação

1. Contém todo o código-fonte da aplicação.
2. É o diretório principal onde você passará a maior parte do tempo desenvolvendo.
3. Inclui: código JavaScript/TypeScript, CSS, componentes, utilitários, etc.

### Subpastas de `src`:

---

### 📁 assets - Recursos utilizados pela aplicação

1. Armazena recursos como imagens, ícones, fontes, etc. que são **importados diretamente no código**.
2. Diferente da pasta `public`, os arquivos aqui **serão processados pelo Vite durante o build**.
3. Permite importações como: `import logo from '@/assets/logo.png'`.
4. Vantagens incluem **otimização automática de imagens** e **bundling eficiente**.

---

### 📁 components - Componentes reutilizáveis

1. Contém componentes React reutilizáveis em toda a aplicação.
2. Geralmente organizado por domínio ou funcionalidade.
3. Componentes devem ser **modulares, independentes e reutilizáveis**.
4. Exemplos incluem: `Button`, `Card`, `Modal`, `Navbar`, etc.

---

### 📁 hooks - Hooks personalizados

1. Armazena hooks React personalizados que encapsulam **lógica reutilizável**.
2. Permite compartilhar lógica entre componentes **sem duplicação de código**.
3. Exemplos comuns: `useLocalStorage`, `useFetch`, `useForm`, etc.
4. Hooks seguem a convenção de nomenclatura `use` + nome do hook.

---

### 📁 pages - Páginas da aplicação

1. Contém componentes que representam **páginas inteiras** da aplicação.
2. Cada arquivo geralmente corresponde a uma **rota específica**.
3. Organiza a **estrutura de navegação** da aplicação.
4. Combina componentes menores para formar interfaces completas.

---

### 📁 utils - Funções utilitárias

1. Contém funções auxiliares e utilitárias reutilizáveis.
2. Funções para **formatação, validação, cálculos**, etc.
3. Não específicas a nenhum componente.
4. Código **puramente funcional**, sem estado ou efeitos colaterais.

---

### 📁 services - Serviços de API e integrações

1. Contém código para **comunicação com APIs externas** e serviços.
2. Isola a lógica de **requisições HTTP**.
3. Facilita a **manutenção e reutilização** do código de integração.
4. Geralmente organizado por **domínio ou serviço externo**.

---

### 📁 store - Gerenciamento de estado global

1. Contém código para **gerenciamento de estado global** da aplicação.
2. Pode usar bibliotecas como **Redux**, **Zustand**, **Jotai** ou **Context API do React**.
3. Organiza **estados, reducers, actions**, etc.
4. Facilita o compartilhamento de dados entre componentes distantes.

---

### 📁 styles - Estilos globais e temas

1. Contém arquivos `CSS/SCSS/LESS` globais ou configurações de tema.
2. Define **variáveis de estilo, mixins, funções**, etc.
3. Configurações para bibliotecas de `CSS-in-JS` como `styled-components`.
4. Estilos que afetam **múltiplos componentes ou toda a aplicação**.

---

### 📁 tests - Testes automatizados

1. Contém **testes automatizados** para a aplicação.
2. Pode incluir **testes unitários, de integração e end-to-end**.
3. Organizado geralmente para **espelhar a estrutura da pasta `src`**.
4. Utiliza ferramentas como **Jest, Testing Library, Cypress**, etc.

---

## 📁 dist - Código compilado para produção

1. Contém o código **compilado e otimizado para produção** após o build.
2. Gerado automaticamente pelo comando de build (`npm run build`).
3. **Não deve ser modificado manualmente**.
4. É o que será implantado em **servidores de produção**.

---

## ⚙️ Arquivos de configuração (na raiz do projeto)

- `package.json`: Define dependências e scripts do projeto.
- `vite.config.js`: Configuração do Vite com plugins e opções.
- `tsconfig.json`: Configuração do TypeScript (se aplicável).
- `.gitignore`: Lista de arquivos/pastas ignorados pelo Git.
- `.env`: Variáveis de ambiente (não versionadas).
- `.eslintrc`: Regras de linting para código JavaScript/TypeScript.
- `.prettierrc`: Configuração de formatação de código.
