import React, { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MobileTableProps {
  children: ReactNode;
  className?: string;
}

interface MobileTableRowProps {
  children: ReactNode;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

interface MobileTableCellProps {
  label: string;
  value: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Componente de tabela otimizada para dispositivos móveis
 * Converte tabelas tradicionais em cards expansíveis
 */
export const MobileTable: React.FC<MobileTableProps> = ({ children, className = "" }) => {
  return (
    <div className={`md:hidden space-y-3 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Linha da tabela mobile - renderizada como um card
 */
export const MobileTableRow: React.FC<MobileTableRowProps> = ({
  children,
  isExpandable = false,
  isExpanded = false,
  onToggle,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {isExpandable && onToggle ? (
        <button
          onClick={onToggle}
          className="w-full p-4 text-left hover:bg-slate-50 transition-colors rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">{children}</div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-2" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400 ml-2" />
            )}
          </div>
        </button>
      ) : (
        <div className="p-4">{children}</div>
      )}
    </div>
  );
};

/**
 * Célula da tabela mobile - renderizada como label/valor
 */
export const MobileTableCell: React.FC<MobileTableCellProps> = ({
  label,
  value,
  className = "",
  fullWidth = false,
}) => {
  return (
    <div className={`${fullWidth ? "col-span-2" : ""} ${className}`}>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
};

/**
 * Container para células em grid
 */
export const MobileTableGrid: React.FC<{ children: ReactNode; columns?: number }> = ({
  children,
  columns = 2,
}) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
};

/**
 * Seção expansível dentro de uma linha
 */
export const MobileTableExpandableSection: React.FC<{
  children: ReactNode;
  isExpanded: boolean;
}> = ({ children, isExpanded }) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="pt-4 border-t border-slate-100 mt-4">{children}</div>
    </div>
  );
};

/**
 * Hook para gerenciar estado de expansão de múltiplas linhas
 */
export const useMobileTableExpansion = (initialState: Record<string, boolean> = {}) => {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>(initialState);

  const toggleRow = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const isExpanded = (rowId: string) => !!expandedRows[rowId];

  const expandAll = () => {
    setExpandedRows(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = true;
      });
      return newState;
    });
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  return {
    expandedRows,
    toggleRow,
    isExpanded,
    expandAll,
    collapseAll,
  };
};