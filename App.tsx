console.log("App.tsx montado");
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from './types';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { GlobalDataProvider, useGlobalDataContext } from './contexts/GlobalDataContext';
import { CurrentUserDataProvider, useCurrentUserDataContext } from './contexts/CurrentUserDataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationDisplay from './components/NotificationDisplay';
import { SimpleI18nProvider } from "./contexts/SimpleI18nContext";
import MainAppLayout from './components/MainAppLayout';
import LoadingScreen from './components/LoadingScreen';
import LanguageLandingPage from './components/LanguageLandingPage';

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, isLoadingAuth, logout } = useAuthContext();
  const { isLoadingGlobalData } = useGlobalDataContext();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showLandingLogin, setShowLandingLogin] = useState(false);
  
  useEffect(() => {
    document.title = t('appTitle');
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = i18n.language.split('-')[0];
  }, [i18n.language]);

  useEffect(() => {
    if (!currentUser && !isLoadingAuth) {
      setCurrentPage('dashboard');
      setCurrentDate(new Date());
    } else if (currentUser && !isLoadingAuth) {
      setCurrentPage('dashboard');
    }
  }, [currentUser, isLoadingAuth]);

  if (typeof window !== 'undefined') {
    window.__APP_LOADING_DEBUG__ = {
      isLoadingAuth,
      isLoadingGlobalData,
      currentUser,
      timestamp: new Date().toISOString()
    };
    console.log("[DEBUG] AppContent loading states:", window.__APP_LOADING_DEBUG__);
  }

  if (isLoadingAuth || (currentUser && isLoadingGlobalData)) {
    return <LoadingScreen message={isLoadingAuth ? t('common.loadingApp') : t('common.loadingUserData')} />;
  }

  if (!currentUser) {
    return <LanguageLandingPage showLogin={showLandingLogin} setShowLogin={setShowLandingLogin} />;
  }

  return (
    <CurrentUserDataProvider currentDate={currentDate}>
      <MainAppLayoutWrapper
        currentPage={currentPage}
        currentDate={currentDate}
        onLogout={logout}
        onNavigate={setCurrentPage}
        onDateChange={setCurrentDate}
      />
    </CurrentUserDataProvider>
  );
};

const MainAppLayoutWrapper: React.FC<{
  currentPage: Page;
  currentDate: Date;
  onLogout: () => Promise<void>;
  onNavigate: (page: Page) => void;
  onDateChange: (newDate: Date) => void;
}> = (props) => {
  const { currentUser } = useAuthContext();
  const { isLoadingCurrentUserData } = useCurrentUserDataContext();
  const { t } = useTranslation();

  if (typeof window !== 'undefined') {
    window.__APP_LOADING_DEBUG_WRAPPER__ = {
      isLoadingCurrentUserData,
      currentUser,
      timestamp: new Date().toISOString()
    };
    console.log("[DEBUG] MainAppLayoutWrapper loading states:", window.__APP_LOADING_DEBUG_WRAPPER__);
  }

  if (isLoadingCurrentUserData && currentUser) {
    return <LoadingScreen message={t('common.loadingUserData', 'Loading user data...')} />;
  }

  return <MainAppLayout user={currentUser!} {...props} />;
};

const App: React.FC = () => (
  <SimpleI18nProvider>
    <AuthProvider>
      <GlobalDataProvider>
        <NotificationProvider>
          <AppContent />
          <NotificationDisplay />
        </NotificationProvider>
      </GlobalDataProvider>
    </AuthProvider>
  </SimpleI18nProvider>
);

export default App;