import { createBrowserRouter, Navigate } from "react-router";
import { useAuth } from "@/app/authContext";
import Root from "@/layouts/AdminLayout";
import Dashboard from "@/pages/Admin/Dashboard";
import Announcements from "@/pages/Admin/Announcements";
import NewReminder from "@/pages/Admin/NewReminder";
import Professors from "@/pages/Admin/Professors";
import AddProfessor from "@/pages/Admin/AddProfessor";
import Staff from "@/pages/Admin/Staff";
import AddStaff from "@/pages/Admin/AddStaff";
import Payroll from "@/pages/Admin/Payroll";
import AIML from "@/pages/Admin/AIML";
import Audit from "@/pages/Admin/Audit";
import SystemLogs from "@/pages/Admin/SystemLogs";
import Database from "@/pages/Admin/Database";
import SoftwareMonitoring from "@/pages/Admin/SoftwareMonitoring";
import UserSettings from "@/pages/Admin/UserSettings";
import Support from "@/pages/Admin/Support";
import Tickets from "@/pages/Admin/Tickets";
import HardwareMonitoring from "@/pages/Admin/HardwareMonitoring";
import StaffDashboard from "@/pages/Staff/Dashboard";

if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1));
}

function RootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role === "staff") {
    return <StaffDashboard onSignOut={signOut} />;
  }
  if (user.role !== "administrator" && user.role !== "admin") return <Navigate to="/" replace />;
  return <Root onSignOut={signOut} user={user} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootWithAuth,
    children: [
      { index: true, Component: Dashboard },
      { path: "notifications", Component: () => null },
      { path: "approvals", Component: () => null },
      { path: "announcements", Component: Announcements },
      {
        path: "announcements/new",
        Component: () => (
          <>
            <Announcements />
            <NewReminder />
          </>
        ),
      },
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
      { path: "aiml", Component: AIML },
      { path: "audit", Component: Audit },
      { path: "system-logs", Component: SystemLogs },
      { path: "database", Component: Database },
      { path: "hardware-monitoring", Component: HardwareMonitoring },
      { path: "software-monitoring", Component: SoftwareMonitoring },
      { path: "settings/user", Component: UserSettings },
      { path: "support", Component: Support },
      { path: "tickets", Component: Tickets },
      { path: "*", Component: Dashboard },
    ],
  },
]);
