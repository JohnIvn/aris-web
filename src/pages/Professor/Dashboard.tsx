import React, { useState } from 'react';
import {
    FileText,
    CalendarCheck,
    Fingerprint,
    Video,
    Clock,
    Info,
    CheckCircle2,
    Plus,
    Upload,
    UserCheck,
} from 'lucide-react';

import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ReportTimeline from '../../components/ui/ReportTimeline';
import type { TimelineStep } from '../../components/ui/ReportTimeline';
import NotificationItem from '../../components/ui/NotificationItem';
import QuickActionButton from '../../components/ui/QuickActionButton';
import InfoBanner from '../../components/ui/InfoBanner';
import Topbar from '../../components/Topbar';
import type { DashboardData, DashboardNotification } from '../../lib/data/dashboard.types';

export interface DashboardProps extends Partial<DashboardData> {

    textColor?: string;
    accentColor?: string;
    secondAccentColor?: string;
    onNavigate?: (key: string) => void;
    onCreateReport?: () => void;
    onStartMeeting?: () => void;
    onUploadDocument?: () => void;
}

const defaultReportSteps: TimelineStep[] = [
    { label: 'Submitted', icon: Clock, status: 'current' },
    { label: 'Checker Review', icon: UserCheck, status: 'upcoming' },
    { label: 'College Secretary', icon: UserCheck, status: 'upcoming' },
    { label: 'Human Resources', icon: UserCheck, status: 'upcoming' },
    { label: 'Accounting', icon: UserCheck, status: 'upcoming' },
];

const defaultNotifications: DashboardNotification[] = [
    {
        id: 'notification-report-submitted',
        type: 'submitted',
        message: 'Your AR for August 2026 has been submitted successfully.',
        time: '8:15 AM',
    },
    { id: 'notification-meeting-recorded', type: 'meeting', message: 'Meeting attendance recorded successfully.', time: '8:02 AM' },
    { id: 'notification-attendance-recorded', type: 'attendance', message: 'Time in recorded via biometric.', time: '7:52 AM' },
];

const notificationVisuals: Record<
    DashboardNotification['type'],
    { icon: React.ElementType; iconBgClass: string; iconColorClass: string }
> = {
    submitted: {
        icon: Clock,
        iconBgClass: 'bg-amber-50 dark:bg-amber-900/30',
        iconColorClass: 'text-amber-600 dark:text-amber-400',
    },
    meeting: {
        icon: Info,
        iconBgClass: 'bg-blue-50 dark:bg-blue-900/30',
        iconColorClass: 'text-blue-600 dark:text-blue-400',
    },
    attendance: {
        icon: CheckCircle2,
        iconBgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
        iconColorClass: 'text-emerald-600 dark:text-emerald-400',
    },
};

