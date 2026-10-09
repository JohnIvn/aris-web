import { createContext, useContext } from "react";
import { createHashRouter, Navigate } from "react-router";
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
import Approvals from "@/pages/Admin/Approvals";
import Performance from "@/pages/Admin/Performance";
import Audit from "@/pages/Admin/Audit";
import SystemLogs from "@/pages/Admin/SystemLogs";
import Database from "@/pages/Admin/Database";
import Curriculum from "@/pages/Admin/Curriculum";
import SoftwareMonitoring from "@/pages/Admin/SoftwareMonitoring";
import SystemSettings from "@/pages/Admin/SystemSettings";
import UserSettings from "@/pages/Admin/UserSettings";
import ProfRoot from "@/layouts/ProfessorLayout";
import ProfOverview from "@/pages/Professor/Overview";
import ProfAnnouncements from "@/pages/Professor/Announcements";
import ProfSubmit from "@/pages/Professor/Submit";
import ProfHistory from "@/pages/Professor/History";
import ProfSummaries from "@/pages/Professor/Summaries";
import ProfSupport from "@/pages/Professor/Support";
import type { UserAccount } from "@/data/demoAccounts";

export const AuthContext = createContext<{ signOut: () => void; user: UserAccount }>({
  signOut: () => {},
  user: { id: "", email: "", name: "", role: "administrator" },
});
export const useAuth = () => useContext(AuthContext);

function RootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role !== "administrator") return <Navigate to="/prof" replace />;
  return <Root onSignOut={signOut} user={user} />;
}

function ProfRootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role !== "professor") return <Navigate to="/" replace />;
  return <ProfRoot onSignOut={signOut} user={user} />;
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
      { path: "performance", Component: Performance },
      { path: "approvals", Component: Approvals },
      { path: "audit", Component: Audit },
      { path: "system-logs", Component: SystemLogs },
      { path: "database", Component: Database },
      { path: "curriculum", Component: Curriculum },
      { path: "software-monitoring", Component: SoftwareMonitoring },
      { path: "settings/system", Component: SystemSettings },
      { path: "settings/user", Component: UserSettings },
      { path: "*", Component: Dashboard },
    ],
  },
  {
    path: "/prof",
    Component: ProfRootWithAuth,
    children: [
      { index: true, Component: ProfOverview },
      { path: "announcements", Component: ProfAnnouncements },
      { path: "submit", Component: ProfSubmit },
      { path: "history", Component: ProfHistory },
      { path: "summaries", Component: ProfSummaries },
      { path: "support", Component: ProfSupport },
      { path: "settings/system", Component: SystemSettings },
      { path: "settings/user", Component: UserSettings },
      { path: "*", Component: ProfOverview },
    ],
  },
]);
