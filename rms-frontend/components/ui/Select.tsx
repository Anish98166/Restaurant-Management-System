import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-[#4E342E]">{label}</label>}
        <select
          ref={ref}
          className={`w-full rounded-xl border border-[#E8D5C4] bg-white px-4 py-2.5 text-sm text-[#4E342E] transition-all focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:border-transparent disabled:bg-[#F5E6D3] disabled:cursor-not-allowed ${error ? 'border-red-400' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
