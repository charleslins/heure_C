import { useState, useEffect, useMemo } from 'react';
import { HolidayCollection } from '../collections/HolidayCollection';
import { HolidayPresenter } from '../presenters/HolidayPresenter';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export function useHolidayPresenter(year?: number, cantonId?: number) {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new HolidayCollection(), []);
  const presenter = useMemo(() => new HolidayPresenter(collection), [collection]);

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] = useState<ReturnType<typeof presenter.getHolidayListViewModel>>();

  // Configurar ano e cantão selecionados
  useEffect(() => {
    if (year) presenter.setYear(year);
    if (cantonId !== undefined) presenter.setCanton(cantonId);
  }, [presenter, year, cantonId]);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        await presenter.initialize();
        setViewModel(presenter.getHolidayListViewModel());
      } catch (err) {
        setError(t('holidayManagement.loadingError'));
        addNotification(t('holidayManagement.loadingError'), 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, t, addNotification]);

  const handleCreateHoliday = async (data: Parameters<typeof presenter.createHoliday>[0]) => {
    const result = await presenter.createHoliday(data);
    if (result.success) {
      addNotification(t('holidayManagement.createSuccess'), 'success');
      setViewModel(presenter.getHolidayListViewModel());
    } else {
      addNotification(result.message || t('holidayManagement.createError'), 'error');
    }
    return result;
  };

  const handleUpdateHoliday = async (holidayId: string, data: Parameters<typeof presenter.updateHoliday>[1]) => {
    const result = await presenter.updateHoliday(holidayId, data);
    if (result.success) {
      addNotification(t('holidayManagement.updateSuccess'), 'success');
      setViewModel(presenter.getHolidayListViewModel());
    } else {
      addNotification(result.message || t('holidayManagement.updateError'), 'error');
    }
    return result;
  };

  const handleRemoveHoliday = async (holidayId: string) => {
    const result = await presenter.removeHoliday(holidayId);
    if (result.success) {
      addNotification(t('holidayManagement.removeSuccess'), 'success');
      setViewModel(presenter.getHolidayListViewModel());
    } else {
      addNotification(result.message || t('holidayManagement.removeError'), 'error');
    }
    return result;
  };

  return {
    isLoading,
    error,
    data: viewModel,
    createHoliday: handleCreateHoliday,
    updateHoliday: handleUpdateHoliday,
    removeHoliday: handleRemoveHoliday,
    getHolidaysByMonth: (month: number) => presenter.getHolidaysByMonth(month),
    getHolidaysByType: (type: 'OFFICIAL' | 'CUSTOM' | 'REGIONAL') => presenter.getHolidaysByType(type),
    getHolidaysByRegion: (cantonId: number, municipalityId?: number) => presenter.getHolidaysByRegion(cantonId, municipalityId)
  };
} 