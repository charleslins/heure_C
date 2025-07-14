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

export interface ButtonProps
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

export default Button;
