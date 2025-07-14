import { cva } from "class-variance-authority";

// Classes base para inputs
export const inputClasses = cva(
  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-white border-slate-300 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500",
        error:
          "bg-white border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500",
        success:
          "bg-white border-green-300 text-green-700 focus:ring-green-500 focus:border-green-500",
        disabled:
          "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed",
      },
      size: {
        sm: "px-2 py-1 text-sm",
        md: "px-3 py-2 text-base",
        lg: "px-4 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Classes específicas para diferentes tipos de input
export const textInputClasses = inputClasses({ variant: "default" });
export const errorInputClasses = inputClasses({ variant: "error" });
export const successInputClasses = inputClasses({ variant: "success" });
export const disabledInputClasses = inputClasses({ variant: "disabled" });

// Classes para textarea
export const textareaClasses = cva(
  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-vertical",
  {
    variants: {
      variant: {
        default:
          "bg-white border-slate-300 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500",
        error:
          "bg-white border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500",
        success:
          "bg-white border-green-300 text-green-700 focus:ring-green-500 focus:border-green-500",
      },
      size: {
        sm: "px-2 py-1 text-sm min-h-[60px]",
        md: "px-3 py-2 text-base min-h-[80px]",
        lg: "px-4 py-3 text-lg min-h-[100px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Classes para select
export const selectClasses = cva(
  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors appearance-none bg-white",
  {
    variants: {
      variant: {
        default:
          "border-slate-300 text-slate-700 focus:ring-indigo-500 focus:border-indigo-500",
        error:
          "border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500",
        success:
          "border-green-300 text-green-700 focus:ring-green-500 focus:border-green-500",
        light:
          "border-slate-200 text-slate-600 focus:ring-slate-500 focus:border-slate-500",
      },
      size: {
        sm: "px-2 py-1 text-sm",
        md: "px-3 py-2 text-base",
        lg: "px-4 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Classes para checkbox e radio
export const checkboxClasses = cva(
  "w-4 h-4 border rounded focus:ring-2 focus:ring-offset-2 transition-colors",
  {
    variants: {
      variant: {
        default: "border-slate-300 text-indigo-600 focus:ring-indigo-500",
        error: "border-red-300 text-red-600 focus:ring-red-500",
        success: "border-green-300 text-green-600 focus:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Classes para labels
export const labelClasses = cva("block text-sm font-medium mb-1", {
  variants: {
    variant: {
      default: "text-slate-700",
      error: "text-red-700",
      success: "text-green-700",
      required:
        "text-slate-700 after:content-['*'] after:ml-0.5 after:text-red-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Classes para grupos de input
export const inputGroupClasses = "space-y-1";

// Classes para mensagens de erro
export const errorMessageClasses = "text-sm text-red-600 mt-1";

// Classes para mensagens de sucesso
export const successMessageClasses = "text-sm text-green-600 mt-1";

// Classes para ajuda/hint
export const hintClasses = "text-sm text-slate-500 mt-1";

// Função helper para combinar classes condicionalmente
export const getInputClasses = (
  hasError?: boolean,
  isSuccess?: boolean,
  isDisabled?: boolean,
  size: "sm" | "md" | "lg" = "md"
) => {
  if (isDisabled) return disabledInputClasses;
  if (hasError) return inputClasses({ variant: "error", size });
  if (isSuccess) return inputClasses({ variant: "success", size });
  return inputClasses({ variant: "default", size });
};
