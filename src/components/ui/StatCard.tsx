import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface StatCardProps {
    icon: React.ElementType;
    /** Tailwind classes for the icon's square background, e.g. "bg-amber-50 dark:bg-amber-900/30" */
    iconBgClass?: string;
    /** Tailwind classes for the icon color, e.g. "text-amber-600 dark:text-amber-400" */
    iconColorClass?: string;
    label: string;
    value: string;
    /** Tailwind classes for the value text color, e.g. "text-amber-600 dark:text-amber-400" */
    valueColorClass?: string;
    subLabel?: string;
    actionLabel: string;
    onAction?: () => void;
    accentColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    iconBgClass = 'bg-slate-100 dark:bg-slate-800',
    iconColorClass = 'text-slate-600 dark:text-slate-300',
    label,
    value,
    valueColorClass = 'text-slate-900 dark:text-white',
    subLabel,
    actionLabel,
    onAction,
    accentColor = '#047857',
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>

            <div className="flex items-center gap-3 mt-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
                    <Icon size={20} className={iconColorClass} />
                </div>
                <div className="min-w-0">
                    <p className={`text-xl font-bold leading-tight ${valueColorClass}`}>{value}</p>
                    {subLabel && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subLabel}</p>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={onAction}
                style={isLight ? { color: accentColor, borderColor: 'currentColor' } : undefined}
                className="mt-auto w-full flex items-center justify-center gap-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl py-2 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
                {actionLabel}
                <ArrowRight size={14} />
            </button>
        </div>
    );
};

export default StatCard;