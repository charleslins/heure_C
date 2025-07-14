import React from "react";
import { textInputClasses, labelClasses } from "../../utils/inputClasses";

interface InputWithIconProps {
  id: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string; // For the sr-only label
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
  id,
  name,
  type,
  autoComplete,
  required,
  value,
  onChange,
  placeholder,
  icon,
  label,
}) => {
  const inputWithIconClasses = `pl-10 ${textInputClasses({ size: "lg" })}`;
  const iconBaseClasses =
    "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400";

  return (
    <div>
      <label
        htmlFor={id}
        className={`${labelClasses()} sr-only`}
      >
        {label}
      </label>
      <div className="relative">
        <div className={iconBaseClasses}>{icon}</div>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={inputWithIconClasses}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputWithIcon;
