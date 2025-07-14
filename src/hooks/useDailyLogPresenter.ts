import { useState, useEffect, useMemo } from "react";
import { DailyLogCollection } from "../collections/DailyLogCollection";
import { DailyLogPresenter } from "../presenters/DailyLogPresenter";
import { useNotificationContext } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth";
import { EntryType, TimeSegment } from "../models/DailyLog";

export function useDailyLogPresenter(year?: number, month?: number) {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new DailyLogCollection(), []);
  const presenter = useMemo(
    () => new DailyLogPresenter(collection),
    [collection]
  );

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] =
    useState<ReturnType<typeof presenter.getDailyLogViewModel>>();

  // Configurar usuário e data
  useEffect(() => {
    if (currentUser?.id) {
      presenter.setUserId(currentUser.id);
    }
    if (year !== undefined && month !== undefined) {
      presenter.setDate(year, month);
    }
  }, [presenter, currentUser?.id, year, month]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!currentUser?.id || year === undefined || month === undefined) return;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        await presenter.initialize();
        setViewModel(presenter.getDailyLogViewModel());
      } catch (err) {
        setError(t("dailyLog.loadingError"));
        addNotification(t("dailyLog.loadingError"), "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, user?.id, year, month, t, addNotification]);

  const handleCreateLog = async (date: string, type?: EntryType) => {
    const result = await presenter.createLog(date, type);
    if (result.success) {
      addNotification(t("dailyLog.createSuccess"), "success");
      setViewModel(presenter.getDailyLogViewModel());
    } else {
      addNotification(result.message || t("dailyLog.createError"), "error");
    }
    return result;
  };

  const handleUpdateLog = async (
    logId: string,
    data: {
      type?: EntryType;
      morning?: TimeSegment;
      afternoon?: TimeSegment;
      comment?: string;
    }
  ) => {
    const result = await presenter.updateLog(logId, data);
    if (result.success) {
      addNotification(t("dailyLog.updateSuccess"), "success");
      setViewModel(presenter.getDailyLogViewModel());
    } else {
      addNotification(result.message || t("dailyLog.updateError"), "error");
    }
    return result;
  };

  const handleRemoveLog = async (logId: string) => {
    const result = await presenter.removeLog(logId);
    if (result.success) {
      addNotification(t("dailyLog.removeSuccess"), "success");
      setViewModel(presenter.getDailyLogViewModel());
    } else {
      addNotification(result.message || t("dailyLog.removeError"), "error");
    }
    return result;
  };

  const handleBulkUpdate = async (
    updates: Array<{
      date: string;
      type?: EntryType;
      morning?: TimeSegment;
      afternoon?: TimeSegment;
      comment?: string;
    }>
  ) => {
    const result = await presenter.bulkUpdateLogs(updates);
    if (result.success) {
      addNotification(t("dailyLog.bulkUpdateSuccess"), "success");
      setViewModel(presenter.getDailyLogViewModel());
    } else {
      addNotification(result.message || t("dailyLog.bulkUpdateError"), "error");
    }
    return result;
  };

  return {
    isLoading,
    error,
    data: viewModel,
    createLog: handleCreateLog,
    updateLog: handleUpdateLog,
    removeLog: handleRemoveLog,
    bulkUpdate: handleBulkUpdate,
    getLogsByType: (type: EntryType) => presenter.getLogsByType(type),
    getIncompleteLogs: () => presenter.getIncompleteLogsViewModel(),
  };
}
