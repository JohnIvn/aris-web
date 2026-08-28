import React from 'react';

export type StepStatus = 'complete' | 'current' | 'upcoming';

export interface TimelineStep {
    label: string;
    icon: React.ElementType;
    status: StepStatus;
}

export interface ReportTimelineProps {
    steps: TimelineStep[];
    accentColor?: string;
    currentColor?: string;
}

const ReportTimeline: React.FC<ReportTimelineProps> = ({
    steps,
    accentColor = '#047857',
    currentColor = '#f59e0b',
}) => {
    return (
        <div className="flex items-start">
            {steps.map((step, idx) => {
                const Icon = step.icon;
                const isLast = idx === steps.length - 1;
                const isActive = step.status !== 'upcoming';

                const circleStyle =
                    step.status === 'current'
                        ? { borderColor: currentColor, color: currentColor }
                        : step.status === 'complete'
                          ? { borderColor: accentColor, backgroundColor: accentColor }
                          : undefined;

                const lineStyle =
                    step.status === 'complete' ? { backgroundColor: accentColor } : undefined;

                return (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center w-20 shrink-0">
                            <div
                                style={circleStyle}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 ${
                                    step.status === 'upcoming'
                                        ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                                        : step.status === 'complete'
                                          ? 'text-white'
                                          : ''
                                }`}
                            >
                                <Icon size={16} />
                            </div>
                            <p
                                className={`mt-2 text-xs text-center leading-tight ${
                                    isActive
                                        ? 'font-semibold text-slate-800 dark:text-slate-100'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                {step.label}
                            </p>
                        </div>
                        {!isLast && (
                            <div
                                style={lineStyle}
                                className={`flex-1 h-0.5 mt-5 ${
                                    step.status === 'complete' ? '' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ReportTimeline;