import { useState } from "react";
import {
  Card,
  PageTitle,
  GhostButton,
  PrimaryButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  initialsColor,
  Modal,
} from "@/components/ui";

// General system access & security events — sign-in, sign-out, MFA, password, sessions.
const logs = [
  {
    actor: "Administrator",
    init: "AD",
    event: "Signed in",
    detail: "Web · Chrome on macOS",
    ip: "10.0.0.2",
    time: "12:52 PM",
    kind: "Auth" as const,
  },
  {
    actor: "Dr. Maria Santos",
    init: "MS",
    event: "Enabled MFA",
    detail: "Authenticator app",
    ip: "10.2.14.88",
    time: "12:40 PM",
    kind: "Security" as const,
  },
  {
    actor: "James Reyes",
    init: "JR",
    event: "Signed out",
    detail: "Session ended by user",
    ip: "10.2.9.12",
    time: "12:11 PM",
    kind: "Auth" as const,
  },
  {
    actor: "Ana Bautista",
    init: "AB",
    event: "Password changed",
    detail: "Self-service reset",
    ip: "10.2.7.51",
    time: "11:38 AM",
    kind: "Security" as const,
  },
  {
    actor: "Unknown",
    init: "??",
    event: "Failed sign-in",
    detail: "3 attempts · admin@aris.edu.ph",
    ip: "203.117.44.9",
    time: "11:02 AM",
    kind: "Alert" as const,
  },
  {
    actor: "Paolo Garcia",
    init: "PG",
    event: "Signed in",
    detail: "Mobile · iOS app",
    ip: "10.2.9.30",
    time: "10:24 AM",
    kind: "Auth" as const,
  },
  {
    actor: "Rina Torres",
    init: "RT",
    event: "MFA challenge passed",
    detail: "SMS one-time code",
    ip: "10.2.7.60",
    time: "09:47 AM",
    kind: "Security" as const,
  },
  {
    actor: "Prof. Lito Cruz",
    init: "LC",
    event: "Session expired",
    detail: "Auto sign-out · 30 min idle",
    ip: "10.2.14.90",
    time: "09:15 AM",
    kind: "Auth" as const,
  },
  {
    actor: "Carla Ramos",
    init: "CR",
    event: "Disabled MFA",
    detail: "Removed authenticator",
    ip: "10.2.6.14",
    time: "08:52 AM",
    kind: "Security" as const,
  },
  {
    actor: "Administrator",
    init: "AD",
    event: "New device authorized",
    detail: "Windows · Edge",
    ip: "10.0.0.9",
    time: "08:20 AM",
    kind: "Security" as const,
  },
];

const kindTone = { Auth: "blue", Security: "green", Alert: "red" } as const;

export default function SystemLogs() {
  const [tab, setTab] = useState("All");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const tabs = ["All", "Auth", "Security", "Alert"];
  const rows = logs.filter((l) => tab === "All" || l.kind === tab);

  const count = (k: string) => logs.filter((l) => l.kind === k).length;
  const stats = [
    ["Events Today", String(logs.length)],
    ["Sign-ins", "842"],
    ["MFA Events", String(count("Security"))],
    ["Alerts", String(count("Alert"))],
  ];

  return (
    <div className="pb-2">
      <PageTitle
        title="System Logs"
        subtitle="Access and security activity — sign-in, sign-out, MFA, and sessions."
        action={
          <GhostButton onClick={() => setShowExportConfirm(true)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </GhostButton>
        }
      />

      <Modal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="Confirm Export"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowExportConfirm(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton
              onClick={() => {
                setShowExportConfirm(false);
                setShowExportSuccess(true);
              }}
            >
              Yes, Export
            </PrimaryButton>
          </>
        }
      >
        Are you sure you want to export the system logs to a CSV file?
      </Modal>

      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export Successful"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowExportSuccess(false)}>
            OK
          </PrimaryButton>
        }
      >
        The system logs have been successfully exported.
      </Modal>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map(([l, v]) => (
          <Card key={l} className="py-4">
            <p className="text-[12px]" style={{ color: "#8fa394" }}>
              {l}
            </p>
            <p
              className="text-[24px] font-bold mt-1 tracking-tight"
              style={{ color: "#111c14" }}
            >
              {v}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "#eef1ef" }}
        >
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2">
            <SearchInput placeholder="Search access logs" />
            <GhostButton>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 10h18M8 2v4M16 2v4" />
              </svg>
              Today
            </GhostButton>
          </div>
        </div>
        <div
          className="grid grid-cols-[1.6fr_1.6fr_1.9fr_1fr_0.8fr_0.9fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa" }}
        >
          <span>User</span>
          <span>Event</span>
          <span>Details</span>
          <span>IP</span>
          <span>Time</span>
          <span className="text-right">Type</span>
        </div>
        {rows.map((l, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.6fr_1.6fr_1.9fr_1fr_0.8fr_0.9fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa]"
            style={{ borderColor: "#f2f4f2" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                initials={l.init}
                color={l.kind === "Alert" ? "#c0392b" : initialsColor(i)}
                size={28}
              />
              <span
                className="text-[13px] font-medium truncate"
                style={{ color: "#111c14" }}
              >
                {l.actor}
              </span>
            </div>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>
              {l.event}
            </span>
            <span className="text-[13px] truncate" style={{ color: "#8fa394" }}>
              {l.detail}
            </span>
            <span
              className="text-[12.5px] font-mono"
              style={{ color: "#8fa394" }}
            >
              {l.ip}
            </span>
            <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
              {l.time}
            </span>
            <span className="flex justify-end">
              <Badge tone={kindTone[l.kind]} dot>
                {l.kind}
              </Badge>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
