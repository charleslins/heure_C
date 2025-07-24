import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, Target, Zap, Award } from "lucide-react";
import SectionCard from "../common/SectionCard";

interface ProductivityMetricsCardProps {
  timeRange: string;
  currentUser: any;
}

interface ProductivityData {
  efficiency: number;
  consistency: number;
  goalAchievement: number;
  workQuality: number;
  trends: {
    efficiency: 'up' | 'down' | 'stable';
    consistency: 'up' | 'down' | 'stable';
    goals: 'up' | 'down' | 'stable';
  };
}

interface WeeklyProductivity {
  week: string;
  hoursWorked: number;
  hoursPlanned: number;
  tasksCompleted: number;
  tasksPlanned: number;
  qualityScore: number;
}

const ProductivityMetricsCard: React.FC<ProductivityMetricsCardProps> = ({ 
  timeRange, 
  currentUser 
}) => {
  const { t } = useTranslation();
  const [productivityData, setProductivityData] = useState<ProductivityData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyProductivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados - substituir por dados reais do Supabase
    const mockProductivityData: ProductivityData = {
      efficiency: 94.2,
      consistency: 87.5,
      goalAchievement: 91.8,
      workQuality: 96.3,
      trends: {
        efficiency: 'up',
        consistency: 'stable',
        goals: 'up'
      }
    };
    
    const mockWeeklyData: WeeklyProductivity[] = [
      {
        week: 'Sem 1',
        hoursWorked: 42,
        hoursPlanned: 40,
        tasksCompleted: 18,
        tasksPlanned: 20,
        qualityScore: 95
      },
      {
        week: 'Sem 2',
        hoursWorked: 38,
        hoursPlanned: 40,
        tasksCompleted: 16,
        tasksPlanned: 18,
        qualityScore: 92
      },
      {
        week: 'Sem 3',
        hoursWorked: 45,
        hoursPlanned: 40,
        tasksCompleted: 22,
        tasksPlanned: 20,
        qualityScore: 98
      },
      {
        week: 'Sem 4',
        hoursWorked: 39,
        hoursPlanned: 40,
        tasksCompleted: 19,
        tasksPlanned: 20,
        qualityScore: 94
      }
    ];
    
    setProductivityData(mockProductivityData);
    setWeeklyData(mockWeeklyData);
    setLoading(false);
  }, [timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable':
        return <div className="w-4 h-4 border-t-2 border-yellow-600"></div>;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-yellow-600';
    }
  };

  if (loading || !productivityData) {
    return (
      <SectionCard
        title={t('reports.productivity.title')}
        titleIcon={TrendingUp}
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
      title={t('reports.productivity.title')}
      titleIcon={TrendingUp}
      titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
      cardClassName="bg-white rounded-xl shadow-lg"
    >
      <div className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 rounded-lg p-2">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              {getTrendIcon(productivityData.trends.efficiency)}
            </div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.productivity.efficiency')}
            </p>
            <p className="text-lg font-bold text-blue-700">
              {productivityData.efficiency}%
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 rounded-lg p-2">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              {getTrendIcon(productivityData.trends.consistency)}
            </div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.productivity.consistency')}
            </p>
            <p className="text-lg font-bold text-green-700">
              {productivityData.consistency}%
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 rounded-lg p-2">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              {getTrendIcon(productivityData.trends.goals)}
            </div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.productivity.goalAchievement')}
            </p>
            <p className="text-lg font-bold text-purple-700">
              {productivityData.goalAchievement}%
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 rounded-lg p-2">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="w-4 h-4"></div>
            </div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {t('reports.productivity.workQuality')}
            </p>
            <p className="text-lg font-bold text-amber-700">
              {productivityData.workQuality}%
            </p>
          </div>
        </div>

        {/* Gráfico de produtividade semanal */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            {t('reports.productivity.weeklyTrend')}
          </h4>
          <div className="space-y-3">
            {weeklyData.map((week, index) => {
              const hoursEfficiency = (week.hoursWorked / week.hoursPlanned) * 100;
              const tasksEfficiency = (week.tasksCompleted / week.tasksPlanned) * 100;
              
              return (
                <div key={index} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {week.week}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t('reports.productivity.qualityScore')}: {week.qualityScore}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>{t('reports.productivity.hours')}</span>
                        <span>{week.hoursWorked}/{week.hoursPlanned}h</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            hoursEfficiency >= 100 ? 'bg-green-500' : 
                            hoursEfficiency >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(hoursEfficiency, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>{t('reports.productivity.tasks')}</span>
                        <span>{week.tasksCompleted}/{week.tasksPlanned}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            tasksEfficiency >= 100 ? 'bg-green-500' : 
                            tasksEfficiency >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(tasksEfficiency, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">
            {t('reports.productivity.insights')}
          </h4>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• {t('reports.productivity.insight1')}</li>
            <li>• {t('reports.productivity.insight2')}</li>
            <li>• {t('reports.productivity.insight3')}</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
};

export default ProductivityMetricsCard;