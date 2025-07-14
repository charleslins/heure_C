console.log("App.tsx montado");
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Page } from "@/types";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import {
  GlobalDataProvider,
  useGlobalDataContext,
} from "@/contexts/GlobalDataContext";
import {
  CurrentUserDataProvider,
  useCurrentUserDataContext,
} from "@/contexts/CurrentUserDataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationDisplay from "@/components/NotificationDisplay";
import MainAppLayout from "@/components/MainAppLayout";
import LoadingScreen from "@/components/LoadingScreen";
import LanguageLandingPage from "@/components/LanguageLandingPage";

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, isLoadingAuth, logout } = useAuthContext();
  const { isLoadingGlobalData } = useGlobalDataContext();

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showLandingLogin, setShowLandingLogin] = useState(false);

  // Removido debug logging

  useEffect(() => {
    const translatedTitle = t("appTitle");
    console.log("🔍 Setting document title:", translatedTitle);
    document.title = translatedTitle;
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = i18n.language.split("-")[0];
  }, [i18n.language]);

  useEffect(() => {
    if (!currentUser && !isLoadingAuth) {
      setCurrentPage("dashboard");
      setCurrentDate(new Date());
    } else if (currentUser && !isLoadingAuth) {
      setCurrentPage("dashboard");
    }
  }, [currentUser, isLoadingAuth]);

  // Removido debug window

  if (isLoadingAuth || (currentUser && isLoadingGlobalData)) {
    console.log("🚨 LOADING SCREEN ATIVO:", {
      isLoadingAuth,
      isLoadingGlobalData,
      currentUser: !!currentUser,
      message: isLoadingAuth
        ? t("common.loadingApp")
        : t("common.loadingUserData"),
    });
    return (
      <LoadingScreen
        message={
          isLoadingAuth ? t("common.loadingApp") : t("common.loadingUserData")
        }
      />
    );
  }

  if (!currentUser) {
    return (
      <LanguageLandingPage
        showLogin={showLandingLogin}
        setShowLogin={setShowLandingLogin}
      />
    );
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

  // Removido debug wrapper

  if (isLoadingCurrentUserData && currentUser) {
    return (
      <LoadingScreen
        message={t("common.loadingUserData", "Loading user data...")}
      />
    );
  }

  return <MainAppLayout user={currentUser!} {...props} />;
};

const App: React.FC = () => (
  <AuthProvider>
    <GlobalDataProvider>
      <NotificationProvider>
        <AppContent />
        <NotificationDisplay />
      </NotificationProvider>
    </GlobalDataProvider>
  </AuthProvider>
);

export default App;
