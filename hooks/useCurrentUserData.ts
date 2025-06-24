console.log("useCurrentUserData executado");
import { useState, useEffect, useCallback } from 'react';
import {
  User,
  WeeklyContractHours,
  DailyLogEntry,
  VacationSelection,
  SummaryData,
  EntryType,
  VacationStatus,
  VacationDay,
  Holiday,
} from '../types';
import { INITIAL_WEEKLY_CONTRACT } from '../constants';
import {
  loadUserWeeklyContractFromSupabase,
  saveUserWeeklyContractToSupabase,
  loadUserDailyLogsForMonthFromSupabase,
  saveUserDailyLogToSupabase,
  loadUserVacationsForMonthFromSupabase,
  saveUserVacationsForMonthToSupabase,
  loadUserYearVacationsFromSupabase,
} from '../utils/supabaseCrud';
import { getDaysInMonth, formatDateToYYYYMMDD, calculateSummaryData, getDayOfWeekName } from '../utils/timeUtils';

export const useCurrentUserData = (
  currentUser: User | null,
  currentDate: Date,
  globalHolidays: Holiday[] // Global holidays are needed for daily log initialization
) => {
  const [weeklyContract, setWeeklyContract] = useState<WeeklyContractHours>(INITIAL_WEEKLY_CONTRACT);
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>([]);
  const [vacations, setVacations] = useState<VacationSelection>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    contractedWeeklyHours: 0,
    plannedMonthlyHours: 0,
    workedPlusSickHours: 0,
    overtimeOrMissedHours: 0,
  });
  const [isLoadingCurrentUserData, setIsLoadingCurrentUserData] = useState<boolean>(true);

  const checkHasInputsFromSegment = (logSegment?: { start: string; end: string; type: EntryType }): boolean => {
    if (!logSegment) return false;
    return !!logSegment.start || !!logSegment.end || logSegment.type !== EntryType.REGULAR;
  };

  const initializeMonthData = useCallback(async () => {
    if (!currentUser || globalHolidays.length === 0) {
        setIsLoadingCurrentUserData(false);
        return;
    }
    setIsLoadingCurrentUserData(true);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    try {
      const loadedContract = await loadUserWeeklyContractFromSupabase(currentUser.id, year, month, INITIAL_WEEKLY_CONTRACT);
      setWeeklyContract(loadedContract);

      const loadedVacations = await loadUserVacationsForMonthFromSupabase(currentUser.id, year, month, []);
      setVacations(Array.isArray(loadedVacations) ? loadedVacations : []);

      const loadedRawLogs = await loadUserDailyLogsForMonthFromSupabase(currentUser.id, year, month);

      const daysInMonth = getDaysInMonth(year, month);
      const newDailyLogs = daysInMonth.map(dayDate => {
        const yyyymmdd = formatDateToYYYYMMDD(dayDate);
        const existingRawLog = loadedRawLogs.find(log => log.id === yyyymmdd);

        const dayName = getDayOfWeekName(dayDate);
        const contractForDay = loadedContract[dayName] || INITIAL_WEEKLY_CONTRACT[dayName];
        const isWorkingDayBasedOnContract = (contractForDay.morning > 0 || contractForDay.afternoon > 0);
        
        let morningType = EntryType.REGULAR;
        let afternoonType = EntryType.REGULAR;
        let morningStart = '';
        let morningEnd = '';
        let afternoonStart = '';
        let afternoonEnd = '';
        let hasInputs = false;

        const holidayOnThisDay = globalHolidays.find(h => h.date === yyyymmdd);
        const activeVacationForLog = (Array.isArray(loadedVacations) ? loadedVacations : []).find(v =>
          v.date === yyyymmdd &&
          (v.status === VacationStatus.APPROVED || v.status === VacationStatus.PENDING_APPROVAL || v.status === VacationStatus.SELECTED)
        );

        if (holidayOnThisDay) {
          morningType = EntryType.FERIE; afternoonType = EntryType.FERIE; hasInputs = true;
        } else if (activeVacationForLog) {
          morningType = EntryType.VACANCE; afternoonType = EntryType.VACANCE; hasInputs = true;
        } else if (existingRawLog) {
          morningType = existingRawLog.morning?.type || EntryType.REGULAR;
          afternoonType = existingRawLog.afternoon?.type || EntryType.REGULAR;
          morningStart = existingRawLog.morning?.start || '';
          morningEnd = existingRawLog.morning?.end || '';
          afternoonStart = existingRawLog.afternoon?.start || '';
          afternoonEnd = existingRawLog.afternoon?.end || '';
          hasInputs = existingRawLog.hasInputs || false;

          if ((morningType === EntryType.VACANCE || morningType === EntryType.FERIE) && !activeVacationForLog && !holidayOnThisDay) {
            morningType = EntryType.REGULAR; morningStart = ''; morningEnd = '';
          }
          if ((afternoonType === EntryType.VACANCE || afternoonType === EntryType.FERIE) && !activeVacationForLog && !holidayOnThisDay) {
            afternoonType = EntryType.REGULAR; afternoonStart = ''; afternoonEnd = '';
          }
        }
        
        const isWeekend = dayName === 'saturday' || dayName === 'sunday';
        if (isWeekend && !holidayOnThisDay && !activeVacationForLog && !existingRawLog?.hasInputs && !hasInputs) {
          hasInputs = false;
        }


        return {
          id: yyyymmdd, date: dayDate,
          morning: { start: morningStart, end: morningEnd, type: morningType },
          afternoon: { start: afternoonStart, end: afternoonEnd, type: afternoonType },
          isWorkingDay: isWorkingDayBasedOnContract, hasInputs,
        };
      });
      setDailyLogs(newDailyLogs);

    } catch (error) {
      console.error("Error initializing month data:", error);
      setWeeklyContract(INITIAL_WEEKLY_CONTRACT);
      setDailyLogs([]);
      setVacations([]);
    } finally {
      setIsLoadingCurrentUserData(false);
    }
  }, [currentUser, currentDate, globalHolidays]);

  useEffect(() => {
    initializeMonthData();
  }, [initializeMonthData]);

  // Effect for saving weeklyContract
  useEffect(() => {
    if (!currentUser || isLoadingCurrentUserData) return;
    saveUserWeeklyContractToSupabase(currentUser.id, currentDate.getFullYear(), currentDate.getMonth(), weeklyContract);
    
    // Update isWorkingDay in dailyLogs if contract changes
    setDailyLogs(prevLogs => prevLogs.map(log => {
        const dayName = getDayOfWeekName(log.date);
        const contractForDay = weeklyContract[dayName];
        const newIsWorkingDay = (contractForDay.morning > 0 || contractForDay.afternoon > 0);
        if (log.isWorkingDay !== newIsWorkingDay) {
            const updatedLog = { ...log, isWorkingDay: newIsWorkingDay };
            saveUserDailyLogToSupabase(currentUser.id, updatedLog);
            return updatedLog;
        }
        return log;
    }));

  }, [weeklyContract, currentUser, currentDate, isLoadingCurrentUserData]);

  // Effect for saving vacations and updating dailyLogs based on vacations/holidays
  useEffect(() => {
    if (!currentUser || isLoadingCurrentUserData) return;
    saveUserVacationsForMonthToSupabase(currentUser.id, currentDate.getFullYear(), currentDate.getMonth(), vacations);

    setDailyLogs(prevLogs => {
      return prevLogs.map(logEntry => {
        const yyyymmdd = formatDateToYYYYMMDD(logEntry.date);
        const isGlobalHoliday = globalHolidays.find(h => h.date === yyyymmdd);
        const activeVacationForLog = vacations.find(v =>
            v.date === yyyymmdd &&
            (v.status === VacationStatus.APPROVED || v.status === VacationStatus.PENDING_APPROVAL || v.status === VacationStatus.SELECTED)
        );

        let newMorningType = logEntry.morning.type;
        let newAfternoonType = logEntry.afternoon.type;
        let newMorningStart = logEntry.morning.start;
        let newMorningEnd = logEntry.morning.end;
        let newAfternoonStart = logEntry.afternoon.start;
        let newAfternoonEnd = logEntry.afternoon.end;
        let newHasInputs = logEntry.hasInputs;
        let changed = false;

        const originalMorningType = logEntry.morning.type;
        const originalAfternoonType = logEntry.afternoon.type;

        if (isGlobalHoliday) {
            if (newMorningType !== EntryType.FERIE) { newMorningType = EntryType.FERIE; newMorningStart = ''; newMorningEnd = ''; changed = true; }
            if (newAfternoonType !== EntryType.FERIE) { newAfternoonType = EntryType.FERIE; newAfternoonStart = ''; newAfternoonEnd = ''; changed = true; }
            if (!newHasInputs) { newHasInputs = true; changed = true; }
        } else if (activeVacationForLog) {
            if (newMorningType !== EntryType.VACANCE) { newMorningType = EntryType.VACANCE; newMorningStart = ''; newMorningEnd = ''; changed = true; }
            if (newAfternoonType !== EntryType.VACANCE) { newAfternoonType = EntryType.VACANCE; newAfternoonStart = ''; newAfternoonEnd = ''; changed = true; }
            if (!newHasInputs) { newHasInputs = true; changed = true; }
        } else { // Neither holiday nor vacation
            if (originalMorningType === EntryType.FERIE || originalMorningType === EntryType.VACANCE) {
                newMorningType = EntryType.REGULAR; newMorningStart = ''; newMorningEnd = ''; changed = true;
            }
            if (originalAfternoonType === EntryType.FERIE || originalAfternoonType === EntryType.VACANCE) {
                newAfternoonType = EntryType.REGULAR; newAfternoonStart = ''; newAfternoonEnd = ''; changed = true;
            }
             if (changed) { 
                newHasInputs = checkHasInputsFromSegment({start: newMorningStart, end: newMorningEnd, type: newMorningType}) ||
                               checkHasInputsFromSegment({start: newAfternoonStart, end: newAfternoonEnd, type: newAfternoonType});
            }
        }
        
        const updatedLogEntry = {
            ...logEntry,
            morning: { ...logEntry.morning, type: newMorningType, start: newMorningStart, end: newMorningEnd },
            afternoon: { ...logEntry.afternoon, type: newAfternoonType, start: newAfternoonStart, end: newAfternoonEnd },
            hasInputs: newHasInputs,
        };

        if (changed) {
            saveUserDailyLogToSupabase(currentUser.id, updatedLogEntry);
        }
        return updatedLogEntry;
      });
    });
  }, [vacations, globalHolidays, currentUser, currentDate, isLoadingCurrentUserData]); // Removed dailyLogs from deps to avoid loop with setDailyLogs

  // Effect for calculating summaryData
  useEffect(() => {
    if (!currentUser || dailyLogs.length === 0 ) {
      const contractedWeekly = Object.values(weeklyContract).reduce((acc, day) => acc + day.morning + day.afternoon, 0);
      setSummaryData({
          contractedWeeklyHours: contractedWeekly,
          plannedMonthlyHours: 0,
          workedPlusSickHours: 0,
          overtimeOrMissedHours: 0,
      });
      return;
    }
    const newSummary = calculateSummaryData(dailyLogs, weeklyContract, currentDate.getFullYear(), currentDate.getMonth());
    setSummaryData(newSummary);
  }, [dailyLogs, weeklyContract, currentDate, currentUser]); // Removed globalUserSettings, isLoadingCurrentUserData

  const handleSetWeeklyContract = useCallback((newContract: WeeklyContractHours) => {
    setWeeklyContract(newContract);
  }, []);

  const handleLogEntryChange = useCallback((updatedEntry: DailyLogEntry) => {
    if (!currentUser) return;
    const morningHasInput = checkHasInputsFromSegment(updatedEntry.morning);
    const afternoonHasInput = checkHasInputsFromSegment(updatedEntry.afternoon);
    const entryWithHasInputs = { ...updatedEntry, hasInputs: morningHasInput || afternoonHasInput };

    setDailyLogs(prevLogs =>
      prevLogs.map(log => (log.id === entryWithHasInputs.id ? entryWithHasInputs : log))
    );
    saveUserDailyLogToSupabase(currentUser.id, entryWithHasInputs);
  }, [currentUser]);

  const handleSetVacations = useCallback((newVacations: VacationSelection) => {
    setVacations(newVacations);
  }, []);
  
  const handleUpdateSpecificUserVacations = useCallback(async (userId: string, year: number, month: number, newVacations: VacationSelection) => {
    await saveUserVacationsForMonthToSupabase(userId, year, month, newVacations);
    if (currentUser && currentUser.id === userId && year === currentDate.getFullYear() && month === currentDate.getMonth()) {
        setVacations(newVacations); // Refresh local state if it's the current user's data
    }
  }, [currentUser, currentDate]);

  const handleLoadUserYearVacations = useCallback(async (userId: string, year: number): Promise<VacationDay[]> => {
    return await loadUserYearVacationsFromSupabase(userId, year);
  }, []);


  return {
    weeklyContract,
    dailyLogs,
    vacations,
    summaryData,
    setWeeklyContract: handleSetWeeklyContract,
    handleLogEntryChange,
    setVacations: handleSetVacations,
    updateSpecificUserVacations: handleUpdateSpecificUserVacations,
    loadUserYearVacations: handleLoadUserYearVacations,
    isLoadingCurrentUserData,
    // refreshCurrentUserData: initializeMonthData // Expose a way to refresh
  };
};
