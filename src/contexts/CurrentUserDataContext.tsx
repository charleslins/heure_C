console.log("CurrentUserDataContext montado");
import React, { createContext, useContext } from "react";
import {
  WeeklyContractHours,
  DailyLogEntry,
  VacationSelection,
  SummaryData,
  VacationDay,
} from "@/types";
import { useCurrentUserData } from "@/hooks/useCurrentUserData";
import { useAuthContext } from "./AuthContext";
import { useGlobalDataContext } from "./GlobalDataContext"; // To get globalHolidays

interface CurrentUserDataContextType {
  weeklyContract: WeeklyContractHours;
  dailyLogs: DailyLogEntry[];
  vacations: VacationSelection;
  summaryData: SummaryData;
  setWeeklyContract: (contract: WeeklyContractHours) => void;
  handleLogEntryChange: (logEntry: DailyLogEntry) => void;
  setVacations: (vacations: VacationSelection) => void;
  updateSpecificUserVacations: (
    userId: string,
    year: number,
    month: number,
    newVacations: VacationSelection
  ) => Promise<void>;
  loadUserYearVacations: (
    userId: string,
    year: number
  ) => Promise<VacationDay[]>;
  isLoadingCurrentUserData: boolean;
  currentDate: Date; // This will be passed from App state
}

const CurrentUserDataContext = createContext<
  CurrentUserDataContextType | undefined
>(undefined);

export interface CurrentUserDataProviderProps {
  children: React.ReactNode;
  currentDate: Date; // Passed from App state
}

export const CurrentUserDataProvider: React.FC<
  CurrentUserDataProviderProps
> = ({ children, currentDate }) => {
  const { currentUser } = useAuthContext();
  const { globalHolidays } = useGlobalDataContext(); // Get globalHolidays here

  // Pass currentUser, currentDate, and globalHolidays to the hook
  const currentUserData = useCurrentUserData(
    currentUser,
    currentDate,
    globalHolidays
  );

  return (
    <CurrentUserDataContext.Provider
      value={{ ...currentUserData, currentDate }}
    >
      {children}
    </CurrentUserDataContext.Provider>
  );
};

export function useCurrentUserDataContext() {
  const context = useContext(CurrentUserDataContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentUserDataContext must be used within a CurrentUserDataProvider"
    );
  }
  return context;
}
