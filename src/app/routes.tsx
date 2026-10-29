import { createBrowserRouter, Navigate, useRouteError } from "react-router";
import { useAuth } from "@/app/authContext";
import Root from "@/layouts/AdminLayout";
import Login from "@/components/Login";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Dashboard from "@/pages/Admin/Dashboard";
import Announcements from "@/pages/Admin/Announcements";
import Curriculum from "@/pages/Admin/Curriculum";
import Professors from "@/pages/Admin/Professors";
import AddProfessor from "@/pages/Admin/AddProfessor";
import Staff from "@/pages/Admin/Staff";
import AddStaff from "@/pages/Admin/AddStaff";
import Payroll from "@/pages/Admin/Payroll";
import PayrollSettings from "@/pages/Admin/PayrollSettings";
import AIML from "@/pages/Admin/AIML";
import Audit from "@/pages/Admin/Audit";
import SystemLogs from "@/pages/Admin/SystemLogs";
import Database from "@/pages/Admin/Database";
import SoftwareMonitoring from "@/pages/Admin/SoftwareMonitoring";
import UserSettings from "@/pages/Admin/UserSettings";
import Tickets from "@/pages/Admin/Tickets";
import StaffProfMessages from "@/pages/Admin/StaffProfMessages";
import HardwareMonitoring from "@/pages/Admin/HardwareMonitoring";
import Enroll from "@/pages/Admin/Enroll";
import StaffDashboard from "@/pages/Staff/Dashboard";

if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1));
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 text-[#c0392b] mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-[18px] font-bold text-[#111c14] mb-1">Something went wrong</h2>
      <p className="text-[13px] text-[#5a6b5e] max-w-md mb-4">{errorMessage}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
          style={{ background: "#3a7d4e" }}
        >
          Reload Page
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 rounded-xl text-[13px] font-medium border bg-white hover:bg-[#f7f9f8]"
          style={{ borderColor: "#e2e8e4", color: "#3d4a41" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function RootWithAuth() {
  const { signOut, user, signIn, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Login onSignIn={signIn} />;
  }
  if (user.role === "staff") {
    return <StaffDashboard onSignOut={signOut} />;
  }
  if (user.role !== "administrator" && user.role !== "admin") {
    return <Login onSignIn={signIn} />;
  }
  return <Root onSignOut={signOut} user={user} />;
}

function LoginPage() {
  const { signIn, isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Login onSignIn={signIn} />;
}

export const router = createBrowserRouter([
  {
    path: "/terms",
    Component: TermsOfService,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/terms-of-service",
    Component: TermsOfService,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicy,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/privacy-policy",
    Component: PrivacyPolicy,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/login",
    Component: LoginPage,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/",
    Component: RootWithAuth,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: Dashboard },
      { path: "notifications", Component: Announcements },
      { path: "notifications/new", Component: Announcements },
      { path: "approvals", Component: () => null },
      { path: "announcements", Component: Announcements },
      { path: "announcements/new", Component: Announcements },
      { path: "curriculum", Component: Curriculum },
      { path: "professors", Component: Professors },
      {
        path: "professors/new",
        Component: () => (
          <>
            <Professors />
            <AddProfessor />
          </>
        ),
      },
      { path: "staff", Component: Staff },
      {
        path: "staff/new",
        Component: () => (
          <>
            <Staff />
            <AddStaff />
          </>
        ),
      },
      { path: "payroll", Component: Payroll },
      { path: "payroll/settings", Component: PayrollSettings },
      { path: "aiml", Component: AIML },
      { path: "audit", Component: Audit },
      { path: "system-logs", Component: SystemLogs },
      { path: "database", Component: Database },
      { path: "enroll", Component: Enroll },
      { path: "hardware-monitoring", Component: HardwareMonitoring },
      { path: "software-monitoring", Component: SoftwareMonitoring },
      { path: "settings/user", Component: UserSettings },
      { path: "support", element: <Navigate to="/tickets" replace /> },
      { path: "support/messages", Component: StaffProfMessages },
      { path: "messages", Component: StaffProfMessages },
      { path: "tickets", Component: Tickets },
      { path: "*", Component: Dashboard },
    ],
  },
]);
