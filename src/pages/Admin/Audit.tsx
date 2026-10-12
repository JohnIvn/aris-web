import { useState } from "react"
import { BRAND } from "@/config/navigation"
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
  arTable,
  dtrTable,
  statusTone,
  SubmissionDetail,
  StatCard,
  StatGrid,
  type RecordKind,
  type RecordPayload,
  type StatusKind,
} from "@/components/ui"

// Audit trail scoped to AR (Accomplishment Report) / DTR (Daily Time Record) submissions.
type AuditLog = {
  actor: string
  init: string
  type: RecordKind
  action: string
  target: string
  time: string
  result: StatusKind
  record: RecordPayload
}

const demoAuditLogs: AuditLog[] = [
  {
    actor: "Dr. Maria Santos",
    init: "MS",
    type: "AR",
    action: "AR submitted",
    target: "Sep Cycle 1 · 18 outputs",
    time: "12:41 PM",
    result: "Submitted",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0142",
      facultyName: "Dr. Maria Santos",
      facultyNumber: "214",
      college: "College of Engineering",
      tables: [
        arTable("CS 102 — WEB DEVELOPMENT", "September 1–12, 2026", [
          ["CS 102", "BSIT 3A", 3, "Monday", "7:00AM–10:00AM", "CONGRESS"],
          ["CS 102", "BSIT 3B", 3, "Tuesday", "1:00PM–4:00PM", "CONGRESS"],
          ["CS 301", "BSCS 3A", 3, "Thursday", "8:00AM–11:00AM", "CONGRESS"],
        ]),
      ],
      topics: "a) HTML document structure\nb) Semantic tags and accessibility",
      tasks:
        "a) Discussed semantic elements and their use.\nb) Hands-on activity: build a personal profile page.\nc) Uploaded reference materials to G-Class.",
      notes:
        "Class suspended on September 8 due to typhoon; make-up session held on September 12.",
      attachment: "AR_Santos_SepCycle1.pdf · 1.2 MB",
      reviewer: "System — Intake",
      reviewedAt: "September 17, 2026 · 12:41 PM",
      remark: "Received and queued for HR validation.",
    },
  },
  {
    actor: "Ana Bautista (HR)",
    init: "AB",
    type: "AR",
    action: "AR rejected by HR",
    target: "Missing output attachments",
    time: "12:19 PM",
    result: "Rejected",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0138",
      facultyName: "Marco Dela Cruz",
      facultyNumber: "342",
      college: "Arts & Sciences",
      tables: [
        arTable("GE 101 — UNDERSTANDING THE SELF", "September 2–11, 2026", [
          ["GE 101", "BSIT 1A", 3, "Wednesday", "9:00AM–12:00PM", "CONGRESS"],
        ]),
      ],
      topics: "a) The self from a philosophical perspective",
      tasks:
        "a) Lecture and small-group discussion.\nb) Reflection paper assigned and collected.",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 12:19 PM",
      remark:
        "Returned to faculty. No output attachments were included for the September 11 session.",
    },
  },
  {
    actor: "James Reyes",
    init: "JR",
    type: "DTR",
    action: "DTR flagged · wrong name",
    target: "Name mismatch vs. roster",
    time: "11:58 AM",
    result: "Flagged",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0121",
      facultyName: "James Reyes",
      facultyNumber: "301",
      college: "College of Engineering",
      tables: [
        dtrTable("DTR — September 1–15, 2026", "22 days logged", [
          ["Sep 01", "7:52 AM", "5:04 PM", 8.2],
          ["Sep 02", "8:31 AM", "5:10 PM", 7.7],
          ["Sep 03", "7:45 AM", "5:00 PM", 8.3],
        ]),
      ],
      attachment: "DTR_Reyes_SepCycle1.xlsx · 84 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 11:58 AM",
      remark:
        "Biometric entry “J. Reyes” does not match the roster entry “James R. Reyes”. Awaiting HR confirmation.",
    },
  },
  {
    actor: "Marco Dela Cruz",
    init: "MD",
    type: "DTR",
    action: "DTR flagged · invalid name",
    target: "Unrecognized employee entry",
    time: "11:32 AM",
    result: "Flagged",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0117",
      facultyName: "Marco Dela Cruz",
      facultyNumber: "342",
      college: "Arts & Sciences",
      tables: [
        dtrTable("DTR — September 1–15, 2026", "18 days logged", [
          ["Sep 01", "8:05 AM", "5:02 PM", 7.9],
          ["Sep 02", "8:12 AM", "5:06 PM", 7.8],
          ["Sep 03", "—", "—", 0],
        ]),
      ],
      attachment: "DTR_DelaCruz_SepCycle1.xlsx · 76 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 11:32 AM",
      remark:
        "Entry logged under an employee number that is not on the active faculty roster.",
    },
  },
  {
    actor: "Prof. Lito Cruz",
    init: "LC",
    type: "DTR",
    action: "DTR not submitted",
    target: "Overdue · Sep Cycle 1",
    time: "11:05 AM",
    result: "Missing",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0110",
      facultyName: "Prof. Lito Cruz",
      facultyNumber: "289",
      college: "College of Engineering",
      tables: [],
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 11:05 AM",
      remark:
        "No DTR was filed for this cycle. Deadline was September 15, 2026; faculty notified by email.",
    },
  },
  {
    actor: "Dr. Elena Reyes",
    init: "ER",
    type: "AR",
    action: "AR submitted",
    target: "Sep Cycle 1 · 15 outputs",
    time: "10:47 AM",
    result: "Submitted",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0108",
      facultyName: "Dr. Elena Reyes",
      facultyNumber: "267",
      college: "Arts & Sciences",
      tables: [
        arTable("GE 105 — PURPOSIVE COMMUNICATION", "September 1–12, 2026", [
          ["GE 105", "BSBA 1A", 3, "Monday", "10:00AM–1:00PM", "CONGRESS"],
          ["GE 105", "BSBA 1B", 3, "Wednesday", "1:00PM–4:00PM", "CONGRESS"],
        ]),
      ],
      topics: "a) Communication models\nb) Audience analysis and register",
      tasks:
        "a) Lecture with group workshop.\nb) Speech delivery activity with peer evaluation.",
      attachment: "AR_Reyes_SepCycle1.pdf · 980 KB",
      reviewer: "System — Intake",
      reviewedAt: "September 17, 2026 · 10:47 AM",
      remark: "Received and queued for HR validation.",
    },
  },
  {
    actor: "Ana Bautista (HR)",
    init: "AB",
    type: "DTR",
    action: "DTR approved by HR",
    target: "22 days verified",
    time: "10:22 AM",
    result: "Approved",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0102",
      facultyName: "James Reyes",
      facultyNumber: "301",
      college: "College of Engineering",
      tables: [
        dtrTable("DTR — September 1–15, 2026", "22 days verified", [
          ["Sep 01", "7:52 AM", "5:04 PM", 8.2],
          ["Sep 02", "8:31 AM", "5:10 PM", 7.7],
          ["Sep 03", "7:45 AM", "5:00 PM", 8.3],
        ]),
      ],
      attachment: "DTR_Reyes_SepCycle1.xlsx · 84 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 10:22 AM",
      remark:
        "Name discrepancy resolved and corrected. All 22 logged days verified for payroll.",
    },
  },
  {
    actor: "Prof. Grace Lim",
    init: "GL",
    type: "AR",
    action: "AR rejected by HR",
    target: "Duplicate submission",
    time: "09:58 AM",
    result: "Rejected",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0097",
      facultyName: "Prof. Grace Lim",
      facultyNumber: "178",
      college: "College of Business",
      tables: [
        arTable("MKT 201 — MARKETING PRINCIPLES", "September 1–5, 2026", [
          ["MKT 201", "BSBA 2A", 3, "Tuesday", "8:00AM–11:00AM", "CONGRESS"],
        ]),
      ],
      topics: "a) Market segmentation and targeting",
      tasks:
        "a) Case study discussion.\nb) Group presentation on segment profiles.",
      attachment: "AR_Lim_SepCycle1.pdf · 1.4 MB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 09:58 AM",
      remark:
        "Duplicate of AR-2026-0916-0081 filed on September 16. Please file only one record per cycle.",
    },
  },
  {
    actor: "Paolo Garcia",
    init: "PG",
    type: "DTR",
    action: "DTR submitted",
    target: "Sep Cycle 1 · 22 days",
    time: "09:31 AM",
    result: "Submitted",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0094",
      facultyName: "Paolo Garcia",
      facultyNumber: "398",
      college: "College of Business",
      tables: [
        dtrTable("DTR — September 1–15, 2026", "22 days logged", [
          ["Sep 01", "8:02 AM", "5:07 PM", 8.1],
          ["Sep 02", "8:15 AM", "5:11 PM", 7.9],
          ["Sep 03", "7:58 AM", "5:01 PM", 8.1],
        ]),
      ],
      attachment: "DTR_Garcia_SepCycle1.xlsx · 78 KB",
      reviewer: "System — Intake",
      reviewedAt: "September 17, 2026 · 09:31 AM",
      remark: "Received and queued for HR validation.",
    },
  },
  {
    actor: "Dr. Nestor Villar",
    init: "NV",
    type: "AR",
    action: "AR not submitted",
    target: "Overdue · Sep Cycle 1",
    time: "08:44 AM",
    result: "Missing",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0088",
      facultyName: "Dr. Nestor Villar",
      facultyNumber: "155",
      college: "College of Engineering",
      tables: [],
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 08:44 AM",
      remark:
        "No AR was filed for this cycle despite five assigned course loads. Follow-up notice sent to the department head.",
    },
  },
]

