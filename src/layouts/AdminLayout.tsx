import { Outlet, useLocation, useNavigate } from "react-router"
import { useState, useEffect, useRef } from "react"
import arisLogo from "@/assets/brand/image.png"
import { BRAND, BRAND_DARK, mainNav, managementNav, settingsNav, supportNav, type NavItem } from "@/config/navigation"
import type { UserAccount } from "@/data/demoAccounts"
import { GhostButton, Modal, PrimaryButton, SearchInput } from "@/components/ui"
import { useResource } from "@/hooks/useResource"
import getBaseUrl from "@/utils/GetBaseUrl"

type AdminAnnouncement = {
  id: string
  title: string
  body: string
  tag?: string
}

export default function Root({ onSignOut, user }: { onSignOut: () => void; user: UserAccount }) {
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { data: rawAnnouncements } = useResource<AdminAnnouncement[]>("/announcements", [])
  const announcements = Array.isArray(rawAnnouncements) ? rawAnnouncements : []
  const { data: profile, reload: reloadProfile } = useResource<{ avatar_url?: string | null }>("/users/me/profile", {})
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const handler = () => {
      setImgError(false)
      reloadProfile()
    }
    window.addEventListener("aris-user-updated", handler)
    return () => window.removeEventListener("aris-user-updated", handler)
  }, [reloadProfile])

  const rawAvatarUrl = profile?.avatar_url || user.avatar_url
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith("http")
      ? rawAvatarUrl
      : `${getBaseUrl()}${rawAvatarUrl}`
    : null
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("aris_admin_read_notifications")
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })
  const markRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem("aris_admin_read_notifications", JSON.stringify([...next])) } catch { /* ignore storage error */ }
      return next
    })
  }
  const markAllRead = () => {
    const allIds = announcements.map((a) => a.id)
    setReadIds(new Set(allIds))
    try { localStorage.setItem("aris_admin_read_notifications", JSON.stringify(allIds)) } catch { /* ignore storage error */ }
  }
  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  // Close the mobile menu after any navigation
  useEffect(() => {
    setShowMobileMenu(false)
    setShowProfileMenu(false)
  }, [location.pathname])

  const confirmSignOut = () => {
    setShowSignOutConfirm(false)
    onSignOut()
  }

  const searchItems = [...mainNav, ...managementNav, ...supportNav, ...settingsNav].filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )

  const navSections = [
    { title: "Main", items: mainNav },
    { title: "Management", items: managementNav },
    { title: "Support", items: supportNav },
    { title: "Settings", items: settingsNav },
  ]

  // The single "user settings" entry shown in the mobile profile dropdown.
  // Matches a settingsNav item whose label or path mentions user/account/profile,
  // and falls back to the first settings item.
  const userSettingsItem =
    settingsNav.find((item) => /user|account|profile/i.test(`${item.label} ${item.path}`)) ?? settingsNav[0]

  const NavButton = ({ item }: { item: NavItem }) => {
    const active =
      location.pathname === item.path ||
      (item.path === "/announcements" &&
        (location.pathname === "/notifications" ||
          location.pathname.startsWith("/announcements") ||
          location.pathname.startsWith("/notifications")))
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center py-2 rounded-xl text-left transition-all duration-150 text-[13px] font-medium mb-0.5 ${sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        style={{
          background: active ? "#f0f7f2" : "transparent",
          color: active ? BRAND : "#5a6b5e",
        }}
      >
        <span className="flex-shrink-0" style={{ opacity: active ? 1 : 0.65 }}>
          {item.icon}
        </span>

        {!sidebarCollapsed && (
          <div className="flex w-full items-center justify-between">
            <span className="flex-1">{item.label}</span>
            {active && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </div>
        )}
      </button>
    )
  }

  return (
    <div
      className="flex h-svh w-full overflow-hidden px-2 py-2 gap-2 lg:h-screen lg:w-screen lg:px-4 lg:pb-4 lg:pt-6 lg:gap-4"
      style={{
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        background: "#eef1ef",
      }}
    >
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-full lg:flex-shrink-0 select-none rounded-3xl bg-white transition-[width] duration-200 ${sidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-60"}`}
        style={{ boxShadow: "0 1px 2px rgba(16,32,20,0.05)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f0f7f2" }}
          >
            <img src={arisLogo} alt="ARIS" className="w-6 h-6 object-contain" />
          </div>
          {!sidebarCollapsed && <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[14px] leading-none tracking-tight"
              style={{ color: "#111c14" }}
            >
              ARIS
            </p>
            <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>
              Administration
            </p>
          </div>}
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="ml-auto hidden bg-white h-8 w-8 flex-shrink-0 -translate-x-2.5 items-center justify-center rounded-full text-[#5a6b5e] transition-colors hover:bg-[#f4f6f5] lg:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d={sidebarCollapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {!sidebarCollapsed && <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-2 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Main
          </p>}
          {mainNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
          {!sidebarCollapsed && <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Management
          </p>}
          {managementNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
          {!sidebarCollapsed && <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Support
          </p>}
          {supportNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
          {!sidebarCollapsed && <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Settings
          </p>}
          {settingsNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-3">
          {!sidebarCollapsed && <div
            className="flex items-center gap-3 p-2 rounded-2xl"
            style={{ background: "#f4f6f5" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden"
              style={{ background: BRAND }}
            >
              {avatarSrc && !imgError ? (
                <img
                  src={avatarSrc}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12.5px] font-semibold truncate"
                style={{ color: "#111c14" }}
              >
                {user.name}
              </p>
              <p className="text-[11px] truncate" style={{ color: "#8fa394" }}>
                {user.email}
              </p>
            </div>
          </div>}
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className={`mt-1 flex w-full items-center gap-2 rounded-xl py-2 text-left text-[13px] font-medium text-[#5a6b5e] transition-colors hover:bg-[#f4f6f5] hover:text-[#c0392b] ${sidebarCollapsed ? "justify-center px-0" : "px-2"}`}
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

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile top bar with burger menu (hidden on lg and up) */}
        <div className="lg:hidden relative mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-2">
            <button
              type="button"
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMobileMenu}
              onClick={() => { setShowProfileMenu(false); setShowMobileMenu((v) => !v) }}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f4f6f5]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
                <path d={showMobileMenu ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
              </svg>
            </button>
            <img src={arisLogo} alt="ARIS" className="h-6 w-6 flex-shrink-0 object-contain" />
            <span className="flex-1 text-[14px] font-semibold" style={{ color: "#111c14" }}>ARIS</span>
            <button
              type="button"
              aria-label="Profile menu"
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              onClick={() => { setShowMobileMenu(false); setShowProfileMenu((v) => !v) }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white overflow-hidden"
              style={{ background: BRAND }}
            >
              {avatarSrc && !imgError ? (
                <img
                  src={avatarSrc}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </button>
          </div>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-56 rounded-2xl bg-white p-2"
                style={{ boxShadow: "0 8px 24px rgba(16,32,20,0.12)" }}
              >
                <div className="px-3 py-2">
                  <p className="truncate text-[13px] font-semibold" style={{ color: "#111c14" }}>{user.name}</p>
                  <p className="truncate text-[11px]" style={{ color: "#8fa394" }}>{user.email}</p>
                </div>
                <div className="my-1 border-t border-[#eef1ef]" />
                {userSettingsItem && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { navigate(userSettingsItem.path); setShowProfileMenu(false) }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#5a6b5e] hover:bg-[#f4f6f5]"
                  >
                    <span style={{ opacity: 0.65 }}>{userSettingsItem.icon}</span>
                    <span>{userSettingsItem.label}</span>
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setShowProfileMenu(false); setShowSignOutConfirm(true) }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#5a6b5e] hover:bg-[#fbecec] hover:text-[#c0392b]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}

          {showMobileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
              <nav
                aria-label="Mobile navigation"
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-2"
                style={{ boxShadow: "0 8px 24px rgba(16,32,20,0.12)" }}
              >
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#b6c3ba" }}>
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const active =
                        location.pathname === item.path ||
                        (item.path === "/announcements" &&
                          (location.pathname === "/notifications" ||
                            location.pathname.startsWith("/announcements") ||
                            location.pathname.startsWith("/notifications")))
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          aria-current={active ? "page" : undefined}
                          className="mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium"
                          style={{ background: active ? "#f0f7f2" : "transparent", color: active ? BRAND : "#5a6b5e" }}
                        >
                          <span style={{ opacity: active ? 1 : 0.65 }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </>
          )}
        </div>

        {location.pathname === "/" && (
          <header className="flex flex-col gap-2 flex-shrink-0 pb-2 pl-1 pr-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold overflow-hidden"
                style={{ background: BRAND_DARK }}
              >
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p
                  className="text-[16px] font-semibold leading-none tracking-tight"
                  style={{ color: "#111c14" }}
                >
                  {user.name}
                </p>
                <p className="text-[12.5px] mt-1" style={{ color: "#8fa394" }}>
                  Welcome back to ARIS 👋
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Search pages"
                title="Search pages"
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="w-4 h-4"
                >
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5l3 3" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => setShowNotifications(true)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[17px] h-[17px]"
                >
                  <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                </svg>
                {unreadCount > 0 && <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
                  style={{ background: BRAND }}
                />}
              </button>
              <div
                className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-medium bg-white border"
                style={{ borderColor: "#e2e8e4", color: "#5a6b5e" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                ,{" "}
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </header>
        )}

        <main ref={mainRef} className="flex-1 overflow-y-auto min-h-0 pr-1">
          <Outlet />
        </main>
      </div>
      <Modal isOpen={showSearch} onClose={() => setShowSearch(false)} title="Search ARIS" size="lg" align="left" actions={<GhostButton onClick={() => setShowSearch(false)}>Close</GhostButton>}>
        <SearchInput placeholder="Search pages" value={searchQuery} onChange={setSearchQuery} className="w-full" />
        <div className="mt-3 space-y-1">
          {searchItems.length ? searchItems.map((item) => <button key={item.path} type="button" onClick={() => { navigate(item.path); setShowSearch(false); setSearchQuery(""); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] text-[#3d4a41] hover:bg-[#f4f6f5]">{item.icon}<span>{item.label}</span></button>) : <p className="px-3 py-4 text-[12px] text-[#8fa394]">No matching pages.</p>}
        </div>
      </Modal>
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notifications"
        size="lg"
        align="left"
        actions={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(false);
                navigate("/announcements");
              }}
              className="text-[12.5px] font-semibold text-[#3a7d4e] hover:underline"
            >
              Manage Announcements →
            </button>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[12px] font-medium text-[#5a6b5e] hover:text-[#111c14] px-2.5 py-1 rounded-lg border border-[#e2e8e4]"
                >
                  Mark all as read
                </button>
              )}
              <PrimaryButton onClick={() => setShowNotifications(false)}>Done</PrimaryButton>
            </div>
          </div>
        }
      >
        <div className="divide-y divide-[#eef1ef]">
          {announcements.length === 0 && <p className="px-3 py-4 text-[12px] text-[#8fa394]">No notifications available.</p>}
          {announcements.map((notice) => {
            const isRead = readIds.has(notice.id);
            return (
              <div
                key={notice.id}
                onClick={() => {
                  markRead(notice.id);
                  navigate("/announcements");
                  setShowNotifications(false);
                }}
                className={`flex w-full items-start justify-between gap-4 py-3 px-2 rounded-xl text-left cursor-pointer transition-colors ${isRead ? "hover:bg-[#fafbfa] opacity-75" : "bg-[#f9fbf9] hover:bg-[#f0f7f2]"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!isRead && <span className="w-2 h-2 rounded-full bg-[#3a7d4e] flex-shrink-0" />}
                    <span className={`block text-[13px] ${isRead ? "font-medium text-[#405145]" : "font-semibold text-[#111c14]"}`}>
                      {notice.title}
                    </span>
                  </div>
                  <span className="mt-1 block text-[12px] text-[#8fa394] line-clamp-2">{notice.body}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-medium text-[#3a7d4e]">{notice.tag ?? "Announcement"}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(notice.id);
                    }}
                    title={isRead ? "Read" : "Mark as read"}
                    className="p-1 text-[#8fa394] hover:text-[#3a7d4e]"
                  >
                    {isRead ? "✓" : "○"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <Modal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Confirm Sign Out"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#fbecec] text-[#c0392b]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowSignOutConfirm(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={confirmSignOut}>Sign Out</PrimaryButton>
          </>
        }
      >
        Are you sure you want to sign out of ARIS?
      </Modal>
    </div>
  )
}