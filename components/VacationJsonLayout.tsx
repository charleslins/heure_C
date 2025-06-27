import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/AuthContext';
import { useGlobalDataContext } from '../contexts/GlobalDataContext';
import { useCurrentUserDataContext } from '../contexts/CurrentUserDataContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useVacationCalculations } from '../hooks/useVacationCalculations';
import { getDaysInMonth, formatDateToYYYYMMDD } from '../utils/timeUtils';
import { printVacationRequest } from '../utils/printVacationRequest';
import { ArrowSmallLeftIcon, ArrowSmallRightIcon, CalendarDaysIcon } from './icons';
import LoadingScreen from './LoadingScreen';
import { VacationStatus } from '../types';
import VacationConfigPage from './VacationConfigPage';

// Ícones extras para os títulos
const SummaryIcon = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18" /></svg>
);
const HolidayIcon = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const PlaneIcon = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 12.5l8.5-2.5-8.5-2.5V3l-7 9 7 9v-5.5z" /></svg>
);

const statusColors: Record<string, string> = {
  workday: 'bg-white text-indigo-700 border border-indigo-200',
  weekend: 'bg-slate-100 text-slate-300',
  [VacationStatus.SELECTED]: 'bg-indigo-100 text-indigo-700 border border-indigo-400',
  [VacationStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-700 border border-yellow-400',
  [VacationStatus.APPROVED]: 'bg-green-100 text-green-700 border border-green-400',
  [VacationStatus.REJECTED]: 'bg-red-100 text-red-700 border border-red-400',
  empty: 'bg-transparent',
};
const summaryThemes = {
  'light-blue': 'bg-cyan-100 text-cyan-800',
  peach: 'bg-rose-100 text-rose-700',
  purple: 'bg-violet-100 text-violet-700',
  'light-purple': 'bg-indigo-100 text-indigo-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  pink: 'bg-pink-100 text-pink-700',
};

const CARD_SIZE = "h-16 w-18"; // Altere aqui para mudar o tamanho dos cards
const CARD_FONT = "text-base"; // Altere aqui para mudar o tamanho da fonte

export default function VacationJsonLayout() {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotificationContext();
  const { currentUser } = useAuthContext();
  const { globalUserSettings, globalHolidays, isLoadingGlobalData } = useGlobalDataContext();
  const {
    weeklyContract, dailyLogs, vacations, setVacations, loadUserYearVacations, isLoadingCurrentUserData
  } = useCurrentUserDataContext();

  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const [allYearVacations, setAllYearVacations] = useState<any[]>([]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  useEffect(() => {
    if (loadUserYearVacations && currentUser) {
      const fetchYearVacs = async () => {
        try {
          const yearVacs = await loadUserYearVacations(currentUser.id, year);
          setAllYearVacations(Array.isArray(yearVacs) ? yearVacs : []);
        } catch (error) {
          setAllYearVacations([]);
        }
      };
      fetchYearVacs();
    }
  }, [year, currentUser, loadUserYearVacations, vacations]);

  const daysInCalendarMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const currentMonthUserVacations = useMemo(() => {
    return vacations.filter(v => {
      const vDate = new Date(v.date + 'T00:00:00');
      return vDate.getFullYear() === year && vDate.getMonth() === month;
    });
  }, [vacations, year, month]);

  const currentMonthGlobalHolidays = useMemo(() => {
    return globalHolidays.filter(h => {
      const hDate = new Date(h.date + 'T00:00:00');
      return hDate.getFullYear() === year && hDate.getMonth() === month;
    });
  }, [globalHolidays, year, month]);

  // Calcule o tauxPercent dinamicamente
  const STANDARD_FULL_TIME_HOURS_WEEKLY = 40;
  const contractedWeeklyHours = Object.values(weeklyContract).reduce((acc: number, day: any) => acc + (day.morning || 0) + (day.afternoon || 0), 0);
  const tauxPercent = STANDARD_FULL_TIME_HOURS_WEEKLY > 0 ? Math.round((contractedWeeklyHours / STANDARD_FULL_TIME_HOURS_WEEKLY) * 100) : 0;

  const userGlobalSettingsDinamic = {
    ...globalUserSettings,
    tauxPercent,
    annualVacationDays: globalUserSettings.annualVacationDays || 20
  };

  const {
    remainingAnnualVacationDays,
    effectiveAnnualAllowance,
    monthSummary,
  } = useVacationCalculations({
    allYearVacations,
    userGlobalSettings: userGlobalSettingsDinamic,
    weeklyContract,
    globalHolidays,
    currentMonthUserVacations,
    daysInCalendarMonth,
  });

  const handleDayClick = useCallback((dateStr: string) => {
    const existingVacationIndex = vacations.findIndex(v => v.date === dateStr);
    let newVacations = [...vacations];
    if (existingVacationIndex > -1) {
      const existingVacation = vacations[existingVacationIndex];
      if (existingVacation.status === VacationStatus.SELECTED || existingVacation.status === VacationStatus.PENDING_APPROVAL || existingVacation.status === VacationStatus.REJECTED) {
        newVacations.splice(existingVacationIndex, 1);
      } else if (existingVacation.status === VacationStatus.APPROVED) {
        addNotification('Não é possível modificar um dia já aprovado.', 'info');
        return;
      }
    } else {
      newVacations.push({ date: dateStr, status: VacationStatus.SELECTED });
    }
    setVacations(newVacations);
  }, [vacations, setVacations, addNotification]);

  const handleDeleteVacationFromList = useCallback((dateStr: string) => {
    const existingVacation = vacations.find(v => v.date === dateStr);
    if (existingVacation && (
      existingVacation.status === VacationStatus.SELECTED ||
      existingVacation.status === VacationStatus.REJECTED ||
      existingVacation.status === VacationStatus.PENDING_APPROVAL
    )) {
      setVacations(vacations.filter(v => v.date !== dateStr));
      addNotification('Férias removidas com sucesso.', 'success');
    } else if (existingVacation && existingVacation.status === VacationStatus.APPROVED) {
      addNotification('Não é possível remover um dia já aprovado.', 'warning');
    }
  }, [vacations, setVacations, addNotification]);

  const handleSubmitForApproval = useCallback(() => {
    const updatedVacations = vacations.map(v => {
      const vDate = new Date(v.date + 'T00:00:00');
      if (v.status === VacationStatus.SELECTED && vDate.getFullYear() === year && vDate.getMonth() === month) {
        return { ...v, status: VacationStatus.PENDING_APPROVAL };
      }
      return v;
    });
    setVacations(updatedVacations);
    addNotification('Solicitação enviada!', 'success');
  }, [vacations, setVacations, year, month, addNotification]);

  const handlePrintRequestInternal = useCallback(() => {
    if (!currentUser) return;
    const printableVacations = currentMonthUserVacations
      .filter(v => v.status === VacationStatus.PENDING_APPROVAL || v.status === VacationStatus.APPROVED)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (printableVacations.length === 0) {
      addNotification('Nenhuma férias para imprimir.', 'info');
      return;
    }
    printVacationRequest(
      currentUser,
      printableVacations,
      displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' }),
      { t, language: i18n.language }
    );
  }, [currentUser, currentMonthUserVacations, displayDate, i18n, t, addNotification]);

  const changeDisplayedMonth = (increment: number) => {
    const newDisplayMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + increment, 1);
    setDisplayDate(newDisplayMonth);
  };

  // Internacionalização dos dias da semana
  const daysOfWeek = useMemo(() => {
    const baseDate = new Date(2023, 0, 2); // Segunda-feira
    return Array.from({ length: 7 }).map((_, i) =>
      baseDate.toLocaleDateString(i18n.language, { weekday: 'short' }).toUpperCase()
    );
  }, [i18n.language]);

  if (isLoadingGlobalData || isLoadingCurrentUserData || !currentUser) {
    return <LoadingScreen message={t('common.loadingData')} />;
  }

  // Geração dos dias do calendário (com células vazias para alinhamento)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  let calendarDays: any[] = [];
  let offset = (firstDayOfWeek + 6) % 7; // Ajuste para começar em segunda-feira
  for (let i = 0; i < offset; i++) {
    calendarDays.push({});
  }
  for (let d = 1; d <= daysInCalendarMonth.length; d++) {
    const dateStr = formatDateToYYYYMMDD(new Date(year, month, d));
    const vacation = currentMonthUserVacations.find(v => v.date === dateStr);
    const holiday = currentMonthGlobalHolidays.find(h => h.date === dateStr);
    let status: string | VacationStatus = 'workday';
    let label = '';
    if (holiday) {
      status = 'weekend';
      label = t('vacationPage.holidayLabel');
    } else if (vacation) {
      status = vacation.status;
      label = t(`vacationStatuses.${vacation.status}`);
    }
    calendarDays.push({
      date: d,
      dateStr,
      status,
      hours: '8.00h', // Pode ser dinâmico se necessário
      label,
    });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({});
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal */}
        <div className="flex items-center gap-2 text-indigo-700 text-2xl font-semibold mb-2">
          <CalendarDaysIcon className="w-7 h-7" />
          <span>{t('vacationPage.title')}</span>
        </div>
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => changeDisplayedMonth(-1)} className="text-2xl text-slate-400 px-2"><ArrowSmallLeftIcon className="w-6 h-6" /></button>
              <span className="text-2xl font-bold text-indigo-700 py-4 block">
                {displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeDisplayedMonth(1)} className="text-2xl text-slate-400 px-2"><ArrowSmallRightIcon className="w-6 h-6" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-2">
              {/* Linha dos dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-1">
                {daysOfWeek.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center h-8 w-16 rounded-lg bg-white text-indigo-600 text-xs font-bold uppercase tracking-wide shadow-sm"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, i) => {
                  const col = i % 7;
                  const isWeekend = col === 5 || col === 6;
                  if (!day.date) {
                    return <div key={i} className="h-16 w-16" />;
                  }
                  if (isWeekend) {
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-300 h-16 w-16"
                      >
                        <span className="text-lg font-bold">{day.date}</span>
                        <span className="text-xs">{day.hours}</span>
                        {day.label && <span className="text-xxs">{day.label}</span>}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      className={`flex flex-col items-center justify-center rounded-lg border ${statusColors[day.status] || 'border-indigo-200 bg-white text-indigo-700'} h-16 w-16 focus:outline-none`}
                      onClick={() => handleDayClick(day.dateStr)}
                    >
                      <span className="text-lg font-bold">{day.date}</span>
                      <span className="text-xs text-indigo-400">{day.hours}</span>
                      {day.label && <span className="text-xxs text-indigo-600">{day.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Resumo do mês */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
                <SummaryIcon className="w-6 h-6" />
                <span>{t('vacationPage.monthlySummaryTitle')}</span>
              </div>
              <div className="space-y-2">
                {monthSummary && Object.entries(monthSummary).map(([key, value], i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-slate-700 text-sm min-w-[170px]">{t(`vacationPage.${key}`)}</span>
                    <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Feriados */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
                <HolidayIcon className="w-6 h-6" />
                <span>{t('vacationPage.holidaysTitle', { month: displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' }) })}</span>
              </div>
              <ul className="space-y-1">
                {currentMonthGlobalHolidays.map((h: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>{h.name}</span>
                    <span className="text-slate-400">{new Date(h.date + 'T00:00:00').toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Minhas Férias */}
        <div className="bg-white rounded-2xl shadow p-4 mt-2">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
            <PlaneIcon className="w-6 h-6" />
            <span>{t('vacationPage.myVacationsTitle', { month: displayDate.toLocaleDateString(i18n.language, { month: 'long' }) })}</span>
            <button
              onClick={handleSubmitForApproval}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium shadow"
            >
              {t('vacationPage.submitRequestButton')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentMonthUserVacations.length > 0 ? (
              currentMonthUserVacations.map((opt: any, idx: number) => (
                <span
                  key={opt.date}
                  className={`px-4 py-1 rounded-full text-xs font-semibold shadow-sm border border-indigo-200 ${opt.status === VacationStatus.SELECTED ? 'bg-indigo-200 text-indigo-800' : opt.status === VacationStatus.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-700' : opt.status === VacationStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {new Date(opt.date + 'T00:00:00').toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' })}
                  {opt.status && (
                    <span className="ml-2">{t(`vacationStatuses.${opt.status}`)}</span>
                  )}
                  {(opt.status === VacationStatus.SELECTED || opt.status === VacationStatus.REJECTED || opt.status === VacationStatus.PENDING_APPROVAL) && (
                    <button
                      onClick={() => handleDeleteVacationFromList(opt.date)}
                      className="ml-2 p-0.5 hover:bg-red-200 rounded-full transition-colors text-xs"
                      aria-label={t('vacationPage.deleteAction')}
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs">{t('vacationPage.noVacationDays')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}