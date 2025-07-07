import { useState, useEffect, useMemo } from 'react';
import { VacationCollection } from '../collections/VacationCollection';
import { VacationPresenter } from '../presenters/VacationPresenter';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';

export function useVacationPresenter(year?: number, month?: number) {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new VacationCollection(), []);
  const presenter = useMemo(() => new VacationPresenter(collection), [collection]);

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] = useState<ReturnType<typeof presenter.getVacationListViewModel>>();

  // Carregar dados iniciais
  useEffect(() => {
    if (!user?.id || year === undefined || month === undefined) return;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        presenter.setUserId(user.id);
        await presenter.initialize(year, month);
        setViewModel(presenter.getVacationListViewModel());
      } catch (err) {
        setError(t('vacationPage.loadingError'));
        addNotification(t('vacationPage.loadingError'), 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, user?.id, year, month, t, addNotification]);

  const handleRequestVacation = async (date: string) => {
    const result = await presenter.requestVacation(date);
    if (result.success) {
      addNotification(t('vacationPage.requestSuccess'), 'success');
      setViewModel(presenter.getVacationListViewModel());
    } else {
      addNotification(result.message || t('vacationPage.requestError'), 'error');
    }
    return result;
  };

  const handleApproveVacation = async (vacationId: string, comment?: string) => {
    const result = await presenter.approveVacation(vacationId, comment);
    if (result.success) {
      addNotification(t('vacationPage.approvalSuccess'), 'success');
      setViewModel(presenter.getVacationListViewModel());
    } else {
      addNotification(result.message || t('vacationPage.approvalError'), 'error');
    }
    return result;
  };

  const handleRejectVacation = async (vacationId: string, comment?: string) => {
    const result = await presenter.rejectVacation(vacationId, comment);
    if (result.success) {
      addNotification(t('vacationPage.rejectionSuccess'), 'success');
      setViewModel(presenter.getVacationListViewModel());
    } else {
      addNotification(result.message || t('vacationPage.rejectionError'), 'error');
    }
    return result;
  };

  const handleCancelVacation = async (vacationId: string) => {
    const result = await presenter.cancelVacation(vacationId);
    if (result.success) {
      addNotification(t('vacationPage.cancellationSuccess'), 'success');
      setViewModel(presenter.getVacationListViewModel());
    } else {
      addNotification(result.message || t('vacationPage.cancellationError'), 'error');
    }
    return result;
  };

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      await presenter.loadPendingRequests();
      setViewModel(presenter.getVacationListViewModel());
    } catch (err) {
      addNotification(t('vacationPage.loadingPendingError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: viewModel,
    requestVacation: handleRequestVacation,
    approveVacation: handleApproveVacation,
    rejectVacation: handleRejectVacation,
    cancelVacation: handleCancelVacation,
    loadPendingRequests,
    getMonthlyStatistics: (y: number, m: number) => presenter.getMonthlyStatistics(y, m),
    getPendingRequests: () => presenter.getPendingRequestsViewModel(),
    getVacationsByDateRange: (start: Date, end: Date) => presenter.getVacationsByDateRange(start, end)
  };
} 