import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SidebarUser } from "../components/Sidebar";

interface AppLayoutProps {
    user: SidebarUser;
    activeKey: string;
    notificationCount?: number;
    onNavigate?: (key: string) => void;
    onSignOut?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    user,
    activeKey,
    notificationCount,
    onNavigate,
    onSignOut,
}) => {
    return (
        <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950">
            <Sidebar
                user={user}
                activeKey={activeKey}
                notificationCount={notificationCount}
                onNavigate={onNavigate}
                onSignOut={onSignOut}
            />
            <div className="flex-1 min-w-0 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AppLayout;