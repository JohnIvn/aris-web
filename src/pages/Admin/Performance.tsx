import { useState } from "react"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts"
import { Card, Badge, Avatar, StatCard, StatGrid, initialsColor } from "@/components/ui"
import { useResource } from "@/hooks/useResource"

// ─── Constants ───────────────────────────────────────────────────────────────

const C_GREEN = "#3a7d4e"
const C_AMBER = "#d99a2b"
const C_RED = "#e05252"
const C_BLUE = "#3f8ecc"

type GradeLevel = "Excellent" | "Good" | "Needs Improvement" | "Poor"
const GRADE_META: Record<GradeLevel, {
  tone: "green" | "amber" | "red"
  color: string
  bg: string
}> = {
  Excellent: { tone: "green", color: C_GREEN, bg: "#eaf4ee" },
  Good: { tone: "green", color: "#2b9c8a", bg: "#e4f6f3" },
  "Needs Improvement": { tone: "amber", color: C_AMBER, bg: "#fbf1de" },
  Poor: { tone: "red", color: C_RED, bg: "#fbecec" },
}

function gradeFromScore(s: number): GradeLevel {
  if (s >= 90) return "Excellent"
  if (s >= 75) return "Good"
  if (s >= 60) return "Needs Improvement"
  return "Poor"
}

// ─── Departments ─────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "College of Engineering",
  "College of Business",
  "Arts & Sciences",
] as const
type Dept = typeof DEPARTMENTS[number]

// Compact label for chips and list rows ("College of Engineering" → "Engineering")
const deptLabel = (d: string) => d.replace(/^College of /, "")

// ─── AI Score Engine ─────────────────────────────────────────────────────────
// Weights (sum = 100)
// AR Submission Rate     20
// DTR Compliance         20
// Curriculum Alignment   20
// Task Quality           15
// Teaching Load Covered  10
// Consistency            10
// Responsiveness          5
// Total                 100

interface ProfData {
  id: string
  name: string
  init: string
  dept: Dept
  position: string
  faculty: string
  courses: number
  units: number
  // raw metric scores (0-100)
  arSubmissionRate: number // % of ARs submitted on time
  dtrCompliance: number // % of DTRs verified and correct
  curriculumAlignment: number // % of AR topics matching curriculum
  taskQuality: number // evaluated from task/activity desc richness
  teachingLoad: number // % of assigned load actually covered
  consistency: number // variance in submission timing
  responsiveness: number // avg days to respond to feedback
  // supplemental
  arHistory: {
    period: string
    submitted: boolean
    onTime: boolean
    topics: number
    alignment: "Aligned" | "Not Aligned" | "Under Review"
  }[]
  weeklyLoad: { wk: string; units: number }[]
  trend: { m: string; score: number }[]
}

function aiScore(p: ProfData) {
  return Math.round(
    p.arSubmissionRate * 0.2 +
      p.dtrCompliance * 0.2 +
      p.curriculumAlignment * 0.2 +
      p.taskQuality * 0.15 +
      p.teachingLoad * 0.1 +
      p.consistency * 0.1 +
      p.responsiveness * 0.05,
  )
}

// ─── Mock Professor Data ──────────────────────────────────────────────────────

