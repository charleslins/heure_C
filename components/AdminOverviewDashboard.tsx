import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import { ChartBarIcon, UserGroupIcon, BellAlertIcon, XCircleIcon } from './icons'; 
// import { formatDateToYYYYMMDD, getDaysInMonth } from '../utils/timeUtils'; // Unused
// import { getUserInitials, getUserColor } from '../utils/stringUtils'; // Unused
// import { USER_COLORS } from '../constants'; // Unused
// import { loadTypedUserMonthDataFromSupabase } from '../utils/supabaseCrud'; // Unused
import { supabase } from '../utils/supabaseClient';
import SectionCard from './common/SectionCard'; 


interface AdminOverviewDashboardProps {
  currentUser: User;
}

interface UserDetail {
  id: string;
  name: string;
  initials: string;
}

interface ConflictDayDetail {
  date: string; 
  formattedDate: string;
  usersDetails: UserDetail[];
  count: number;
}

interface MonthlyChartData {
  month: number; 
  monthName: string;
  barHeightValue: number; 
  absolutePeakDate: string | null; 
  absolutePeakUsersDetails: UserDetail[]; 
  absolutePeakCount: number; 
  conflictDays: ConflictDayDetail[]; 
  exceedsThreshold: boolean; 
}

// const MAX_CONCURRENT_USERS_THRESHOLD = 2; // Unused due to placeholder chart

const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({ currentUser }) => {
  const { t, i18n } = useTranslation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [totalManagedUsers, setTotalManagedUsers] = useState(0); 

  const [chartYear] = useState<number>(new Date().getFullYear()); // Removed setChartYear
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>([]);
  const [allPeaksAreZero, setAllPeaksAreZero] = useState<boolean>(true); 
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [selectedMonthConflictData, setSelectedMonthConflictData] = useState<MonthlyChartData | null>(null);
  
  useEffect(() => {
    const fetchAdminData = async () => {
      const { error: pendingError, count } = await supabase
        .from('user_vacations')
        .select('user_id', { count: 'exact', head: true }) 
        .eq('status', 'pending_approval');
      
      if (pendingError) console.error("Error fetching pending requests count:", pendingError.message || pendingError);
      else setPendingRequestsCount(count || 0);

      // User counting and detailed chart data fetching would require a 'profiles' table or similar.
      // For now, these are simplified.
      setTotalManagedUsers(0); 
      setIsLoadingChart(false); 
      setAllPeaksAreZero(true); 
      setMonthlyChartData(Array(12).fill(null).map((_, i) => ({
          month: i,
          monthName: new Date(chartYear, i).toLocaleDateString(i18n.language, { month: 'short' }),
          barHeightValue: 0,
          absolutePeakDate: null,
          absolutePeakUsersDetails: [],
          absolutePeakCount: 0,
          conflictDays: [],
          exceedsThreshold: false,
      })));

    };
    fetchAdminData();
  }, [i18n.language, chartYear]);

  const handleBarClick = (monthData: MonthlyChartData) => {
    if (monthData.conflictDays.length > 0 || monthData.absolutePeakCount > 1) {
        setSelectedMonthConflictData(monthData);
        setIsConflictModalOpen(true);
    }
  };
  
  // const maxPeakForChartScaling = Math.max(...monthlyChartData.map(d => d.barHeightValue), 1); // Unused

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionCard 
        title={t('dashboardPage.adminOverviewTitle')}
        titleTextClassName="text-xl md:text-2xl font-semibold text-slate-800"
        headerAreaClassName="p-6 border-b-0" 
        contentAreaClassName="p-6 pt-0" 
      >
        <p className="text-slate-600 mt-1">{t('dashboardPage.adminWelcome', { name: currentUser.name })}</p>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('adminDashboardPage.totalManagedUsers')}</p>
            <p className="text-3xl font-bold text-slate-800">{totalManagedUsers > 0 ? totalManagedUsers : t('common.notAvailableShort')}</p>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <BellAlertIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('adminDashboardPage.pendingRequestsTitle')}</p>
            <p className="text-3xl font-bold text-slate-800">{pendingRequestsCount}</p>
          </div>
        </div>
      </div>

      <SectionCard
        title={t('adminDashboardPage.peakConcurrencyChart.title')}
        titleIcon={ChartBarIcon}
        titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
        titleTextClassName="text-lg font-semibold text-slate-700"
      >
        {isLoadingChart ? (
             <div className="h-72 flex items-center justify-center bg-slate-50 p-4 rounded-md border border-slate-200">
                <svg className="mx-auto h-8 w-8 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
        ) : (
          <div className="h-72 flex items-end space-x-1 md:space-x-2 bg-slate-50 p-4 rounded-md border border-slate-200 relative">
            {monthlyChartData.map((data) => (
                <div 
                    key={data.month} 
                    className="flex-1 h-full flex flex-col justify-end items-center group"
                    title={data.monthName}
                    onClick={() => handleBarClick(data)} // Still allow click for potential future data
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBarClick(data)}
                >
                  <div className={`w-full rounded-t-sm transition-all duration-300 ease-out 
                                 ${data.barHeightValue > 0 ? (data.exceedsThreshold ? 'bg-red-400 hover:bg-red-500' : 'bg-indigo-400 hover:bg-indigo-500') : 'bg-slate-200'}
                                 ${data.barHeightValue > 0 ? 'cursor-pointer' : 'cursor-default'}`} 
                       style={{ height: `${data.barHeightValue > 0 ? (data.barHeightValue / (allPeaksAreZero ? 1 : Math.max(...monthlyChartData.map(d => d.barHeightValue), 1))) * 100 : 0}%`}}>
                  </div>
                  <span className="mt-1 text-xs text-slate-600">{data.monthName}</span>
                </div>
            ))}
            {allPeaksAreZero && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-slate-500 bg-white/80 p-2 rounded">
                        {t('adminDashboardPage.peakConcurrencyChart.dataUnavailable')}
                    </p>
                </div>
            )}
          </div>
        )}
         <p className="text-xs text-slate-500 mt-2 text-center italic">
            {t('adminDashboardPage.peakConcurrencyChart.yAxisLabel')}
            <br />
            {t('adminDashboardPage.peakConcurrencyChart.featureNote')}
        </p>
      </SectionCard>

      {isConflictModalOpen && selectedMonthConflictData && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsConflictModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-slate-800">
                {t('adminDashboardPage.peakConcurrencyChart.conflictModalTitle', { month: selectedMonthConflictData.monthName, year: chartYear })}
              </h4>
              <button onClick={() => setIsConflictModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
             <p className="text-sm text-slate-500">{t('adminDashboardPage.peakConcurrencyChart.noDetailedConflicts')}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverviewDashboard;