export default function Audit() {
  const { data: logs } = useResource("/audit", demoAuditLogs)
  const [tab, setTab] = useState("All")
  const [showExportConfirm, setShowExportConfirm] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [selected, setSelected] = useState<{
    log: AuditLog
    idx: number
  } | null>(null)

  const tabs = [
    "All",
    "Submitted",
    "Approved",
    "Rejected",
    "Flagged",
    "Missing",
  ]
  const rows = logs.filter((l) => tab === "All" || l.result === tab)

  const count = (r: string) => logs.filter((l) => l.result === r).length
  const stats = [
    ["Records Today", String(logs.length)],
    ["Rejected", String(count("Rejected"))],
    ["Flagged", String(count("Flagged"))],
    ["Not Submitted", String(count("Missing"))],
  ]

  return (
    <div className="pb-2">
      <PageTitle
        title="Audit Logs"
        subtitle="Immutable trail of every AR / DTR submission event."
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
                setShowExportConfirm(false)
                setShowExportSuccess(true)
              }}
            >
              Yes, Export
            </PrimaryButton>
          </>
        }
      >
        Are you sure you want to export the audit logs to a CSV file?
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
        The audit logs have been successfully exported.
      </Modal>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `${selected.log.type} Submission Detail`
            : "Submission Detail"
        }
        size="lg"
        align="left"
        actions={
          <GhostButton onClick={() => setSelected(null)}>Close</GhostButton>
        }
      >
        {selected && (
          <SubmissionDetail
            record={selected.log.record}
            type={selected.log.type}
            status={selected.log.result}
            initials={selected.log.init}
            colorIndex={selected.idx}
            loggedAt={selected.log.time}
            event={`${selected.log.action} · ${selected.log.target}`}
          />
        )}
      </Modal>

      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      <Card className="p-0 overflow-x-auto">
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "#eef1ef" }}
        >
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2">
            <SearchInput placeholder="Search AR / DTR events" />
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
          className="grid min-w-[920px] grid-cols-[1.6fr_0.7fr_1.7fr_1.8fr_0.8fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa" }}
        >
          <span>Actor</span>
          <span>Type</span>
          <span>Event</span>
          <span>Details</span>
          <span>Time</span>
          <span className="text-right">Result</span>
        </div>
        {rows.map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected({ log: l, idx: i })}
            title="View submission detail"
            className="grid min-w-[920px] w-full text-left grid-cols-[1.6fr_0.7fr_1.7fr_1.8fr_0.8fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
            style={{ borderColor: "#f2f4f2" }}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Avatar
                initials={l.init}
                color={l.result === "Rejected" ? "#c0392b" : initialsColor(i)}
                size={28}
              />
              <span
                className="text-[13px] font-medium truncate"
                style={{ color: "#111c14" }}
              >
                {l.actor}
              </span>
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{ color: l.type === "DTR" ? BRAND : "#3f8ecc" }}
            >
              {l.type}
            </span>
            <span className="text-[13px] truncate" style={{ color: "#3d4a41" }}>
              {l.action}
            </span>
            <span className="text-[13px] truncate" style={{ color: "#8fa394" }}>
              {l.target}
            </span>
            <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
              {l.time}
            </span>
            <span className="flex justify-end">
              <Badge tone={statusTone[l.result]} dot>
                {l.result}
              </Badge>
            </span>
          </button>
        ))}
      </Card>
    </div>
  )
}
