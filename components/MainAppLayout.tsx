import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Page } from '../types';
import AppHeader from './AppHeader';
import DashboardPage from './DashboardPage';
import VacationConfigPage from './VacationConfigPage';
import AdminDashboardPage from '../AdminDashboardPage';
import HolidayManagementPage from './HolidayManagementPage';
import UserProfilePage from './UserProfilePage';
import AccessDeniedMessage from './AccessDeniedMessage';
import { useGlobalDataContext } from '../contexts/GlobalDataContext';
import { useCurrentUserDataContext } from '../contexts/CurrentUserDataContext';
import LoadingScreen from './LoadingScreen';

interface MainAppLayoutProps {
  user: User;
  currentPage: Page;
  currentDate: Date;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onDateChange: (newDate: Date) => void;
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({
  user,
  currentPage,
  currentDate,
  onLogout,
  onNavigate,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const { isLoadingGlobalData } = useGlobalDataContext();
  const { isLoadingCurrentUserData } = useCurrentUserDataContext();

  if (isLoadingGlobalData || isLoadingCurrentUserData) {
    return <LoadingScreen message={t('common.loadingUserData', 'Loading data...')} />;
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage currentUser={user} />;
      case 'vacations':
        return <VacationConfigPage currentDate={currentDate} onDateChange={onDateChange} />;
      case 'admin_dashboard':
        if (user.role === 'admin') {
          return <AdminDashboardPage currentUser={user} />;
        }
        return <AccessDeniedMessage />;
      case 'holiday_management':
        if (user.role === 'admin') {
          return <HolidayManagementPage />;
        }
        return <AccessDeniedMessage />;
      case 'user_profile':
        return <UserProfilePage />;
      default:
        return <p>{t('common.pageNotFound')}</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        user={user}
        currentDate={currentDate}
        currentPage={currentPage}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onDateChange={onDateChange}
      />
      <div className="max-w-7xl mx-auto w-full px-2 md:px-6 flex-1">
        <main className="bg-slate-50 min-h-[calc(100vh-5rem)]">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default MainAppLayout;
