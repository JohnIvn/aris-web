import { useEffect, useState, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import arisLogo from "@/assets/brand/image.png";
import { BRAND, BRAND_DARK } from "@/config/navigation";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import getBaseUrl from "@/utils/GetBaseUrl";
import {
  Card,
  CardHeader,
  Modal,
  PrimaryButton,
} from "@/components/ui";
import Approvals, {
  approvalQueue,
  normalizeStaffRole,
  STAGES,
  STAGE_COLOR,
  STAGE_OWNER,
} from "./Approvals";
import Announcements from "./Announcements";
import UserSettings from "./UserSettings";
import Tickets from "../Admin/Tickets";

type Profile = {
  firstname?: string;
  lastname?: string;
  email?: string;
  position?: string | null;
  department?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

type StaffAnnouncement = {
  id: string;
  title: string;
  body: string;
  tag?: string;
  audience?: string;
  publishedAt?: string | null;
};

type StaffNavItem = {
  path: string;
  label: string;
  icon: ReactNode;
};

const staffMainNav: StaffNavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
];

const staffManagementNav: StaffNavItem[] = [
  {
    path: "/notifications",
    label: "Announcements",
    icon: (
      <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
    ),
  },
  {
    path: "/approvals",
    label: "Approvals",
    icon: <path d="M5 12l4 4L19 6" />,
  },
];

const staffSupportNav: StaffNavItem[] = [
  {
    path: "/tickets",
    label: "Tickets",
    icon: (
      <path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 13v6h2v-6H4Z" />
    ),
  },
];

const staffSettingsNav: StaffNavItem[] = [
  {
    path: "/settings/user",
    label: "User Settings",
    icon: (
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    ),
  },
];

const staffNavigation: StaffNavItem[] = [
  ...staffMainNav,
  ...staffManagementNav,
  ...staffSupportNav,
  ...staffSettingsNav,
];

function StaffIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      {children}
    </svg>
  );
}

function CardHead({
  title,
  action,
  onActionClick,
}: {
  title: string;
  action?: string;
  onActionClick?: () => void;
}) {
  return (
    <CardHeader
      title={title}
      titleColor="#6B7A6F"
      className="mb-3 items-center"
      action={
        action ? (
          <button
            type="button"
            onClick={onActionClick}
            className="text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-colors hover:bg-[#f4f6f5] cursor-pointer"
            style={{ color: "#3d4a41", borderColor: "#e2e8e4" }}
          >
            {action}
          </button>
        ) : undefined
      }
    />
  );
}

function CustomThroughputTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-2xl p-3 border shadow-sm text-[12px]"
        style={{ background: "#fff", borderColor: "#e2e8e4" }}
      >
        <p className="font-semibold text-[#111c14] mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="text-[#5a6b5e]">{entry.name}</span>
              </div>
              <span className="font-semibold text-[#111c14] tabular-nums">
                {entry.value} files
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: profile, reload: reloadProfile } = useResource<Profile>("/users/me/profile", {});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handler = () => {
      setImgError(false);
      reloadProfile();
    };
    window.addEventListener("aris-user-updated", handler);
    return () => window.removeEventListener("aris-user-updated", handler);
  }, [reloadProfile]);

  const rawAvatarUrl = profile?.avatar_url || user.avatar_url;
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith("http")
      ? rawAvatarUrl
      : `${getBaseUrl()}${rawAvatarUrl}`
    : null;
  const { data: rawAnnouncements } = useResource<StaffAnnouncement[]>(
    "/announcements",
    []
  );
  const announcements = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];

  const displayName =
    [profile.firstname, profile.lastname].filter(Boolean).join(" ") || user.name;

  const allowedPath =
    staffNavigation.some((item) => item.path === location.pathname) ||
    location.pathname === "/settings" ||
    location.pathname === "/settings/user" ||
    location.pathname === "/announcements";

  useEffect(() => {
    if (!allowedPath) navigate("/", { replace: true });
  }, [allowedPath, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTimeFormatted =
    currentTime.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const NavButton = ({ item }: { item: StaffNavItem }) => {
    const active =
      location.pathname === item.path ||
      (item.path === "/notifications" && location.pathname === "/announcements") ||
      (item.path === "/settings/user" && location.pathname === "/settings");
    return (
      <button
        type="button"
        onClick={() => navigate(item.path)}
        className={`mb-0.5 flex w-full items-center gap-3 rounded-xl py-2 text-left text-[13px] font-medium transition-all duration-150 cursor-pointer ${
          sidebarCollapsed ? "justify-center px-0" : "px-3"
        }`}
        style={{
          background: active ? "#f0f7f2" : "transparent",
          color: active ? BRAND : "#5a6b5e",
        }}
      >
        <span style={{ opacity: active ? 1 : 0.65 }}>
          <StaffIcon>{item.icon}</StaffIcon>
        </span>
        <div
          className={`flex items-center justify-between ${
            sidebarCollapsed ? "w-auto" : "w-full"
          }`}
        >
          {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
          {active && !sidebarCollapsed && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
      </button>
    );
  };

  const filteredNav = staffNavigation.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div
      className="flex h-svh w-full overflow-hidden px-2 py-2 gap-2 lg:h-screen lg:w-screen lg:px-4 lg:pb-4 lg:pt-6 lg:gap-4"
      style={{
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        background: "#eef1ef",
      }}
    >
      {/* Sidebar matching System Theme */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-full lg:flex-shrink-0 select-none rounded-3xl bg-white transition-[width] duration-200 ${
          sidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-60"
        }`}
        style={{ boxShadow: "0 1px 2px rgba(16,32,20,0.05)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f0f7f2" }}
          >
            <img src={arisLogo} alt="ARIS" className="w-6 h-6 object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-[14px] leading-none tracking-tight"
                style={{ color: "#111c14" }}
              >
                ARIS
              </p>
              <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>
                Staff workspace
              </p>
            </div>
          )}
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="ml-auto hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#5a6b5e] transition-colors hover:bg-[#f4f6f5] lg:flex cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                d={
                  sidebarCollapsed
                    ? "M9 6l6 6-6 6"
                    : "M15 6l-6 6 6 6"
                }
              />
            </svg>
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-3">
          {/* Main */}
          {!sidebarCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-2 pb-1.5"
              style={{ color: "#b6c3ba" }}
            >
              Main
            </p>
          )}
          {staffMainNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}

          {/* Management */}
          {!sidebarCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
              style={{ color: "#b6c3ba" }}
            >
              Management
            </p>
          )}
          {staffManagementNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}

          {/* Support */}
          {!sidebarCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
              style={{ color: "#b6c3ba" }}
            >
              Support
            </p>
          )}
          {staffSupportNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}

          {/* Settings */}
          {!sidebarCollapsed && (
            <p
              className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
              style={{ color: "#b6c3ba" }}
            >
              Settings
            </p>
          )}
          {staffSettingsNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-3">
          {!sidebarCollapsed && (
            <div
              onClick={() => navigate("/settings/user")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/settings/user");
                }
              }}
              title="Click to view and edit User Settings"
              className="flex items-center gap-3 p-2 rounded-2xl cursor-pointer hover:bg-[#eaf4ee] transition-colors"
              style={{
                background:
                  location.pathname === "/settings" ||
                  location.pathname === "/settings/user"
                    ? "#eaf4ee"
                    : "#f4f6f5",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden"
                style={{ background: BRAND }}
              >
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: "#111c14" }}
                >
                  {displayName}
                </p>
                <p className="text-[11px] truncate" style={{ color: "#8fa394" }}>
                  {profile.position || user.email}
                </p>
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="#8fa394"
                strokeWidth="1.6"
                className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
              >
                <path d="M6 12l4-4-4-4" />
              </svg>
            </div>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className={`mt-1 flex w-full items-center gap-2 rounded-xl py-2 text-left text-[13px] font-medium text-[#5a6b5e] transition-colors hover:bg-[#f4f6f5] hover:text-[#c0392b] cursor-pointer ${
              sidebarCollapsed ? "justify-center px-0" : "px-2"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* System Theme Top Header Bar on Dashboard */}
        {location.pathname === "/" && (
          <header className="flex flex-col gap-2 flex-shrink-0 pb-2 pl-1 pr-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0 overflow-hidden"
                style={{ background: BRAND_DARK }}
              >
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p
                  className="text-[16px] font-semibold leading-none tracking-tight"
                  style={{ color: "#111c14" }}
                >
                  {displayName}
                </p>
                <p className="text-[12.5px] mt-1" style={{ color: "#8fa394" }}>
                  Welcome back to ARIS 👋 · {profile.department || "Academic Affairs Staff"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Search pages"
                title="Search pages"
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border cursor-pointer hover:bg-[#f7f9f8] transition-colors"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="w-4 h-4"
                >
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3.5 3.5" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => setShowNotifications(true)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border cursor-pointer hover:bg-[#f7f9f8] transition-colors"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="w-4 h-4"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {announcements.length > 0 && (
                  <span
                    className="absolute right-2 top-2 w-2 h-2 rounded-full border-2 border-white"
                    style={{ background: BRAND }}
                  />
                )}
              </button>

              <div
                className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-white border text-[12.5px]"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: BRAND }}
                />
                <span>{currentTimeFormatted}</span>
              </div>
            </div>
          </header>
        )}

        {/* Mobile Navigation bar */}
        <nav
          aria-label="Staff navigation"
          className="flex flex-shrink-0 gap-1 overflow-x-auto pb-2 lg:hidden"
        >
          {staffNavigation.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex h-9 flex-shrink-0 items-center gap-2 rounded-lg px-3 text-[12px] font-medium"
              style={{
                background:
                  location.pathname === item.path ||
                  (item.path === "/notifications" && location.pathname === "/announcements") ||
                  (item.path === "/settings/user" && location.pathname === "/settings")
                    ? "#e6f1e9"
                    : "#fff",
                color:
                  location.pathname === item.path ||
                  (item.path === "/notifications" && location.pathname === "/announcements") ||
                  (item.path === "/settings/user" && location.pathname === "/settings")
                    ? BRAND
                    : "#5a6b5e",
              }}
            >
              <StaffIcon>{item.icon}</StaffIcon>
              {item.label}
            </button>
          ))}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto pr-1">
          {location.pathname === "/" && <StaffDashboard />}
          {(location.pathname === "/notifications" ||
            location.pathname === "/announcements") && <StaffNotifications />}
          {location.pathname === "/approvals" && <StaffApprovals />}
          {(location.pathname === "/tickets" ||
            location.pathname === "/support") && <Tickets />}
          {(location.pathname === "/settings" ||
            location.pathname === "/settings/user") && <StaffUserSettings />}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <Modal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        title="Search Staff Workspace"
        size="lg"
        align="left"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Type page name or shortcut..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] bg-[#fafbfa] focus:bg-white focus:outline-none"
            style={{ borderColor: "#e2e8e4" }}
            autoFocus
          />
          <div className="divide-y divide-[#f2f4f2] max-h-60 overflow-y-auto">
            {filteredNav.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  navigate(item.path);
                }}
                className="flex items-center gap-3 w-full py-2.5 px-2 text-left hover:bg-[#fafbfa] rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-[#3a7d4e]">{item.icon}</span>
                <span className="text-[13px] font-medium text-[#111c14]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Announcements Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Institutional Announcements"
        size="lg"
        align="left"
        actions={
          <PrimaryButton onClick={() => setShowNotifications(false)}>
            Done
          </PrimaryButton>
        }
      >
        <div className="divide-y divide-[#eef1ef]">
          {announcements.length === 0 && (
            <p className="px-3 py-4 text-[12px] text-[#8fa394]">
              No notifications available.
            </p>
          )}
          {announcements.map((notice, index) => (
            <button
              key={`${notice.title}-${index}`}
              type="button"
              onClick={() => {
                setShowNotifications(false);
                navigate("/notifications");
              }}
              className="flex w-full items-start justify-between gap-4 py-3 text-left hover:bg-[#fafbfa] transition-colors"
            >
              <span>
                <span className="block text-[13px] font-semibold text-[#111c14]">
                  {notice.title}
                </span>
                <span className="mt-1 block text-[12px] text-[#8fa394]">
                  {notice.body}
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-[#3a7d4e]">
                {notice.tag || notice.audience || "Notice"}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [range, setRange] = useState("Cycle 1");

  const { data: profile } = useResource<{ position?: string | null }>("/users/me/profile", {});
  const staffRole = normalizeStaffRole(profile?.position || user?.position);

  const { data: fetchedQueue } = useResource<any[]>("/approvals", []);
  const allQueue = Array.isArray(fetchedQueue) && fetchedQueue.length > 0 ? fetchedQueue : approvalQueue || [];
  const queue = useMemo(() => allQueue.filter((i) => i.stage === staffRole), [allQueue, staffRole]);

  const pendingQueue = useMemo(
    () => queue.filter((i) => i.status === "Pending"),
    [queue]
  );
  const approvedQueue = useMemo(
    () => queue.filter((i) => i.status === "Approved"),
    [queue]
  );
  const flaggedQueue = useMemo(
    () => queue.filter((i) => i.status === "Flagged" || i.status === "Disapproved"),
    [queue]
  );

  const arCount = queue.filter((i) => i.type === "AR").length;
  const dtrCount = queue.filter((i) => i.type === "DTR").length;
  const totalSubmissions = queue.length || 1;

  const approvedPct = Math.round((approvedQueue.length / totalSubmissions) * 100);
  const pendingPct = Math.round((pendingQueue.length / totalSubmissions) * 100);
  const flaggedPct = Math.round((flaggedQueue.length / totalSubmissions) * 100);

  // Submissions trend data for the area/line charts
  const submissionsTrendData = [
    { period: "Week 1", count: 8 },
    { period: "Week 2", count: 14 },
    { period: "Week 3", count: 22 },
    { period: "Week 4", count: totalSubmissions },
  ];

  const cycleProgressData = [
    { m: "WEEK 1", v: 6 },
    { m: "WEEK 2", v: 12 },
    { m: "CUT-OFF", v: 18 },
    { m: "ENDORSED", v: approvedQueue.length },
  ];

  // Weekly Submissions Volume & Clearance Velocity (Replaces the Table on Dashboard)
  const weeklyThroughputData = [
    { period: "Week 1 (Sep 1–5)", ar: 14, dtr: 18, cleared: 28 },
    { period: "Week 2 (Sep 6–10)", ar: 22, dtr: 25, cleared: 41 },
    { period: "Week 3 (Sep 11–15)", ar: 31, dtr: 34, cleared: 58 },
    { period: "Week 4 (Sep 16–20)", ar: 38, dtr: 42, cleared: approvedQueue.length * 15 || 68 },
  ];

  return (
    <div className="grid auto-rows-[minmax(16rem,auto)] grid-cols-1 gap-3 sm:grid-cols-3 2xl:grid-cols-3 pb-4">
      {/* 1. Submissions Tracker */}
      <Card className="flex flex-col min-h-0">
        <CardHead
          title="Submissions Tracker"
          action="Review"
          onActionClick={() => navigate("/approvals")}
        />
        <div className="flex items-center gap-2">
          <p
            className="text-[28px] font-bold leading-none tracking-tight"
            style={{ color: "#111c14" }}
          >
            {pendingQueue.length}
          </p>
          <span className="text-[12px]" style={{ color: "#8fa394" }}>
            pending clearance
          </span>
        </div>

        <div
          className="flex gap-1 mt-3 p-0.5 rounded-lg w-fit"
          style={{ background: "#f4f6f5" }}
        >
          {["Cycle 1", "Cycle 2", "All"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              style={{
                background: range === r ? "#fff" : "transparent",
                color: range === r ? "#111c14" : "#8fa394",
                boxShadow: range === r ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 my-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={submissionsTrendData}
              margin={{ top: 6, right: 6, bottom: 0, left: 6 }}
            >
              <Line
                type="monotone"
                dataKey="count"
                stroke={BRAND}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 mt-auto pt-2 border-t" style={{ borderColor: "#f2f4f2" }}>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: BRAND }}
            />
            <span
              className="text-[12.5px] flex-1 truncate"
              style={{ color: "#3d4a41" }}
            >
              Accomplishment Reports (AR)
            </span>
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#111c14" }}
            >
              {arCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#3f8ecc" }}
            />
            <span
              className="text-[12.5px] flex-1 truncate"
              style={{ color: "#3d4a41" }}
            >
              Daily Time Records (DTR)
            </span>
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#111c14" }}
            >
              {dtrCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#c0392b" }}
            />
            <span
              className="text-[12.5px] flex-1 truncate"
              style={{ color: "#3d4a41" }}
            >
              Flagged for Correction
            </span>
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#111c14" }}
            >
              {flaggedQueue.length}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Endorsement Ratio */}
      <Card className="flex flex-col min-h-0">
        <CardHead
          title="Endorsement Ratio"
          action="Approvals"
          onActionClick={() => navigate("/approvals")}
        />
        <div className="flex items-center gap-2">
          <p
            className="text-[28px] font-bold leading-none tracking-tight"
            style={{ color: "#111c14" }}
          >
            {totalSubmissions.toLocaleString()}
          </p>
          <span className="text-[12px]" style={{ color: "#8fa394" }}>
            total files
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 flex-1 content-start">
          {[
            { label: "Approved", pct: `${approvedPct}%`, count: approvedQueue.length, color: "#2f7043" },
            { label: "Pending", pct: `${pendingPct}%`, count: pendingQueue.length, color: "#996515" },
            { label: "Flagged", pct: `${flaggedPct}%`, count: flaggedQueue.length, color: "#c0392b" },
          ].map((d) => (
            <div key={d.label}>
              <p className="text-[12px]" style={{ color: "#8fa394" }}>
                {d.label}
              </p>
              <p
                className="text-[22px] font-bold leading-tight mt-1"
                style={{ color: "#111c14" }}
              >
                {d.pct}
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: d.color }}>
                {d.count} docs
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-3">
          <div style={{ width: `${approvedPct}%`, background: BRAND }} />
          <div style={{ width: `${pendingPct}%`, background: "#d99a2b" }} />
          <div style={{ width: `${flaggedPct}%`, background: "#c0392b" }} />
        </div>

        <div className="flex justify-between items-center mt-3 text-[11px] text-[#8fa394]">
          <span>Payroll Clearance</span>
          <span className="font-semibold text-[#111c14]">{approvedPct}% Ready</span>
        </div>
      </Card>

      {/* 3. Active Cut-Off Cycle */}
      <Card className="flex flex-col min-h-0">
        <CardHead
          title="Active Cut-Off Cycle"
          action="Details"
          onActionClick={() => navigate("/approvals")}
        />
        <div className="flex items-center gap-2">
          <p
            className="text-[28px] font-bold leading-none tracking-tight"
            style={{ color: "#111c14" }}
          >
            Sep Cycle 1
          </p>
        </div>

        <div className="space-y-2 mt-3">
          {[
            { l: "Coverage Period", v: "Sep 1 – 15, 2026" },
            { l: "Staff Cut-off Deadline", v: "Sep 18, 5:00 PM" },
            { l: "Faculty Filed Rate", v: "88% Compliant" },
          ].map((r) => (
            <div key={r.l} className="flex items-center">
              <span className="text-[12.5px] flex-1" style={{ color: "#5a6b5e" }}>
                {r.l}
              </span>
              <span
                className="text-[12.5px] font-semibold"
                style={{ color: "#111c14" }}
              >
                {r.v}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cycleProgressData}
              margin={{ top: 8, right: 6, bottom: 0, left: 6 }}
            >
              <defs>
                <linearGradient id="staffCycleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={BRAND}
                strokeWidth={2.5}
                fill="url(#staffCycleGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="flex justify-between text-[10px] font-medium mt-1 uppercase"
          style={{ color: "#b6c3ba" }}
        >
          {cycleProgressData.map((p) => (
            <span key={p.m}>{p.m}</span>
          ))}
        </div>
      </Card>

      {/* 4. Submissions Inflow & Clearance Velocity Graph (Spans 2 columns - REPLACES TABLE) */}
      <Card className="flex flex-col min-h-0 sm:col-span-2 2xl:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <CardHeader
              title="Submissions Volume & Clearance Velocity"
              titleColor="#6B7A6F"
              className="mb-0"
            />
            <p className="text-[12px] text-[#8fa394] mt-0.5">
              Weekly AR & DTR document intake compared against staff endorsement throughput
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Graph Legend */}
            <div className="flex items-center gap-3 text-[11.5px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#2b6ca3" }} />
                <span style={{ color: "#5a6b5e" }}>AR Filed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#8a63c4" }} />
                <span style={{ color: "#5a6b5e" }}>DTR Filed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND }} />
                <span style={{ color: "#5a6b5e" }}>Cleared</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/approvals")}
              className="text-[12px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-[#f4f6f5] cursor-pointer"
              style={{ color: BRAND, borderColor: "#e2e8e4" }}
            >
              Open Approvals Table →
            </button>
          </div>
        </div>

        {/* Multi-Bar Chart */}
        <div className="flex-1 min-h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyThroughputData}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1ee" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={{ stroke: "#e2e8e4" }}
                tick={{ fill: "#8fa394", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8fa394", fontSize: 11 }}
              />
              <Tooltip content={<CustomThroughputTooltip />} />
              <Bar dataKey="ar" name="AR Reports" fill="#2b6ca3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dtr" name="DTR Records" fill="#8a63c4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cleared" name="Cleared for Payroll" fill={BRAND} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom metric summary pills */}
        <div
          className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t text-[12px]"
          style={{ borderColor: "#f2f4f2" }}
        >
          <div>
            <span className="text-[#8fa394]">Avg Turnaround</span>
            <p className="text-[15px] font-bold text-[#111c14] mt-0.5">1.8 Days</p>
          </div>
          <div>
            <span className="text-[#8fa394]">Endorsement Rate</span>
            <p className="text-[15px] font-bold text-[#2f7043] mt-0.5">92.4% on-time</p>
          </div>
          <div>
            <span className="text-[#8fa394]">Active Clearance</span>
            <p className="text-[15px] font-bold text-[#111c14] mt-0.5">Cycle 1 Phase 2</p>
          </div>
        </div>
      </Card>

      {/* 5. Approval Pipeline Stages (Spans 1 column) */}
      <Card className="flex flex-col min-h-0">
        <CardHead
          title="Approval Pipeline Stages"
          action="Manage"
          onActionClick={() => navigate("/approvals")}
        />
        <div className="flex items-baseline gap-2">
          <p
            className="text-[28px] font-bold leading-none tracking-tight"
            style={{ color: "#111c14" }}
          >
            4 Stages
          </p>
          <span className="text-[12px]" style={{ color: "#8fa394" }}>
            {queue.length} active documents
          </span>
        </div>

        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-4">
          {STAGES.map((stage) => {
            const count = queue.filter((i) => i.stage === stage).length;
            const pct = queue.length > 0 ? (count / queue.length) * 100 : 25;
            return (
              <div
                key={stage}
                style={{ width: `${pct}%`, background: STAGE_COLOR[stage] }}
                title={`${stage}: ${count}`}
              />
            );
          })}
        </div>

        <div className="space-y-2 mt-4 flex-1">
          {STAGES.map((stage) => {
            const count = queue.filter((i) => i.stage === stage).length;
            return (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: STAGE_COLOR[stage] }}
                />
                <span
                  className="text-[12px] flex-1 text-[#3d4a41] truncate"
                >
                  {stage} ({STAGE_OWNER[stage]})
                </span>
                <span
                  className="text-[12px] font-semibold text-[#111c14]"
                >
                  {count} items
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StaffNotifications() {
  return <Announcements />;
}

function StaffApprovals() {
  return <Approvals />;
}

function StaffUserSettings() {
  return <UserSettings />;
}
