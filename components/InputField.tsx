import React from 'react';

export interface InputFieldProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
  placeholder?: string;
  error?: string;
  warning?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  helpText?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
  error,
  warning,
  min,
  max,
  step = 0.01,
  required = false,
  helpText,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  const inputClasses = `
    form-input w-full
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${warning && !error ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500' : ''}
  `.trim();

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {unit && <span className="text-gray-500 text-sm font-normal"> ({unit})</span>}
      </label>

      <div className="relative">
        <input
          type="number"
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          className={inputClasses}
          aria-describedby={
            error ? `${id}-error` : warning ? `${id}-warning` : helpText ? `${id}-help` : undefined
          }
        />

        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 text-sm">{unit}</span>
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && !error && !warning && (
        <p id={`${id}-help`} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {/* Warning message */}
      {warning && !error && (
        <p id={`${id}-warning`} className="text-sm text-amber-600 flex items-start space-x-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{warning}</span>
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start space-x-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default InputField;