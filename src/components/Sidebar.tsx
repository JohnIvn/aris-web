import React from 'react';
import {
    Home,
    User,
    CalendarCheck,
    Video,
    FileText,
    Bell,
    HelpCircle,
    LogOut,
    ShieldCheck,
} from 'lucide-react';

export interface SidebarNavItemData {
    key: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

export interface SidebarUser {
    name: string;
    role: string;
    department: string;
    avatarUrl?: string;
}

export interface SidebarProps {
    appName?: string;
    appSubtitle?: string;
    logoUrl?: string;
    user: SidebarUser;
    activeKey: string;
    navItems?: SidebarNavItemData[];
    notificationCount?: number;
    onNavigate?: (key: string) => void;
    onSignOut?: () => void;
    /** Brand color for the sidebar background. Sidebar keeps a fixed dark
     * brand look regardless of the light/dark theme toggle. */
    accentColor?: string;
}

const professorNavItems: SidebarNavItemData[] = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'dtr', label: 'My DTR', icon: CalendarCheck },
    { key: 'meetings', label: 'Meeting Attendance', icon: Video },
    { key: 'reports', label: 'My Accomplishment Reports', icon: FileText },
    { key: 'payroll', label: 'Payroll', icon: FileText },
];

const secondaryNavItems = (notificationCount?: number): SidebarNavItemData[] => [
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
    { key: 'help', label: 'Help & Support', icon: HelpCircle },
];

const NavButton: React.FC<{
    item: SidebarNavItemData;
    active: boolean;
    onClick?: () => void;
}> = ({ item, active, onClick }) => {
    const Icon = item.icon;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
            }`}
        >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1 leading-tight">{item.label}</span>
            {!!item.badge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                </span>
            )}
        </button>
    );
};

/**
 * Fixed dark-green brand sidebar for the ARIS app shell. Unlike the rest of
 * the UI it does not respond to the light/dark theme toggle - it's meant to
 * stay a consistent brand color, similar to how BrandPanel behaves on the
 * login page.
 */
const Sidebar: React.FC<SidebarProps> = ({
    appName = 'A.R.I.S.',
    appSubtitle = 'Accomplishment Report Information System',
    logoUrl,
    user,
    activeKey,
    navItems = professorNavItems,
    notificationCount = 0,
    onNavigate,
    onSignOut,
    accentColor = '#0b3d2e',
}) => {
    return (
        <aside
            style={{ backgroundColor: accentColor }}
            className="w-72 shrink-0 h-screen sticky top-0 flex flex-col text-white px-5 py-6 overflow-y-auto"
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-2 pb-6">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt={appName} className="w-full h-full object-cover" />
                    ) : (
                        <ShieldCheck size={22} className="text-amber-300" />
                    )}
                </div>
                <div className="leading-tight">
                    <p className="font-bold text-lg tracking-tight">{appName}</p>
                    <p className="text-[11px] text-emerald-100/70">{appSubtitle}</p>
                </div>
            </div>

            {/* Primary nav */}
            <nav className="flex flex-col gap-1" aria-label="Primary">
                {navItems.map((item) => (
                    <NavButton
                        key={item.key}
                        item={item}
                        active={activeKey === item.key}
                        onClick={() => onNavigate?.(item.key)}
                    />
                ))}
            </nav>

            <div className="h-px bg-white/10 mt-5 mb-4" />

            <nav className="flex flex-col gap-1" aria-label="Secondary">
                {secondaryNavItems(notificationCount).map((item) => (
                    <NavButton
                        key={item.key}
                        item={item}
                        active={activeKey === item.key}
                        onClick={() => onNavigate?.(item.key)}
                    />
                ))}
            </nav>

            <div className="flex-1 mt-8" />

            {/* User card */}
            <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5 mt-2">
                <div className="w-10 h-10 rounded-full bg-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={18} />
                    )}
                </div>
                <div className="leading-tight min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-[11px] text-emerald-100/70 truncate">{user.role}</p>
                    <p className="text-[11px] text-emerald-100/70 truncate">{user.department}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={onSignOut}
                className="mt-3 flex items-center gap-2 px-2 py-2 text-sm text-emerald-100/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg"
            >
                <LogOut size={16} />
                Sign out
            </button>
        </aside>
    );
};

export default Sidebar;