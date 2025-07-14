import React from "react";

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
  const inputBaseClasses =
    "block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm bg-white text-slate-800 placeholder-slate-400";
  const inputWithIconClasses = `pl-10 ${inputBaseClasses}`;
  const iconBaseClasses =
    "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 sr-only"
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
