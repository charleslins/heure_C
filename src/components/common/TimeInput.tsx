import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TimeInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minHour?: number;
  maxHour?: number;
  label?: string;
  className?: string;
}

const minutes = ["00", "15", "30", "45"];

const TimeInput: React.FC<TimeInputProps> = ({
  id = crypto.randomUUID(),
  value,
  onChange,
  disabled,
  minHour,
  maxHour,
  label,
  className = "",
}) => {
  const { t } = useTranslation();
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [selectedMinute, setSelectedMinute] = useState<string>("");

  const availableHours = useMemo(() => {
    let allHours = Array.from({ length: 24 }, (_, i) => i);
    if (minHour !== undefined) {
      allHours = allHours.filter((h) => h >= minHour);
    }
    if (maxHour !== undefined) {
      allHours = allHours.filter((h) => h <= maxHour);
    }
    return allHours.map((h) => h.toString().padStart(2, "0"));
  }, [minHour, maxHour]);

  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
      setSelectedHour("");
      setSelectedMinute("");
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setSelectedHour(newHour);

    if (!newHour) {
      onChange("");
      setSelectedMinute("");
    } else {
      if (selectedMinute) {
        onChange(`${newHour}:${selectedMinute}`);
      } else {
        setSelectedMinute("00");
        onChange(`${newHour}:00`);
      }
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setSelectedMinute(newMinute);

    if (!newMinute) {
      if (selectedHour) {
        setSelectedMinute("00");
        onChange(`${selectedHour}:00`);
      } else {
        onChange("");
      }
    } else {
      if (selectedHour) {
        onChange(`${selectedHour}:${newMinute}`);
      } else {
        const defaultHour =
          availableHours.length > 0 ? availableHours[0] : "00";
        setSelectedHour(defaultHour);
        onChange(`${defaultHour}:${newMinute}`);
      }
    }
  };

  const baseSelectClasses =
    "p-1.5 border border-slate-300 bg-slate-50 text-slate-700 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={`${id}-hour`}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="flex items-center space-x-1">
        <select
          id={`${id}-hour`}
          aria-label={t("dailyLog.hourLabel", "Hour")}
          value={selectedHour}
          onChange={handleHourChange}
          disabled={disabled}
          className={`${baseSelectClasses} w-1/2`}
        >
          <option value="">{t("common.selectDefault", "--")}</option>
          {availableHours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-slate-400 text-sm">:</span>
        <select
          id={`${id}-minute`}
          aria-label={t("dailyLog.minuteLabel", "Minute")}
          value={selectedMinute}
          onChange={handleMinuteChange}
          disabled={disabled}
          className={`${baseSelectClasses} w-1/2`}
        >
          <option value="">{t("common.selectDefault", "--")}</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimeInput;
