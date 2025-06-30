import { useMemo } from 'react';
import {
  VacationStatus,
  STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE,
  UseVacationCalculationsProps,
  VacationCalculations
} from '../types';
import { getDayOfWeekName, formatDateToYYYYMMDD } from '../utils/timeUtils';

export const useVacationCalculations = ({
  allYearVacations,
  userGlobalSettings,
  weeklyContract,
  globalHolidays,
  currentMonthUserVacations,
  daysInCalendarMonth,
}: UseVacationCalculationsProps): VacationCalculations => {

  const { effectiveAnnualAllowance, remainingAnnualVacationDays } = useMemo(() => {
    if (!userGlobalSettings || !weeklyContract || !globalHolidays) {
      return { effectiveAnnualAllowance: undefined, remainingAnnualVacationDays: undefined };
    }

    const baseAllowance = userGlobalSettings.annualVacationDays || 0;
    const tauxFactor = (userGlobalSettings.tauxPercent || 100) / 100;
    const calculatedEffectiveAllowance = parseFloat((baseAllowance * tauxFactor).toFixed(2));

    let effectiveVacationHoursTakenOrPending = 0;
    allYearVacations.forEach(vacDay => {
      if (vacDay.status === VacationStatus.SELECTED || vacDay.status === VacationStatus.PENDING_APPROVAL || vacDay.status === VacationStatus.APPROVED) {
        const isGlobalHolidayForThisDay = globalHolidays.some(h => h.date === vacDay.date);
        if (!isGlobalHolidayForThisDay) {
          const dayDateObj = new Date(vacDay.date + 'T00:00:00');
          const dayName = getDayOfWeekName(dayDateObj);
          const contractForDay = weeklyContract[dayName];
          effectiveVacationHoursTakenOrPending += (contractForDay?.morning || 0) + (contractForDay?.afternoon || 0);
        }
      }
    });

    const effectiveDaysTaken = STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE > 0
      ? effectiveVacationHoursTakenOrPending / STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE
      : 0;

    const calculatedRemaining = parseFloat((calculatedEffectiveAllowance - effectiveDaysTaken).toFixed(2));
    
    return { 
        effectiveAnnualAllowance: calculatedEffectiveAllowance, 
        remainingAnnualVacationDays: calculatedRemaining 
    };
  }, [allYearVacations, userGlobalSettings, weeklyContract, globalHolidays]);

  const monthSummary = useMemo(() => {
    let joursOuvrables = 0;
    let joursFeriesComptabilises = 0;
    let impactVacancesHeures = 0;

    const relevantVacationsInMonth = currentMonthUserVacations.filter(v =>
      v.status === VacationStatus.APPROVED ||
      v.status === VacationStatus.PENDING_APPROVAL ||
      v.status === VacationStatus.SELECTED
    );

    daysInCalendarMonth.forEach(dayDate => {
      const dayName = getDayOfWeekName(dayDate);
      const contractForDay = weeklyContract[dayName];
      const dateStr = formatDateToYYYYMMDD(dayDate);
      const isGlobalHolidayForThisDay = globalHolidays.some(h => h.date === dateStr);

      if (contractForDay && (contractForDay.morning > 0 || contractForDay.afternoon > 0)) {
        joursOuvrables++;
        if (isGlobalHolidayForThisDay) {
          joursFeriesComptabilises++;
        }
      }
      if (relevantVacationsInMonth.some(v => v.date === dateStr) && !isGlobalHolidayForThisDay) {
        impactVacancesHeures += (contractForDay?.morning || 0) + (contractForDay?.afternoon || 0);
      }
    });

    const joursDeCalendrierEnVacances = relevantVacationsInMonth.length;
    const joursDeVacancesCalcules = STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE > 0
      ? parseFloat((impactVacancesHeures / STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE).toFixed(2))
      : 0;
    const joursTravaillesEffectifs = joursOuvrables - joursFeriesComptabilises - joursDeVacancesCalcules;

    return { joursOuvrables, joursFeriesComptabilises, joursDeCalendrierEnVacances, impactVacancesHeures, joursDeVacancesCalcules, joursTravaillesEffectifs };
  }, [daysInCalendarMonth, weeklyContract, globalHolidays, currentMonthUserVacations]);

  return {
    remainingAnnualVacationDays,
    effectiveAnnualAllowance,
    monthSummary,
  };
};
