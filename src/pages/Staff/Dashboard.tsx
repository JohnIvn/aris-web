import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import arisLogo from "@/assets/brand/image.png";
import { BRAND } from "@/config/navigation";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import { Card, Modal, PageTitle, PrimaryButton } from "@/components/ui";
import Approvals from "./Approvals";
import Announcements from "./Announcements";

type Profile = {
  firstname?: string;
  lastname?: string;
  email?: string;
  position?: string | null;
  department?: string | null;
};

type StaffAnnouncement = {
  id: string;
  title: string;
  body: string;
  tag?: string;
};

const staffNavigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  },
  {
    path: "/notifications",
    label: "Notifications",
    icon: <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />,
  },
  {
    path: "/approvals",
    label: "Approvals",
    icon: <path d="M5 12l4 4L19 6" />,
  },
];

function StaffIcon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">{children}</svg>;
}

export default function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useResource<Profile>("/users/me/profile", {});
  const displayName = [profile.firstname, profile.lastname].filter(Boolean).join(" ") || user.name;
  const allowedPath = staffNavigation.some((item) => item.path === location.pathname);

  useEffect(() => {
    if (!allowedPath) navigate("/", { replace: true });
  }, [allowedPath, navigate]);

  const NavButton = ({ item }: { item: (typeof staffNavigation)[number] }) => {
    const active = location.pathname === item.path;
    return (
      <button
        type="button"
        onClick={() => navigate(item.path)}
        className="mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-all duration-150"
        style={{ background: active ? "#f0f7f2" : "transparent", color: active ? BRAND : "#5a6b5e" }}
      >
        <span style={{ opacity: active ? 1 : 0.65 }}><StaffIcon>{item.icon}</StaffIcon></span>
        <div className="flex w-full items-center justify-between">
          <span className="flex-1">{item.label}</span>
          {active && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
      </button>
    );
  };

  return (
    <div
      className="flex h-svh w-full overflow-hidden px-2 py-2 gap-2 lg:h-screen lg:w-screen lg:px-4 lg:pb-4 lg:pt-6 lg:gap-4"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", background: "#eef1ef" }}
    >
      <aside
        className="hidden lg:flex lg:flex-col lg:w-60 lg:h-full lg:flex-shrink-0 select-none rounded-3xl bg-white"
        style={{ boxShadow: "0 1px 2px rgba(16,32,20,0.05)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0f7f2" }}>
            <img src={arisLogo} alt="ARIS" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] leading-none tracking-tight" style={{ color: "#111c14" }}>ARIS</p>
            <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>Staff workspace</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          <p className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-2 pb-1.5" style={{ color: "#b6c3ba" }}>Main</p>
          {staffNavigation.map((item) => <NavButton key={item.path} item={item} />)}
        </nav>
        <div className="p-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl" style={{ background: "#f4f6f5" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: BRAND }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold truncate" style={{ color: "#111c14" }}>{displayName}</p>
              <p className="text-[11px] truncate" style={{ color: "#8fa394" }}>{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-[13px] font-medium text-[#5a6b5e] transition-colors hover:bg-[#f4f6f5] hover:text-[#c0392b]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <nav aria-label="Staff navigation" className="flex flex-shrink-0 gap-1 overflow-x-auto pb-2 lg:hidden">
          {staffNavigation.map((item) => <button key={item.path} type="button" onClick={() => navigate(item.path)} className="flex h-9 flex-shrink-0 items-center gap-2 rounded-lg px-3 text-[12px] font-medium" style={{ background: location.pathname === item.path ? "#e6f1e9" : "#fff", color: location.pathname === item.path ? BRAND : "#5a6b5e" }}><StaffIcon>{item.icon}</StaffIcon>{item.label}</button>)}
        </nav>
        <main className="min-h-0 flex-1 overflow-y-auto pr-1">
          {location.pathname === "/" && <StaffDashboard displayName={displayName} profile={profile} user={user} onManageProfile={() => navigate("/settings/user")} />}
          {location.pathname === "/notifications" && <StaffNotifications />}
          {location.pathname === "/approvals" && <StaffApprovals />}
        </main>
      </div>
    </div>
  );
}

function StaffDashboard({ displayName, profile, user, onManageProfile }: { displayName: string; profile: Profile; user: { email: string }; onManageProfile: () => void }) {
  const navigate = useNavigate();
  const { data: announcements } = useResource<StaffAnnouncement[]>("/announcements", []);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = announcements.map((announcement) => ({
    title: announcement.title,
    detail: announcement.body,
    label: announcement.tag ?? "Announcement",
  }));

  return (
    <div className="mx-auto max-w-5xl py-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title={`Welcome, ${displayName}`} subtitle="Review your ARIS work and current updates." />
        <button
          type="button"
          aria-label="Open notifications"
          title="Notifications"
          onClick={() => {
            setShowNotifications(true);
          }}
          className="relative flex h-9 w-9 items-center justify-center self-start rounded-xl border bg-white sm:self-auto"
          style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
            <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
          </svg>
          {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white" style={{ background: BRAND }} />}
        </button>
      </div>
      <Card>
        <h2 className="text-[15px] font-semibold text-[#111c14]">Your account</h2>
        <div className="mt-3 space-y-2 text-[13px]"><p><span className="text-[#8fa394]">Email: </span>{profile.email ?? user.email}</p><p><span className="text-[#8fa394]">Position: </span>{profile.position ?? "Not assigned"}</p><p><span className="text-[#8fa394]">Department: </span>{profile.department ?? "Not assigned"}</p></div>
        <div className="mt-4"><PrimaryButton onClick={onManageProfile}>Manage profile</PrimaryButton></div>
      </Card>
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notifications"
        size="lg"
        align="left"
        actions={<PrimaryButton onClick={() => setShowNotifications(false)}>Done</PrimaryButton>}
      >
        <div className="divide-y divide-[#eef1ef]">
          {notifications.length === 0 && (
            <p className="px-3 py-4 text-[12px] text-[#8fa394]">
              No notifications available.
            </p>
          )}
          {notifications.map((notice, index) => (
            <button
              key={`${notice.title}-${index}`}
              type="button"
              onClick={() => {
                setShowNotifications(false);
                navigate("/notifications");
              }}
              className="flex w-full items-start justify-between gap-4 py-3 text-left hover:bg-[#fafbfa]"
            >
              <span>
                <span className="block text-[13px] font-semibold text-[#111c14]">{notice.title}</span>
                <span className="mt-1 block text-[12px] text-[#8fa394]">{notice.detail}</span>
              </span>
              <span className="shrink-0 text-[11px] font-medium text-[#3a7d4e]">{notice.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function StaffNotifications() {
  return <Announcements />;
}

function StaffApprovals() {
  return <div className="mx-auto max-w-6xl py-5"><Approvals /></div>;
}
