import { useState, type ReactNode } from "react"
import { BRAND } from "@/config/navigation"
import {
  Card,
  PageTitle,
  GhostButton,
  SearchInput,
  Badge,
  Tabs,
  Modal,
  arTable,
  dtrTable,
  statusTone,
  SubmissionDetail,
  type RecordKind,
  type RecordPayload,
  type StatusKind,
} from "@/components/ui"

const FACULTY = {
  name: "Juan M. Rivera",
  number: "289",
  college: "College of Liberal Arts and Sciences",
  initials: "JR",
}

type HistoryRecord = {
  type: RecordKind
  period: string
  units: string
  submitted: string
  status: StatusKind
  /** One-line summary of the event shown in the detail modal. */
  event: string
  record: RecordPayload
}

const records: HistoryRecord[] = [
  {
    type: "AR",
    period: "Sep Cycle 1",
    units: "18 outputs",
    submitted: "Sep 6, 12:41 PM",
    status: "Approved",
    event: "AR submitted · Sep Cycle 1 · 18 outputs",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0906-0091",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        arTable("CC 105 — INFORMATION MANAGEMENT", "September 1–5, 2026", [
          [
            "CC 105",
            "BSIT 2B",
            5,
            "Monday",
            "7:00AM–10:00AM / 1:00PM–3:00PM",
            "CONGRESS",
          ],
          ["CC 105", "BSIT 2A", 5, "Tuesday", "1:00PM–6:00PM", "CONGRESS"],
          ["CC 105", "BSIS 2-B", 5, "Wednesday", "1:30PM–6:30PM", "CONGRESS"],
        ]),
      ],
      topics:
        "a) Aggregate functions\nb) Group By, Order By and Having clauses",
      tasks:
        "a) Discussed aggregate functions and definitions.\nb) Gave activities and posted the PPT and learning materials through G-Class.",
      attachment: "AR_Rivera_SepCycle1.pdf · 1.1 MB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "Sep 8, 2026 · 10:22 AM",
      remark:
        "All 18 outputs verified against the syllabus. Forwarded to accounting for payroll processing.",
    },
  },
  {
    type: "DTR",
    period: "Sep Cycle 1",
    units: "22 days",
    submitted: "Sep 6, 12:39 PM",
    status: "Pending",
    event: "DTR submitted · Sep Cycle 1 · 22 days",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0906-0089",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        dtrTable("DTR — September 1–5, 2026", "22 duty days logged", [
          ["Sep 01", "7:52 AM", "5:04 PM", 8.2],
          ["Sep 02", "8:05 AM", "5:10 PM", 8.1],
          ["Sep 03", "7:58 AM", "5:00 PM", 8.1],
        ]),
      ],
      attachment: "DTR_Rivera_SepCycle1.xlsx · 82 KB",
      reviewer: "L. Bautista (College Secretary)",
      reviewedAt: "Sep 7, 2026 · 9:05 AM",
      remark: "Names and entries verified. Routing to HR for endorsement.",
    },
  },
  {
    type: "AR",
    period: "Aug Cycle 2",
    units: "16 outputs",
    submitted: "Aug 22, 4:02 PM",
    status: "Approved",
    event: "AR submitted · Aug Cycle 2 · 16 outputs",
    record: {
      period: "August Cycle 2",
      reference: "AR-2026-0822-0233",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        arTable("CC 105 — INFORMATION MANAGEMENT", "August 11–22, 2026", [
          ["CC 105", "BSIT 2A", 5, "Tuesday", "1:00PM–6:00PM", "CONGRESS"],
          ["CC 105", "BSIS 2-A", 5, "Thursday", "1:30PM–6:30PM", "CONGRESS"],
        ]),
      ],
      topics: "a) Normalization\nb) Entity relationship modelling",
      tasks:
        "a) Workshop on ER diagramming.\nb) Graded exercise on second normal form, returned with feedback.",
      attachment: "AR_Rivera_AugCycle2.pdf · 1.0 MB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "Aug 24, 2026 · 9:40 AM",
      remark:
        "Complete and curriculum-aligned. Approved and endorsed to accounting.",
    },
  },
  {
    type: "DTR",
    period: "Aug Cycle 2",
    units: "21 days",
    submitted: "Aug 22, 3:58 PM",
    status: "Rejected",
    event: "DTR rejected by HR · Aug Cycle 2 · 21 days",
    record: {
      period: "August Cycle 2",
      reference: "DTR-2026-0822-0231",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        dtrTable("DTR — August 11–22, 2026", "21 duty days logged", [
          ["Aug 11", "8:02 AM", "5:07 PM", 8.1],
          ["Aug 12", "—", "5:03 PM", 0],
          ["Aug 13", "8:11 AM", "5:00 PM", 7.8],
        ]),
      ],
      attachment: "DTR_Rivera_AugCycle2.xlsx · 79 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "Aug 23, 2026 · 11:12 AM",
      remark:
        "Rejected: three biometric entries were logged under an unregistered employee number. Refile with the corrected entries.",
    },
  },
  {
    type: "AR",
    period: "Aug Cycle 1",
    units: "17 outputs",
    submitted: "Aug 8, 10:15 AM",
    status: "Approved",
    event: "AR submitted · Aug Cycle 1 · 17 outputs",
    record: {
      period: "August Cycle 1",
      reference: "AR-2026-0808-0176",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        arTable("CC 105 — INFORMATION MANAGEMENT", "August 1–8, 2026", [
          ["CC 105", "BSIT 2B", 5, "Monday", "7:00AM–10:00AM", "CONGRESS"],
          ["CC 105", "BSIS 2-B", 5, "Wednesday", "1:30PM–6:30PM", "CONGRESS"],
        ]),
      ],
      topics: "a) Relational model\nb) Primary and foreign keys",
      tasks:
        "a) Lecture on keys and constraints.\nb) Hands-on exercise creating tables with referential integrity.",
      attachment: "AR_Rivera_AugCycle1.pdf · 950 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "Aug 10, 2026 · 8:55 AM",
      remark: "Verified. Topics match the approved curriculum for week 1.",
    },
  },
  {
    type: "DTR",
    period: "Aug Cycle 1",
    units: "22 days",
    submitted: "Aug 8, 10:11 AM",
    status: "Approved",
    event: "DTR approved by HR · Aug Cycle 1 · 22 days",
    record: {
      period: "August Cycle 1",
      reference: "DTR-2026-0808-0175",
      facultyName: FACULTY.name,
      facultyNumber: FACULTY.number,
      college: FACULTY.college,
      tables: [
        dtrTable("DTR — August 1–8, 2026", "22 duty days verified", [
          ["Aug 01", "7:45 AM", "5:00 PM", 8.3],
          ["Aug 02", "7:52 AM", "5:06 PM", 8.2],
          ["Aug 03", "7:58 AM", "5:01 PM", 8.1],
        ]),
      ],
      attachment: "DTR_Rivera_AugCycle1.xlsx · 81 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "Aug 9, 2026 · 2:18 PM",
      remark: "All 22 logged days verified for payroll.",
    },
  },
]

