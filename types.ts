
export enum EntryType {
  REGULAR = 'Regular',
  VACANCE = 'Vacance',
  FERIE = 'Ferié',
  RECUPERATION = 'Récupération',
  MALADIE = 'Maladie',
}

export enum VacationStatus {
  SELECTED = 'Selecionado',
  PENDING_APPROVAL = 'Pendente',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado',
}

export interface Holiday {
  id?: string; // UUID - Made optional as Supabase will generate it for new holidays
  date: string; // 'YYYY-MM-DD'
  name: string;
  isOfficial?: boolean; // Optional: To distinguish official vs custom
}

export interface VacationDay {
  date: string; // 'YYYY-MM-DD'
  status: VacationStatus;
  adminComment?: string; // Optional comment from admin on approval/rejection
}

export type VacationSelection = VacationDay[];


export interface TimeSegment {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  type: EntryType;
}

export interface DailyLogEntry {
  id: string; // Usually date string 'YYYY-MM-DD'
  date: Date;
  morning: TimeSegment;
  afternoon: TimeSegment;
  isWorkingDay: boolean; 
  hasInputs: boolean;    
}

export interface DayContractHours {
  morning: number; // hours
  afternoon: number; // hours
}

export type DayOfWeekName = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface WeeklyContractHours {
  sunday: DayContractHours;
  monday: DayContractHours;
  tuesday: DayContractHours;
  wednesday: DayContractHours;
  thursday: DayContractHours;
  friday: DayContractHours;
  saturday: DayContractHours;
}

export interface SummaryData {
  contractedWeeklyHours: number;
  plannedMonthlyHours: number;
  workedPlusSickHours: number;
  overtimeOrMissedHours: number;
}

export interface User {
  id: string;
  name: string;
  email?: string; // Added email field
  role: 'user' | 'admin';
  photoUrl?: string; 
  initials?: string;
}

export interface UserWorkTimeDefaults {
  overallStartTime?: string; 
  overallEndTime?: string;   
}

export interface UserGlobalSettings { 
  tauxPercent: number; 
  annualVacationDays: number; 
  workTimeDefaults?: UserWorkTimeDefaults;
}

export interface DashboardPageProps {
  currentUser: User; // Keep currentUser as it's fundamental for deciding view
  // Other props will now largely come from context
}

export type Page = 'dashboard' | 'vacations' | 'admin_dashboard' | 'holiday_management' | 'user_profile';

// AppDataContextValue replaces the old AppData, providing more granular access via contexts
export interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
  logout: () => Promise<void>;
}

export interface GlobalDataContextType {
  globalUserSettings: UserGlobalSettings;
  globalHolidays: Holiday[];
  allUsers: User[];
  saveGlobalUserSettings: (settings: UserGlobalSettings) => Promise<{ success: boolean, error?: any, message?: string }>;
  saveGlobalHolidays: (holidays: Holiday[]) => Promise<{ success: boolean, error?: any, message?: string }>;
  fetchAllUsers: () => Promise<void>; // To refresh user list if needed
  isLoadingGlobalData: boolean;
}

export interface CurrentUserDataContextType {
  weeklyContract: WeeklyContractHours;
  dailyLogs: DailyLogEntry[];
  vacations: VacationSelection;
  summaryData: SummaryData;
  setWeeklyContract: (contract: WeeklyContractHours) => void;
  handleLogEntryChange: (logEntry: DailyLogEntry) => void;
  setVacations: (vacations: VacationSelection) => void;
  updateSpecificUserVacations: (userId: string, year: number, month: number, newVacations: VacationSelection) => Promise<void>;
  loadUserYearVacations: (userId: string, year: number) => Promise<VacationDay[]>;
  isLoadingCurrentUserData: boolean;
  currentDate: Date; // For data fetching based on current user and date
  // refreshCurrentUserData: () => Promise<void>; // Function to explicitly refresh data for current user/date
}


export interface VacationConfigPageProps {
  // Props are now primarily derived from context or App.tsx top-level state (like currentDate)
  currentDate: Date; // This will still be passed from App/MainAppLayout
  onDateChange: (newDate: Date) => void; // This will still be passed from App/MainAppLayout
}

export const STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE = 8;

// Props for VacationCalculations Hook
export interface UseVacationCalculationsProps {
  allYearVacations: VacationDay[];
  userGlobalSettings: UserGlobalSettings;
  weeklyContract: WeeklyContractHours;
  globalHolidays: Holiday[];
  currentMonthUserVacations: VacationDay[];
  daysInCalendarMonth: Date[];
}

export interface VacationCalculations {
  remainingAnnualVacationDays?: number;
  effectiveAnnualAllowance?: number;
  monthSummary: {
    joursOuvrables: number;
    joursFeriesComptabilises: number;
    joursDeCalendrierEnVacances: number;
    impactVacancesHeures: number;
    joursDeVacancesCalcules: number;
    joursTravaillesEffectifs: number;
  };
}

// Props for CalendarGrid
export interface CalendarGridProps {
  year: number;
  month: number;
  vacationsForMonth: VacationDay[];
  globalHolidays: Holiday[];
  weeklyContract: WeeklyContractHours;
  dailyLogs: DailyLogEntry[];
  onDayClick: (dateStr: string) => void;
  remainingAnnualVacationDays?: number; // Needed for alert logic in onDayClick
}

// Props for VacationSummaryPanel
export interface VacationSummaryPanelProps {
  remainingAnnualVacationDays?: number;
  effectiveAnnualAllowance?: number;
  monthSummaryData: VacationCalculations['monthSummary']; // Use the specific part of the calculation
  displayDate: Date; // For "Holidays in {{month}} {{year}}"
  currentMonthGlobalHolidays: Holiday[];
}

// Props for MonthlyVacationList
export interface MonthlyVacationListProps {
  currentMonthUserVacations: VacationDay[];
  onDeleteVacation: (dateStr: string) => void;
  onSubmitForApproval: () => void;
  onPrintRequest: () => void;
  displayDate: Date;
  user: User;
}

export interface I18nInstanceType {
  language: string;
  t: (key: string, options?: any) => string;
}

// Notification System Types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // Optional duration in ms
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}