const professors: ProfData[] = [
  {
    id: "p01",
    name: "Prof. Lito Cruz",
    init: "LC",
    dept: "College of Engineering",
    position: "Associate Professor",
    faculty: "289",
    courses: 4,
    units: 20,
    arSubmissionRate: 100,
    dtrCompliance: 95,
    curriculumAlignment: 90,
    taskQuality: 88,
    teachingLoad: 100,
    consistency: 92,
    responsiveness: 95,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: true,
        onTime: false,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 20 },
      { wk: "Wk2", units: 18 },
      { wk: "Wk3", units: 20 },
      { wk: "Wk4", units: 19 },
      { wk: "Wk5", units: 20 },
    ],
    trend: [
      { m: "Jun", score: 88 },
      { m: "Jul", score: 90 },
      { m: "Aug", score: 91 },
      { m: "Sep", score: 93 },
    ],
  },
  {
    id: "p02",
    name: "Dr. Maria Santos",
    init: "MS",
    dept: "College of Engineering",
    position: "Full Professor",
    faculty: "214",
    courses: 3,
    units: 15,
    arSubmissionRate: 80,
    dtrCompliance: 75,
    curriculumAlignment: 45,
    taskQuality: 70,
    teachingLoad: 85,
    consistency: 60,
    responsiveness: 55,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Not Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: false,
        topics: 2,
        alignment: "Not Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: false,
        onTime: false,
        topics: 0,
        alignment: "Not Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 15 },
      { wk: "Wk2", units: 12 },
      { wk: "Wk3", units: 14 },
      { wk: "Wk4", units: 10 },
      { wk: "Wk5", units: 13 },
    ],
    trend: [
      { m: "Jun", score: 78 },
      { m: "Jul", score: 76 },
      { m: "Aug", score: 71 },
      { m: "Sep", score: 68 },
    ],
  },
  {
    id: "p03",
    name: "James Reyes",
    init: "JR",
    dept: "College of Engineering",
    position: "Instructor I",
    faculty: "301",
    courses: 3,
    units: 15,
    arSubmissionRate: 100,
    dtrCompliance: 90,
    curriculumAlignment: 100,
    taskQuality: 82,
    teachingLoad: 100,
    consistency: 88,
    responsiveness: 90,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 15 },
      { wk: "Wk2", units: 15 },
      { wk: "Wk3", units: 14 },
      { wk: "Wk4", units: 15 },
      { wk: "Wk5", units: 15 },
    ],
    trend: [
      { m: "Jun", score: 85 },
      { m: "Jul", score: 87 },
      { m: "Aug", score: 89 },
      { m: "Sep", score: 91 },
    ],
  },
  {
    id: "p04",
    name: "Prof. Grace Lim",
    init: "GL",
    dept: "College of Business",
    position: "Associate Professor",
    faculty: "178",
    courses: 4,
    units: 18,
    arSubmissionRate: 100,
    dtrCompliance: 100,
    curriculumAlignment: 100,
    taskQuality: 95,
    teachingLoad: 100,
    consistency: 98,
    responsiveness: 100,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 18 },
      { wk: "Wk2", units: 18 },
      { wk: "Wk3", units: 18 },
      { wk: "Wk4", units: 18 },
      { wk: "Wk5", units: 18 },
    ],
    trend: [
      { m: "Jun", score: 94 },
      { m: "Jul", score: 96 },
      { m: "Aug", score: 96 },
      { m: "Sep", score: 98 },
    ],
  },
  {
    id: "p05",
    name: "Marco Dela Cruz",
    init: "MD",
    dept: "Arts & Sciences",
    position: "Instructor II",
    faculty: "342",
    courses: 2,
    units: 9,
    arSubmissionRate: 60,
    dtrCompliance: 65,
    curriculumAlignment: 50,
    taskQuality: 58,
    teachingLoad: 70,
    consistency: 50,
    responsiveness: 60,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: false,
        topics: 1,
        alignment: "Under Review",
      },
      {
        period: "Aug Cycle 2",
        submitted: false,
        onTime: false,
        topics: 0,
        alignment: "Not Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: true,
        onTime: false,
        topics: 1,
        alignment: "Not Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: false,
        onTime: false,
        topics: 0,
        alignment: "Not Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 9 },
      { wk: "Wk2", units: 6 },
      { wk: "Wk3", units: 8 },
      { wk: "Wk4", units: 5 },
      { wk: "Wk5", units: 7 },
    ],
    trend: [
      { m: "Jun", score: 68 },
      { m: "Jul", score: 64 },
      { m: "Aug", score: 60 },
      { m: "Sep", score: 59 },
    ],
  },
  {
    id: "p06",
    name: "Dr. Nestor Villar",
    init: "NV",
    dept: "College of Engineering",
    position: "Full Professor",
    faculty: "155",
    courses: 5,
    units: 25,
    arSubmissionRate: 100,
    dtrCompliance: 95,
    curriculumAlignment: 100,
    taskQuality: 90,
    teachingLoad: 98,
    consistency: 95,
    responsiveness: 88,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: true,
        topics: 3,
        alignment: "Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: true,
        onTime: true,
        topics: 4,
        alignment: "Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 25 },
      { wk: "Wk2", units: 24 },
      { wk: "Wk3", units: 25 },
      { wk: "Wk4", units: 25 },
      { wk: "Wk5", units: 24 },
    ],
    trend: [
      { m: "Jun", score: 91 },
      { m: "Jul", score: 93 },
      { m: "Aug", score: 94 },
      { m: "Sep", score: 95 },
    ],
  },
  {
    id: "p07",
    name: "Paolo Garcia",
    init: "PG",
    dept: "College of Business",
    position: "Instructor I",
    faculty: "398",
    courses: 2,
    units: 9,
    arSubmissionRate: 60,
    dtrCompliance: 70,
    curriculumAlignment: 40,
    taskQuality: 55,
    teachingLoad: 65,
    consistency: 48,
    responsiveness: 50,
    arHistory: [
      {
        period: "Sep Cycle 1",
        submitted: true,
        onTime: false,
        topics: 1,
        alignment: "Not Aligned",
      },
      {
        period: "Aug Cycle 2",
        submitted: true,
        onTime: true,
        topics: 2,
        alignment: "Aligned",
      },
      {
        period: "Aug Cycle 1",
        submitted: false,
        onTime: false,
        topics: 0,
        alignment: "Not Aligned",
      },
      {
        period: "Jul Cycle 2",
        submitted: true,
        onTime: false,
        topics: 1,
        alignment: "Not Aligned",
      },
      {
        period: "Jul Cycle 1",
        submitted: false,
        onTime: false,
        topics: 0,
        alignment: "Not Aligned",
      },
    ],
    weeklyLoad: [
      { wk: "Wk1", units: 9 },
      { wk: "Wk2", units: 7 },
      { wk: "Wk3", units: 5 },
      { wk: "Wk4", units: 6 },
      { wk: "Wk5", units: 7 },
    ],
    trend: [
      { m: "Jun", score: 62 },
      { m: "Jul", score: 59 },
      { m: "Aug", score: 57 },
      { m: "Sep", score: 55 },
    ],
  },
]

