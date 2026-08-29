import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useAuthStore } from "../lib/stores/auth.store";
import { SidebarUser } from "../components/Sidebar";

const AppLayoutRoute: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const isLoading = useAuthStore((s) => s.loading);
    const signOut = useAuthStore((s) => s.signOut);

    const location = useLocation();
    const navigate = useNavigate();

    const segments = location.pathname.split("/").filter(Boolean);
    const activeKey = segments.includes("reports") ? "reports" : segments[segments.length - 1] || "dashboard";

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                <p className="text-slate-500 dark:text-slate-400">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const sidebarUser: SidebarUser = {
        name: user.name ?? user.fullName ?? user.email,
        role: user.position ?? user.role,
        department: user.department ?? "—",
        avatarUrl: user.avatarUrl ?? user.photoUrl,
    };

    const handleNavigate = (key: string) => {
        navigate(key === "dashboard" ? "/user/dashboard" : `/user/${key}`);
    };

    const handleSignOut = () => {
        signOut?.();
        navigate("/", { replace: true });
    };

    return (
        <AppLayout
            user={sidebarUser}
            activeKey={activeKey}
            notificationCount={0}
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
        />
    );
};

export default AppLayoutRoute;