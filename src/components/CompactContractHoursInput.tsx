import React from 'react';
import { useTranslation } from 'react-i18next';
import { WeeklyContractHours, DayOfWeekName } from '../types';
import { Clock } from 'lucide-react';
import SectionCard from './common/SectionCard';

interface CompactContractHoursInputProps {
  contractHours: WeeklyContractHours;
  onContractHoursChange: (newContract: WeeklyContractHours) => void;
}

// Ordem para exibição: Segunda a Domingo
const DISPLAY_DAYS_ORDER: DayOfWeekName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CompactContractHoursInput: React.FC<CompactContractHoursInputProps> = ({ contractHours, onContractHoursChange }) => {
  const { t } = useTranslation();

  const getDayAbbreviation = (dayKey: DayOfWeekName) => {
    // Mapear nomes internos dos dias para chaves específicas de 2 letras para tradução
    const keyMap: { [key in DayOfWeekName]: string } = {
      monday: 'LU', tuesday: 'MA', wednesday: 'ME', thursday: 'JE',
      friday: 'VE', saturday: 'SA', sunday: 'DI'
    };
    return t(`daysAbbreviated.${keyMap[dayKey]}`, keyMap[dayKey].toUpperCase());
  };

  const handleHourChange = (day: DayOfWeekName, period: 'morning' | 'afternoon', value: string) => {
    const hours = parseFloat(value);
    if (!isNaN(hours) && hours >= 0 && hours <= 12) {
      onContractHoursChange({
        ...contractHours,
        [day]: {
          ...contractHours[day],
          [period]: hours,
        },
      });
    } else if (value === "") {
      onContractHoursChange({
        ...contractHours,
        [day]: {
          ...contractHours[day],
          [period]: 0,
        },
      });
    }
  };

  const inputClasses = "block w-12 h-10 p-1 border border-slate-300 bg-slate-50 text-slate-700 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <SectionCard
      title={t('dashboardPage.contractualHoursTitle')}
      titleIcon={Clock}
      titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
      titleTextClassName="text-lg font-semibold text-slate-800"
      cardClassName="bg-white rounded-xl shadow-lg h-full flex flex-col"
      headerAreaClassName="p-4 border-b-0"
      contentAreaClassName="p-4 pt-0 flex-grow"
    >
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-7 gap-2 min-w-[350px]">
          {DISPLAY_DAYS_ORDER.map((day) => (
            <div key={day} className="flex flex-col items-center space-y-1.5">
              <span className="font-medium text-xs text-slate-700 p-1.5 bg-slate-100 rounded-md w-full text-center">
                {getDayAbbreviation(day)}
              </span>
              <input
                type="number"
                aria-label={`${t('dailyLog.morningHeader')} ${getDayAbbreviation(day)}`}
                min="0"
                max="12"
                step="0.25"
                value={contractHours[day]?.morning || 0}
                onChange={(e) => handleHourChange(day, 'morning', e.target.value)}
                className={inputClasses}
                placeholder="0"
              />
              <input
                type="number"
                aria-label={`${t('dailyLog.afternoonHeader')} ${getDayAbbreviation(day)}`}
                min="0"
                max="12"
                step="0.25"
                value={contractHours[day]?.afternoon || 0}
                onChange={(e) => handleHourChange(day, 'afternoon', e.target.value)}
                className={inputClasses}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

export default CompactContractHoursInput;