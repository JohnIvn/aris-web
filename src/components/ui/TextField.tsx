import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
}

const TextField: React.FC<TextFieldProps> = ({ icon: Icon, className = '', ...inputProps }) => {
  return (
    <div className="relative">
      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        {...inputProps}
        className={`w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus:border-emerald-400 dark:focus:border-emerald-500 ${className}`}
      />
    </div>
  );
};

export default TextField;