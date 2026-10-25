import type { JSX } from "react"

export const BRAND = "#3a7d4e"
export const BRAND_DARK = "#0d1a10"

export const icon = (path: JSX.Element) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[18px] h-[18px]"
  >
    {path}
  </svg>
)

export type NavItem = { path: string; label: string; icon: JSX.Element }
export const mainNav: NavItem[] = [
  {
    path: "/",
    label: "Overview",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>,
    ),
  },
]

export const managementNav: NavItem[] = [
  {
    path: "/announcements",
    label: "Announcements",
    icon: icon(
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    ),
  },
  {
    path: "/audit",
    label: "Audit Logs",
    icon: icon(
      <path d="M9 12h6M9 16h6M9 8h6M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />,
    ),
  },
  {
    path: "/professors",
    label: "Professors",
    icon: icon(
      <>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </>,
    ),
  },
  {
    path: "/payroll",
    label: "Payroll",
    icon: icon(
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h2M10 15h4" />
      </>,
    ),
  },
  {
    path: "/staff",
    label: "Staff",
    icon: icon(
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    ),
  },
]

export const supportNav: NavItem[] = [
  {
    path: "/tickets",
    label: "Tickets",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>,
    ),
  },
]

export const settingsNav: NavItem[] = [
  {
    path: "/aiml",
    label: "AI / ML",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </>,
    ),
  },
  {
    path: "/database",
    label: "Database",
    icon: icon(
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </>,
    ),
  },
  {
    path: "/hardware-monitoring",
    label: "Hardware Monitoring",
    icon: icon(<path d="M4 17l6-6-6-6M12 19h8" />),
  },
  {
    path: "/software-monitoring",
    label: "Software Monitoring",
    icon: icon(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />),
  },
  {
    path: "/system-logs",
    label: "System Logs",
    icon: icon(
      <>
        <path d="M4 17l6-6-6-6M12 19h8" />
      </>,
    ),
  },
  {
    path: "/settings/user",
    label: "User Settings",
    icon: icon(
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>,
    ),
  },
]

export const allNav = [...mainNav, ...managementNav, ...supportNav, ...settingsNav]
