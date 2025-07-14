import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const layoutClasses = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  flexEnd: "flex items-center justify-end",
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
} as const;

export const spacingClasses = {
  spaceX1: "space-x-1",
  spaceX2: "space-x-2",
  spaceX3: "space-x-3",
  spaceX4: "space-x-4",
  spaceY1: "space-y-1",
  spaceY2: "space-y-2",
  spaceY3: "space-y-3",
  spaceY4: "space-y-4",
} as const;

export const inputClasses = {
  base: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700",
  withIcon:
    "pl-10 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700",
} as const;

export const cardClasses = {
  base: "bg-white rounded-xl shadow-md",
  withBorder: "bg-white rounded-xl shadow-md border border-slate-200",
} as const;
