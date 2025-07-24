import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Page } from "@/types";
import {
  Clock,
  Calendar,
  Shield,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MonthYearSelector from "../MonthYearSelector";

interface MobileNavigationProps {
  user: User;
  currentDate: Date;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onDateChange: (newDate: Date) => void;
}

/**
 * Componente de navegação otimizada para dispositivos móveis
 * Inclui menu hambúrguer, navegação por abas e controles de data
 */
const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  currentDate,
  currentPage,
  onNavigate,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Função para mudar o mês
  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    onDateChange(newDate);
  };

  // Itens de navegação
  const navigationItems = [
    {
      key: "dashboard" as Page,
      icon: Clock,
      label: t("nav.dashboard"),
      visible: true,
    },
    {
      key: "vacations" as Page,
      icon: Calendar,
      label: t("nav.vacations"),
      visible: user.role !== "admin",
    },
    {
      key: "reports" as Page,
      icon: BarChart3,
      label: t("nav.reports"),
      visible: true,
    },
    {
      key: "admin_tabbed" as Page,
      icon: Shield,
      label: t("nav.adminPanel"),
      visible: user.role === "admin",
    },
  ].filter(item => item.visible);

  const handleNavigation = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Barra de navegação superior mobile */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Botão do menu hambúrguer */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>

          {/* Título da página atual */}
          <h1 className="text-lg font-semibold text-slate-800">
            {navigationItems.find(item => item.key === currentPage)?.label || t("nav.dashboard")}
          </h1>

          {/* Controles de data compactos */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              aria-label={t("monthYearSelector.previousMonth")}
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              aria-label={t("monthYearSelector.nextMonth")}
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Seletor de data expandido */}
        <div className="px-4 pb-3 border-t border-slate-100">
          <MonthYearSelector
            currentDate={currentDate}
            onDateChange={onDateChange}
            labelColorClass="text-slate-700"
          />
        </div>
      </div>

      {/* Menu lateral mobile */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu lateral */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Cabeçalho do menu */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  {t("nav.menu")}
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Informações do usuário */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-indigo-600">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email || user.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Itens de navegação */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.key;
                    
                    return (
                      <li key={item.key}>
                        <button
                          onClick={() => handleNavigation(item.key)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            isActive
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${
                            isActive ? "text-indigo-600" : "text-slate-500"
                          }`} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Navegação por abas na parte inferior (alternativa) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? "text-indigo-600" : "text-slate-500"
                }`} />
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;