import { type InputHTMLAttributes, type ReactNode } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  helperText?: string;
  labelRight?: ReactNode;
}

export default function FormInput({
  id,
  label,
  value,
  onChange,
  error,
  icon,
  rightElement,
  helperText,
  labelRight,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#181c20]"
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute bottom-0 left-0 top-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            'h-[50px] w-full rounded-[8px] border-2 bg-[#f7f9ff] outline-none transition-colors placeholder:font-[\'Roboto\',sans-serif] placeholder:text-sm placeholder:text-[#727785] ' +
            (icon ? 'pl-[41px]' : 'px-[18px]') +
            ' ' +
            (rightElement ? 'pr-[44px]' : 'pr-3') +
            " font-['Roboto',sans-serif] text-sm text-[#727785] " +
            (error ? 'border-red-500' : 'border-[#c1c6d6]') +
            ' ' + className
          }
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
