import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Page, DashboardPageProps } from '../types'; // Removed unused types
import AppHeader from './AppHeader';
import DashboardPage from './DashboardPage';
import VacationConfigPage from './VacationConfigPage';
import AdminDashboardPage from '../AdminDashboardPage';
import HolidayManagementPage from './HolidayManagementPage';
import UserProfilePage from './UserProfilePage';
import AccessDeniedMessage from './AccessDeniedMessage';
import { useAuthContext } from '../contexts/AuthContext';
import { useGlobalDataContext } from '../contexts/GlobalDataContext';
import { useCurrentUserDataContext } from '../contexts/CurrentUserDataContext';
import LoadingScreen from './LoadingScreen';
import VacationPagePreview from './VacationPagePreview';
import VacationJsonLayout from './VacationJsonLayout';
import ModernVacationCalendar from './ModernVacationCalendar';

interface MainAppLayoutProps {
  user: User; // User is still passed directly for AppHeader and page access checks
  currentPage: Page;
  currentDate: Date;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onDateChange: (newDate: Date) => void;
  // appData prop is removed; pages will get data from context
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
  // Child pages will use these contexts directly
  const { globalUserSettings, globalHolidays, allUsers, saveGlobalUserSettings, saveGlobalHolidays, isLoadingGlobalData } = useGlobalDataContext();
  const { 
    weeklyContract, dailyLogs, summaryData, vacations, 
    setWeeklyContract, handleLogEntryChange, setVacations, 
    updateSpecificUserVacations, loadUserYearVacations, isLoadingCurrentUserData } = useCurrentUserDataContext();
  const [showPreview, setShowPreview] = React.useState(false);
  const [showJsonLayout, setShowJsonLayout] = React.useState(false);

  // Show loading screen if either global or current user data is still loading
  if (isLoadingGlobalData || isLoadingCurrentUserData) {
    return <LoadingScreen message={t('common.loadingUserData', 'Loading data...')} />;
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        // DashboardPage will now use contexts for its data needs
        // Pass currentUser directly for role checks if needed, or it can get from AuthContext
        return <DashboardPage currentUser={user} />;
      case 'vacations':
        console.log("--- DEBUGGING CALENDAR DATA ---");
        console.log("Display Date:", currentDate.toISOString());
        console.log("Vacations from context:", vacations);
        console.log("Global Holidays from context:", globalHolidays);
        return <ModernVacationCalendar />;
      case 'admin_dashboard':
        if (user.role === 'admin') {
            // AdminDashboardPage will use contexts. Pass currentUser for its direct use.
            return <AdminDashboardPage
                currentUser={user}
                // Props below are now sourced from useGlobalDataContext or useCurrentUserDataContext within AdminDashboardPage
                // allUsers={allUsers}
                // globalHolidays={globalHolidays}
                // globalUserSettings={globalUserSettings}
                // onGlobalUserSettingsChange={saveGlobalUserSettings}
                // loadUserMonthData from CurrentUserDataContext
                // updateUserVacations from CurrentUserDataContext
             />;
        }
        return <AccessDeniedMessage />;
      case 'holiday_management':
        if (user.role === 'admin') {
          // HolidayManagementPage will use contexts
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
    <div className="min-h-screen flex flex-col bg-slate-100 print:bg-white">
      <AppHeader
        user={user}
        currentDate={currentDate}
        currentPage={currentPage}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onDateChange={onDateChange}
      />
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {renderPageContent()}
      </main>
      <footer className="text-center py-4 text-sm text-slate-500 border-t border-slate-200 bg-slate-100 print:hidden">
        <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('common.allRightsReserved')}</p>
      </footer>
    </div>
  );
};

export default MainAppLayout;
