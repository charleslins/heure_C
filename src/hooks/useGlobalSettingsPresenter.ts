import { useState, useEffect, useMemo } from 'react';
import { GlobalSettingsCollection } from '../collections/GlobalSettingsCollection';
import { GlobalSettingsPresenter } from '../presenters/GlobalSettingsPresenter';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { WorkTimeDefaults, VacationRules, RegionalSettings } from '../models/GlobalSettings';

export function useGlobalSettingsPresenter() {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new GlobalSettingsCollection(), []);
  const presenter = useMemo(() => new GlobalSettingsPresenter(collection), [collection]);

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] = useState<ReturnType<typeof presenter.getSettingsViewModel>>();

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        await presenter.initialize();
        setViewModel(presenter.getSettingsViewModel());
      } catch (err) {
        setError(t('globalSettings.loadingError'));
        addNotification(t('globalSettings.loadingError'), 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, t, addNotification]);

  const handleUpdateWorkTime = async (data: WorkTimeDefaults) => {
    const result = await presenter.updateWorkTime(data);
    if (result.success) {
      addNotification(t('globalSettings.workTimeUpdateSuccess'), 'success');
      setViewModel(presenter.getSettingsViewModel());
    } else {
      addNotification(result.message || t('globalSettings.workTimeUpdateError'), 'error');
    }
    return result;
  };

  const handleUpdateVacationRules = async (data: VacationRules) => {
    const result = await presenter.updateVacationRules(data);
    if (result.success) {
      addNotification(t('globalSettings.vacationRulesUpdateSuccess'), 'success');
      setViewModel(presenter.getSettingsViewModel());
    } else {
      addNotification(result.message || t('globalSettings.vacationRulesUpdateError'), 'error');
    }
    return result;
  };

  const handleUpdateRegionalSettings = async (data: RegionalSettings) => {
    const result = await presenter.updateRegionalSettings(data);
    if (result.success) {
      addNotification(t('globalSettings.regionalSettingsUpdateSuccess'), 'success');
      setViewModel(presenter.getSettingsViewModel());
    } else {
      addNotification(result.message || t('globalSettings.regionalSettingsUpdateError'), 'error');
    }
    return result;
  };

  const handleUpdateGeneralSettings = async (data: {
    tauxPercent?: number;
    annualVacationDays?: number;
  }) => {
    const result = await presenter.updateGeneralSettings(data);
    if (result.success) {
      addNotification(t('globalSettings.generalSettingsUpdateSuccess'), 'success');
      setViewModel(presenter.getSettingsViewModel());
    } else {
      addNotification(result.message || t('globalSettings.generalSettingsUpdateError'), 'error');
    }
    return result;
  };

  const handleResetToDefaults = async () => {
    const result = await presenter.resetToDefaults();
    if (result.success) {
      addNotification(t('globalSettings.resetSuccess'), 'success');
      setViewModel(presenter.getSettingsViewModel());
    } else {
      addNotification(result.message || t('globalSettings.resetError'), 'error');
    }
    return result;
  };

  return {
    isLoading,
    error,
    data: viewModel,
    updateWorkTime: handleUpdateWorkTime,
    updateVacationRules: handleUpdateVacationRules,
    updateRegionalSettings: handleUpdateRegionalSettings,
    updateGeneralSettings: handleUpdateGeneralSettings,
    resetToDefaults: handleResetToDefaults,
    validateVacationRequest: (startDate: Date, endDate: Date, userId: string) =>
      presenter.validateVacationRequest(startDate, endDate, userId),
    getWorkHoursForDate: (date: Date) =>
      presenter.getWorkHoursForDate(date),
    shouldConsiderRegionalHolidays: (cantonId?: number) =>
      presenter.shouldConsiderRegionalHolidays(cantonId),
    shouldConsiderMunicipalityHolidays: () =>
      presenter.shouldConsiderMunicipalityHolidays()
  };
} 