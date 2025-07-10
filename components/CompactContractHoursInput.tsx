import React from 'react';
import { useTranslation } from 'react-i18next';
import TimeInput from './common/TimeInput';
import { Clock } from 'lucide-react';

interface CompactContractHoursInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const CompactContractHoursInput: React.FC<CompactContractHoursInputProps> = ({
  value,
  onChange,
  label,
  className = ''
}) => {
  const { t } = useTranslation();
  const displayLabel = label || t('contractHours.defaultLabel');

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className="w-5 h-5 text-slate-400" />
      <TimeInput
        value={value}
        onChange={onChange}
        label={displayLabel}
        className="w-20"
      />
    </div>
  );
};

export default CompactContractHoursInput;