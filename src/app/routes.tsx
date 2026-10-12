import { createHashRouter, Navigate } from "react-router";
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
import SystemSettings from "@/pages/Admin/SystemSettings";
import UserSettings from "@/pages/Admin/UserSettings";

function RootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role !== "administrator") return <Navigate to="/" replace />;
  return <Root onSignOut={signOut} user={user} />;
}

export const router = createHashRouter([
  {
    path: "/",
    Component: RootWithAuth,
    children: [
      { index: true, Component: Dashboard },
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
      { path: "software-monitoring", Component: SoftwareMonitoring },
      { path: "settings/system", Component: SystemSettings },
      { path: "settings/user", Component: UserSettings },
      { path: "*", Component: Dashboard },
    ],
  },
]);
