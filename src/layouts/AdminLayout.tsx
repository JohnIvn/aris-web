import { Outlet, useLocation, useNavigate } from "react-router"
import { useState, useEffect } from "react"
import arisLogo from "@/assets/brand/image.png"
import { BRAND, BRAND_DARK, mainNav, settingsNav, type NavItem } from "@/config/navigation"

export default function Root({ onSignOut }: { onSignOut: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = location.pathname === item.path
    return (
      <button
        onClick={() => navigate(item.path)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-150 text-[13px] font-medium mb-0.5"
        style={{
          background: active ? "#f0f7f2" : "transparent",
          color: active ? BRAND : "#5a6b5e",
        }}
      >
        <span style={{ opacity: active ? 1 : 0.65 }}>{item.icon}</span>
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
      </button>
    )
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden px-4 pb-4 pt-6 gap-4"
      style={{
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        background: "#eef1ef",
      }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col w-56 h-full flex-shrink-0 select-none rounded-3xl bg-white"
        style={{ boxShadow: "0 1px 2px rgba(16,32,20,0.05)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f0f7f2" }}
          >
            <img src={arisLogo} alt="ARIS" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[14px] leading-none tracking-tight"
              style={{ color: "#111c14" }}
            >
              ARIS
            </p>
            <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>
              Administration
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-2 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Main
          </p>
          {mainNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
          <p
            className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5"
            style={{ color: "#b6c3ba" }}
          >
            Settings
          </p>
          {settingsNav.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-3">
          <div
            className="flex items-center gap-3 p-2 rounded-2xl"
            style={{ background: "#f4f6f5" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: BRAND }}
            >
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12.5px] font-semibold truncate"
                style={{ color: "#111c14" }}
              >
                Administrator
              </p>
              <p className="text-[11px] truncate" style={{ color: "#8fa394" }}>
                admin@aris.edu.ph
              </p>
            </div>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="transition-opacity hover:opacity-60"
              style={{ color: "#b6c3ba" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {location.pathname === "/" && (
          <header className="flex items-center justify-between flex-shrink-0 pb-3 pl-1 pr-1">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold"
                style={{ background: BRAND_DARK }}
              >
                AD
              </div>
              <div>
                <p
                  className="text-[16px] font-semibold leading-none tracking-tight"
                  style={{ color: "#111c14" }}
                >
                  Administrator
                </p>
                <p className="text-[12.5px] mt-1" style={{ color: "#8fa394" }}>
                  Welcome back to ARIS 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
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
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
                  style={{ background: BRAND }}
                />
              </button>
              <div
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-medium bg-white border"
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

        <main className="flex-1 overflow-y-auto min-h-0 pr-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
