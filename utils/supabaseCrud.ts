
import { supabase } from './supabaseClient';
import { User, UserGlobalSettings, Holiday, WeeklyContractHours, DailyLogEntry, VacationSelection, VacationStatus, VacationDay } from '../types';
import { INITIAL_WEEKLY_CONTRACT, INITIAL_USER_GLOBAL_SETTINGS, MOCK_GLOBAL_HOLIDAYS } from '../constants';
import { formatDateToYYYYMMDD, getDaysInMonth, getDayOfWeekName } from './timeUtils';
import { getUserInitials } from './stringUtils';

// --- Global Settings ---
const GLOBAL_SETTINGS_ID = 1; // Assuming a single row for global settings

export const loadGlobalUserSettingsFromSupabase = async (defaultValue: UserGlobalSettings): Promise<UserGlobalSettings> => {
  const { data, error } = await supabase
    .from('global_settings')
    .select('settings_data')
    .eq('id', GLOBAL_SETTINGS_ID)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 'JSON object requested, multiple (or no) rows returned' (no rows)
    console.error('Error loading global user settings:', error.message || error);
    return defaultValue;
  }
  if (!data || !data.settings_data) {
     // If no settings exist, save the default ones
    await saveGlobalUserSettingsToSupabase(defaultValue);
    return defaultValue;
  }
  return data.settings_data as UserGlobalSettings;
};

export const saveGlobalUserSettingsToSupabase = async (settings: UserGlobalSettings): Promise<{ success: boolean, error?: any, message?: string }> => {
  const { error } = await supabase
    .from('global_settings')
    .upsert({ id: GLOBAL_SETTINGS_ID, settings_data: settings }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving global user settings:', error.message || error);
    return { success: false, error, message: error.message };
  }
  return { success: true };
};

// --- Global Holidays ---
// Interface for the structure expected by/from the 'global_holidays' table
interface DbHolidaySchema {
  id: string; // This will be UUID from DB
  date: string;
  name: string;
  is_official?: boolean;
}

export const loadGlobalHolidaysFromSupabase = async (defaultValue: Holiday[]): Promise<Holiday[]> => {
  const { data, error } = await supabase
    .from('global_holidays')
    .select('id, date, name, is_official'); 

  if (error) {
    console.error('Error loading global holidays:', error.message || error);
    return defaultValue;
  }
  if (!data || data.length === 0) {
    // If no holidays exist in DB, consider saving the defaultValue if it's MOCK_GLOBAL_HOLIDAYS
    // This is optional and depends on desired behavior (e.g., initial seeding)
    // For now, just return the defaultValue from constants if DB is empty.
    return defaultValue;
  }
  return (data as DbHolidaySchema[]).map(dbHoliday => ({
    id: dbHoliday.id, 
    date: dbHoliday.date,
    name: dbHoliday.name,
    isOfficial: dbHoliday.is_official 
  }));
};

export const saveGlobalHolidaysToSupabase = async (holidays: Holiday[]): Promise<{ success: boolean, error?: any, message?: string }> => {
  const { data: existingHolidaysData, error: fetchError } = await supabase.from('global_holidays').select('id');
  
  if (fetchError) {
    console.error('Error fetching existing holiday IDs for deletion:', fetchError.message || fetchError);
    return { success: false, error: fetchError, message: 'Error fetching existing holiday IDs.' };
  }
  
  if (existingHolidaysData) {
    const existingDbIds = existingHolidaysData.map(h => h.id);
    
    const clientKeptOrUpdatedUUIDs = new Set<string>();
    holidays.forEach(h => {
        if (h.id && !h.id.startsWith('holiday-') && !h.id.startsWith('gh-')) {
            clientKeptOrUpdatedUUIDs.add(h.id);
        }
    });

    const idsToDelete = existingDbIds.filter(dbId => !clientKeptOrUpdatedUUIDs.has(dbId));

    if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('global_holidays').delete().in('id', idsToDelete);
        if (deleteError) {
          console.error('Error deleting old holidays:', deleteError.message || deleteError);
          // Potentially return partial success or specific error here
        }
    }
  }

  const holidaysToUpsert = holidays.map(holiday => {
    const { isOfficial, id: originalClientId, ...restOfHoliday } = holiday;
    
    const dbHolidayObjectPayload: Omit<DbHolidaySchema, 'id'> = {
      date: restOfHoliday.date,
      name: restOfHoliday.name,
      is_official: typeof isOfficial === 'boolean' ? isOfficial : false,
    };

    let finalIdForDb: string;
    const isTemporaryOrMockId = originalClientId && (originalClientId.startsWith('holiday-') || originalClientId.startsWith('gh-'));

    if (originalClientId && !isTemporaryOrMockId) {
      finalIdForDb = originalClientId;
    } else {
      finalIdForDb = crypto.randomUUID();
    }
    
    return { ...dbHolidayObjectPayload, id: finalIdForDb } as DbHolidaySchema; 
  });


  if (holidaysToUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from('global_holidays')
      .upsert(holidaysToUpsert, { onConflict: 'id' }); 
      
    if (upsertError) {
      console.error('Error saving global holidays (upsert):', upsertError.message || upsertError);
      return { success: false, error: upsertError, message: upsertError.message };
    }
  }
  return { success: true };
};


