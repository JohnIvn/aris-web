import React, { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar, { SidebarNavItemData, SidebarUser } from "../components/Sidebar";
import ThemeToggle from "../components/ui/ThemeToggle";

interface AppLayoutProps {
    user: SidebarUser;
    activeKey: string;
    navItems?: SidebarNavItemData[];
    notificationCount?: number;
    onNavigate?: (key: string) => void;
    onSignOut?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    user,
    activeKey,
    navItems,
    notificationCount,
    onNavigate,
    onSignOut,
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
            <div className="relative flex min-h-screen">
                <div
                    className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0 ${
                        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <Sidebar
                        user={user}
                        activeKey={activeKey}
                        navItems={navItems}
                        notificationCount={notificationCount}
                        onNavigate={(key) => {
                            onNavigate?.(key);
                            setMobileOpen(false);
                        }}
                        onSignOut={onSignOut}
                    />
                </div>

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

                    <div className="flex-1 min-w-0 overflow-y-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;