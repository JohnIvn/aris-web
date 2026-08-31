import React, { useState } from 'react';
import {
    ChevronRight,
    Pencil,
    Mail,
    Building2,
    ShieldCheck,
    CalendarDays,
    GraduationCap,
    Lock,
    Globe,
    KeyRound,
    Clock,
    Monitor,
} from 'lucide-react';
    
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import InfoBanner from '../../components/ui/InfoBanner';
import type {
    ProfileDetailField,
    ProfileEmploymentField,
    ProfileSecurityItem,
} from '../../lib/data/profile.types';

export interface ProfileProps {
    dateLabel?: string;
    dayTimeLabel?: string;
    unreadCount?: number;

    photoUrl?: string;
    fullName?: string;
    facultyType?: string;
    roleBadge?: string;

    contactEmail?: string;
    contactEmailNote?: string;
    department?: string;
    employeeId?: string;
    joinedLabel?: string;

    personalInfo?: ProfileDetailField[];
    employment?: ProfileEmploymentField[];
    security?: ProfileSecurityItem[];

    textColor?: string;
    accentColor?: string;
    secondAccentColor?: string;

    onNavigate?: (key: string) => void;
    onEditProfile?: () => void;
    onEditEmployment?: () => void;
}

const defaultPersonalInfo: ProfileDetailField[] = [
    { label: 'Full Name', value: 'Juan Dela Cruz' },
    { label: 'Date of Birth', value: 'June 12, 1985' },
    { label: 'Gender', value: 'Male' },
    { label: 'Civil Status', value: 'Married' },
    { label: 'Nationality', value: 'Filipino' },
    { label: 'Contact Number', value: '+63 912 345 6789' },
    { label: 'Personal Email', value: 'juan.delacruz@ucc.edu.ph' },
    { label: 'Home Address', value: '123 Sampaguita St., Barangay 12, Caloocan City, Metro Manila, Philippines' },
];

const defaultEmployment: ProfileEmploymentField[] = [
    { label: 'Employee / Faculty ID', value: 'UCC-IT-2018-0456' },
    { label: 'Department', value: 'Information Technology Department' },
    { label: 'College', value: 'College of Information and Computing Studies' },
    { label: 'Position / Rank', value: 'Professor' },
    { label: 'Highest Educational Attainment', value: 'Master of Science in Information Technology' },
    { label: 'Date Hired', value: 'August 15, 2018' },
    { label: 'Employment Status', value: 'Regular', badge: true },
];

const defaultSecurity: ProfileSecurityItem[] = [
    {
        icon: Globe,
        iconColorClass: 'text-slate-500 dark:text-slate-400',
        title: 'Google Account',
        subtitle: 'juan.delacruz@ucc.edu.ph',
    },
    {
        icon: KeyRound,
        iconColorClass: 'text-slate-500 dark:text-slate-400',
        title: 'Account Security',
        subtitle: 'Password is managed by Google',
    },
    {
        icon: Clock,
        iconColorClass: 'text-slate-500 dark:text-slate-400',
        title: 'Last Login',
        subtitle: 'May 28, 2026  •  8:15 AM',
    },
    {
        icon: Monitor,
        iconColorClass: 'text-slate-500 dark:text-slate-400',
        title: 'Trusted Device',
        subtitle: 'Chrome on Windows',
    },
];

function DetailRow({ label, value }: ProfileDetailField) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 sm:w-56 shrink-0">{label}</p>
            <p className="text-sm font-base text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}

function EmploymentRow({ label, value, badge, accentColor }: ProfileEmploymentField & { accentColor: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 sm:w-60">{label}</p>
            {badge ? (
                <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: accentColor, backgroundColor: `${accentColor}1A` }}
                >
                    {value}
                </span>
            ) : (
                <p className="text-sm text-slate-900 dark:text-slate-100">{value}</p>
            )}
        </div>
    );
}

function SecurityRow({ icon: Icon, iconColorClass, title, subtitle, onClick }: ProfileSecurityItem) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                -mx-4
                w-[calc(100%+2rem)]
                flex items-center gap-3
                px-4 py-3
                border-b border-slate-100
                dark:border-slate-800
                last:border-b-0
                text-left
                focus:outline-none
                cursor-pointer
                rounded-md
                hover:bg-slate-200
            "
        >
            <Icon
                size={18}
                className={iconColorClass ?? 'text-slate-500 dark:text-slate-400'}
            />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subtitle}
                </p>
            </div>

            <ChevronRight
                size={16}
                className="text-slate-300 dark:text-slate-600 shrink-0"
            />
        </button>
    );
}

