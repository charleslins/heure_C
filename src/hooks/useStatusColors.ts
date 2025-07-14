import { useMemo } from "react";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "approved"
  | "rejected";

export const useStatusColors = (status: StatusType) => {
  return useMemo(() => {
    const colors = {
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        focus: "focus:ring-green-400",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        focus: "focus:ring-red-400",
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-100",
        focus: "focus:ring-yellow-400",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        focus: "focus:ring-blue-400",
      },
      pending: {
        bg: "bg-yellow-100",
        border: "border-yellow-400",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-200",
        focus: "focus:ring-yellow-400",
      },
      approved: {
        bg: "bg-green-100",
        border: "border-green-400",
        text: "text-green-700",
        hover: "hover:bg-green-200",
        focus: "focus:ring-green-400",
      },
      rejected: {
        bg: "bg-red-100",
        border: "border-red-400",
        text: "text-red-700",
        hover: "hover:bg-red-200",
        focus: "focus:ring-red-400",
      },
    };

    return colors[status] || colors.info;
  }, [status]);
};
