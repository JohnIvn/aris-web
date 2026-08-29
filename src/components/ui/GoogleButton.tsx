import React from 'react';

export interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ label = 'Continue with Google', className = '', ...buttonProps }) => {
  return (
    <button
      type="button"
      {...buttonProps}
      className={`w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-sm transition-all duration-200 ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.42-.22-2.05H12v3.9h6.5c-.13 1.05-.84 2.63-2.42 3.7l-.02.15 3.51 2.72.24.02c2.23-2.06 3.68-5.1 3.68-8.44z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.78-2.93c-1.02.7-2.4 1.19-4.15 1.19-3.17 0-5.86-2.09-6.82-4.98l-.14.01-3.66 2.84-.05.14C3.34 21.3 7.36 24 12 24z" />
        <path fill="#FBBC05" d="M5.18 14.38A7.4 7.4 0 0 1 4.78 12c0-.83.15-1.63.39-2.38l-.01-.16-3.71-2.88-.12.06A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.27 5.36l3.91-3z" />
        <path fill="#EA4335" d="M12 4.75c2.26 0 3.79.97 4.66 1.79l3.4-3.32C17.94 1.19 15.24 0 12 0 7.36 0 3.34 2.7 1.27 6.64l3.9 3.02C6.14 6.84 8.83 4.75 12 4.75z" />
      </svg>
      {label}
    </button>
  );
};

export default GoogleButton;