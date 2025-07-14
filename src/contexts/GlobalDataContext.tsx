console.log("GlobalDataContext montado");
import React, { createContext, useContext } from "react";
import { UserGlobalSettings, Holiday, User } from "@/types";
import { useGlobalData } from "@/hooks/useGlobalData"; // Assuming useGlobalData is in hooks folder

interface GlobalDataContextType {
  globalUserSettings: UserGlobalSettings;
  globalHolidays: Holiday[];
  allUsers: User[];
  saveGlobalUserSettings: (
    settings: UserGlobalSettings
  ) => Promise<{ success: boolean; error?: unknown; message?: string }>;
  saveGlobalHolidays: (
    holidays: Holiday[]
  ) => Promise<{ success: boolean; error?: unknown; message?: string }>;
  fetchAllUsers: () => Promise<void>;
  isLoadingGlobalData: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(
  undefined
);

const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const globalData = useGlobalData();
  return (
    <GlobalDataContext.Provider value={globalData}>
      {children}
    </GlobalDataContext.Provider>
  );
};

const useGlobalDataContext = () => {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalDataContext must be used within a GlobalDataProvider"
    );
  }
  return context;
};

export { GlobalDataProvider, useGlobalDataContext };
