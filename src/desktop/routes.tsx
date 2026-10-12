import { createHashRouter, Navigate } from "react-router";
import { useAuth } from "@/app/authContext";
import ProfRoot from "@/layouts/ProfessorLayout";
import ProfOverview from "@/pages/Professor/Overview";
import ProfAnnouncements from "@/pages/Professor/Announcements";
import ProfSubmit from "@/pages/Professor/Submit";
import ProfHistory from "@/pages/Professor/History";
import ProfSummaries from "@/pages/Professor/Summaries";
import ProfSupport from "@/pages/Professor/Support";
import UserSettings from "@/pages/Admin/UserSettings";
import StaffOverview from "@/pages/Staff/Overview";
import StaffApprovals from "@/pages/Staff/Approvals";
import StaffAnnouncements from "@/pages/Professor/Announcements";

function StaffRootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role !== "staff") return <Navigate to="/staff" replace />;
  return <ProfRoot onSignOut={signOut} user={user} />;
}

function DesktopHome() {
  const { user } = useAuth();
  return <Navigate to={user.role === "staff" ? "/staff" : "/prof"} replace />;
}

function ProfessorRootWithAuth() {
  const { signOut, user } = useAuth();
  if (user.role !== "professor") return <Navigate to="/prof" replace />;
  return <ProfRoot onSignOut={signOut} user={user} />;
}

export const desktopRouter = createHashRouter([
  {
    path: "/staff",
    Component: StaffRootWithAuth,
    children: [
      { index: true, Component: StaffOverview },
      { path: "approvals", Component: StaffApprovals },
      { path: "announcements", Component: StaffAnnouncements },
      { path: "settings", Component: UserSettings },
      { path: "*", Component: StaffOverview },
    ],
  },
  {
    path: "/prof",
    Component: ProfessorRootWithAuth,
    children: [
      { index: true, Component: ProfOverview },
      { path: "announcements", Component: ProfAnnouncements },
      { path: "submit", Component: ProfSubmit },
      { path: "history", Component: ProfHistory },
      { path: "summaries", Component: ProfSummaries },
      { path: "support", Component: ProfSupport },
      { path: "settings/system", Component: UserSettings },
      { path: "settings/user", Component: UserSettings },
      { path: "*", Component: ProfOverview },
    ],
  },
  { path: "/", Component: DesktopHome },
  { path: "*", Component: DesktopHome },
]);