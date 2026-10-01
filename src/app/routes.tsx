import { createContext, useContext } from "react";
import { createHashRouter } from "react-router";
import Root from "@/layouts/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import NewReminder from "@/pages/NewReminder";
import Professors from "@/pages/Professors";
import AddProfessor from "@/pages/AddProfessor";
import Staff from "@/pages/Staff";
import AddStaff from "@/pages/AddStaff";
import Payroll from "@/pages/Payroll";
import AIML from "@/pages/AIML";
import Approvals from "@/pages/Approvals";
import Performance from "@/pages/Performance";
import Audit from "@/pages/Audit";
import SystemLogs from "@/pages/SystemLogs";
import Database from "@/pages/Database";
import Curriculum from "@/pages/Curriculum";
import SoftwareMonitoring from "@/pages/SoftwareMonitoring";
import SystemSettings from "@/pages/SystemSettings";
import UserSettings from "@/pages/UserSettings";
import ProfRoot from "@/layouts/ProfessorLayout";
import ProfOverview from "@/pages/prof/Overview";
import ProfAnnouncements from "@/pages/prof/Announcements";
import ProfSubmit from "@/pages/prof/Submit";
import ProfHistory from "@/pages/prof/History";
import ProfSummaries from "@/pages/prof/Summaries";
import ProfSupport from "@/pages/prof/Support";

export const AuthContext = createContext<{ signOut: () => void }>({
  signOut: () => {},
});
export const useAuth = () => useContext(AuthContext);

function RootWithAuth() {
  const { signOut } = useAuth();
  return <Root onSignOut={signOut} />;
}

function ProfRootWithAuth() {
  const { signOut } = useAuth();
  return <ProfRoot onSignOut={signOut} />;
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
