import React from "react";
import { useTranslation } from "react-i18next";

interface MonthYearSelectorProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  labelColorClass?: string;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  currentDate,
  onDateChange,
  labelColorClass = "text-slate-700",
}) => {
  const { t, i18n } = useTranslation();

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value, 10);
    onDateChange(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(event.target.value, 10);
    if (!isNaN(newYear) && newYear > 1900 && newYear < 2100) {
      onDateChange(new Date(newYear, currentDate.getMonth(), 1));
    }
  };

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleDateString(i18n.language, { month: "long" }),
  );

  const selectBaseClasses =
    "p-2 border border-orange-300 rounded-md shadow-sm focus:ring-white focus:border-orange-200 text-sm bg-orange-50 text-orange-700 focus:ring-opacity-50";
  const inputBaseClasses = `${selectBaseClasses} w-20 md:w-24`;

  return (
    <div className="flex items-center space-x-2 md:space-x-3">
      <label
        htmlFor="month-select"
        className={`sr-only md:not-sr-only font-medium text-sm ${labelColorClass}`}
      >
        {t("monthYearSelector.monthLabel")}
      </label>
      <select
        id="month-select"
        aria-label={t("monthYearSelector.selectMonth")}
        value={currentDate.getMonth()}
        onChange={handleMonthChange}
        className={selectBaseClasses}
      >
        {months.map((month, index) => (
          <option key={index} value={index} className="bg-white text-slate-800">
            {month}
          </option>
        ))}
      </select>
      <label
        htmlFor="year-input"
        className={`sr-only md:not-sr-only font-medium text-sm ${labelColorClass}`}
      >
        {t("monthYearSelector.yearLabel")}
      </label>
      <input
        id="year-input"
        type="number"
        aria-label={t("monthYearSelector.selectYear")}
        value={currentDate.getFullYear()}
        onChange={handleYearChange}
        className={inputBaseClasses}
      />
    </div>
  );
};

export default MonthYearSelector;
