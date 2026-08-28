import React from 'react';

export type StatusTone = 'success' | 'neutral' | 'warning';

export interface StatusBadgeProps {
    label: string;
    tone?: StatusTone;
    icon?: React.ElementType;
}

const toneStyles: Record<StatusTone, string> = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    neutral: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'neutral', icon: Icon }) => {
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${toneStyles[tone]}`}
        >
            {Icon && <Icon size={12} />}
            {label}
        </span>
    );
};

export default StatusBadge;