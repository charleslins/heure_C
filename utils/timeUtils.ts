
import { DailyLogEntry, DayOfWeekName, EntryType, WeeklyContractHours } from '../types';

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateDurationInHours = (start: string, end: string): number => {
  if (!start || !end) return 0;
  try {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        return 0;
    }

    const startDate = new Date(0, 0, 0, startHours, startMinutes);
    const endDate = new Date(0, 0, 0, endHours, endMinutes);
    
    let diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) { 
      return 0;
    }
    return diff / (1000 * 60 * 60); // convert milliseconds to hours
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 0;
  }
};

export const getDayOfWeekName = (date: Date): DayOfWeekName => {
  const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, ...
  const dayNames: DayOfWeekName[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[dayIndex];
};

export const calculateSummaryData = (
  dailyLogs: DailyLogEntry[],
  weeklyContract: WeeklyContractHours,
  currentYear: number,
  currentMonth: number // 0-indexed
) => {
  let contractedWeeklyHours = 0;
  Object.values(weeklyContract).forEach(dayContract => {
    contractedWeeklyHours += dayContract.morning + dayContract.afternoon;
  });

  let plannedMonthlyHours = 0;
  const daysInSelectedMonth = getDaysInMonth(currentYear, currentMonth);
  
  daysInSelectedMonth.forEach(dayDate => {
    const dayName = getDayOfWeekName(dayDate);
    const contractForDay = weeklyContract[dayName];
    const logEntry = dailyLogs.find(log => formatDateToYYYYMMDD(log.date) === formatDateToYYYYMMDD(dayDate));

    let hoursToConsiderForPlanning = contractForDay.morning + contractForDay.afternoon;

    if (logEntry && hoursToConsiderForPlanning > 0) {
        if (logEntry.morning.type === EntryType.FERIE || logEntry.morning.type === EntryType.VACANCE || logEntry.morning.type === EntryType.RECUPERATION || logEntry.morning.type === EntryType.MALADIE) {
            hoursToConsiderForPlanning -= contractForDay.morning;
        }
        if (logEntry.afternoon.type === EntryType.FERIE || logEntry.afternoon.type === EntryType.VACANCE || logEntry.afternoon.type === EntryType.RECUPERATION || logEntry.afternoon.type === EntryType.MALADIE) {
            hoursToConsiderForPlanning -= contractForDay.afternoon;
        }
    }
    plannedMonthlyHours += Math.max(0, hoursToConsiderForPlanning);
  });
  
  let workedPlusSickHours = 0;
  dailyLogs.forEach(logEntry => {
    const dayName = getDayOfWeekName(logEntry.date);
    const contractForDay = weeklyContract[dayName];

    let morningHoursContribution = 0;
    if (logEntry.morning.type === EntryType.MALADIE) {
      morningHoursContribution = contractForDay.morning;
    } else if (logEntry.morning.type !== EntryType.VACANCE && 
               logEntry.morning.type !== EntryType.FERIE &&
               logEntry.morning.type !== EntryType.RECUPERATION) {
      morningHoursContribution = calculateDurationInHours(logEntry.morning.start, logEntry.morning.end);
    }
    
    let afternoonHoursContribution = 0;
    if (logEntry.afternoon.type === EntryType.MALADIE) {
      afternoonHoursContribution = contractForDay.afternoon;
    } else if (logEntry.afternoon.type !== EntryType.VACANCE && 
               logEntry.afternoon.type !== EntryType.FERIE &&
               logEntry.afternoon.type !== EntryType.RECUPERATION) {
      afternoonHoursContribution = calculateDurationInHours(logEntry.afternoon.start, logEntry.afternoon.end);
    }
    workedPlusSickHours += morningHoursContribution + afternoonHoursContribution;
  });

  const overtimeOrMissedHours = workedPlusSickHours - plannedMonthlyHours;

  return {
    contractedWeeklyHours: parseFloat(contractedWeeklyHours.toFixed(2)),
    plannedMonthlyHours: parseFloat(plannedMonthlyHours.toFixed(2)),
    workedPlusSickHours: parseFloat(workedPlusSickHours.toFixed(2)),
    overtimeOrMissedHours: parseFloat(overtimeOrMissedHours.toFixed(2)),
  };
};

export const formatHours = (hours: number): string => {
  if (isNaN(hours)) return "0.00";
  return hours.toFixed(2);
};
