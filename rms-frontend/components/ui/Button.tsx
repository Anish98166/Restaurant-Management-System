import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#4E342E] text-white hover:bg-[#3E2723] focus:ring-[#4E342E] shadow-sm hover:shadow-md',
      secondary: 'bg-[#FF8A65] text-white hover:bg-[#F4511E] focus:ring-[#FF8A65] shadow-sm hover:shadow-md',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
      ghost: 'bg-transparent text-[#4E342E] hover:bg-[#F5E6D3] focus:ring-[#4E342E]',
      outline: 'bg-transparent border-2 border-[#4E342E] text-[#4E342E] hover:bg-[#4E342E] hover:text-white focus:ring-[#4E342E]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
