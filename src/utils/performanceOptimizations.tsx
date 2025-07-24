/**
 * Otimizações de Performance
 * Data de criação: 24 de janeiro de 2025
 * Última atualização: 24 de janeiro de 2025
 * Versão: 1.0.0
 * Status: Implementado
 * Autor: Sistema de Análise
 */

import React, { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

// Lazy loading das páginas principais
export const DashboardPageLazy = lazy(() => import('@/pages/DashboardPage'));
export const VacationConfigPageLazy = lazy(() => import('@/pages/VacationConfigPage'));
export const AdminTabbedPageLazy = lazy(() => import('@/pages/AdminTabbedPage'));
export const UserProfilePageLazy = lazy(() => import('@/pages/UserProfilePage'));
export const LanguageLandingPageLazy = lazy(() => import('@/pages/LanguageLandingPage'));
export const AdminOverviewDashboardLazy = lazy(() => import('@/pages/AdminOverviewDashboard'));
export const ReportsPageLazy = lazy(() => import('@/components/Reports/ReportsPage'));

// Lazy loading de componentes pesados
export const AdminUserListLazy = lazy(() => import('@/components/AdminDashboard/AdminUserList'));
export const PendingRequestsListLazy = lazy(() => import('@/components/AdminDashboard/PendingRequestsList'));
export const UserVacationSummaryTableLazy = lazy(() => import('@/components/AdminDashboard/UserVacationSummaryTable'));
export const HolidayManagementPageLazy = lazy(() => import('@/pages/HolidayManagementPage'));
export const GlobalSettingsFormLazy = lazy(() => import('@/components/AdminDashboard/GlobalSettingsForm'));

// HOC para Suspense com LoadingScreen
export const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingScreen message="Carregando componente..." />}>
      <Component {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Componentes otimizados com Suspense
export const DashboardPage = withSuspense(DashboardPageLazy);
export const VacationConfigPage = withSuspense(VacationConfigPageLazy);
export const AdminTabbedPage = withSuspense(AdminTabbedPageLazy);
export const UserProfilePage = withSuspense(UserProfilePageLazy);
export const LanguageLandingPage = withSuspense(LanguageLandingPageLazy);
export const AdminOverviewDashboard = withSuspense(AdminOverviewDashboardLazy);
export const ReportsPage = withSuspense(ReportsPageLazy);
export const AdminUserList = withSuspense(AdminUserListLazy);
export const PendingRequestsList = withSuspense(PendingRequestsListLazy);
export const UserVacationSummaryTable = withSuspense(UserVacationSummaryTableLazy);
export const HolidayManagementPage = withSuspense(HolidayManagementPageLazy);
export const GlobalSettingsForm = withSuspense(GlobalSettingsFormLazy);

// Utilitários para React.memo
export const arePropsEqual = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keysToCompare?: (keyof T)[]
): boolean => {
  if (keysToCompare) {
    return keysToCompare.every(key => prevProps[key] === nextProps[key]);
  }
  
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  return prevKeys.every(key => prevProps[key] === nextProps[key]);
};

// Comparador específico para props de usuário
export const areUserPropsEqual = (
  prevProps: { user?: any; currentUser?: any },
  nextProps: { user?: any; currentUser?: any }
): boolean => {
  const prevUser = prevProps.user || prevProps.currentUser;
  const nextUser = nextProps.user || nextProps.currentUser;
  
  if (!prevUser && !nextUser) return true;
  if (!prevUser || !nextUser) return false;
  
  return prevUser.id === nextUser.id && 
         prevUser.role === nextUser.role &&
         prevUser.email === nextUser.email;
};

// Comparador para props de data
export const areDatePropsEqual = (
  prevProps: { currentDate?: Date; date?: Date },
  nextProps: { currentDate?: Date; date?: Date }
): boolean => {
  const prevDate = prevProps.currentDate || prevProps.date;
  const nextDate = nextProps.currentDate || nextProps.date;
  
  if (!prevDate && !nextDate) return true;
  if (!prevDate || !nextDate) return false;
  
  return prevDate.getTime() === nextDate.getTime();
};

// Comparador para arrays simples
export const areArrayPropsEqual = <T,>(
  prevArray: T[],
  nextArray: T[],
  compareItem?: (prev: T, next: T) => boolean
): boolean => {
  if (prevArray.length !== nextArray.length) return false;
  
  if (compareItem) {
    return prevArray.every((item, index) => compareItem(item, nextArray[index]));
  }
  
  return prevArray.every((item, index) => item === nextArray[index]);
};