# Análise de Padrões de Código Duplicados

## 📋 Resumo Executivo

Esta análise identifica padrões de código duplicados no projeto e sugere refatorações para criar componentes reutilizáveis, hooks personalizados e funções utilitárias que eliminem a duplicação, seguindo o princípio DRY (Don't Repeat Yourself).

## 🔍 Padrões de Duplicação Identificados

### 1. **Classes de Estilo Tailwind Duplicadas**

#### 1.1 Padrão de Botões Primários

**Ocorrências encontradas:**

- `src/pages/AdminDashboardPage.tsx:567`
- `src/components/vacation_config/MonthlyVacationList.tsx:54`
- `src/components/HolidayManagementPage.tsx:280`
- `src/components/AdminDashboard/PendingRequestsList.tsx:81`
- `src/components/AdminDashboard/GlobalSettingsForm.tsx:113`
- `src/components/AdminDashboard/UserForm.tsx:123`
- `src/components/LanguageLandingPage.tsx:86, 92, 112, 118`
- `src/components/VacationConfigPage.tsx:720`

**Padrão duplicado:**

```tsx
className =
  "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors";
```

#### 1.2 Padrão de Botões Secundários

**Ocorrências encontradas:**

- `src/components/vacation_config/MonthlyVacationList.tsx:43`
- `src/components/AdminDashboard/PendingRequestsList.tsx:133, 139`

**Padrão duplicado:**

```tsx
className =
  "px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors";
```

#### 1.3 Padrão de Alertas/Notificações

**Ocorrências encontradas:**

- `src/components/NotificationDisplay.tsx:32-37`
- `src/components/LoginPage.tsx:107-109, 253-255`

**Padrão duplicado:**

```tsx
// Sucesso
className = "bg-green-50 border-green-200 text-green-700";

// Erro
className = "bg-red-50 border-red-200 text-red-700";

// Aviso
className = "bg-yellow-50 border-yellow-200 text-yellow-700";

// Info
className = "bg-blue-50 border-blue-200 text-blue-700";
```

#### 1.4 Padrão de Layout Flex com Espaçamento

**Ocorrências encontradas:**

- `src/components/AppHeader.tsx:57, 155, 232, 245, 285`
- `src/components/AdminOverviewDashboard.tsx:199, 203, 245, 257, 271, 309, 335`
- `src/components/AdminDashboard/GlobalSettingsForm.tsx:93`
- `src/components/common/TimeInput.tsx:105`
- `src/components/MonthYearSelector.tsx:37`

**Padrão duplicado:**

```tsx
className = "flex items-center space-x-2";
className = "flex items-center space-x-3";
className = "flex items-center space-x-4";
```

### 2. **Lógica de Cores por Tipo Duplicada**

#### 2.1 Cores de Status de Férias

**Ocorrências encontradas:**

- `src/components/vacation_config/CalendarGrid.tsx:178-242`
- `src/components/VacationConfigPage.tsx:431-480`

**Padrão duplicado:**

```tsx
// Feriado
bgClass = "bg-yellow-100 text-yellow-700";
dayNumberStyle = "text-lg sm:text-xl font-semibold text-yellow-700";

// Recuperação
bgClass = "bg-cyan-100 text-cyan-700";
dayNumberStyle = "text-lg sm:text-xl font-semibold text-cyan-700";

// Atestado
bgClass = "bg-red-100 text-red-700";
dayNumberStyle = "text-lg sm:text-xl font-semibold text-red-700";
```

#### 2.2 Cores de Segmentos de Tempo

**Ocorrências encontradas:**

- `src/presenters/DailyLogPresenter.ts:82-93`
- `src/utils/constants.ts:41-57`

**Padrão duplicado:**

```tsx
const classes = {
  Regular: "bg-blue-100 text-blue-800",
  Vacance: "bg-green-100 text-green-800",
  Ferié: "bg-purple-100 text-purple-800",
  Récupération: "bg-yellow-100 text-yellow-800",
  Maladie: "bg-red-100 text-red-800",
};
```

### 3. **Classes de Input Duplicadas**

#### 3.1 Inputs Padrão

**Ocorrências encontradas:**

- `src/pages/AdminDashboardPage.tsx:57-62`
- `src/components/AdminDashboard/GlobalSettingsForm.tsx:40, 55, 70, 85`

**Padrão duplicado:**

```tsx
className =
  "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700";
```

### 4. **Lógica de Formatação Duplicada**

#### 4.1 Formatação de Horas

**Ocorrências encontradas:**

- `src/components/ContractAndMonthlySummaryCard.tsx:61`
- `src/utils/timeUtils.ts` (funções de formatação)

**Padrão duplicado:**

```tsx
typeof value === "number" ? formatHours(value) : value;
```

## 🛠️ Sugestões de Refatoração

### 1. **Criar Componente Button Reutilizável**

```tsx
// src/components/common/Button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary:
          "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        warning:
          "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
        outline:
          "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  children,
  ...props
}) => {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
};
```

### 2. **Criar Componente Alert Reutilizável**

```tsx
// src/components/common/Alert.tsx
import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const alertVariants = cva("flex items-start p-4 rounded-lg border", {
  variants: {
    variant: {
      success: "bg-green-50 border-green-200 text-green-700",
      error: "bg-red-50 border-red-200 text-red-700",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
      info: "bg-blue-50 border-blue-200 text-blue-700",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  onClose?: () => void;
}

const getIcon = (variant: AlertProps["variant"]) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="w-5 h-5" />;
    case "error":
      return <XCircle className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  children,
  onClose,
  className,
  ...props
}) => {
  return (
    <div className={alertVariants({ variant, className })} {...props}>
      <div className="flex-shrink-0 mr-3">{getIcon(variant)}</div>
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 bg-transparent rounded-md inline-flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <span className="sr-only">Fechar</span>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
```

### 3. **Criar Hook para Cores de Status**

```tsx
// src/hooks/useStatusColors.ts
import { useMemo } from "react";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "approved"
  | "rejected";

export const useStatusColors = (status: StatusType) => {
  return useMemo(() => {
    const colors = {
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        focus: "focus:ring-green-400",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        focus: "focus:ring-red-400",
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-100",
        focus: "focus:ring-yellow-400",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        focus: "focus:ring-blue-400",
      },
      pending: {
        bg: "bg-yellow-100",
        border: "border-yellow-400",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-200",
        focus: "focus:ring-yellow-400",
      },
      approved: {
        bg: "bg-green-100",
        border: "border-green-400",
        text: "text-green-700",
        hover: "hover:bg-green-200",
        focus: "focus:ring-green-400",
      },
      rejected: {
        bg: "bg-red-100",
        border: "border-red-400",
        text: "text-red-700",
        hover: "hover:bg-red-200",
        focus: "focus:ring-red-400",
      },
    };

    return colors[status] || colors.info;
  }, [status]);
};
```

### 4. **Criar Utilitário para Classes Tailwind**

```tsx
// src/utils/tailwindUtils.ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const layoutClasses = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  flexEnd: "flex items-center justify-end",
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
} as const;

export const spacingClasses = {
  spaceX1: "space-x-1",
  spaceX2: "space-x-2",
  spaceX3: "space-x-3",
  spaceX4: "space-x-4",
  spaceY1: "space-y-1",
  spaceY2: "space-y-2",
  spaceY3: "space-y-3",
  spaceY4: "space-y-4",
} as const;

export const inputClasses = {
  base: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700",
  withIcon:
    "pl-10 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700",
} as const;

export const cardClasses = {
  base: "bg-white rounded-xl shadow-md",
  withBorder: "bg-white rounded-xl shadow-md border border-slate-200",
} as const;
```

### 5. **Criar Hook para Formatação**

```tsx
// src/hooks/useFormatting.ts
import { useMemo } from "react";
import { formatHours } from "../utils/timeUtils";

export const useFormatting = () => {
  const formatValue = useMemo(() => {
    return (value: number | string, unit?: string) => {
      const formattedValue =
        typeof value === "number" ? formatHours(value) : value;
      return unit ? `${formattedValue} ${unit}` : formattedValue;
    };
  }, []);

  const formatCurrency = useMemo(() => {
    return (value: number, currency = "CHF") => {
      return new Intl.NumberFormat("de-CH", {
        style: "currency",
        currency,
      }).format(value);
    };
  }, []);

  const formatDate = useMemo(() => {
    return (date: Date, locale = "de-CH") => {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    };
  }, []);

  return {
    formatValue,
    formatCurrency,
    formatDate,
  };
};
```

## 📊 Impacto da Refatoração

### Benefícios Esperados:

1. **Redução de Duplicação:**

   - ~40% menos código duplicado
   - Manutenção centralizada de estilos
   - Consistência visual garantida

2. **Melhor Manutenibilidade:**

   - Mudanças de estilo em um local
   - Menos bugs por inconsistências
   - Código mais limpo e legível

3. **Performance:**

   - Menos re-renders desnecessários
   - Bundle size reduzido
   - Melhor tree-shaking

4. **Desenvolvimento:**
   - Componentes reutilizáveis
   - Menos tempo de desenvolvimento
   - Melhor experiência do desenvolvedor

## 🚀 Plano de Implementação

### Fase 1: Componentes Base

1. Criar `Button` component
2. Criar `Alert` component
3. Criar `Input` component
4. Criar utilitários de classes

### Fase 2: Hooks Utilitários

1. Implementar `useStatusColors`
2. Implementar `useFormatting`
3. Criar outros hooks conforme necessário

### Fase 3: Migração Gradual

1. Substituir usos duplicados pelos novos componentes
2. Testar cada mudança
3. Documentar padrões estabelecidos

### Fase 4: Otimização

1. Refinar componentes baseado no uso
2. Adicionar variantes conforme necessário
3. Implementar testes para componentes

## 📝 Próximos Passos

1. **Implementar componentes base** seguindo as sugestões acima
2. **Criar documentação** para os novos componentes
3. **Migrar gradualmente** os usos duplicados
4. **Estabelecer padrões** de uso no projeto
5. **Implementar testes** para garantir consistência

Esta refatoração seguirá os princípios estabelecidos nas regras do Cursor, mantendo a tipagem forte, organização de classes Tailwind e estrutura MVC com Presenters.
