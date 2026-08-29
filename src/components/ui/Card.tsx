import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface CardProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    accentColor?: string;
    accentHover?: string;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({
    title,
    actionLabel,
    onAction,
    accentColor = '#047857',
    children,
    className = '',
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                {actionLabel && (
                    <button
                        type="button"
                        onClick={onAction}
                        style={isLight ? { color: accentColor, } : undefined}
                        className={`text-sm font-semibold dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded cursor-pointer transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
};

export default Card;