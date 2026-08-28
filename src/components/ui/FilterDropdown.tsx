import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterDropdownProps {
    value: string;
    icon?: React.ElementType;
    onClick?: () => void;
    className?: string;
}

/**
 * Visual trigger for a filter (month picker, status filter, etc.). This
 * renders the closed/collapsed state used across list pages — wire
 * `onClick` up to whatever menu/select implementation your app uses.
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, icon: Icon, onClick, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-2.5 py-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${className}`}
        >
            {Icon && <Icon size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />}
            <span className="font-medium">{value}</span>
            <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </button>
    );
};

export default FilterDropdown;