// compute AI scores
const withScores = professors
  .map((p) => ({ ...p, score: aiScore(p) }))
  .sort((a, b) => b.score - a.score)

// ─── Helper components ────────────────────────────────────────────────────────

type ChartTipEntry = { name?: string; color?: string; fill?: string; value?: string | number };
type ChartTipProps = { active?: boolean; payload?: ChartTipEntry[]; label?: string | number };

function ChartTip({ active, payload, label }: ChartTipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="bg-white border rounded-xl shadow-lg px-3 py-2 text-[12px]"
      style={{ borderColor: "#e2e8e4" }}
    >
      {label && (
        <p className="font-semibold mb-1" style={{ color: "#111c14" }}>
          {label}
        </p>
      )}
      {payload.map((p, index) => (
        <p key={p.name ?? index} style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between text-[11.5px] mb-1">
        <span style={{ color: "#5a6b5e" }}>{label}</span>
        <span className="font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "#f0f2f0" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const grade = gradeFromScore(score)
  const meta = GRADE_META[grade]
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f0f2f0"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.color}
          strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[17px] font-black leading-none"
          style={{ color: meta.color }}
        >
          {score}
        </span>
        <span className="text-[9px] font-semibold" style={{ color: "#8fa394" }}>
          / 100
        </span>
      </div>
    </div>
  )
}

// ─── Professor Detail Panel ────────────────────────────────────────────────────

function ProfDetail({ p, idx }: { p: (typeof withScores)[0]; idx: number }) {
  const grade = gradeFromScore(p.score)
  const meta = GRADE_META[grade]
  const radarData = [
    { ax: "AR Submission", val: p.arSubmissionRate },
    { ax: "DTR", val: p.dtrCompliance },
    { ax: "Curriculum", val: p.curriculumAlignment },
    { ax: "Task Quality", val: p.taskQuality },
    { ax: "Load Coverage", val: p.teachingLoad },
    { ax: "Consistency", val: p.consistency },
  ]
  return (
    <div className="space-y-3">
      {/* Profile header */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar initials={p.init} color={initialsColor(idx)} size={52} />
          <div className="flex-1 min-w-0">
            <p
              className="text-[16px] font-bold tracking-tight"
              style={{ color: "#111c14" }}
            >
              {p.name}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>
              {p.position} · {p.dept} · Faculty #{p.faculty}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {grade}
              </span>
              <span className="text-[11px]" style={{ color: "#8fa394" }}>
                {p.courses} courses · {p.units} units
              </span>
            </div>
          </div>
          <ScoreRing score={p.score} size={88} />
        </div>

        {/* AI Insight */}
        <div
          className="mt-4 px-4 py-3 rounded-2xl text-[12.5px] leading-relaxed"
          style={{
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.color}30`,
          }}
        >
          <strong>AI Assessment:</strong>{" "}
          {p.score >= 90
            ? `${p.name.split(" ").slice(-1)[0]} is performing at an exemplary level. All AR submissions are on time, topics are curriculum-aligned, and task descriptions demonstrate high instructional quality. Recommend for commendation.`
            : p.score >= 75
              ? `${p.name.split(" ").slice(-1)[0]} shows consistent performance with minor areas for improvement. Curriculum alignment and task documentation are generally on track. Minor follow-up recommended.`
              : p.score >= 60
                ? `${p.name.split(" ").slice(-1)[0]} has notable gaps in ${
                    p.curriculumAlignment < 70
                      ? "curriculum alignment"
                      : "DTR compliance"
                  }. AR submissions show ${
                    p.arSubmissionRate < 80
                      ? "missed deadlines"
                      : "quality issues"
                  }. Coaching intervention advised.`
                : `${p.name.split(" ").slice(-1)[0]} is at risk. Multiple missed AR/DTR submissions and significant curriculum misalignment detected. Immediate performance review required.`}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {/* Radar */}
        <Card className="flex flex-col">
          <p
            className="text-[13px] font-semibold mb-2"
            style={{ color: "#111c14" }}
          >
            Performance Radar
          </p>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#e2e8e4" />
                <PolarAngleAxis
                  dataKey="ax"
                  tick={{ fill: "#8fa394", fontSize: 9 }}
                />
                <Radar
                  dataKey="val"
                  name="Score"
                  stroke={meta.color}
                  fill={meta.color}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Score trend */}
        <Card className="flex flex-col">
          <p
            className="text-[13px] font-semibold mb-2"
            style={{ color: "#111c14" }}
          >
            Score Trend
          </p>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={p.trend}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={meta.color}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={meta.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f2f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 10, fill: "#8fa394" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 100]}
                  tick={{ fontSize: 10, fill: "#8fa394" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="AI Score"
                  stroke={meta.color}
                  fill="url(#tg)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: meta.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Metric bars */}
      <Card>
        <p
          className="text-[13px] font-semibold mb-3"
          style={{ color: "#111c14" }}
        >
          Metric Breakdown
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <MetricBar
            label="AR Submission Rate"
            value={p.arSubmissionRate}
            color={p.arSubmissionRate >= 80 ? C_GREEN : C_RED}
          />
          <MetricBar
            label="DTR Compliance"
            value={p.dtrCompliance}
            color={p.dtrCompliance >= 80 ? C_GREEN : C_AMBER}
          />
          <MetricBar
            label="Curriculum Alignment"
            value={p.curriculumAlignment}
            color={p.curriculumAlignment >= 80 ? C_GREEN : C_RED}
          />
          <MetricBar
            label="Task Quality"
            value={p.taskQuality}
            color={p.taskQuality >= 80 ? C_GREEN : C_AMBER}
          />
          <MetricBar
            label="Teaching Load Coverage"
            value={p.teachingLoad}
            color={p.teachingLoad >= 85 ? C_GREEN : C_AMBER}
          />
          <MetricBar
            label="Consistency"
            value={p.consistency}
            color={p.consistency >= 80 ? C_GREEN : C_AMBER}
          />
        </div>
      </Card>

      {/* AR History */}
      <Card className="p-0 overflow-hidden">
        <div
          className="px-5 py-3.5 border-b"
          style={{ borderColor: "#eef1ef" }}
        >
          <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>
            AR Submission History
          </p>
        </div>
        <div
          className="grid px-5 py-2 text-[10.5px] uppercase tracking-wide font-semibold"
          style={{
            color: "#b6c3ba",
            background: "#fafbfa",
            gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr 1fr",
          }}
        >
          <span>Period</span>
          <span>Submitted</span>
          <span>On Time</span>
          <span>Topics</span>
          <span className="text-right">Alignment</span>
        </div>
        {p.arHistory.map((h) => {
          const alignTone: "green" | "red" | "amber" =
            h.alignment === "Aligned"
              ? "green"
              : h.alignment === "Not Aligned"
                ? "red"
                : "amber"
          return (
            <div
              key={h.period}
              className="grid items-center px-5 py-3 border-t"
              style={{
                borderColor: "#f2f4f2",
                gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr 1fr",
              }}
            >
              <span
                className="text-[13px] font-medium"
                style={{ color: "#111c14" }}
              >
                {h.period}
              </span>
              <span>
                {h.submitted ? (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#eaf4ee", color: C_GREEN }}
                  >
                    Yes
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#fbecec", color: C_RED }}
                  >
                    No
                  </span>
                )}
              </span>
              <span>
                {h.onTime ? (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#eaf4ee", color: C_GREEN }}
                  >
                    Yes
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#fbecec", color: C_RED }}
                  >
                    Late
                  </span>
                )}
              </span>
              <span className="text-[13px]" style={{ color: "#5a6b5e" }}>
                {h.topics}
              </span>
              <div className="flex justify-end">
                <Badge tone={alignTone} dot>
                  {h.alignment}
                </Badge>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Weekly load chart */}
      <Card>
        <p
          className="text-[13px] font-semibold mb-3"
          style={{ color: "#111c14" }}
        >
          Weekly Teaching Load (Units)
        </p>
        <div style={{ height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={p.weeklyLoad}
              barSize={22}
              margin={{ top: 2, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f2f0"
                vertical={false}
              />
              <XAxis
                dataKey="wk"
                tick={{ fontSize: 10, fill: "#8fa394" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8fa394" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              <Bar
                dataKey="units"
                name="Units"
                fill={meta.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEPT_FILTERS = ["All", ...DEPARTMENTS] as const

export default function Performance() {
  const { data: performanceData } = useResource("/performance", withScores)
  const [selected, setSelected] = useState<string | null>(null)
  const [deptFilter, setDeptFilter] = useState<string>("All")
  const [search, setSearch] = useState("")
  const selectedId = selected ?? performanceData[0]?.id ?? null

  const filtered = performanceData.filter((p) => {
    const matchDept = deptFilter === "All" || p.dept === deptFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q)
    return matchDept && matchSearch
  })

  const selectedProf = performanceData.find((p) => p.id === selectedId) ?? performanceData[0]
  const selIdx = performanceData.findIndex((p) => p.id === selectedId)

  // summary for top row
  const avg = Math.round(
    performanceData.reduce((s, p) => s + p.score, 0) / performanceData.length,
  )
  const excellent = performanceData.filter((p) => p.score >= 90).length
  const needsAttention = performanceData.filter((p) => p.score < 65).length

  // overview bar chart data
  const overviewData = performanceData.slice(0, 7).map((p) => ({
    name: p.init,
    score: p.score,
    fill: GRADE_META[gradeFromScore(p.score)].color,
  }))

  return (
    <div className="pb-8 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ color: "#111c14" }}
          >
            AI Performance Analytics
          </h1>
          <p className="text-[13.5px] mt-0.5" style={{ color: "#8fa394" }}>
            Automated professor performance scores calculated from AR
            submissions, DTR compliance, curriculum alignment, and teaching load
            data.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold"
          style={{ background: "#eaf4ee", color: C_GREEN }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3.5 h-3.5"
          >
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          AI Model · Updated Sep 16, 2026
        </div>
      </div>

      {/* ── KPI row ── */}
      <StatGrid>
        {[
          {
            label: "Faculty Evaluated",
            value: performanceData.length,
            sub: "This semester",
            color: C_BLUE,
          },
          {
            label: "Avg AI Score",
            value: avg,
            sub: "Out of 100",
            color: avg >= 80 ? C_GREEN : C_AMBER,
          },
          {
            label: "Excellent (90+)",
            value: excellent,
            sub: "Top performers",
            color: C_GREEN,
          },
          {
            label: "Needs Attention",
            value: needsAttention,
            sub: "Score below 65",
            color: C_RED,
          },
        ].map(({ label, value, sub, color }) => (
          <StatCard key={label} label={label} value={value} valueColor={color} detail={sub} />
        ))}
      </StatGrid>

      {/* ── Overview bar chart ── */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>
            Score Overview (Top 7)
          </p>
          <div className="flex gap-2 text-[11px] font-medium">
            {([
              ["Excellent ≥90", C_GREEN],
              ["Good ≥75", "#2b9c8a"],
              ["Needs Improvement ≥60", C_AMBER],
              ["Poor <60", C_RED],
            ] as [string, string][]).map(([l, c]) => (
              <span key={l} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c }}
                />
                <span style={{ color: "#8fa394" }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overviewData}
              barSize={32}
              margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f2f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#8fa394" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8fa394" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="score" name="AI Score" radius={[6, 6, 0, 0]}>
                {overviewData.map((d, i) => (
                  <rect key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Main 2-panel layout ── */}
      <div className="grid grid-cols-[320px_1fr] gap-4 items-start">
        {/* Left — professor list */}
        <div className="space-y-2">
          {/* filters */}
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white border"
            style={{ borderColor: "#e2e8e4" }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="#8fa394"
              strokeWidth="1.6"
              className="w-4 h-4 flex-shrink-0"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5l3 3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty…"
              className="bg-transparent outline-none text-[13px] w-full"
              style={{ color: "#111c14" }}
            />
          </div>
          <div
            className="flex gap-1 p-0.5 rounded-xl overflow-x-auto"
            style={{ background: "#f0f2f0" }}
          >
            {DEPT_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                style={{
                  background: deptFilter === d ? "#fff" : "transparent",
                  color: deptFilter === d ? "#111c14" : "#8fa394",
                  boxShadow:
                    deptFilter === d ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {d === "All" ? "All" : deptLabel(d)}
              </button>
            ))}
          </div>

          {/* list */}
          <div className="space-y-1.5">
            {filtered.map((p, i) => {
              const grade = gradeFromScore(p.score)
              const meta = GRADE_META[grade]
              const isActive = p.id === selectedId
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="w-full text-left px-4 py-3 rounded-2xl border transition-all"
                  style={{
                    background: isActive ? meta.bg : "#fff",
                    borderColor: isActive ? meta.color + "60" : "#e2e8e4",
                    boxShadow: isActive ? `0 0 0 1.5px ${meta.color}` : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={p.init}
                      color={initialsColor(i)}
                      size={32}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "#111c14" }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-[11px] truncate"
                        style={{ color: "#8fa394" }}
                      >
                        {p.position} · {deptLabel(p.dept)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-[18px] font-black leading-none"
                        style={{ color: meta.color }}
                      >
                        {p.score}
                      </p>
                      <p
                        className="text-[9.5px] font-semibold mt-0.5"
                        style={{ color: meta.color }}
                      >
                        {grade === "Needs Improvement" ? "Needs Work" : grade}
                      </p>
                    </div>
                  </div>
                  {/* Mini metric pills */}
                  <div className="flex gap-1.5 mt-2">
                    {[
                      ["AR", p.arSubmissionRate],
                      ["DTR", p.dtrCompliance],
                      ["Curric", p.curriculumAlignment],
                    ].map(([l, v]) => (
                      <span
                        key={l as string}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{
                          background:
                            v as number >= 80
                              ? "#eaf4ee"
                              : v as number >= 60
                                ? "#fbf1de"
                                : "#fbecec",
                          color:
                            v as number >= 80
                              ? C_GREEN
                              : v as number >= 60
                                ? C_AMBER
                                : C_RED,
                        }}
                      >
                        {l}: {v}%
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right — detail */}
        <ProfDetail p={selectedProf} idx={selIdx} />
      </div>
    </div>
  )
}
