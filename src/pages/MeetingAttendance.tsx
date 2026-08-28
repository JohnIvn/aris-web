import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    ChevronRight,
    Calendar,
    Clock,
    CheckCircle2,
    Video,
    History,
    Eye,
    Info,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

import Card from '../components/ui/Card';
import InfoBanner from '../components/ui/InfoBanner';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/ui/StatusBadge';
import FilterDropdown from '../components/ui/FilterDropdown';
import SearchInput from '../components/ui/SearchInput';

import type { MeetingAttendanceData } from '../lib/data/meetingAttendance.types';
import {
    fetchMeetingAttendanceData,
    startMeeting as startMeetingRequest,
} from '../lib/services/meetingAttendance.service';

export interface MeetingAttendanceProps {
    dateLabel?: string;
    dayTimeLabel?: string;
    unreadCount?: number;

    textColor?: string;
    accentColor?: string;
    secondAccentColor?: string;

    /**
     * Data-fetching function. Defaults to `fetchMeetingAttendanceData` from
     * meetingAttendance.service.ts (currently backed by mock data). Override
     * this in tests/storybook to inject fixtures without touching the mock
     * file.
     */
    fetchData?: () => Promise<MeetingAttendanceData>;

    onNavigate?: (key: string) => void;
    /** Called after a meeting is successfully started, in addition to the internal service call. */
    onStartMeeting?: (meetingId: string | undefined) => void;
    onViewHistory?: () => void;
    onViewDetails?: (meetingId: string) => void;
    onMonthFilterClick?: () => void;
    onStatusFilterClick?: () => void;
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400 dark:text-slate-500">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading meeting attendance…</p>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4">
            <AlertTriangle size={28} className="text-amber-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
                Try again
            </button>
        </div>
    );
}

