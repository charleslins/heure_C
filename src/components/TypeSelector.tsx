import React from "react";
import { useTranslation } from "react-i18next";
import { EntryType } from "@/types";
import { ENTRY_TYPES } from "@/utils/constants";
import { selectClasses } from "@/utils/inputClasses";

interface TypeSelectorProps {
  id: string;
  value: EntryType;
  onChange: (value: EntryType) => void;
  disabled?: boolean;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({
  id,
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation();
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as EntryType)}
      disabled={disabled}
      className={selectClasses({ size: "sm" })}
    >
      {ENTRY_TYPES.map((type) => (
        <option key={type} value={type}>
          {t(`entryTypes.${type}`, type)}
        </option>
      ))}
    </select>
  );
};

export default TypeSelector;