// --- User Weekly Contract ---
export const loadUserWeeklyContractFromSupabase = async (userId: string, year: number, month: number, defaultValue: WeeklyContractHours): Promise<WeeklyContractHours> => {
  const { data, error } = await supabase
    .from('user_weekly_contracts')
    .select('contract_data')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error loading contract for user ${userId}, ${year}-${month}:`, error.message || error);
    return defaultValue;
  }
  return data?.contract_data as WeeklyContractHours || defaultValue;
};

export const saveUserWeeklyContractToSupabase = async (userId: string, year: number, month: number, contract: WeeklyContractHours): Promise<void> => {
  const { error } = await supabase
    .from('user_weekly_contracts')
    .upsert({ user_id: userId, year, month, contract_data: contract }, { onConflict: 'user_id,year,month' });

  if (error) {
    console.error(`Error saving contract for user ${userId}, ${year}-${month}:`, error.message || error);
  }
};

// --- User Daily Logs ---
export const loadUserDailyLogsForMonthFromSupabase = async (
    userId: string, 
    year: number, 
    month: number
): Promise<Partial<DailyLogEntry>[]> => { 
  const startDate = formatDateToYYYYMMDD(new Date(year, month, 1));
  const endDate = formatDateToYYYYMMDD(new Date(year, month + 1, 0)); 

  const { data, error } = await supabase
    .from('user_daily_logs')
    .select('log_date, morning, afternoon, is_working_day, has_inputs')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error) {
    console.error(`Error loading daily logs for user ${userId}, ${year}-${month}:`, error.message || error);
    return [];
  }
  return data.map(log => ({
    id: log.log_date, 
    date: new Date(log.log_date + 'T00:00:00'), 
    morning: log.morning,
    afternoon: log.afternoon,
    isWorkingDay: log.is_working_day,
    hasInputs: log.has_inputs,
  })) as Partial<DailyLogEntry>[];
};

export const saveUserDailyLogToSupabase = async (userId: string, logEntry: DailyLogEntry): Promise<void> => {
  const logDateStr = formatDateToYYYYMMDD(logEntry.date);
  const { error } = await supabase
    .from('user_daily_logs')
    .upsert({
      user_id: userId,
      log_date: logDateStr,
      morning: logEntry.morning,
      afternoon: logEntry.afternoon,
      is_working_day: logEntry.isWorkingDay,
      has_inputs: logEntry.hasInputs
    }, { onConflict: 'user_id,log_date' });

  if (error) {
    console.error(`Error saving daily log for user ${userId}, date ${logDateStr}:`, error.message || error);
  }
};

// --- User Vacations ---
export const loadUserVacationsForMonthFromSupabase = async (userId: string, year: number, month: number, defaultValue: VacationSelection): Promise<VacationSelection> => {
  const startDate = formatDateToYYYYMMDD(new Date(year, month, 1));
  const endDate = formatDateToYYYYMMDD(new Date(year, month + 1, 0));

  const { data, error } = await supabase
    .from('user_vacations')
    .select('vacation_date, status, admin_comment')
    .eq('user_id', userId)
    .gte('vacation_date', startDate)
    .lte('vacation_date', endDate);

  if (error) {
    console.error(`Error loading vacations for user ${userId}, ${year}-${month}:`, error.message || error);
    return defaultValue;
  }
  return data.map(v => ({
    date: v.vacation_date, 
    status: v.status as VacationStatus,
    adminComment: v.admin_comment
  })) || defaultValue;
};

export const saveUserVacationsForMonthToSupabase = async (userId: string, year: number, month: number, allUserVacations: VacationSelection): Promise<void> => {
  const startDate = formatDateToYYYYMMDD(new Date(year, month, 1));
  const endDate = formatDateToYYYYMMDD(new Date(year, month + 1, 0));

  const { error: deleteError } = await supabase
    .from('user_vacations')
    .delete()
    .eq('user_id', userId)
    .gte('vacation_date', startDate)
    .lte('vacation_date', endDate);

  if (deleteError) {
    console.error(`CRITICAL: Error deleting old vacations for user ${userId}, ${year}-${month}. Aborting save. Error:`, deleteError.message || deleteError);
    throw deleteError; 
  }

  const vacationsForThisMonthRaw = allUserVacations.filter(v => {
    try {
      const vDate = new Date(v.date + 'T00:00:00Z'); 
      return vDate.getUTCFullYear() === year && vDate.getUTCMonth() === month;
    } catch (e) {
      console.warn(`Invalid date format in vacation data: ${v.date}`, e);
      return false;
    }
  });

  const uniqueVacationsForThisMonthMap = new Map<string, VacationDay>();
  vacationsForThisMonthRaw.forEach(v => {
    uniqueVacationsForThisMonthMap.set(v.date, v);
  });
  const uniqueVacationsToInsert = Array.from(uniqueVacationsForThisMonthMap.values());

  if (uniqueVacationsToInsert.length > 0) {
    const vacationRecordsToInsert = uniqueVacationsToInsert.map(v => ({
      user_id: userId,
      vacation_date: v.date, 
      status: v.status,
      admin_comment: v.adminComment 
    }));

    const { error: insertError } = await supabase
      .from('user_vacations')
      .insert(vacationRecordsToInsert);

    if (insertError) {
      console.error(`Error inserting new vacations for user ${userId}, ${year}-${month}:`, insertError.message || insertError);
      throw insertError; 
    }
  }
};

export const loadUserYearVacationsFromSupabase = async (userId: string, year: number): Promise<VacationDay[]> => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('user_vacations')
    .select('vacation_date, status, admin_comment')
    .eq('user_id', userId)
    .gte('vacation_date', startDate)
    .lte('vacation_date', endDate);

  if (error) {
    console.error(`Error loading year vacations for user ${userId}, year ${year}:`, error.message || error);
    return [];
  }
  return data.map(v => ({
    date: v.vacation_date,
    status: v.status as VacationStatus,
    adminComment: v.admin_comment
  })) || [];
};

export const loadTypedUserMonthDataFromSupabase = async <T>(
  userId: string,
  dataType: 'vacations' | 'contractHours' | 'dailyLogs', 
  year: number,
  month: number,
  defaultValue: T
): Promise<T> => {
  switch (dataType) {
    case 'vacations':
      return await loadUserVacationsForMonthFromSupabase(userId, year, month, defaultValue as VacationSelection) as T;
    case 'contractHours':
      return await loadUserWeeklyContractFromSupabase(userId, year, month, defaultValue as WeeklyContractHours) as T;
    default:
      console.warn(`loadTypedUserMonthDataFromSupabase: dataType ${dataType} not handled.`);
      return defaultValue;
  }
};

// --- All Users (for Admin purposes) ---
export const loadAllUsersFromSupabase = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles') 
    .select('id, name, role, photo_url, email'); 

  if (error) {
    console.error('Error loading all users from profiles:', error.message || error);
    return []; 
  }
  return data.map(profile => ({
    id: profile.id,
    name: profile.name || 'Unnamed User',
    email: profile.email, 
    role: profile.role || 'user',
    photoUrl: profile.photo_url,
    initials: getUserInitials(profile.name || profile.email || 'Unnamed User'), 
  }));
};

export const getMockUsers = (): User[] => {
  return [
    { id: 'user1-mock', name: 'Mock User One', email: 'user1@example.mock', role: 'user', initials: 'MU' },
    { id: 'user2-mock', name: 'Mock User Two', email: 'user2@example.mock', role: 'user', initials: 'MT' },
    { id: 'admin1-mock', name: 'Mock Admin', email: 'admin1@example.mock', role: 'admin', initials: 'MA' },
  ];
};

// --- Update User Profile Role ---
export const updateUserProfileRole = async (userId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; error?: any; message?: string }> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() }) 
    .eq('id', userId);

  if (error) {
    console.error(`Error updating role for user ${userId}:`, error.message || error);
    return { success: false, error, message: error.message };
  }
  return { success: true };
};