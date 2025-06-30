import React from 'react';
import { useTranslation } from 'react-i18next';
import { EntryType } from '../types';
import { ENTRY_TYPES } from '../constants';

interface TypeSelectorProps {
  id: string;
  value: EntryType;
  onChange: (value: EntryType) => void;
  disabled?: boolean;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ id, value, onChange, disabled }) => {
  const { t } = useTranslation();
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as EntryType)}
      disabled={disabled}
      className="w-full p-1.5 border border-slate-300 bg-slate-50 text-slate-700 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
    >
      {ENTRY_TYPES.map(type => (
        <option key={type} value={type}>{t(`entryTypes.${type}`, type)}</option>
      ))}
    </select>
  );
};

export default TypeSelector;