console.log("App.tsx montado");
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from './types';
import { supabase } from './utils/supabaseClient';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { GlobalDataProvider, useGlobalDataContext } from './contexts/GlobalDataContext';
import { CurrentUserDataProvider, useCurrentUserDataContext } from './contexts/CurrentUserDataContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Import NotificationProvider
import NotificationDisplay from './components/NotificationDisplay'; // Import NotificationDisplay


import LoginPage from './components/LoginPage';
import MainAppLayout from './components/MainAppLayout';
import LoadingScreen from './components/LoadingScreen';

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, isLoadingAuth, logout } = useAuthContext();
  const { isLoadingGlobalData } = useGlobalDataContext();
  // We need a hook to get isLoadingCurrentUserData if it's relevant for top-level loading display
  // For now, assume it's handled within pages or MainAppLayout if needed for specific parts.
  // const { isLoadingCurrentUserData } = useCurrentUserDataContext(); // Might cause issues if context isn't ready

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  useEffect(() => {
    document.title = t('appTitle');
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = i18n.language.split('-')[0];
  }, [i18n.language]);

  // Effect to reset page and date on logout
   useEffect(() => {
    if (!currentUser && !isLoadingAuth) { // User logged out
      setCurrentPage('dashboard');
      setCurrentDate(new Date());
    } else if (currentUser && !isLoadingAuth) { // User logged in
        setCurrentPage('dashboard'); // Or last saved page
        // setCurrentDate could be persisted or reset to current month
    }
  }, [currentUser, isLoadingAuth]);


  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  };
  
  // Combine loading states
  if (isLoadingAuth || (currentUser && isLoadingGlobalData)) {
    return <LoadingScreen message={isLoadingAuth ? t('common.loadingApp') : t('common.loadingUserData')} />;
  }

  if (!currentUser) {
    return <LoginPage supabaseClient={supabase} />;
  }
  
  // If currentUser exists, then GlobalDataProvider and CurrentUserDataProvider are active.
  // A more granular loading for CurrentUserData can be handled inside MainAppLayout or specific pages.
  // For example, if useCurrentUserDataContext() is called and isLoadingCurrentUserData is true,
  // that specific component can show a loader.

  return (
    // CurrentUserDataProvider needs currentDate, so it's nested here
    <CurrentUserDataProvider currentDate={currentDate}>
        <MainAppLayoutWrapper
            currentPage={currentPage}
            currentDate={currentDate}
            onLogout={logout}
            onNavigate={handleNavigate}
            onDateChange={handleDateChange}
        />
    </CurrentUserDataProvider>
  );
};

// Wrapper to ensure MainAppLayout uses the CurrentUserDataContext correctly
const MainAppLayoutWrapper: React.FC<{
    currentPage: Page;
    currentDate: Date;
    onLogout: () => Promise<void>;
    onNavigate: (page: Page) => void;
    onDateChange: (newDate: Date) => void;
}> = (props) => {
    const { currentUser } = useAuthContext(); // currentUser will be non-null here
    const { isLoadingCurrentUserData } = useCurrentUserDataContext();
    const { t } = useTranslation();

    if (isLoadingCurrentUserData && currentUser) {
        return <LoadingScreen message={t('common.loadingUserData', 'Loading user data...')} />;
    }
    
    // currentUser is guaranteed to be non-null if we reach here due to AppContent's logic
    return <MainAppLayout user={currentUser!} {...props} />;
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <NotificationProvider> {/* Add NotificationProvider here */}
          <AppContent />
          <NotificationDisplay /> {/* Render NotificationDisplay here */}
        </NotificationProvider>
      </GlobalDataProvider>
    </AuthProvider>
  );
};

export default App;