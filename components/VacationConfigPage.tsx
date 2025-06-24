import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useTranslation } from 'react-i18next';
import { VacationStatus, VacationDay, VacationConfigPageProps, UserGlobalSettings } from '../types';
import { getDaysInMonth, formatDateToYYYYMMDD } from '../utils/timeUtils';
import SectionCard from './SectionCard';
import { ArrowSmallLeftIcon, ArrowSmallRightIcon, CalendarDaysIcon as PageIcon } from './icons';
import CalendarGrid from './vacation_config/CalendarGrid';
import VacationSummaryPanel from './vacation_config/VacationSummaryPanel';
import MonthlyVacationList from './vacation_config/MonthlyVacationList';
import { useVacationCalculations } from '../hooks/useVacationCalculations';
import { printVacationRequest } from '../utils/printVacationRequest';
import { useAuthContext } from '../contexts/AuthContext';
import { useGlobalDataContext } from '../contexts/GlobalDataContext';
import { useCurrentUserDataContext } from '../contexts/CurrentUserDataContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import LoadingScreen from './LoadingScreen';


const VacationConfigPage: React.FC<VacationConfigPageProps> = ({
    currentDate, // From App.tsx state
    onDateChange // From App.tsx state
}) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotificationContext();
  const { currentUser } = useAuthContext();
  const { globalUserSettings, globalHolidays, isLoadingGlobalData } = useGlobalDataContext();
  const { 
    weeklyContract, dailyLogs, vacations, setVacations, loadUserYearVacations, 
    isLoadingCurrentUserData 
  } = useCurrentUserDataContext();

  const [displayDate, setDisplayDate] = useState<Date>(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const [allYearVacations, setAllYearVacations] = useState<VacationDay[]>([]);
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  useEffect(() => {
    setDisplayDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate]);

  useEffect(() => {
    if (loadUserYearVacations && currentUser) {
        const fetchYearVacs = async () => {
            try {
                const yearVacs = await loadUserYearVacations(currentUser.id, year);
                setAllYearVacations(Array.isArray(yearVacs) ? yearVacs : []);
            } catch (error) {
                console.error("Error loading year vacations:", error);
                addNotification('Error loading annual vacation data.', 'error');
                setAllYearVacations([]);
            }
        };
        fetchYearVacs();
    }
  }, [year, currentUser, loadUserYearVacations, vacations, addNotification]); 

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
  const STANDARD_FULL_TIME_HOURS_WEEKLY = 40; // ou o valor padrão do seu sistema
  const contractedWeeklyHours = Object.values(weeklyContract).reduce((acc, day) => acc + (day.morning || 0) + (day.afternoon || 0), 0);
  const tauxPercent = STANDARD_FULL_TIME_HOURS_WEEKLY > 0 ? Math.round((contractedWeeklyHours / STANDARD_FULL_TIME_HOURS_WEEKLY) * 100) : 0;

  // Crie um userGlobalSettings dinâmico
  const userGlobalSettingsDinamic = {
    ...globalUserSettings,
    tauxPercent,
    annualVacationDays: globalUserSettings.annualVacationDays || 20 // valor padrão se não houver
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
      if (existingVacation.status === VacationStatus.SELECTED || 
          existingVacation.status === VacationStatus.PENDING_APPROVAL ||
          existingVacation.status === VacationStatus.REJECTED) {
        newVacations.splice(existingVacationIndex, 1);
      } else if (existingVacation.status === VacationStatus.APPROVED) {
        addNotification(t('vacationPage.alertModifyApproved', { status: t(`vacationStatuses.${existingVacation.status}`), newStatus: t(`vacationStatuses.${VacationStatus.SELECTED}`) }), 'info');
        return; 
      }
    } else {
      newVacations.push({ date: dateStr, status: VacationStatus.SELECTED });
    }
    setVacations(newVacations);
  }, [vacations, setVacations, t, addNotification]);

  const handleDeleteVacationFromList = useCallback((dateStr: string) => {
    const existingVacation = vacations.find(v => v.date === dateStr);
    if (existingVacation && (
        existingVacation.status === VacationStatus.SELECTED || 
        existingVacation.status === VacationStatus.REJECTED ||
        existingVacation.status === VacationStatus.PENDING_APPROVAL 
    )) {
        setVacations(vacations.filter(v => v.date !== dateStr));
        addNotification(t('vacationPage.alertVacationDeletedSuccessfully', { date: new Date(dateStr + 'T00:00:00').toLocaleDateString(i18n.language) }), 'success');
    } else if (existingVacation && existingVacation.status === VacationStatus.APPROVED) {
        addNotification(t('vacationPage.alertDeletePending', {status: t(`vacationStatuses.${existingVacation.status}`)}), 'warning');
    }
  }, [vacations, setVacations, t, i18n.language, addNotification]);

  const handleSubmitForApproval = useCallback(() => {
    const updatedVacations = vacations.map(v => {
        const vDate = new Date(v.date + 'T00:00:00');
        if (v.status === VacationStatus.SELECTED && vDate.getFullYear() === year && vDate.getMonth() === month) {
            return { ...v, status: VacationStatus.PENDING_APPROVAL };
        }
        return v;
    });
    setVacations(updatedVacations);
    addNotification(t('vacationPage.alertRequestsSent'), 'success');
    addNotification(t('vacationPage.alertAdminNotified'), 'info');
  }, [vacations, setVacations, year, month, t, addNotification]);

  const handlePrintRequestInternal = useCallback(() => {
    if (!currentUser) return;
    const printableVacations = currentMonthUserVacations
      .filter(v => v.status === VacationStatus.PENDING_APPROVAL || v.status === VacationStatus.APPROVED)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (printableVacations.length === 0) {
        addNotification(t('vacationPage.alertNoPrintableVacations'), 'info');
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
    onDateChange(newDisplayMonth); 
  };

  if (isLoadingGlobalData || isLoadingCurrentUserData || !currentUser) {
    return <LoadingScreen message={t('common.loadingData')} />;
  }

  return (
    <div className="space-y-4">
       <SectionCard
          title={t('vacationPage.title')}
          titleIcon={PageIcon}
          titleIconProps={{ className: "w-7 h-7 text-indigo-600" }}
          titleTextClassName="text-2xl font-semibold text-slate-800"
          headerAreaClassName="p-6 pb-4 border-none"
          contentAreaClassName="p-6"
          cardClassName="bg-white rounded-xl shadow-md"
       >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <SectionCard 
                  title={
                    <div className="flex items-center justify-center gap-4 w-full">
                      <button onClick={() => changeDisplayedMonth(-1)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600" aria-label={t('monthYearSelector.selectMonth')}>
                          <ArrowSmallLeftIcon className="w-6 h-6" />
                      </button>
                      <span className="text-xl font-semibold text-indigo-700 whitespace-nowrap">
                        {displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => changeDisplayedMonth(1)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600" aria-label={t('monthYearSelector.selectMonth')}>
                          <ArrowSmallRightIcon className="w-6 h-6" />
                      </button>
                    </div>
                  }
                  titleTextClassName=""
                  headerAreaClassName="p-0 mb-0 border-none"
                  contentAreaClassName="p-0"
                  cardClassName="bg-slate-50 rounded-lg shadow-none border border-slate-100"
                >
                  <CalendarGrid
                    year={year}
                    month={month}
                    vacationsForMonth={currentMonthUserVacations}
                    globalHolidays={globalHolidays}
                    weeklyContract={weeklyContract}
                    dailyLogs={dailyLogs}
                    onDayClick={handleDayClick}
                    remainingAnnualVacationDays={remainingAnnualVacationDays}
                  />
                </SectionCard>
              </div>

              <VacationSummaryPanel
                remainingAnnualVacationDays={remainingAnnualVacationDays}
                effectiveAnnualAllowance={effectiveAnnualAllowance}
                monthSummaryData={monthSummary}
                displayDate={displayDate}
                currentMonthGlobalHolidays={currentMonthGlobalHolidays}
              />
          </div>
        </SectionCard>

        <SectionCard
          title={t('vacationPage.holidaysTitle', { month: displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' }) })}
          titleTextClassName="text-lg font-semibold text-slate-700"
          headerAreaClassName="p-4 border-b border-slate-200"
          contentAreaClassName="p-4"
          cardClassName="bg-white rounded-xl shadow-md"
        >
          <MonthlyVacationList
              currentMonthUserVacations={currentMonthUserVacations}
              onDeleteVacation={handleDeleteVacationFromList}
              onSubmitForApproval={handleSubmitForApproval}
              onPrintRequest={handlePrintRequestInternal}
              displayDate={displayDate}
              user={currentUser}
          />
        </SectionCard>
    </div>
  );
};

export default VacationConfigPage;