/* ─── Latest submission routing ────────────────────────────────────────────── */

type StageState = "done" | "current" | "pending"

type RoutingStage = {
  label: string
  owner: string
  note: string
  when?: string
  state: StageState
  icon: ReactNode
}

const stageIcon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    {path}
  </svg>
)

const latestSubmission = {
  type: "DTR" as const,
  period: "September Cycle 1",
  units: "22 days",
  reference: "DTR-2026-0906-0088",
  filed: "Sep 6, 2026 · 12:39 PM",
  status: "Pending" as const,
  currentStage: "College Secretary",
  currentSince: "Sep 7, 9:05 AM",
}

// Device → Checker → Secretary → HR → Accounting
const routingStages: RoutingStage[] = [
  {
    label: "Device",
    owner: "Your device",
    note: "Filed from Chrome",
    when: "Sep 6, 12:39 PM",
    state: "done",
    icon: stageIcon(
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>,
    ),
  },
  {
    label: "Checker",
    owner: "Prof. R. Alonzo",
    note: "22 days verified",
    when: "Sep 6, 1:15 PM",
    state: "done",
    icon: stageIcon(
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </>,
    ),
  },
  {
    label: "Secretary",
    owner: "L. Bautista",
    note: "Routing to HR",
    when: "Sep 7, 9:05 AM",
    state: "current",
    icon: stageIcon(
      <>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </>,
    ),
  },
  {
    label: "HR",
    owner: "Ana Bautista",
    note: "Awaiting endorsement",
    state: "pending",
    icon: stageIcon(
      <>
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </>,
    ),
  },
  {
    label: "Accounting",
    owner: "Payroll Office",
    note: "Awaiting HR approval",
    state: "pending",
    icon: stageIcon(
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h8" />
      </>,
    ),
  },
]

const AMBER = "#d99a2b"

