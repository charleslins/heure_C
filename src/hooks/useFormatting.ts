import { useTranslation } from "react-i18next";

export const useFormatting = () => {
  const { t, i18n } = useTranslation();

  const formatDate = (
    date: string | Date,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const dateObj =
      typeof date === "string" ? new Date(date + "T00:00:00") : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
    };
    return dateObj.toLocaleDateString(i18n.language, options || defaultOptions);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString(
        i18n.language,
        { month: "short" }
      )}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatTime = (time: string, options?: Intl.DateTimeFormatOptions) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleTimeString(i18n.language, options || defaultOptions);
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "0h";
    if (hours === 1) return "1h";
    return `${hours}h`;
  };

  const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const formatCurrency = (amount: number, currency: string = "CHF") => {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");

    // Formato suíço: +41 XX XXX XX XX
    if (cleaned.startsWith("41") && cleaned.length === 11) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
        4,
        7
      )} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }

    // Formato local: 0XX XXX XX XX
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        8
      )} ${cleaned.slice(8)}`;
    }

    return phone; // Retorna original se não conseguir formatar
  };

  const formatStatus = (status: string) => {
    return t(`statuses.${status}`, status);
  };

  const formatRole = (role: string) => {
    return t(`roles.${role}`, role);
  };

  const formatVacationStatus = (status: string) => {
    return t(`vacationStatuses.${status}`, status);
  };

  return {
    formatDate,
    formatDateRange,
    formatTime,
    formatHours,
    formatPercentage,
    formatCurrency,
    formatFileSize,
    formatPhoneNumber,
    formatStatus,
    formatRole,
    formatVacationStatus,
  };
};
