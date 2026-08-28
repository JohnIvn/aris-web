import React from 'react';

export interface NotificationItemProps {
    icon: React.ElementType;
    /** Tailwind classes for the icon's round background */
    iconBgClass?: string;
    /** Tailwind classes for the icon color */
    iconColorClass?: string;
    message: string;
    time: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    icon: Icon,
    iconBgClass = 'bg-slate-100 dark:bg-slate-800',
    iconColorClass = 'text-slate-500 dark:text-slate-300',
    message,
    time,
}) => {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
                <Icon size={15} className={iconColorClass} />
            </div>
            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug">{message}</p>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap pt-0.5">
                {time}
            </span>
        </div>
    );
};

export default NotificationItem;