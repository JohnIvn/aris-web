import React from 'react';
import { CheckCircle2, Lightbulb, Clock } from 'lucide-react';

export type InfoBannerVariant = 'success' | 'warning' | 'tip';

export interface InfoBannerProps {
    variant: InfoBannerVariant;
    children: React.ReactNode;
    action?: React.ReactNode;
    icon?: React.ElementType;
}

const variantStyles: Record<
    InfoBannerVariant,
    { wrap: string; icon: React.ElementType; iconColor: string }
> = {
    success: {
        wrap: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
        wrap: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        icon: Clock,
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    tip: {
        wrap: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        icon: Lightbulb,
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
};

const InfoBanner: React.FC<InfoBannerProps> = ({ variant, children, action, icon }) => {
    const { wrap, icon: DefaultIcon, iconColor } = variantStyles[variant];
    const Icon = icon ?? DefaultIcon;

    return (
        <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${wrap}`}>
            <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug">{children}</div>
            {action}
        </div>
    );
};

export default InfoBanner;