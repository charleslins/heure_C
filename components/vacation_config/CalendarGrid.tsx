
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WeeklyContractHours,
  VacationDay,
  Holiday,
  EntryType,
  DailyLogEntry,
  VacationStatus,
  CalendarGridProps,
  STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE
} from '../../types';
import { getDaysInMonth, formatDateToYYYYMMDD, getDayOfWeekName, formatHours } from '../../utils/timeUtils';
import { VACATION_STATUS_STYLES } from '../../constants';

// Helper to generate day headers starting from Monday
const generateDayHeaders = (locale: string): string[] => {
    const headers: string[] = [];
    const refMonday = new Date(2024, 0, 1); // A known Monday
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(refMonday);
        currentDay.setDate(refMonday.getDate() + i);
        headers.push(currentDay.toLocaleDateString(locale, { weekday: 'short' }).substring(0,3));
    }
    return headers;
};

const getFirstDayOfMonthGridOffset = (year: number, month: number): number => {
    const firstDayDate = new Date(year, month, 1);
    const dayOfWeek = firstDayDate.getDay();
    return (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Monday is 0, Sunday is 6
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  vacationsForMonth,
  globalHolidays,
  weeklyContract,
  dailyLogs,
  onDayClick,
  remainingAnnualVacationDays
}) => {
  const { t, i18n } = useTranslation();

  const daysInCalendarMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const daysOffset = useMemo(() => getFirstDayOfMonthGridOffset(year, month), [year, month]);
  const dayHeaders = useMemo(() => generateDayHeaders(i18n.language), [i18n.language]);

  const handleDayClickInternal = (dateStr: string) => {
    const dayDate = new Date(dateStr + 'T00:00:00');
    const isGlobalHolidayOnClick = globalHolidays.some(h => h.date === dateStr);
    if (isGlobalHolidayOnClick) return;

    const logEntryForDay = dailyLogs.find(log => formatDateToYYYYMMDD(log.date) === dateStr);
    if (logEntryForDay && (logEntryForDay.morning.type === EntryType.FERIE || logEntryForDay.afternoon.type === EntryType.FERIE)) return;
    if (logEntryForDay && (logEntryForDay.morning.type === EntryType.RECUPERATION || logEntryForDay.afternoon.type === EntryType.RECUPERATION)) return;
    if (logEntryForDay && (logEntryForDay.morning.type === EntryType.MALADIE || logEntryForDay.afternoon.type === EntryType.MALADIE)) return;

    const dayName = getDayOfWeekName(dayDate);
    const contractForDay = weeklyContract[dayName];
    const isWorkingDay = contractForDay.morning > 0 || contractForDay.afternoon > 0;
    if (!isWorkingDay) return;

    const existingVacation = vacationsForMonth.find(v => v.date === dateStr);
    if (!existingVacation) { // If adding a new vacation
        const hoursForThisDay = (contractForDay.morning || 0) + (contractForDay.afternoon || 0);
        const impactThisSelectionDaysEquivalent = STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE > 0
            ? hoursForThisDay / STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE
            : 0;

        if (impactThisSelectionDaysEquivalent > 0 && remainingAnnualVacationDays !== undefined) {
            if ((remainingAnnualVacationDays - impactThisSelectionDaysEquivalent) < -0.001) { 
                alert(t('vacationPage.alertVacationDayExceedsBalance'));
                return;
            }
            if (remainingAnnualVacationDays <= 0) {
                alert(t('vacationPage.alertNoMoreVacationDays'));
                return;
            }
        }
    }
    onDayClick(dateStr);
  };


  return (
    <>
      <div className="grid grid-cols-7 gap-px text-center text-xs sm:text-sm font-medium text-slate-600 bg-slate-200 rounded-t-md">
        {dayHeaders.map(header => <div key={header} className="py-1.5 px-1">{header}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-b-md">
        {Array.from({ length: daysOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="bg-slate-50 h-[68px] sm:h-[76px]"></div>
        ))}
        {daysInCalendarMonth.map(dayDate => {
          const dateStr = formatDateToYYYYMMDD(dayDate);
          const dayName = getDayOfWeekName(dayDate);
          const contractForDay = weeklyContract[dayName];
          const totalContractHours = (contractForDay?.morning || 0) + (contractForDay?.afternoon || 0);
          const isWorkingDay = totalContractHours > 0;
          const userVacation = vacationsForMonth.find(v => v.date === dateStr);
          const isGlobalHoliday = globalHolidays.some(h => h.date === dateStr);
          const logEntryForDay = dailyLogs.find(log => formatDateToYYYYMMDD(log.date) === dateStr);
          const isRecuperationDay = logEntryForDay && (logEntryForDay.morning.type === EntryType.RECUPERATION || logEntryForDay.afternoon.type === EntryType.RECUPERATION);
          const isSickDay = logEntryForDay && (logEntryForDay.morning.type === EntryType.MALADIE || logEntryForDay.afternoon.type === EntryType.MALADIE);

          let cellBgClass = 'bg-white';
          let isActionable = false;
          let dayNumberStyle = 'text-lg sm:text-xl font-semibold text-slate-800';
          let dayAbbrStyle = 'text-xxs sm:text-xs capitalize text-slate-500';
          let indicatorElement = null;
          let indicatorTextForAria: string = '';

          if (isGlobalHoliday) {
            cellBgClass = 'bg-yellow-50';
            dayNumberStyle = 'text-lg sm:text-xl font-semibold text-yellow-700';
            dayAbbrStyle = 'text-xxs sm:text-xs capitalize text-yellow-600';
            indicatorElement = <div className="mt-0.5"><span className="text-xxs sm:text-xs font-medium text-yellow-700">{t('vacationPage.holidayLabel')}</span></div>;
            indicatorTextForAria = t('vacationPage.holidayLabel');
          } else if (isRecuperationDay) {
            cellBgClass = 'bg-cyan-50';
            dayNumberStyle = 'text-lg sm:text-xl font-semibold text-cyan-700';
            dayAbbrStyle = 'text-xxs sm:text-xs capitalize text-cyan-600';
            indicatorElement = <div className="mt-0.5"><span className="text-xxs sm:text-xs font-medium text-cyan-700">{t('vacationPage.recuperationLabel', 'RECUP.')}</span></div>;
            indicatorTextForAria = t('vacationPage.recuperationLabel', 'RECUP.');
          } else if (isSickDay) {
            cellBgClass = 'bg-red-50';
            dayNumberStyle = 'text-lg sm:text-xl font-semibold text-red-700';
            dayAbbrStyle = 'text-xxs sm:text-xs capitalize text-red-600';
            indicatorElement = <div className="mt-0.5"><span className="text-xxs sm:text-xs font-medium text-red-700">{t('vacationPage.sickLeaveLabel', 'ATEST.')}</span></div>;
            indicatorTextForAria = t('vacationPage.sickLeaveLabel', 'ATEST.');
          } else if (userVacation) {
            const statusStyle = VACATION_STATUS_STYLES[userVacation.status];
            cellBgClass = statusStyle.bg;
            dayNumberStyle = `text-lg sm:text-xl font-semibold ${statusStyle.text}`;
            dayAbbrStyle = `text-xxs sm:text-xs capitalize ${statusStyle.text} opacity-90`;
            indicatorElement = <div className="mt-0.5"><span className={`text-xxs sm:text-xs font-medium ${statusStyle.text}`}>{t(`vacationStatuses.${userVacation.status}`)}</span></div>;
            indicatorTextForAria = t(`vacationStatuses.${userVacation.status}`);
            isActionable = userVacation.status !== VacationStatus.APPROVED;
            if (userVacation.status === VacationStatus.APPROVED) cellBgClass += ' opacity-70';
            if (userVacation.status === VacationStatus.PENDING_APPROVAL) cellBgClass += ' opacity-80';
          } else if (isWorkingDay) {
            cellBgClass = 'bg-white hover:bg-indigo-50 focus-within:bg-indigo-50';
            indicatorElement = <div className="mt-0.5"><span className="text-xxs sm:text-xs text-indigo-700 font-medium">{formatHours(totalContractHours)}{t('common.hoursUnitShort')}</span></div>;
            indicatorTextForAria = `${formatHours(totalContractHours)}${t('common.hoursUnitShort')}`;
            isActionable = true;
          } else {
            cellBgClass = 'bg-slate-100';
            dayNumberStyle = 'text-lg sm:text-xl font-semibold text-slate-400';
            dayAbbrStyle = 'text-xxs sm:text-xs capitalize text-slate-400';
            indicatorTextForAria = t('common.nonWorkingDay', 'Non-working');
          }

          const cellContent = (
            <div className="flex flex-col items-center justify-center h-full p-0.5 sm:p-1">
              <span className={dayNumberStyle}>{dayDate.getDate()}</span>
              <span className={dayAbbrStyle}>{dayDate.toLocaleDateString(i18n.language, { weekday: 'short' }).substring(0,3)}</span>
              {indicatorElement}
            </div>
          );

          return (
            <div
              key={dateStr}
              className={`relative flex flex-col items-stretch justify-start text-center h-[68px] sm:h-[76px]
                          transition-colors duration-150 ease-in-out rounded-sm
                          ${cellBgClass}
                          ${isActionable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10' : 'cursor-not-allowed'}
                        `}
              onClick={isActionable ? () => handleDayClickInternal(dateStr) : undefined}
              onKeyDown={isActionable ? (e) => (e.key === 'Enter' || e.key === ' ') && handleDayClickInternal(dateStr) : undefined}
              role={isActionable ? "button" : undefined}
              tabIndex={isActionable ? 0 : -1}
              aria-label={`${t('dailyLog.dateHeader')} ${dayDate.toLocaleDateString(i18n.language)}, ${indicatorTextForAria}`}
              aria-disabled={!isActionable}
            >
              {cellContent}
            </div>
          );
        })}
        {Array.from({ length: (7 - (daysInCalendarMonth.length + daysOffset) % 7) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-slate-50 h-[68px] sm:h-[76px]"></div>
        ))}
      </div>
    </>
  );
};

export default CalendarGrid;
