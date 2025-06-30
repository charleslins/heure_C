import React from 'react';
import { DashboardPageProps } from '../types'; 
import { useGlobalDataContext } from '../contexts/GlobalDataContext';
import { useCurrentUserDataContext } from '../contexts/CurrentUserDataContext';

import CompactContractHoursInput from './CompactContractHoursInput';
import ContractAndMonthlySummaryCard from './ContractAndMonthlySummaryCard';
import DailyLog from './DailyLog';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import LoadingScreen from './LoadingScreen';
import { useTranslation } from 'react-i18next';


const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const { globalUserSettings, isLoadingGlobalData } = useGlobalDataContext();
  const { 
    weeklyContract, dailyLogs, summaryData, 
    setWeeklyContract, handleLogEntryChange, 
    isLoadingCurrentUserData 
  } = useCurrentUserDataContext();

  if (isLoadingGlobalData || isLoadingCurrentUserData) {
    return <LoadingScreen message={t('common.loadingData')} />;
  }

  // currentUser is guaranteed by App.tsx logic if this page is rendered
  if (!currentUser) return null; // Should not happen if App.tsx logic is correct

  if (currentUser.role === 'admin') {
    return (
      <AdminOverviewDashboard 
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-stretch">
        <div className="lg:col-span-2">
          <CompactContractHoursInput
            contractHours={weeklyContract}
            onContractHoursChange={setWeeklyContract} // Directly use setter from context
          />
        </div>
        <div className="lg:col-span-3">
          <ContractAndMonthlySummaryCard
            userGlobalSettings={globalUserSettings}
            summaryData={summaryData}
          />
        </div>
      </div>

      <div>
        <DailyLog 
            dailyLogs={dailyLogs} 
            onLogEntryChange={handleLogEntryChange} // Directly use handler from context
            userGlobalSettings={globalUserSettings}
            weeklyContract={weeklyContract}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
