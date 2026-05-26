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
          className="text-sm font-medium tracking-[0.5px] text-text-primary"
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
            'h-12 w-full rounded-lg border-2 bg-bg-card-inner outline-none transition-colors placeholder:text-sm placeholder:text-text-muted ' +
            (icon ? 'pl-[41px]' : 'px-[18px]') +
            ' ' +
            (rightElement ? 'pr-[44px]' : 'pr-3') +
            " text-sm text-text-primary " +
            (error ? 'border-error' : 'border-border') +
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
        <p className="text-xs font-medium text-text-secondary">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}