const ProfileContent: React.FC<ProfileProps> = ({
    photoUrl,
    fullName = 'Prof. Juan Dela Cruz',
    facultyType = 'Faculty Member',
    roleBadge = 'Professor',

    contactEmail = 'juan.delacruz@ucc.edu.ph',
    contactEmailNote = '(Google Account)',
    department = 'Information Technology Department',
    employeeId = 'UCC-IT-2018-0456',
    joinedLabel = 'Joined: August 15, 2018',

    personalInfo = defaultPersonalInfo,
    employment = defaultEmployment,
    security = defaultSecurity,
    accentColor = '#047857', // Tailwind emerald-700
    onEditProfile,
    onEditEmployment,
}) => {
    const [modal, setModal] = useState<{ title: string; description: string; body: string } | null>(null);

    const openModal = (title: string, description: string, body: string) => {
        setModal({ title, description, body });
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950 transition-colors">
            <main className="flex-1 min-w-0">
                {/* Top row: photo card + personal information */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                    {/* Photo card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 overflow-hidden flex items-center justify-center shadow-sm">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                                            {fullName
                                                .replace(/^Prof\.\s*/i, '')
                                                .split(' ')
                                                .map((p) => p[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onEditProfile) onEditProfile();
                                        else openModal('Edit Profile Photo', 'Update your profile image', 'This action is prepared for a future file upload or profile image endpoint once the backend is connected.');
                                    }}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm focus:outline-none transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: accentColor }}
                                    aria-label="Edit photo"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>

                            <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{fullName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{facultyType}</p>
                            <span
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                                style={{ color: accentColor, backgroundColor: `${accentColor}1A` }}
                            >
                                <GraduationCap size={13} />
                                {roleBadge}
                            </span>
                        </div>

                        <div className="px-6 py-5 space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {contactEmail}
                                    <br />
                                    <span className="text-slate-400 dark:text-slate-500">{contactEmailNote}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">{department}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Employee ID: {employeeId}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarDays size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">{joinedLabel}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal information */}
                    <div className="xl:col-span-2">
                        <Card
                            title="Personal Information"
                            actionLabel="Edit Profile"
                            accentColor={accentColor}
                            onAction={() => {
                                if (onEditProfile) onEditProfile();
                                else openModal('Edit Personal Information', 'Update your profile details', 'This edit flow is ready for your API endpoint. Replace the placeholder action with your profile update URL when the backend is available.');
                            }}
                        >
                            <div>
                                {personalInfo.map((f) => (
                                    <DetailRow key={f.label} {...f} />
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Bottom row: employment + system & security */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <Card
                            title="Employment Information"
                            actionLabel="Edit"
                            accentColor={accentColor}
                            onAction={() => {
                                if (onEditEmployment) onEditEmployment();
                                else openModal('Edit Employment Information', 'Update department records', 'This section is aligned to accept your employment API data once the backend endpoint is available.');
                            }}
                        >
                            <div>
                                {employment.map((f) => (
                                    <EmploymentRow key={f.label} {...f} accentColor={accentColor} />
                                ))}
                            </div>
                        </Card>
                    </div>

                    <Card
                        title="System & Security"
                        accentColor={accentColor}
                        className="h-fit"
                    >
                        <div>
                            {security.map((s) => (
                                <SecurityRow
                                    key={s.title}
                                    {...s}
                                    onClick={() => openModal(s.title, s.subtitle, `This security item can be connected to its specific backend endpoint once the related API is available. Current data is displayed as a front-end placeholder.`)}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Security banner */}
                <div className="mt-6">
                    <InfoBanner variant="success" icon={Lock}>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            Your information is secure.
                        </span>{' '}
                        Your personal data is protected and will only be used for official purposes related to the
                        Accomplishment Report Information System (ARIS).
                    </InfoBanner>
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
                    © 2026 ARIS. All rights reserved.
                </p>
            </main>

            <Modal
                isOpen={!!modal}
                title={modal?.title ?? 'Profile'}
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

const Profile: React.FC<ProfileProps> = (props) => (
    <ProfileContent {...props} />
);

export default Profile;