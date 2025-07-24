import React from "react";
import { useTranslation } from "react-i18next";
import { DailyLogEntry, UserGlobalSettings, WeeklyContractHours, EntryType } from "@/types";
import { ICONS } from "@/utils/constants";
import {
  MobileTable,
  MobileTableRow,
  MobileTableCell,
  MobileTableGrid,
  MobileTableExpandableSection,
  useMobileTableExpansion,
} from "./MobileTable";
import { Clock, Calendar, Sun, Moon } from "lucide-react";
import { calculateDurationInHours, formatDateToYYYYMMDD } from "@/utils/timeUtils";

interface MobileDailyLogProps {
  dailyLogs: DailyLogEntry[];
  onLogEntryChange: (updatedEntry: DailyLogEntry) => void;
  userGlobalSettings: UserGlobalSettings;
  weeklyContract: WeeklyContractHours;
}

/**
 * Versão mobile otimizada do DailyLog
 * Converte a tabela complexa em cards expansíveis
 */
const MobileDailyLog: React.FC<MobileDailyLogProps> = ({
  dailyLogs,
  onLogEntryChange,
  userGlobalSettings,
  weeklyContract,
}) => {
  const { t } = useTranslation();
  const { toggleRow, isExpanded } = useMobileTableExpansion();

  if (!dailyLogs || dailyLogs.length === 0) {
    return (
      <div className="md:hidden">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">{t("dailyLog.noData")}</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    return timeString;
  };

  const getWorkTypeIcon = (type: EntryType) => {
    switch (type) {
      case EntryType.REGULAR:
        return "💼";
      case EntryType.VACANCE:
        return "🏖️";
      case EntryType.MALADIE:
        return "🏥";
      case EntryType.FERIE:
        return "🎉";
      case EntryType.RECUPERATION:
        return "🔄";
      default:
        return "📝";
    }
  };

  const getWorkTypeLabel = (type: EntryType) => {
    switch (type) {
      case EntryType.REGULAR:
        return t("dailyLog.workType.work");
      case EntryType.VACANCE:
        return t("dailyLog.workType.vacation");
      case EntryType.MALADIE:
        return t("dailyLog.workType.sick");
      case EntryType.FERIE:
        return t("dailyLog.workType.holiday");
      case EntryType.RECUPERATION:
        return t("dailyLog.workType.recuperation");
      default:
        return type;
    }
  };

  const calculateDayTotal = (entry: DailyLogEntry) => {
    const morningHours = calculateDurationInHours(
      entry.morning.start,
      entry.morning.end
    );
    const afternoonHours = calculateDurationInHours(
      entry.afternoon.start,
      entry.afternoon.end
    );
    return morningHours + afternoonHours;
  };

  return (
    <div className="md:hidden">
      <MobileTable className="px-4">
        {dailyLogs.map((entry) => {
          const dayTotal = calculateDayTotal(entry);
          const hasDetails = entry.morning.start || entry.afternoon.start;
          const rowId = entry.id;

          return (
            <MobileTableRow
              key={entry.id}
              isExpandable={hasDetails}
              isExpanded={isExpanded(rowId)}
              onToggle={hasDetails ? () => toggleRow(rowId) : undefined}
            >
              {/* Informações principais sempre visíveis */}
              <MobileTableGrid columns={2}>
                <MobileTableCell
                  label={t("dailyLog.dateHeader")}
                  value={
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{formatDate(entry.date)}</span>
                    </div>
                  }
                />
                <MobileTableCell
                  label={t("dailyLog.totalHoursShortHeader")}
                  value={
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className={`font-semibold ${
                        dayTotal > 8 ? "text-orange-600" : "text-slate-900"
                      }`}>
                        {dayTotal.toFixed(2)}h
                      </span>
                    </div>
                  }
                />
              </MobileTableGrid>

              {/* Tipos de trabalho se houver */}
              {(entry.morning.type !== EntryType.REGULAR || entry.afternoon.type !== EntryType.REGULAR) && (
                <div className="mt-3">
                  <div className="flex items-center space-x-4">
                    {entry.morning.type !== EntryType.REGULAR && (
                      <div className="flex items-center space-x-1">
                        <span>{getWorkTypeIcon(entry.morning.type)}</span>
                        <span className="text-xs text-slate-600">
                          {getWorkTypeLabel(entry.morning.type)}
                        </span>
                      </div>
                    )}
                    {entry.afternoon.type !== EntryType.REGULAR && (
                      <div className="flex items-center space-x-1">
                        <span>{getWorkTypeIcon(entry.afternoon.type)}</span>
                        <span className="text-xs text-slate-600">
                          {getWorkTypeLabel(entry.afternoon.type)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção expansível com detalhes */}
              {hasDetails && (
                <MobileTableExpandableSection isExpanded={isExpanded(rowId)}>
                  <div className="space-y-4">
                    {/* Período da manhã */}
                    {entry.morning.start && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-slate-700">
                            {t("dailyLog.morningHeader")}
                          </span>
                        </div>
                        <MobileTableGrid columns={2}>
                          <MobileTableCell
                            label={t("dailyLog.startHeader")}
                            value={formatTime(entry.morning.start)}
                          />
                          <MobileTableCell
                            label={t("dailyLog.endHeader")}
                            value={formatTime(entry.morning.end)}
                          />
                          {entry.morning.type !== EntryType.REGULAR && (
                            <MobileTableCell
                              label={t("dailyLog.typeHeader")}
                              value={
                                <div className="flex items-center space-x-1">
                                  <span>{getWorkTypeIcon(entry.morning.type)}</span>
                                  <span>{getWorkTypeLabel(entry.morning.type)}</span>
                                </div>
                              }
                              fullWidth
                            />
                          )}
                        </MobileTableGrid>
                      </div>
                    )}

                    {/* Período da tarde */}
                    {entry.afternoon.start && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium text-slate-700">
                            {t("dailyLog.afternoonHeader")}
                          </span>
                        </div>
                        <MobileTableGrid columns={2}>
                          <MobileTableCell
                            label={t("dailyLog.startHeader")}
                            value={formatTime(entry.afternoon.start)}
                          />
                          <MobileTableCell
                            label={t("dailyLog.endHeader")}
                            value={formatTime(entry.afternoon.end)}
                          />
                          {entry.afternoon.type !== EntryType.REGULAR && (
                            <MobileTableCell
                              label={t("dailyLog.typeHeader")}
                              value={
                                <div className="flex items-center space-x-1">
                                  <span>{getWorkTypeIcon(entry.afternoon.type)}</span>
                                  <span>{getWorkTypeLabel(entry.afternoon.type)}</span>
                                </div>
                              }
                              fullWidth
                            />
                          )}
                        </MobileTableGrid>
                      </div>
                    )}
                  </div>
                </MobileTableExpandableSection>
              )}
            </MobileTableRow>
          );
        })}
      </MobileTable>
    </div>
  );
};

export default MobileDailyLog;