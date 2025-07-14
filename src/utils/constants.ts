import {
  EntryType,
  VacationStatus,
  DayOfWeekName,
  WeeklyContractHours,
  Holiday,
  UserGlobalSettings,
} from "@/types";

// APP_NAME and APP_TITLE are now managed by i18next (e.g., t('appName'))

export const ENTRY_TYPES: EntryType[] = [
  EntryType.REGULAR,
  EntryType.VACANCE,
  EntryType.FERIE,
  EntryType.RECUPERATION,
  EntryType.MALADIE,
];

export const DAYS_OF_WEEK: DayOfWeekName[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// DAYS_OF_WEEK_LABELS and DAYS_OF_WEEK_ABBREVIATED_LABELS are now managed by i18next or dynamic date formatting
// Example: t(`days.${dayName}`) or date.toLocaleDateString(i18n.language, { weekday: 'short' })

export const INITIAL_WEEKLY_CONTRACT: WeeklyContractHours = {
  sunday: { morning: 0, afternoon: 0 },
  monday: { morning: 4, afternoon: 4 },
  tuesday: { morning: 4, afternoon: 4 },
  wednesday: { morning: 4, afternoon: 4 },
  thursday: { morning: 4, afternoon: 4 },
  friday: { morning: 4, afternoon: 4 },
  saturday: { morning: 0, afternoon: 0 },
};

export const SEGMENT_COLORS: { [key in EntryType]?: string } = {
  [EntryType.VACANCE]: "bg-orange-100 border-orange-300",
  [EntryType.FERIE]: "bg-yellow-100 border-yellow-300",
  [EntryType.RECUPERATION]: "bg-blue-100 border-blue-300",
  [EntryType.MALADIE]: "bg-red-100 border-red-300",
  [EntryType.REGULAR]: "bg-white border-slate-200",
};

export const SEGMENT_HOVER_COLORS: { [key in EntryType]?: string } = {
  [EntryType.VACANCE]: "hover:bg-orange-200",
  [EntryType.FERIE]: "hover:bg-yellow-200",
  [EntryType.RECUPERATION]: "hover:bg-blue-200",
  [EntryType.MALADIE]: "hover:bg-red-200",
  [EntryType.REGULAR]: "hover:bg-slate-50",
};

// MOCK_USERS is removed. User management will be handled by Supabase Auth.
// export const MOCK_USERS: User[] = [
//   { id: 'user1', name: 'Usuário Padrão', role: 'user', initials: 'UP' },
//   { id: 'admin1', name: 'Administrador', role: 'admin', initials: 'AD' },
// ];

export const USER_COLORS = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-lime-500",
];

export const VACATION_STATUS_STYLES: {
  [key in VacationStatus]: { bg: string; text: string; border?: string };
} = {
  [VacationStatus.SELECTED]: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  [VacationStatus.PENDING_APPROVAL]: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  [VacationStatus.APPROVED]: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  [VacationStatus.REJECTED]: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
};

export const ICONS = {
  USER: "👤",
  LOGOUT: "🚪",
  CALENDAR: "📅",
  PREVIOUS: "◀️",
  NEXT: "▶️",
  SUN: "☀️",
  MOON: "🌙",
  CLOCK: "🕒",
  CHECK: "✔️",
  CROSS: "❌",
  PRINT: "🖨️",
  SEND: "✉️",
  SETTINGS: "⚙️",
  TRASH: "🗑️",
  ADD: "➕",
  INFO: "ℹ️",
  TAUX: "📊",
  HOLIDAY: "🎉",
  STOPWATCH: "⏱️",
  CALENDAR_DAYS: "🗓️",
  BRIEFCASE: "💼",
  CALENDAR_CHECK: "📆",
  TREND_UP: "📈",
  TREND_DOWN: "📉",
  USER_PLUS: "🧑‍💼+",
  CALENDAR_EDIT: "🗓️✏️",
};

export const MOCK_GLOBAL_HOLIDAYS: Holiday[] = [
  {
    id: "gh-1",
    date: `${new Date().getFullYear()}-01-01`,
    name: "Ano Novo",
    type: "NATIONAL",
    isOfficial: true,
  },
  {
    id: "gh-2",
    date: `${new Date().getFullYear()}-05-01`,
    name: "Dia do Trabalhador",
    type: "NATIONAL",
    isOfficial: true,
  },
  {
    id: "gh-3",
    date: `${new Date().getFullYear()}-12-25`,
    name: "Natal",
    type: "NATIONAL",
    isOfficial: true,
  },
];

export const INITIAL_USER_GLOBAL_SETTINGS: UserGlobalSettings = {
  tauxPercent: 100,
  annualVacationDays: 20,
  workTimeDefaults: {
    overallStartTime: undefined,
    overallEndTime: undefined,
  },
};
