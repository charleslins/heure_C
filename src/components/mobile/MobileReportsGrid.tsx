import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Clock, Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";

interface MobileReportCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface MetricItemProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

/**
 * Card base para relatórios mobile
 */
export const MobileReportCard: React.FC<MobileReportCardProps> = ({
  title,
  icon,
  children,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="text-white">{icon}</div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

/**
 * Item de métrica com trend
 */
export const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  trend,
  trendValue,
  className = "",
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-slate-900">{value}</span>
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Grid responsivo para relatórios mobile
 */
export const MobileReportsGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="md:hidden space-y-6 px-4 pb-20">
      {children}
    </div>
  );
};

/**
 * Componente de período de tempo mobile
 */
export const MobileTimeRangeCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MobileReportCard
      title={t("reports.timeRange.title")}
      icon={<Clock className="w-6 h-6" />}
    >
      <div className="space-y-3">
        <MetricItem
          label={t("reports.timeRange.hoursWorked")}
          value="168.5h"
          trend="up"
          trendValue="+5.2h"
        />
        <MetricItem
          label={t("reports.timeRange.hoursPlanned")}
          value="160.0h"
        />
        <MetricItem
          label={t("reports.timeRange.overtime")}
          value="8.5h"
          trend="up"
          trendValue="+3.2%"
        />
        <MetricItem
          label={t("reports.timeRange.efficiency")}
          value="105.3%"
          trend="up"
          trendValue="+2.1%"
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          {t("reports.timeRange.weeklyBreakdown")}
        </h4>
        <div className="space-y-2">
          {[
            { week: "Semana 1", hours: "42.0h" },
            { week: "Semana 2", hours: "40.5h" },
            { week: "Semana 3", hours: "43.0h" },
            { week: "Semana 4", hours: "43.0h" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-slate-600">{item.week}</span>
              <span className="text-sm font-medium text-slate-900">{item.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </MobileReportCard>
  );
};

/**
 * Componente de análise de férias mobile
 */
export const MobileVacationAnalyticsCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MobileReportCard
      title={t("reports.vacationAnalytics.title")}
      icon={<Calendar className="w-6 h-6" />}
    >
      <div className="space-y-3">
        <MetricItem
          label={t("reports.vacationAnalytics.totalDays")}
          value="25 dias"
        />
        <MetricItem
          label={t("reports.vacationAnalytics.usedDays")}
          value="12 dias"
          trend="neutral"
        />
        <MetricItem
          label={t("reports.vacationAnalytics.remainingDays")}
          value="13 dias"
          trend="up"
          trendValue="52%"
        />
        <MetricItem
          label={t("reports.vacationAnalytics.plannedDays")}
          value="8 dias"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          Próximas férias
        </h4>
        <div className="space-y-2">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Dezembro 2024</span>
              <span className="text-xs text-blue-600">5 dias</span>
            </div>
            <span className="text-xs text-blue-700">23/12 - 27/12</span>
          </div>
        </div>
      </div>
    </MobileReportCard>
  );
};

/**
 * Componente de métricas de produtividade mobile
 */
export const MobileProductivityMetricsCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MobileReportCard
      title={t("reports.productivityMetrics.title")}
      icon={<BarChart3 className="w-6 h-6" />}
    >
      <div className="space-y-3">
        <MetricItem
          label={t("reports.productivityMetrics.averageDaily")}
          value="8.2h"
          trend="up"
          trendValue="+0.3h"
        />
        <MetricItem
          label={t("reports.productivityMetrics.peakDay")}
          value="Terça-feira"
          trend="up"
        />
        <MetricItem
          label={t("reports.productivityMetrics.consistency")}
          value="94%"
          trend="up"
          trendValue="+2%"
        />
        <MetricItem
          label={t("reports.productivityMetrics.punctuality")}
          value="96%"
          trend="up"
          trendValue="+1%"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          Distribuição semanal
        </h4>
        <div className="space-y-2">
          {[
            { day: "Segunda", hours: "8.1h", percentage: 85 },
            { day: "Terça", hours: "8.5h", percentage: 95 },
            { day: "Quarta", hours: "8.3h", percentage: 90 },
            { day: "Quinta", hours: "8.0h", percentage: 80 },
            { day: "Sexta", hours: "7.8h", percentage: 75 },
          ].map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">{item.day}</span>
                <span className="text-sm font-medium text-slate-900">{item.hours}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileReportCard>
  );
};

/**
 * Componente de exportação de relatórios mobile
 */
export const MobileExportReportsCard: React.FC = () => {
  const { t } = useTranslation();

  const exportOptions = [
    {
      format: "PDF",
      description: "Relatório completo em PDF",
      icon: "📄",
      action: () => console.log("Export PDF"),
    },
    {
      format: "Excel",
      description: "Planilha com dados detalhados",
      icon: "📊",
      action: () => console.log("Export Excel"),
    },
    {
      format: "CSV",
      description: "Dados em formato CSV",
      icon: "📋",
      action: () => console.log("Export CSV"),
    },
  ];

  return (
    <MobileReportCard
      title={t("reports.exportReports.title")}
      icon={<Download className="w-6 h-6" />}
    >
      <div className="space-y-3">
        {exportOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{option.icon}</span>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900">{option.format}</div>
                <div className="text-xs text-slate-600">{option.description}</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">💡</span>
            <span className="text-sm font-medium text-blue-900">Dica</span>
          </div>
          <p className="text-xs text-blue-700">
            Os relatórios incluem dados dos últimos 30 dias por padrão. 
            Use os filtros para personalizar o período.
          </p>
        </div>
      </div>
    </MobileReportCard>
  );
};