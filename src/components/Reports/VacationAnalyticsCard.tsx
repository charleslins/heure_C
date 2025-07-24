import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Users, TrendingUp, AlertCircle } from "lucide-react";
import SectionCard from "../common/SectionCard";

interface VacationAnalyticsCardProps {
  timeRange: string;
  currentUser: any;
}

interface VacationStats {
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  approvalRate: number;
  averageDuration: number;
  peakMonths: string[];
}

interface MonthlyVacationData {
  month: string;
  requests: number;
  approvals: number;
  rejections: number;
}

const VacationAnalyticsCard: React.FC<VacationAnalyticsCardProps> = ({ 
  timeRange, 
  currentUser 
}) => {
  const { t } = useTranslation();
  const [vacationStats, setVacationStats] = useState<VacationStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyVacationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados - substituir por dados reais do Supabase
    const mockStats: VacationStats = {
      totalDays: 25,
      usedDays: 12,
      pendingDays: 3,
      remainingDays: 10,
      approvalRate: 92.5,
      averageDuration: 4.2,
      peakMonths: ['Julho', 'Dezembro', 'Agosto']
    };
    
    const mockMonthlyData: MonthlyVacationData[] = [
      { month: 'Jan', requests: 8, approvals: 7, rejections: 1 },
      { month: 'Fev', requests: 6, approvals: 6, rejections: 0 },
      { month: 'Mar', requests: 10, approvals: 9, rejections: 1 },
      { month: 'Abr', requests: 12, approvals: 11, rejections: 1 },
      { month: 'Mai', requests: 9, approvals: 8, rejections: 1 },
      { month: 'Jun', requests: 15, approvals: 14, rejections: 1 }
    ];
    
    setVacationStats(mockStats);
    setMonthlyData(mockMonthlyData);
    setLoading(false);
  }, [timeRange]);

  if (loading || !vacationStats) {
    return (
      <SectionCard
        title={t('reports.vacation.title')}
        titleIcon={Calendar}
        titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
        cardClassName="bg-white rounded-xl shadow-lg"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </SectionCard>
    );
  }

  const utilizationRate = (vacationStats.usedDays / vacationStats.totalDays) * 100;

  return (
    <SectionCard
      title={t('reports.vacation.title')}
      titleIcon={Calendar}
      titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
      cardClassName="bg-white rounded-xl shadow-lg"
    >
      <div className="space-y-6">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.vacation.totalDays')}
            </p>
            <p className="text-lg font-bold text-blue-700">
              {vacationStats.totalDays}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.vacation.usedDays')}
            </p>
            <p className="text-lg font-bold text-green-700">
              {vacationStats.usedDays}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.vacation.pendingDays')}
            </p>
            <p className="text-lg font-bold text-yellow-700">
              {vacationStats.pendingDays}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.vacation.remainingDays')}
            </p>
            <p className="text-lg font-bold text-purple-700">
              {vacationStats.remainingDays}
            </p>
          </div>
        </div>

        {/* Métricas avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {t('reports.vacation.utilizationRate')}
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {utilizationRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {t('reports.vacation.approvalRate')}
                </p>
                <p className="text-xl font-bold text-blue-700">
                  {vacationStats.approvalRate}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 rounded-lg p-2">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {t('reports.vacation.averageDuration')}
                </p>
                <p className="text-xl font-bold text-violet-700">
                  {vacationStats.averageDuration} {t('common.daysUnitShort')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de solicitações mensais */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            {t('reports.vacation.monthlyRequests')}
          </h4>
          <div className="space-y-2">
            {monthlyData.map((data, index) => {
              const maxRequests = Math.max(...monthlyData.map(d => d.requests));
              const widthPercentage = (data.requests / maxRequests) * 100;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-slate-600">
                    {data.month}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${widthPercentage}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {data.requests}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-xs text-green-600 font-medium">
                      ✓{data.approvals}
                    </span>
                    {data.rejections > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        ✗{data.rejections}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meses de pico */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {t('reports.vacation.peakMonths')}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {vacationStats.peakMonths.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default VacationAnalyticsCard;