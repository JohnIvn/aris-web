import React from 'react';
import { Calendar, Bell } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';

export interface TopbarProps {
    /** Large page heading, e.g. "Professor Dashboard" or "My Profile" */
    title: string;
    /**
     * Content rendered under the title — a plain greeting string, or a
     * breadcrumb trail. Pass a node so each page can shape it differently
     * without Topbar needing to know the difference.
     */
    subtitle?: React.ReactNode;

    dateLabel: string;
    dayTimeLabel: string;
    unreadCount?: number;

    /** Dashboard shows the light/dark switch here; Profile doesn't. */
    showThemeToggle?: boolean;

    textColor?: string;
    accentColor?: string;

    onNotificationClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
    title,
    subtitle,
    dateLabel,
    dayTimeLabel,
    unreadCount = 0,
    showThemeToggle = true,
    textColor = '#1e293b', // Tailwind slate-800
    accentColor = '#047857', // Tailwind emerald-700
    onNotificationClick,
}) => {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6" style={{ color: textColor }}>
            <div>
                <h1 className="text-3xl font-bold dark:text-white">
                    {title}
                </h1>
                {subtitle && <div className="mt-1">{subtitle}</div>}
            </div>

            <div className="hidden items-center gap-4 sm:flex">
                {showThemeToggle && <ThemeToggle />}
        
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={18} style={{ color: accentColor }} className="dark:text-emerald-400" />
                    <div className="leading-tight text-right">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{dateLabel}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{dayTimeLabel}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onNotificationClick}
                    className="relative w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`${unreadCount} unread notifications`}
                >
                    <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Topbar;