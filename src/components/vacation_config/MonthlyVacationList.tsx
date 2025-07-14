import React from "react";
import { useTranslation } from "react-i18next";
import { VacationStatus } from "@/types";
import { formatDateRange } from "../../utils/timeUtils";
import {
  Send,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
} from "lucide-react";
import SectionCard from "../common/SectionCard";

const MonthlyVacationList: React.FC<MonthlyVacationListProps> = ({
  currentMonthUserVacations,
  onDeleteVacation,
  onSubmitForApproval,
  onPrintRequest,
  displayDate,
  user,
}) => {
  const { t, i18n } = useTranslation();

  const sortedVacations = [...currentMonthUserVacations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <SectionCard
      title={t("vacationPage.myVacationsTitle", {
        month: displayDate.toLocaleDateString(i18n.language, { month: "long" }),
      })}
      titleTextClassName="text-xl font-semibold text-slate-700"
      headerActions={
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          {currentMonthUserVacations.some(
            (v) =>
              v.status === VacationStatus.PENDING_APPROVAL ||
              v.status === VacationStatus.APPROVED,
          ) && (
            <button
              onClick={onPrintRequest}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors flex items-center justify-center space-x-2 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>{t("vacationPage.printRequestButton")}</span>
            </button>
          )}
          {currentMonthUserVacations.some(
            (v) => v.status === VacationStatus.SELECTED,
          ) && (
            <button
              onClick={onSubmitForApproval}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Send className="w-5 h-5 transform -rotate-45" />
              <span>{t("vacationPage.submitRequestButton")}</span>
            </button>
          )}
        </div>
      }
    >
      {sortedVacations.length > 0 ? (
        <div className="max-h-80 overflow-y-auto pr-1 -mr-1">
          <ul className="flex flex-wrap gap-2 justify-start">
            {sortedVacations.map((vacation) => (
              <li
                key={vacation.date}
                className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm font-semibold text-xs mr-2
                                ${vacation.status === VacationStatus.APPROVED ? "bg-green-100 text-green-700 border border-green-200" : ""}
                                ${vacation.status === VacationStatus.PENDING_APPROVAL ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : ""}
                                ${vacation.status === VacationStatus.REJECTED ? "bg-red-100 text-red-700 border border-red-200" : ""}
                                ${vacation.status === VacationStatus.SELECTED ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : ""}
                            `}
                title={t(`vacationStatuses.${vacation.status}`)}
              >
                {vacation.status === VacationStatus.SELECTED && (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                {vacation.status === VacationStatus.PENDING_APPROVAL && (
                  <Clock className="w-4 h-4 mr-1" />
                )}
                {vacation.status === VacationStatus.APPROVED && (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                {vacation.status === VacationStatus.REJECTED && (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                <span className="block truncate">
                  {new Date(vacation.date + "T00:00:00").toLocaleDateString(
                    i18n.language,
                    { weekday: "short", day: "numeric", month: "short" },
                  )}
                </span>
                {(vacation.status === VacationStatus.SELECTED ||
                  vacation.status === VacationStatus.REJECTED ||
                  vacation.status === VacationStatus.PENDING_APPROVAL) && (
                  <button
                    onClick={() => onDeleteVacation(vacation.date)}
                    className="ml-2 p-0.5 hover:bg-red-200 rounded-full transition-colors flex items-center justify-center"
                    aria-label={t("vacationPage.deleteAction")}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-500 py-4 text-center">
          {t("vacationPage.noVacationDays")}
        </p>
      )}
    </SectionCard>
  );
};

export default MonthlyVacationList;
