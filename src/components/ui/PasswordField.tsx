import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export type PasswordFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

const PasswordField: React.FC<PasswordFieldProps> = ({ className = '', ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        className={`w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus:border-emerald-400 dark:focus:border-emerald-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordField;