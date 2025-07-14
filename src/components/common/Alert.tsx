import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info, X } from "lucide-react";
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

export interface AlertProps
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

export default Alert;
