import React from 'react';

export interface DividerLabelProps {
  label: string;
}

const DividerLabel: React.FC<DividerLabelProps> = ({ label }) => {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
      <span className="text-xs text-slate-400 dark:text-slate-500 rounded-full border border-slate-200 dark:border-slate-700 w-6 h-6 flex items-center justify-center">
        {label}
      </span>
      <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
    </div>
  );
};

export default DividerLabel;