import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { formatHours } from "@/utils/timeUtils";

interface TimeRangeReportCardProps {
  timeRange: string;
  currentUser: any;
}

interface TimeData {
  period: string;
  worked: number;
  planned: number;
  overtime: number;
  efficiency: number;
}

const TimeRangeReportCard: React.FC<TimeRangeReportCardProps> = ({ 
  timeRange, 
  currentUser 
}) => {
  const { t } = useTranslation();
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados - substituir por dados reais do Supabase
    const mockData: TimeData[] = [
      {
        period: "Semana 1",
        worked: 42.5,
        planned: 40,
        overtime: 2.5,
        efficiency: 106.25
      },
      {
        period: "Semana 2",
        worked: 38.0,
        planned: 40,
        overtime: -2.0,
        efficiency: 95.0
      },
      {
        period: "Semana 3",
        worked: 45.0,
        planned: 40,
        overtime: 5.0,
        efficiency: 112.5
      },
      {
        period: "Semana 4",
        worked: 39.5,
        planned: 40,
        overtime: -0.5,
        efficiency: 98.75
      }
    ];
    
    setTimeData(mockData);
    setLoading(false);
  }, [timeRange]);

  const totalWorked = timeData.reduce((sum, data) => sum + data.worked, 0);
  const totalPlanned = timeData.reduce((sum, data) => sum + data.planned, 0);
  const totalOvertime = timeData.reduce((sum, data) => sum + data.overtime, 0);
  const averageEfficiency = timeData.length > 0 
    ? timeData.reduce((sum, data) => sum + data.efficiency, 0) / timeData.length 
    : 0;

  if (loading) {
    return (
      <SectionCard
        title={t('reports.timeRange.title')}
        titleIcon={Clock}
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

  return (
    <SectionCard
      title={t('reports.timeRange.title')}
      titleIcon={Clock}
      titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
      cardClassName="bg-white rounded-xl shadow-lg"
    >
      <div className="space-y-6">
        {/* Resumo geral */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.timeRange.totalWorked')}
            </p>
            <p className="text-lg font-bold text-blue-700">
              {formatHours(totalWorked)}
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.timeRange.totalPlanned')}
            </p>
            <p className="text-lg font-bold text-slate-700">
              {formatHours(totalPlanned)}
            </p>
          </div>
          
          <div className={`rounded-lg p-3 ${
            totalOvertime >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.timeRange.overtime')}
            </p>
            <div className="flex items-center gap-1">
              {totalOvertime >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className={`text-lg font-bold ${
                totalOvertime >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatHours(Math.abs(totalOvertime))}
              </p>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.timeRange.efficiency')}
            </p>
            <p className="text-lg font-bold text-purple-700">
              {averageEfficiency.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tabela detalhada */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">
                  {t('reports.timeRange.period')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">
                  {t('reports.timeRange.worked')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">
                  {t('reports.timeRange.planned')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">
                  {t('reports.timeRange.difference')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">
                  {t('reports.timeRange.efficiency')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeData.map((data, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-sm font-medium text-slate-900">
                    {data.period}
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-slate-700">
                    {formatHours(data.worked)}
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-slate-700">
                    {formatHours(data.planned)}
                  </td>
                  <td className={`py-3 px-3 text-sm text-right font-medium ${
                    data.overtime >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.overtime >= 0 ? '+' : ''}{formatHours(data.overtime)}
                  </td>
                  <td className="py-3 px-3 text-sm text-right font-medium text-slate-700">
                    {data.efficiency.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
};

export default TimeRangeReportCard;