import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from "lucide-react";
import SectionCard from "../common/SectionCard";
import TimeRangeReportCard from "./TimeRangeReportCard";
import VacationAnalyticsCard from "./VacationAnalyticsCard";
import ProductivityMetricsCard from "./ProductivityMetricsCard";
import ExportReportsCard from "./ExportReportsCard";

interface ReportsPageProps {
  currentUser: any;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 rounded-lg p-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t('reports.title')}
            </h1>
            <p className="text-slate-600">
              {t('reports.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Seletor de período */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">{t('reports.timeRange.week')}</option>
            <option value="month">{t('reports.timeRange.month')}</option>
            <option value="quarter">{t('reports.timeRange.quarter')}</option>
            <option value="year">{t('reports.timeRange.year')}</option>
            <option value="custom">{t('reports.timeRange.custom')}</option>
          </select>
        </div>
      </div>

      {/* Grid de relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatório de Horas por Período */}
        <TimeRangeReportCard 
          timeRange={selectedTimeRange}
          currentUser={currentUser}
        />
        
        {/* Análise de Férias */}
        <VacationAnalyticsCard 
          timeRange={selectedTimeRange}
          currentUser={currentUser}
        />
        
        {/* Métricas de Produtividade */}
        <ProductivityMetricsCard 
          timeRange={selectedTimeRange}
          currentUser={currentUser}
        />
        
        {/* Exportação de Relatórios */}
        <ExportReportsCard 
          timeRange={selectedTimeRange}
          currentUser={currentUser}
        />
      </div>

      {/* Seção de relatórios detalhados */}
      <div className="grid grid-cols-1 gap-6">
        <SectionCard
          title={t('reports.detailedAnalysis.title')}
          titleIcon={TrendingUp}
          titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
          cardClassName="bg-white rounded-xl shadow-lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {t('reports.detailedAnalysis.efficiency')}
                    </p>
                    <p className="text-2xl font-bold text-blue-700">94.2%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-lg p-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {t('reports.detailedAnalysis.growth')}
                    </p>
                    <p className="text-2xl font-bold text-green-700">+12.5%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {t('reports.detailedAnalysis.balance')}
                    </p>
                    <p className="text-2xl font-bold text-purple-700">+8.3h</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>{t('reports.detailedAnalysis.comingSoon')}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ReportsPage;