const MeetingAttendanceContent: React.FC<MeetingAttendanceProps> = ({
    dateLabel = 'May 28, 2026',
    dayTimeLabel = 'Thursday, 8:30 AM',
    unreadCount = 3,

    textColor = '#1e293b', // Tailwind slate-800
    accentColor = '#047857', // Tailwind emerald-700
    secondAccentColor = '#64748b', // Tailwind slate-500

    fetchData = fetchMeetingAttendanceData,

    onNavigate,
    onStartMeeting,
    onViewHistory,
    onViewDetails,
    onMonthFilterClick,
    onStatusFilterClick,
}) => {
    const [data, setData] = useState<MeetingAttendanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [startingMeetingId, setStartingMeetingId] = useState<string | undefined>(undefined);

    const loadData = useCallback(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetchData()
            .then((result) => {
                if (cancelled) return;
                setData(result);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load meeting attendance data.');
            })
            .finally(() => {
                if (cancelled) return;
                setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [fetchData]);

    useEffect(() => {
        const cancel = loadData();
        return cancel;
    }, [loadData]);

    const filteredHistory = useMemo(() => {
        if (!data) return [];
        const q = searchValue.trim().toLowerCase();
        if (!q) return data.meetingHistory;
        return data.meetingHistory.filter(
            (row) => row.title.toLowerCase().includes(q) || row.purpose.toLowerCase().includes(q)
        );
    }, [data, searchValue]);

    const handleStartMeeting = async (meetingId?: string) => {
        setStartingMeetingId(meetingId ?? 'new');
        try {
            await startMeetingRequest(meetingId);
            onStartMeeting?.(meetingId);
        } finally {
            setStartingMeetingId(undefined);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950 transition-colors">
            <main className="flex-1 min-w-0 p-6 md:p-8">
                <Topbar
                    title="Meeting Attendance"
                    subtitle={
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: secondAccentColor }}>
                            <button
                                type="button"
                                onClick={() => onNavigate?.('dashboard')}
                                className="hover:underline dark:text-slate-400"
                            >
                                Dashboard
                            </button>
                            <ChevronRight size={14} className="dark:text-slate-500" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                Meeting Attendance
                            </span>
                        </div>
                    }
                    dateLabel={dateLabel}
                    dayTimeLabel={dayTimeLabel}
                    unreadCount={unreadCount}
                    textColor={textColor}
                    accentColor={accentColor}
                    onNotificationClick={() => onNavigate?.('notifications')}
                />

                {isLoading && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <LoadingState />
                    </div>
                )}

                {!isLoading && error && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <ErrorState message={error} onRetry={loadData} />
                    </div>
                )}

                {!isLoading && !error && data && (
                    <>
                        {/* Today's meeting + quick actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-base font-bold mb-4" style={{ color: accentColor }}>
                                    Today&apos;s Meeting
                                </h3>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                        <Calendar size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                        {data.todaysMeeting.dateLabel}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                        <Clock size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                        {data.todaysMeeting.timeLabel}
                                    </div>
                                </div>
                                {data.todaysMeeting.isRecorded ? (
                                    <StatusBadge label="Recorded" tone="success" icon={CheckCircle2} />
                                ) : (
                                    <StatusBadge label="Not Recorded" tone="warning" />
                                )}
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                                    {data.todaysMeeting.note}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-base font-bold mb-4" style={{ color: accentColor }}>
                                    Quick Actions
                                </h3>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStartMeeting()}
                                        disabled={startingMeetingId === 'new'}
                                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {startingMeetingId === 'new' ? (
                                            <Loader2 size={18} className="shrink-0 animate-spin" />
                                        ) : (
                                            <Video size={18} className="shrink-0" />
                                        )}
                                        <span>
                                            <span className="block text-sm font-semibold">Start Meeting</span>
                                            <span className="block text-xs text-white/80">
                                                Record attendance for a new meeting
                                            </span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onViewHistory}
                                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <History size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />
                                        <span>
                                            <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                                                View Meeting History
                                            </span>
                                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                                View all your recorded meetings
                                            </span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Meeting history */}
                        <Card title="Meeting History" accentColor={accentColor}>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <FilterDropdown
                                    icon={Calendar}
                                    value={data.monthFilterValue}
                                    onClick={onMonthFilterClick}
                                />
                                <FilterDropdown value={data.statusFilterValue} onClick={onStatusFilterClick} />
                                <SearchInput
                                    value={searchValue}
                                    onChange={setSearchValue}
                                    placeholder="Search meeting..."
                                    className="ml-auto w-full sm:w-64"
                                />
                            </div>

                            {filteredHistory.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10">
                                    No meetings match your search.
                                </p>
                            ) : (
                                <div className="overflow-x-auto -mx-6">
                                    <table className="w-full text-sm min-w-[820px]">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
                                                <th className="px-3 py-3 font-semibold">Meeting Title / Purpose</th>
                                                <th className="px-3 py-3 font-semibold">Duration</th>
                                                <th className="px-3 py-3 font-semibold">Status</th>
                                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredHistory.map((row) => (
                                                <tr key={row.id}>
                                                    <td className="px-6 py-3.5 align-top">
                                                        <div className="flex items-start gap-2.5">
                                                            <span className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                                                <Calendar
                                                                    size={13}
                                                                    className="text-emerald-600 dark:text-emerald-400"
                                                                />
                                                            </span>
                                                            <span>
                                                                <span className="block font-medium text-slate-900 dark:text-slate-100">
                                                                    {row.dateLabel}
                                                                </span>
                                                                <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                                    {row.timeLabel}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3.5 align-top">
                                                        <span className="block font-semibold text-slate-900 dark:text-slate-100">
                                                            {row.title}
                                                        </span>
                                                        <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                            {row.purpose}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5 align-top">
                                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                            <Clock size={13} className="text-slate-400 dark:text-slate-500" />
                                                            {row.durationLabel}
                                                        </div>
                                                        <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                            {row.durationTimeRange}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5 align-top">
                                                        {row.isRecorded ? (
                                                            <StatusBadge label="Recorded" tone="success" />
                                                        ) : (
                                                            <StatusBadge label="No Record" tone="neutral" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5 align-top text-right">
                                                        {row.isRecorded ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => onViewDetails?.(row.id)}
                                                                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                                                                style={{ color: accentColor }}
                                                            >
                                                                <Eye size={14} />
                                                                View Details
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartMeeting(row.id)}
                                                                disabled={startingMeetingId === row.id}
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white shrink-0 disabled:opacity-60"
                                                                style={{ backgroundColor: accentColor }}
                                                            >
                                                                {startingMeetingId === row.id ? (
                                                                    <Loader2 size={13} className="animate-spin" />
                                                                ) : (
                                                                    <Video size={13} />
                                                                )}
                                                                Start Meeting
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        <div className="mt-6">
                            <InfoBanner variant="success" icon={Info}>
                                <span className="font-semibold text-slate-900 dark:text-white">Note:</span>{' '}
                                {data.noteText}
                            </InfoBanner>
                        </div>
                    </>
                )}

                <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
                    © 2026 ARIS. All rights reserved.
                </p>
            </main>
        </div>
    );
};

const MeetingAttendance: React.FC<MeetingAttendanceProps> = (props) => (
    <MeetingAttendanceContent {...props} />
);

export default MeetingAttendance;