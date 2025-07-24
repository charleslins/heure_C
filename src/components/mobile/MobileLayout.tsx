import React from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
  withBottomSafeArea?: boolean;
}

/**
 * Layout otimizado para dispositivos móveis
 * Inclui safe areas, padding adequado e otimizações de performance
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = "",
  withPadding = true,
  withBottomSafeArea = true,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-slate-50",
        withPadding && "px-4",
        withBottomSafeArea && "pb-safe-bottom",
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * Container responsivo para conteúdo mobile
 */
export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = "",
  maxWidth = "full",
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobilePageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Componente de página mobile com header padrão
 */
export const MobilePage: React.FC<MobilePageProps> = ({
  children,
  title,
  subtitle,
  className = "",
  headerActions,
}) => {
  return (
    <MobileLayout className={className}>
      {(title || subtitle || headerActions) && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 mb-6">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {title && (
                  <h1 className="text-2xl font-bold text-slate-900 truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-600 mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-2 ml-4">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <MobileContainer>
        {children}
      </MobileContainer>
    </MobileLayout>
  );
};

interface MobileSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Seção mobile com título e espaçamento adequado
 */
export const MobileSection: React.FC<MobileSectionProps> = ({
  children,
  title,
  subtitle,
  className = "",
  headerActions,
}) => {
  return (
    <section className={cn("mb-8", className)}>
      {(title || subtitle || headerActions) && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-slate-900 truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2 ml-4">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Grid responsivo para mobile
 */
export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 1,
  gap = "md",
  className = "",
}) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Stack vertical para mobile com espaçamento consistente
 */
export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  spacing = "md",
  className = "",
}) => {
  const spacingClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

export default {
  MobileLayout,
  MobileContainer,
  MobilePage,
  MobileSection,
  MobileGrid,
  MobileStack,
};