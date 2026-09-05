import React, { useState } from "react";
import { Bell, ChevronRight, Menu, X } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar, { SidebarNavItemData, SidebarUser } from "../components/Sidebar";
import Modal from "../components/ui/Modal";
import ThemeToggle from "../components/ui/ThemeToggle";
import Topbar from "../components/Topbar";

import { getTodayFormatted } from "../lib/utils/date";

interface AppLayoutProps {
    user: SidebarUser;
    activeKey: string;
    navItems?: SidebarNavItemData[];
    notificationCount?: number;
    onNavigate?: (key: string) => void;
    onSignOut?: () => void;
}
export type UserTopbarKey =
    | "profile"
    | "dtr"
    | "meetings"
    | "reports"
    | "payroll"
    | "notifications"
    | "help";

export type StaffTopbarKey =
    | "dashboard"
    | "reports"
    | "reportDetails"
    | "history"
    | "audit"
    | "notifications"
    | "help";

export interface TopbarItem {
    title: string;
    subtitleType?: "breadcrumb" | "greeting";
    breadcrumb?: string;
    breadcrumbItems?: string[];
}

export const userTopbarSeed: Record<string, TopbarItem> = {
    dashboard: {
        title: "Dashboard",
        subtitleType: "greeting",
    },

    profile: {
        title: "My Profile",
        subtitleType: "breadcrumb",
        breadcrumb: "My Profile",
    },

    dtr: {
        title: "DTR / Attendance",
        subtitleType: "breadcrumb",
        breadcrumb: "DTR / Attendance",
    },

    meetings: {
        title: "Meetings",
        subtitleType: "breadcrumb",
        breadcrumb: "Meetings",
    },

    reports: {
        title: "My Accomplishment Reports",
        subtitleType: "breadcrumb",
        breadcrumb: "Reports",
    },

    payroll: {
        title: "Payroll",
        subtitleType: "breadcrumb",
        breadcrumb: "Payroll",
    },
    
    notifications: {
        title: "Notifications",
    },
    
    help: {
        title: "Help & Support",
    },
};

export const staffTopbarSeed: Record<StaffTopbarKey, TopbarItem> = {
    dashboard: {
        title: "Dashboard",
        subtitleType: "greeting",
    },

    reports: {
        title: "Pending Reports",
        subtitleType: "breadcrumb",
        breadcrumb: "Pending Reports",
    },

    reportDetails: {
        title: "Report Details",
        subtitleType: "breadcrumb",
        breadcrumbItems: ["Pending Reports", "Report Details"],
    },

    history: {
        title: "Approval History",
        subtitleType: "breadcrumb",
        breadcrumb: "Approval History",
    },

    audit: {
        title: "Audit Trail",
        subtitleType: "breadcrumb",
        breadcrumb: "Audit Trail",
    },
    
    notifications: {
        title: "Notifications",
    },
    
    help: {
        title: "Help & Support",
    },
};


const AppLayout: React.FC<AppLayoutProps> = ({
    user,
    activeKey,
    navItems,
    notificationCount,
    onNavigate,
    onSignOut,
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isStaffLayout = location.pathname.startsWith("/staff");
    const routeKey = location.pathname.split("/")[2] || "dashboard";
    const isStaffReportDetail = isStaffLayout && location.pathname.startsWith("/staff/reports/");
    const topbar = isStaffLayout
        ? staffTopbarSeed[isStaffReportDetail ? "reportDetails" : routeKey as StaffTopbarKey]
        : userTopbarSeed[routeKey as UserTopbarKey];

    const renderSubtitle = () => {
        if (topbar.subtitleType === "greeting") {
            return (
                <p className="text-slate-500 dark:text-slate-400">
                    Good morning, {user.name}! 👋
                </p>
            );
        }

        const breadcrumbItems = topbar.breadcrumbItems;

        return (
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <button
                    type="button"
                    onClick={() => onNavigate?.("dashboard")}
                    className="hover:underline hover:text-slate-600 flex items-center gap-2 dark:hover:text-slate-200 cursor-pointer"
                >
                    Dashboard <ChevronRight size={14} />
                </button>

                {breadcrumbItems ? (
                    breadcrumbItems.map((item, index) => (
                        <React.Fragment key={item}>
                            {index === breadcrumbItems.length - 1 ? (
                                <span className="font-medium text-slate-700 dark:text-slate-100">
                                    {item}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.("reports")}
                                    className="text-slate-500 flex items-center gap-2 hover:text-slate-600 hover:underline dark:text-slate-300 dark:hover:text-slate-100"
                                >
                                    {item} <ChevronRight size={14} />
                                </button>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {topbar.breadcrumb}
                    </span>
                )}
            </div>
        );
    };
    const handleSidebarNavigate = (key: string) => {
        onNavigate?.(key);
        setMobileOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
            <div className="relative flex min-h-screen">
                <div
                    className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        }`}
                >
                    <Sidebar
                        user={user}
                        activeKey={activeKey}
                        navItems={navItems}
                        notificationCount={notificationCount}
                        onNavigate={(key) => {
                            handleSidebarNavigate(key);
                            setMobileOpen(false);
                        }}
                        onSignOut={() => setShowLogoutConfirm(true)}
                    />
                </div>

                <Modal
                    isOpen={showLogoutConfirm}
                    title="Confirm sign out"
                    description="You will be signed out of your current session."
                    onClose={() => setShowLogoutConfirm(false)}
                    size="sm"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    onSignOut?.();
                                }}
                                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                            >
                                Sign out
                            </button>
                        </>
                    }
                >
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Are you sure you want to log out of ARIS? You can sign back in anytime.
                    </p>
                </Modal>

                {mobileOpen && (
                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
                    />
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70 lg:hidden">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen((value) => !value)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                                Menu
                            </button>

                            <div className="ml-auto flex items-center gap-2">
                                <ThemeToggle />
                                <button
                                    type="button"
                                    aria-label="Notifications"
                                    onClick={() => navigate(isStaffLayout ? '/staff/notifications' : '/user/notifications')}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <Bell size={16} />
                                    {notificationCount && notificationCount > 0 ? (
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                            {notificationCount}
                                        </span>
                                    ) : null}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 md:p-8 min-w-0 overflow-y-auto">
                        <Topbar
                            title={topbar.title}
                            subtitle={renderSubtitle()}
                            dateLabel={getTodayFormatted()}
                            dayTimeLabel={topbar.title}
                            unreadCount={notificationCount ?? 0}
                            accentColor="#047857"
                            textColor="#1e293b"
                            onNotificationClick={() => onNavigate?.("notifications")}
                        />
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;