const DashboardContent: React.FC<DashboardProps> = ({
    username = "Test",
    dateLabel = 'May 28, 2026',
    dayTimeLabel = 'Thursday, 8:30 AM',
    unreadCount = 3,

    arStatus = {
        label: 'AR Status (Current Month)',
        value: 'Pending',
        subLabel: 'Checker Review',
        actionLabel: 'View My Report',
    },
    dtrSummary = {
        label: 'DTR This Month',
        value: '21 / 22',
        subLabel: 'Present Days',
        actionLabel: 'View DTR',
    },
    attendanceSummary = {
        label: "Today's Attendance",
        value: 'Present',
        subLabel: 'Time in: 7:52 AM',
        actionLabel: 'View Details',
    },
    meetingSummary = {
        label: 'Meeting Today',
        value: '1',
        subLabel: 'Meeting Recorded',
        actionLabel: 'View Meetings',
    },

    reportPeriodLabel = 'August 1 – August 31, 2026',
    reportSubmittedLabel = 'Submitted on May 28, 2026 at 8:15 AM',
    reportStatusMessage = 'Your report is currently pending review from the Checker.',
    reportSteps = defaultReportSteps,

    notifications = defaultNotifications,

    meetingSessionTitle = 'Meeting Session 1',
    meetingSessionTimeLabel = '8:00 AM – 10:00 AM  •  Google Meet',
    meetingProofTimeLabel = '8:01 AM',

    reminders = [
        'Make sure to submit your AR on or before the deadline.',
        'Complete all required fields and attach supporting documents.',
        'Check your DTR regularly.',
    ],

    textColor = '#1e293b', // Tailwind slate-800
    accentColor = '#047857', // Tailwind emerald-700
    secondAccentColor = '#64748b', // Tailwind slate-500

    onNavigate,
    onCreateReport,
    onStartMeeting,
    onUploadDocument,
}) => {
    const [modal, setModal] = useState<{ title: string; description: string; body: string } | null>(null);

    const openModal = (title: string, description: string, body: string) => {
        setModal({ title, description, body });
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950 transition-colors">

            <main className="flex-1 min-w-0 p-6 md:p-8">
                <Topbar
                    title="Professor Dashboard"
                    subtitle={
                        <p style={{ color: secondAccentColor }} className="dark:text-slate-400">
                            Good morning, {username}! 👋
                        </p>
                    }
                    showThemeToggle
                    dateLabel={dateLabel}
                    dayTimeLabel={dayTimeLabel}
                    unreadCount={unreadCount}
                    textColor={textColor}
                    accentColor={accentColor}
                    onNotificationClick={() => onNavigate?.('notifications')}
                />

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                    <StatCard
                        icon={FileText}
                        iconBgClass="bg-amber-50 dark:bg-amber-900/30"
                        iconColorClass="text-amber-600 dark:text-amber-400"
                        valueColorClass="text-amber-600 dark:text-amber-400"
                        label={arStatus.label}
                        value={arStatus.value}
                        subLabel={arStatus.subLabel}
                        actionLabel={arStatus.actionLabel}
                        accentColor={accentColor}
                        onAction={() => onNavigate?.('reports')}
                    />
                    <StatCard
                        icon={CalendarCheck}
                        iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                        iconColorClass="text-emerald-600 dark:text-emerald-400"
                        valueColorClass="text-emerald-700 dark:text-emerald-400"
                        label={dtrSummary.label}
                        value={dtrSummary.value}
                        subLabel={dtrSummary.subLabel}
                        actionLabel={dtrSummary.actionLabel}
                        accentColor={accentColor}
                        onAction={() => onNavigate?.('dtr')}
                    />
                    <StatCard
                        icon={Fingerprint}
                        iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                        iconColorClass="text-emerald-600 dark:text-emerald-400"
                        valueColorClass="text-emerald-700 dark:text-emerald-400"
                        label={attendanceSummary.label}
                        value={attendanceSummary.value}
                        subLabel={attendanceSummary.subLabel}
                        actionLabel={attendanceSummary.actionLabel}
                        accentColor={accentColor}
                        onAction={() => onNavigate?.('attendance')}
                    />
                    <StatCard
                        icon={Video}
                        iconBgClass="bg-indigo-50 dark:bg-indigo-900/30"
                        iconColorClass="text-indigo-600 dark:text-indigo-400"
                        valueColorClass="text-indigo-600 dark:text-indigo-400"
                        label={meetingSummary.label}
                        value={meetingSummary.value}
                        subLabel={meetingSummary.subLabel}
                        actionLabel={meetingSummary.actionLabel}
                        accentColor={accentColor}
                        onAction={() => onNavigate?.('meetings')}
                    />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3  gap-6">
                    {/* Left column */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <Card
                            title="My Accomplishment Report"
                            actionLabel="View All"
                            accentColor={accentColor}
                            onAction={() => onNavigate?.('reports')}
                        >
                            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-5">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {reportPeriodLabel}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    {reportSubmittedLabel}
                                </p>

                                <ReportTimeline steps={reportSteps} accentColor={accentColor} />

                                <div className="mt-6">
                                    <InfoBanner variant="warning">{reportStatusMessage}</InfoBanner>
                                </div>
                            </div>
                        </Card>

                        <Card title="Quick Actions" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <QuickActionButton
                                    icon={Plus}
                                    label="Create New AR"
                                    description="Start a new report"
                                    accentColor={accentColor}
                                    onClick={() => {
                                        if (onCreateReport) onCreateReport();
                                        else openModal('Create New AR', 'Start a report from the web app', 'This action is ready for your backend endpoint. Connect it by replacing the callback handler or the service URL in the dashboard flow.');
                                    }}
                                />
                                <QuickActionButton
                                    icon={Video}
                                    label="Start Meeting"
                                    description="Record meeting attendance"
                                    accentColor={accentColor}
                                    onClick={() => {
                                        if (onStartMeeting) onStartMeeting();
                                        else openModal('Start Meeting', 'Begin attendance tracking', 'This button is prepared for a backend call once the meeting service endpoint is available.');
                                    }}
                                />
                                <QuickActionButton
                                    icon={CalendarCheck}
                                    label="View DTR"
                                    description="Check your daily attendance"
                                    accentColor={accentColor}
                                    onClick={() => onNavigate?.('dtr')}
                                />
                                <QuickActionButton
                                    icon={Upload}
                                    label="Upload Document"
                                    description="Add supporting documents"
                                    accentColor={accentColor}
                                    onClick={() => {
                                        if (onUploadDocument) onUploadDocument();
                                        else openModal('Upload Document', 'Attach supporting file', 'The upload flow is ready to connect to your file endpoint when the backend is live.');
                                    }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        <Card
                            title="Recent Notifications"
                            actionLabel="View All"
                            accentColor={accentColor}
                            onAction={() => onNavigate?.('notifications')}
                        >
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => {
                                    const visuals = notificationVisuals[notification.type];
                                    return (
                                        <NotificationItem
                                            key={notification.id}
                                            icon={visuals.icon}
                                            iconBgClass={visuals.iconBgClass}
                                            iconColorClass={visuals.iconColorClass}
                                            message={notification.message}
                                            time={notification.time}
                                        />
                                    );
                                })}
                            </div>
                            {unreadCount > 0 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 pt-3">
                                    You have {unreadCount} unread notifications.
                                </p>
                            )}
                        </Card>

                        <Card title="Meeting Attendance Today" accentColor={accentColor}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Video size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {meetingSessionTitle}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {meetingSessionTimeLabel}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                                    Recorded
                                </span>
                            </div>

                            <InfoBanner
                                variant="success"
                                action={
                                    <button
                                        type="button"
                                        onClick={() => openModal('Meeting Proof', 'Initial attendance verification', 'Proof recorded at 8:01 AM. This is the placeholder record for backend sync; replace it with your actual proof response when the API is connected.')}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    >
                                        View Proof
                                    </button>
                                }
                            >
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    Initial proof captured at {meetingProofTimeLabel}
                                </span>
                                <br />
                                You can use this as proof in case of disconnection.
                            </InfoBanner>
                        </Card>

                        <Card title="Helpful Reminders" accentColor={accentColor}>
                            <InfoBanner variant="tip">
                                <ul className="list-disc list-inside space-y-1">
                                    {reminders.map((r, idx) => (
                                        <li key={idx}>{r}</li>
                                    ))}
                                </ul>
                            </InfoBanner>
                        </Card>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
                    © 2026 ARIS. All rights reserved.
                </p>
            </main>

            <Modal
                isOpen={!!modal}
                title={modal?.title ?? 'Action'}
                description={modal?.description ?? ''}
                onClose={() => setModal(null)}
                size="md"
                footer={
                    <button
                        type="button"
                        onClick={() => setModal(null)}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
                    >
                        Close
                    </button>
                }
            >
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{modal?.body}</p>
            </Modal>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => (
    <DashboardContent {...props} />
);

export default Dashboard;