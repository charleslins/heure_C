
// Most functions related to core data (dailyLogs, contracts, vacations, global settings)
// are being migrated to use Supabase. This file will be largely deprecated for those purposes.

// loadFromLocalStorage and saveToLocalStorage can remain for simple, non-critical UI state if needed,
// for example, UI theme preference, or language preference if not using browser detector first.
export const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

// The following specific helpers are now superseded by Supabase operations or SDK session management.
