import { useState, useMemo } from "react"
import { useResource } from "@/hooks/useResource"
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
  StatCard,
  StatGrid,
} from "@/components/ui"

type LogKind = "Auth" | "Security" | "Alert"

interface RawLogItem {
  id?: string
  name?: string
  actor_name?: string
  actor?: string
  actor_label?: string
  email?: string | null
  actor_email?: string | null
  actorUserId?: string | null
  actor_user_id?: string | null
  init?: string
  event?: string
  details?: string
  detail?: string
  ip?: string
  ip_address?: string
  userAgent?: string | null
  user_agent?: string | null
  sessionId?: string | null
  session_id?: string | null
  time?: string
  occurred_at?: string
  created_at?: string
  kind?: string
}

interface NormalizedLogItem {
  id: string
  name: string
  email?: string | null
  actor: string
  actorUserId?: string | null
  init: string
  event: string
  detail: string
  ip: string
  userAgent?: string | null
  sessionId?: string | null
  formattedDate: string
  formattedTime: string
  fullTime: string
  rawTime: string
  kind: LogKind
}

function getInitials(actor: string): string {
  if (!actor || actor.trim().length === 0) return "SY"
  const clean = actor.trim()
  if (clean.includes("@")) {
    const local = clean.split("@")[0]
    return local.slice(0, 2).toUpperCase()
  }
  const parts = clean.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

function formatLogDateTime(rawTime?: string): {
  date: string
  time: string
  full: string
} {
  if (!rawTime) return { date: "—", time: "—", full: "—" }
  const d = new Date(rawTime)
  if (isNaN(d.getTime())) return { date: rawTime, time: "—", full: rawTime }

  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
  return {
    date,
    time,
    full: `${date} at ${time}`,
  }
}

function isTodayDate(rawTime?: string): boolean {
  if (!rawTime) return false
  const date = new Date(rawTime)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

const kindTone: Record<LogKind, "blue" | "green" | "red"> = {
  Auth: "blue",
  Security: "green",
  Alert: "red",
}

export default function SystemLogs() {
  const { data: rawLogs, loading, error, reload } = useResource<RawLogItem[]>(
    "/system/logs",
    []
  )
  const [tab, setTab] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [todayOnly, setTodayOnly] = useState(false)
  const [showExportConfirm, setShowExportConfirm] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [selectedLog, setSelectedLog] = useState<NormalizedLogItem | null>(null)
  const [copied, setCopied] = useState(false)

  const tabs = ["All", "Auth", "Security", "Alert"]

  // Normalize live backend rows
  const normalizedLogs: NormalizedLogItem[] = useMemo(() => {
    if (!Array.isArray(rawLogs)) return []

    return rawLogs.map((item, idx) => {
      const rawKind = (item.kind || "").toLowerCase()
      const kind: LogKind =
        rawKind === "security"
          ? "Security"
          : rawKind === "alert"
          ? "Alert"
          : "Auth"

      const rawTime = item.occurred_at || item.created_at || item.time || ""
      const dt = formatLogDateTime(rawTime)

      const rawName = (item.name || item.actor_name || "").trim()
      const rawActor = (item.actor || item.actor_label || "").trim()
      const email =
        item.email ||
        item.actor_email ||
        (rawActor.includes("@") ? rawActor : rawName.includes("@") ? rawName : null)

      // Clear display name: prioritize resolved name, otherwise actor label, fallback to email/System
      const name =
        rawName && !rawName.includes("@")
          ? rawName
          : rawActor && !rawActor.includes("@")
          ? rawActor
          : email || "System"

      const init = item.init || getInitials(name)
      const event = item.event || "System Event"
      const detail = item.detail || item.details || "—"
      const ip = item.ip || item.ip_address || "—"
      const userAgent = item.userAgent || item.user_agent || null
      const sessionId = item.sessionId || item.session_id || null
      const actorUserId = item.actorUserId || item.actor_user_id || null

      return {
        id: item.id || `log-${idx}`,
        name,
        email,
        actor: name,
        actorUserId,
        init,
        event,
        detail,
        ip,
        userAgent,
        sessionId,
        formattedDate: dt.date,
        formattedTime: dt.time,
        fullTime: dt.full,
        rawTime,
        kind,
      }
    })
  }, [rawLogs])

  // Real dynamic counts
  const totalEvents = normalizedLogs.length
  const authCount = normalizedLogs.filter((l) => l.kind === "Auth").length
  const securityCount = normalizedLogs.filter((l) => l.kind === "Security").length
  const alertCount = normalizedLogs.filter((l) => l.kind === "Alert").length

  const stats = [
    ["Total Events", String(totalEvents)],
    ["Auth Events", String(authCount)],
    ["Security Events", String(securityCount)],
    ["System Alerts", String(alertCount)],
  ]

  // Filtering by tab, search query, and optional today filter
  const rows = useMemo(() => {
    return normalizedLogs.filter((item) => {
      if (tab !== "All" && item.kind !== tab) return false
      if (todayOnly && !isTodayDate(item.rawTime)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesEmail = (item.email || "").toLowerCase().includes(q)
        const matchesActor = item.actor.toLowerCase().includes(q)
        const matchesEvent = item.event.toLowerCase().includes(q)
        const matchesDetail = item.detail.toLowerCase().includes(q)
        const matchesIp = item.ip.toLowerCase().includes(q)
        const matchesDate = item.formattedDate.toLowerCase().includes(q)
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesActor &&
          !matchesEvent &&
          !matchesDetail &&
          !matchesIp &&
          !matchesDate
        ) {
          return false
        }
      }
      return true
    })
  }, [normalizedLogs, tab, searchQuery, todayOnly])

  const handleExportCsv = () => {
    if (rows.length === 0) return

    const headers = [
      "ID",
      "Category",
      "Event",
      "Name",
      "Email",
      "Details",
      "IP Address",
      "Timestamp",
    ]
    const csvLines = rows.map((r) => [
      r.id,
      r.kind,
      `"${r.event.replace(/"/g, '""')}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${r.detail.replace(/"/g, '""')}"`,
      r.ip,
      `"${r.rawTime}"`,
    ])

    const csvContent = [headers.join(","), ...csvLines.map((line) => line.join(","))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `system_logs_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    setShowExportConfirm(false)
    setShowExportSuccess(true)
  }

  const handleCopyLogDetails = () => {
    if (!selectedLog) return
    const logSummary = JSON.stringify(
      {
        id: selectedLog.id,
        kind: selectedLog.kind,
        event: selectedLog.event,
        name: selectedLog.name,
        email: selectedLog.email,
        actor: selectedLog.actor,
        actorUserId: selectedLog.actorUserId,
        detail: selectedLog.detail,
        ip: selectedLog.ip,
        userAgent: selectedLog.userAgent,
        sessionId: selectedLog.sessionId,
        timestamp: selectedLog.rawTime,
        formattedDateTime: selectedLog.fullTime,
      },
      null,
      2
    )
    navigator.clipboard.writeText(logSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pb-2">
      <PageTitle
        title="System Logs"
        subtitle="Live audit trail of authentication, security modifications, and system alerts."
        action={
          <div className="flex items-center gap-2">
            <span title="Refresh system logs">
              <GhostButton onClick={() => reload()}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className={`w-4 h-4 ${loading ? "animate-spin text-[#3a7d4e]" : ""}`}
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </GhostButton>
            </span>
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
          </div>
        }
      />

      {error && (
        <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      )}

      {/* Confirmation Modal */}
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
            <PrimaryButton onClick={handleExportCsv}>
              Yes, Export
            </PrimaryButton>
          </>
        }
      >
        Export {rows.length} {rows.length === 1 ? "record" : "records"} matching your current filters to a CSV file?
      </Modal>

      {/* Success Modal */}
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
        The system logs have been successfully exported and downloaded to your computer.
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="System Log Details"
        size="lg"
        align="left"
        icon={
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background:
                selectedLog?.kind === "Alert"
                  ? "#fbecec"
                  : selectedLog?.kind === "Security"
                  ? "#eaf4ee"
                  : "#e7f1fa",
              color:
                selectedLog?.kind === "Alert"
                  ? "#c0392b"
                  : selectedLog?.kind === "Security"
                  ? "#2f7043"
                  : "#2b6ca3",
            }}
          >
            {selectedLog?.kind === "Alert" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            ) : selectedLog?.kind === "Security" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            )}
          </div>
        }
        actions={
          <div className="flex w-full items-center justify-between gap-3">
            <GhostButton onClick={handleCopyLogDetails}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? "Copied JSON!" : "Copy Details"}
            </GhostButton>
            <PrimaryButton onClick={() => setSelectedLog(null)}>
              Close
            </PrimaryButton>
          </div>
        }
      >
        {selectedLog && (
          <div className="flex flex-col gap-4 text-left">
            {/* Header info badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef1ef]">
              <div>
                <span className="text-[12px] uppercase font-semibold tracking-wider text-[#8fa394]">
                  Event
                </span>
                <p className="text-[16px] font-bold text-[#111c14] mt-0.5">
                  {selectedLog.event}
                </p>
              </div>
              <Badge tone={kindTone[selectedLog.kind]} dot>
                {selectedLog.kind}
              </Badge>
            </div>

            {/* Grid of properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Name / User
                </span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <Avatar
                    initials={selectedLog.init}
                    color={selectedLog.kind === "Alert" ? "#c0392b" : "#2f7043"}
                    size={32}
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111c14] truncate">
                      {selectedLog.name}
                    </p>
                    {selectedLog.email && (
                      <p className="text-[11.5px] text-[#8fa394] truncate">
                        {selectedLog.email}
                      </p>
                    )}
                    {selectedLog.actorUserId && (
                      <p className="text-[10px] font-mono text-[#8fa394] truncate mt-0.5">
                        User ID: {selectedLog.actorUserId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Date & Time
                </span>
                <p className="text-[13px] font-medium text-[#111c14] mt-1.5">
                  {selectedLog.fullTime}
                </p>
                {selectedLog.rawTime && (
                  <p className="text-[10.5px] font-mono text-[#8fa394] mt-0.5 truncate">
                    ISO: {selectedLog.rawTime}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  IP Address
                </span>
                <p className="text-[13px] font-mono font-medium text-[#111c14] mt-1.5">
                  {selectedLog.ip}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Record ID
                </span>
                <p className="text-[12px] font-mono text-[#5a6b5e] mt-1.5 truncate">
                  {selectedLog.id}
                </p>
              </div>
            </div>

            {/* Optional session or user agent */}
            {(selectedLog.sessionId || selectedLog.userAgent) && (
              <div className="grid grid-cols-1 gap-2 p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0] text-[12px]">
                {selectedLog.sessionId && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#8fa394] uppercase">
                      Session ID:{" "}
                    </span>
                    <span className="font-mono text-[#3d4a41]">
                      {selectedLog.sessionId}
                    </span>
                  </div>
                )}
                {selectedLog.userAgent && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#8fa394] uppercase">
                      Client / User Agent:{" "}
                    </span>
                    <span className="font-mono text-[11.5px] text-[#3d4a41] break-all">
                      {selectedLog.userAgent}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Event Description / Payload */}
            <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8ece8]">
              <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                Event Details & Payload
              </span>
              <p className="text-[13px] text-[#2d3830] mt-1.5 leading-relaxed whitespace-pre-wrap">
                {selectedLog.detail}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Stat Cards */}
      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      {/* Table Card */}
      <Card className="p-0 overflow-x-auto">
        <div
          className="flex items-center justify-between p-4 border-b flex-wrap gap-3"
          style={{ borderColor: "#eef1ef" }}
        >
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2 items-center">
            <SearchInput
              placeholder="Search by name, event, IP..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-64"
            />
            {todayOnly ? (
              <PrimaryButton onClick={() => setTodayOnly(false)}>
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
                Showing Today
              </PrimaryButton>
            ) : (
              <GhostButton onClick={() => setTodayOnly(true)}>
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
            )}
          </div>
        </div>

        <div
          className="grid min-w-[960px] grid-cols-[1.6fr_1.5fr_1.7fr_1fr_1.4fr_0.8fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa" }}
        >
          <span>Name / User</span>
          <span>Event</span>
          <span>Details</span>
          <span>IP Address</span>
          <span>Date & Time</span>
          <span className="text-right">Category</span>
        </div>

        {loading && rows.length === 0 && (
          <p className="py-6 text-center text-[12px] text-[#8fa394]">
            Loading system logs...
          </p>
        )}

        {!loading && rows.length === 0 && (
          <p className="py-6 text-center text-[12px] text-[#8fa394]">
            {searchQuery || tab !== "All" || todayOnly
              ? "No matching system logs found."
              : "No system logs recorded yet."}
          </p>
        )}

        {rows.map((l, i) => (
          <div
            key={l.id || i}
            onClick={() => setSelectedLog(l)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setSelectedLog(l)
              }
            }}
            className="grid min-w-[960px] grid-cols-[1.6fr_1.5fr_1.7fr_1fr_1.4fr_0.8fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#f6f9f7] active:bg-[#edf3ef] cursor-pointer"
            style={{ borderColor: "#f2f4f2" }}
            title="Click to view full log details"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                initials={l.init}
                color={l.kind === "Alert" ? "#c0392b" : initialsColor(i)}
                size={30}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-[13px] font-semibold truncate text-[#111c14]"
                  title={l.name}
                >
                  {l.name}
                </span>
                {l.email && l.email !== l.name && (
                  <span
                    className="text-[11px] text-[#8fa394] truncate"
                    title={l.email}
                  >
                    {l.email}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[13px] font-medium" style={{ color: "#3d4a41" }}>
              {l.event}
            </span>
            <span
              className="text-[13px] truncate"
              style={{ color: "#8fa394" }}
              title={l.detail}
            >
              {l.detail}
            </span>
            <span
              className="text-[12.5px] font-mono"
              style={{ color: "#8fa394" }}
            >
              {l.ip}
            </span>
            <div className="flex flex-col text-[12px] leading-tight min-w-0">
              <span className="font-medium text-[#2d3830] truncate">{l.formattedDate}</span>
              <span className="text-[11px] text-[#8fa394] font-mono">{l.formattedTime}</span>
            </div>
            <span className="flex justify-end items-center gap-2">
              <Badge tone={kindTone[l.kind]} dot>
                {l.kind}
              </Badge>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="#b6c3ba"
                strokeWidth="1.6"
                className="w-3.5 h-3.5 opacity-60"
              >
                <path d="M6 12l4-4-4-4" />
              </svg>
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
