# Work Hours Tracker (Gestor de Horas)

Uma aplicação web projetada para ajudar usuários a rastrear suas horas de trabalho diárias e mensais, gerenciar diferentes tipos de entradas (como férias, atestados) e calcular resumos. Também inclui recursos para planejamento de férias e um painel administrativo para gerenciar usuários e configurações globais.

## Funcionalidades

### Autenticação e Perfil

- **Autenticação de Usuário:** Login e registro seguros usando Supabase Auth
- **Seleção de Idioma:** Suporte completo para Português, Inglês, Francês e Alemão
- **Perfil de Usuário:** Configurações personalizadas por usuário (nome, email, preferências)

### Dashboard Principal

- **Registro Diário:**
  - Input de períodos de trabalho (manhã/tarde) com horários de início/fim
  - Tipos de entrada: Regular, Férias, Feriado, Recuperação, Atestado
  - Visualização clara com status coloridos
- **Horas Contratuais Semanais:**
  - Definição de horas padrão para cada dia da semana
  - Ajuste automático para feriados e férias
- **Cartão de Resumo:**
  - Taxa de ocupação calculada
  - Direito a férias anual
  - Horas contratuais semanais
  - Horas planejadas mensais
  - Horas realizadas + ausências
  - Saldo (horas extra/a repor)

### Gestão de Férias

- **Calendário Interativo:**
  - Seleção visual de dias de férias
  - Indicadores de status (Selecionado, Pendente, Aprovado, Rejeitado)
  - Visualização de feriados
- **Cálculos Automáticos:**
  - Saldo de férias anual
  - Impacto das férias no mês
  - Dias úteis vs. não úteis
- **Solicitações:**
  - Formulário de pedido de férias imprimível
  - Sistema de aprovação/rejeição
  - Comentários administrativos

### Painel Administrativo

- **Configurações Globais:**
  - Taxa de ocupação padrão
  - Dias base de férias anuais
  - Horários padrão de trabalho
- **Gestão de Usuários:**
  - Visualização de todos os usuários
  - Gerenciamento de funções (usuário/admin)
  - Resumo de férias por usuário
- **Gestão de Solicitações:**
  - Lista de pedidos pendentes
  - Aprovação/rejeição individual ou em lote
  - Sistema de comentários
- **Gestão de Feriados:**
  - Configuração de feriados por ano/região
  - Feriados oficiais e personalizados
- **Gestão de Funcionários:**
  - Cadastro de novos funcionários
  - Atribuição de regiões/cantões
  - Configurações específicas por funcionário

### Interface e Usabilidade

- **Design Responsivo:** Adaptação para diferentes tamanhos de tela
- **Temas Visuais:** Layout moderno com cards bem organizados
- **Sistema de Notificações:** Feedback visual para ações do usuário
- **Tratamento de Erros:** Sistema robusto de tratamento de exceções

## Stack Tecnológica

### Frontend

- React 19 (via `esm.sh`)
- TypeScript
- Tailwind CSS
- Vite (desenvolvimento e build)

### Backend & Database

- Supabase:
  - Autenticação
  - PostgreSQL Database
  - Políticas de Segurança RLS

### Internacionalização

- i18next
- react-i18next
- i18next-browser-languagedetector

### Qualidade de Código

- ESLint
- Prettier
- TypeScript strict mode

## Estrutura do Projeto

```
/
├── public/                     # Ativos estáticos
├── src/
│   ├── components/            # Componentes React
│   │   ├── AdminDashboard/    # Componentes do painel admin
│   │   ├── common/           # Componentes compartilhados
│   │   └── vacation_config/  # Componentes de configuração de férias
│   ├── contexts/             # Contextos React
│   ├── hooks/                # Hooks personalizados
│   ├── locales/              # Arquivos de tradução
│   └── utils/                # Funções utilitárias
├── SCHEMA.sql                # Schema do banco de dados
└── [Arquivos de configuração]
```

## Começando

1. **Clone o repositório:**

   ```bash
   git clone <repository-url>
   cd your-project-directory
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure o Supabase:**
   - Crie um projeto no [Supabase](https://supabase.com/)
   - Execute o `SCHEMA.sql` no Editor SQL
   - Configure as variáveis de ambiente:
     ```typescript
     const supabaseUrl = "YOUR_SUPABASE_URL";
     const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
     ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Configuração do MCP

1. Copie o arquivo de exemplo do MCP:

   ```bash
   cp .mcp.example.json .mcp.json
   ```

2. Configure seu token do Supabase:
   - Acesse https://supabase.com/dashboard/account/tokens
   - Gere um novo token
   - Substitua "seu_token_aqui" no arquivo `.mcp.json`

3. Verifique se está funcionando:
   ```bash
   npm run generate-types
   ```

O MCP (Model Control Protocol) fornece:

- Tipagem automática do banco de dados
- Validação de queries em tempo real
- Autocompleção de código
- Documentação inline

## Gerenciamento de Estado

A aplicação utiliza React Context API para gerenciar estados compartilhados:

- **AuthContext:** Autenticação e informações do usuário
- **GlobalDataContext:** Dados e configurações globais
- **CurrentUserDataContext:** Dados específicos do usuário atual
- **NotificationContext:** Sistema de notificações

## Scripts Disponíveis

- `npm run dev`: Modo de desenvolvimento
- `npm run build`: Build de produção
- `npm run lint`: Análise de código
- `npm run preview`: Preview da build de produção

## Segurança

- Autenticação robusta via Supabase
- Políticas RLS para controle de acesso
- Validação de dados em todas as operações
- Proteção contra XSS e injeção SQL

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

Para mais informações, consulte a documentação do Supabase e das bibliotecas utilizadas.
