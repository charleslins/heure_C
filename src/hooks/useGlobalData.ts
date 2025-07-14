console.log("useGlobalData executado");
import { useState, useEffect, useCallback } from "react";
import { UserGlobalSettings, Holiday, User } from "@/types";
import {
  INITIAL_USER_GLOBAL_SETTINGS,
  MOCK_GLOBAL_HOLIDAYS,
} from "@/utils/constants";
import {
  loadGlobalUserSettingsFromSupabase,
  saveGlobalUserSettingsToSupabase,
  loadGlobalHolidaysFromSupabase,
  saveGlobalHolidaysToSupabase,
  loadAllUsersFromSupabase,
  getMockUsers,
} from "@/utils/supabaseCrud";

export const useGlobalData = () => {
  const [globalUserSettings, setGlobalUserSettings] =
    useState<UserGlobalSettings>(INITIAL_USER_GLOBAL_SETTINGS);
  const [globalHolidays, setGlobalHolidays] =
    useState<Holiday[]>(MOCK_GLOBAL_HOLIDAYS);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingGlobalData, setIsLoadingGlobalData] = useState(true);

  const fetchAllGlobalData = useCallback(async () => {
    setIsLoadingGlobalData(true);
    try {
      const loadedSettings = await loadGlobalUserSettingsFromSupabase(
        INITIAL_USER_GLOBAL_SETTINGS,
      );
      if (
        loadedSettings.workTimeDefaults &&
        ("morningStart" in loadedSettings.workTimeDefaults ||
          "morningEnd" in loadedSettings.workTimeDefaults)
      ) {
        loadedSettings.workTimeDefaults = {
          overallStartTime: undefined,
          overallEndTime: undefined,
        };
      } else if (!loadedSettings.workTimeDefaults) {
        loadedSettings.workTimeDefaults = {
          overallStartTime: undefined,
          overallEndTime: undefined,
        };
      }
      setGlobalUserSettings(loadedSettings);

      const loadedHolidays =
        await loadGlobalHolidaysFromSupabase(MOCK_GLOBAL_HOLIDAYS);
      setGlobalHolidays(loadedHolidays);

      const usersFromDb = await loadAllUsersFromSupabase();
      if (usersFromDb.length > 0) {
        setAllUsers(usersFromDb);
      } else {
        console.warn(
          "No users found in Supabase 'profiles' table, falling back to mock users.",
        );
        setAllUsers(getMockUsers());
      }
    } catch (error) {
      console.error("Error loading global static data:", error);
      setGlobalUserSettings(INITIAL_USER_GLOBAL_SETTINGS);
      setGlobalHolidays(MOCK_GLOBAL_HOLIDAYS);
      setAllUsers(getMockUsers());
    } finally {
      setIsLoadingGlobalData(false);
    }
  }, []);

  useEffect(() => {
    fetchAllGlobalData();
  }, [fetchAllGlobalData]);

  const handleSaveGlobalUserSettings = useCallback(
    async (
      settings: UserGlobalSettings,
    ): Promise<{ success: boolean; error?: unknown; message?: string }> => {
      const result = await saveGlobalUserSettingsToSupabase(settings);
      if (result.success) {
        setGlobalUserSettings(settings); // Update local state after successful save
      }
      return result;
    },
    [],
  );

  const handleSaveGlobalHolidays = useCallback(
    async (
      holidays: Holiday[],
    ): Promise<{ success: boolean; error?: unknown; message?: string }> => {
      const result = await saveGlobalHolidaysToSupabase(holidays);
      if (result.success) {
        setGlobalHolidays(holidays); // Update local state
      }
      return result;
    },
    [],
  );

  return {
    globalUserSettings,
    globalHolidays,
    allUsers,
    saveGlobalUserSettings: handleSaveGlobalUserSettings,
    saveGlobalHolidays: handleSaveGlobalHolidays,
    fetchAllUsers: fetchAllGlobalData, // Expose a way to refresh if needed
    isLoadingGlobalData,
  };
};
