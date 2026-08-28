import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface QuickActionButtonProps {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick?: () => void;
    accentColor?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon: Icon,
    label,
    description,
    onClick,
    accentColor = '#047857',
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-start gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
            <Icon size={20} style={isLight ? { color: accentColor } : undefined} className="dark:text-emerald-400" />
            <span
                style={isLight ? { color: accentColor } : undefined}
                className="text-sm font-semibold dark:text-emerald-400"
            >
                {label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{description}</span>
        </button>
    );
};

export default QuickActionButton;