function StageNode({ s }: { s: RoutingStage }) {
  const accent =
    s.state === "done" ? BRAND : s.state === "current" ? AMBER : "#c8d2cb"
  return (
    <div className="flex flex-col items-center text-center px-2">
      <span
        className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: s.state === "done" ? BRAND : "#fff",
          border: `2px solid ${accent}`,
          color: s.state === "done" ? "#fff" : accent,
          boxShadow: s.state === "current" ? `0 0 0 4px ${AMBER}22` : "none",
        }}
      >
        {s.state === "done" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          s.icon
        )}
      </span>
      <p
        className="text-[12.5px] font-semibold mt-2.5"
        style={{
          color:
            s.state === "current"
              ? "#996515"
              : s.state === "done"
                ? "#111c14"
                : "#b6c3ba",
        }}
      >
        {s.label}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: "#8fa394" }}>
        {s.owner}
      </p>
      <p
        className="text-[10.5px] mt-1 leading-snug"
        style={{ color: s.state === "pending" ? "#c8d2cb" : "#5a6b5e" }}
      >
        {s.note}
      </p>
      <p
        className="text-[10.5px] mt-1 tabular-nums"
        style={{ color: s.state === "pending" ? "#c8d2cb" : "#8fa394" }}
      >
        {s.when ?? "—"}
      </p>
    </div>
  )
}

function LatestSubmissionCard() {
  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>
            Latest Submission
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>
            {latestSubmission.type} · {latestSubmission.period} ·{" "}
            {latestSubmission.units} · filed {latestSubmission.filed}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge tone={statusTone[latestSubmission.status]} dot>
            {latestSubmission.status}
          </Badge>
          <span
            className="text-[11.5px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#f0f2f0", color: "#5a6b5e" }}
          >
            Ref {latestSubmission.reference}
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-2 mt-3.5 px-3.5 py-2.5 rounded-xl text-[12px]"
        style={{ background: "#fbf1de", color: "#996515" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="w-4 h-4 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        Currently with the {latestSubmission.currentStage} since{" "}
        {latestSubmission.currentSince} — next stop: Human Resources.
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="relative min-w-[720px]">
          {/* connector rail: from the centre of each stage to the next */}
          <div className="absolute top-[17px] left-0 right-0 h-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="absolute h-[2px] rounded-full"
                style={{
                  left: `${10 + i * 20}%`,
                  width: "20%",
                  background:
                    routingStages[i + 1].state === "pending"
                      ? "#e2e8e4"
                      : BRAND,
                }}
              />
            ))}
          </div>
          <div className="relative grid grid-cols-5">
            {routingStages.map((s) => (
              <StageNode key={s.label} s={s} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11.5px] mt-3" style={{ color: "#b6c3ba" }}>
        The record moves automatically to the next stage. You will be notified
        once it reaches HR.
      </p>
    </Card>
  )
}

export default function ProfHistory() {
  const [tab, setTab] = useState("All")
  const [selected, setSelected] = useState<{
    row: HistoryRecord
    idx: number
  } | null>(null)
  const tabs = ["All", "AR", "DTR"]
  const rows = records.filter((r) => tab === "All" || r.type === tab)

  return (
    <div className="pb-2">
      <PageTitle
        title="Submission History"
        subtitle="Every AR / DTR you have filed, with its verification outcome."
        action={
          <GhostButton>
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

      <LatestSubmissionCard />

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ["Total Filed", "39"],
          ["Approved", "34"],
          ["Pending", "2"],
          ["Rejected", "3"],
        ].map(([l, v]) => (
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
          <SearchInput placeholder="Search records" />
        </div>
        <div
          className="grid grid-cols-[0.7fr_1.2fr_1.3fr_1.6fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa" }}
        >
          <span>Type</span>
          <span>Period</span>
          <span>Units</span>
          <span>Submitted</span>
          <span className="text-right">Status</span>
        </div>
        {rows.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected({ row: r, idx: i })}
            title="View submission detail"
            className="grid w-full text-left grid-cols-[0.7fr_1.2fr_1.3fr_1.6fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
            style={{ borderColor: "#f2f4f2" }}
          >
            <span
              className="text-[12px] font-semibold"
              style={{ color: r.type === "DTR" ? BRAND : "#3f8ecc" }}
            >
              {r.type}
            </span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>
              {r.period}
            </span>
            <span
              className="text-[13px] tabular-nums"
              style={{ color: "#8fa394" }}
            >
              {r.units}
            </span>
            <span className="text-[13px]" style={{ color: "#8fa394" }}>
              {r.submitted}
            </span>
            <span className="flex justify-end">
              <Badge tone={statusTone[r.status]} dot>
                {r.status}
              </Badge>
            </span>
          </button>
        ))}
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `${selected.row.type === "AR" ? "AR" : "DTR"} Submission Detail`
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
            record={selected.row.record}
            type={selected.row.type}
            status={selected.row.status}
            initials={FACULTY.initials}
            colorIndex={selected.idx}
            loggedAt={selected.row.submitted}
            event={selected.row.event}
          />
        )}
      </Modal>
    </div>
  )
}
