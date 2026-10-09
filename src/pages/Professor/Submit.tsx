import { useState } from "react"
import { useNavigate } from "react-router"
import { PageTitle } from "@/components/ui"
import { useAuth } from "@/app/routes"
import { saveResource } from "@/services/dataSource"

type ColumnDef = {
  id: string
  label: string
}

type RowData = {
  id: string
  [key: string]: string | number
}

type CourseBlock = {
  id: string
  title: string
  datesHeld: string
  columns: ColumnDef[]
  rows: RowData[]
}

/* ─── Shared Label ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[10.5px] font-bold uppercase tracking-widest mb-1.5"
      style={{ color: "#8fa394" }}
    >
      {children}
    </label>
  )
}

/* ─── Section Card ──────────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-2xl border p-6"
      style={{
        borderColor: "#e8eeea",
        boxShadow: "0 1px 4px 0 rgba(0,60,30,0.06), 0 0 0 0 transparent",
      }}
    >
      {children}
    </div>
  )
}

/* ─── Section Header ────────────────────────────────────── */
function SectionHeader({
  num,
  title,
  subtitle,
  extra,
  actions,
}: {
  num: string
  title: string
  subtitle?: string
  extra?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {/* Badge */}
        <div
          className="w-8 h-8 rounded-xl text-white font-black flex items-center justify-center text-[11px] tracking-wide flex-shrink-0 shadow-sm"
          style={{
            background: "linear-gradient(135deg,#009668 0%,#00b87a 100%)",
          }}
        >
          {num}
        </div>

        {/* Divider + Text */}
        <div
          className="h-8 w-px self-stretch"
          style={{ background: "#e8eeea" }}
        />
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-[14.5px] font-bold"
              style={{ color: "#111c14" }}
            >
              {title}
            </h2>
            {extra}
          </div>
          {subtitle && (
            <p className="text-[11.5px] mt-0.5" style={{ color: "#8fa394" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ─── Select / Input base ───────────────────────────────── */
const inputCls =
  "w-full h-11 px-3.5 rounded-xl border text-[13.5px] font-medium outline-none transition-colors bg-[#fafbfa]"
const inputStyle = { borderColor: "#e8eeea", color: "#111c14" }

export default function ProfSubmit() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [recordType, setRecordType] = useState("Accomplishment Report (AR)")
  const [period, setPeriod] = useState("September Cycle 1")
  const [facultyName, setFacultyName] = useState(user.name.toUpperCase())
  const [facultyNumber, setFacultyNumber] = useState("289")
  const [college, setCollege] = useState("COLLEGE OF LIBERAL ARTS AND SCIENCES")

  const [courses, setCourses] = useState<CourseBlock[]>([
    {
      id: "course-1",
      title: "INFORMATION MANAGEMENT",
      datesHeld: "August 17–18, 19–20, 2026",
      columns: [
        { id: "code", label: "CODE" },
        { id: "section", label: "PROGRAM, YEAR & SECTION" },
        { id: "units", label: "UNITS" },
        { id: "days", label: "DAYS" },
        { id: "time", label: "TIME" },
        { id: "campus", label: "CAMPUS" },
      ],
      rows: [
        {
          id: "r1",
          code: "CC 105",
          section: "BSIT 2B",
          units: 5,
          days: "Monday",
          time: "7:00AM–10:00AM / 1:00PM–3:00PM",
          campus: "CONGRESS",
        },
        {
          id: "r2",
          code: "CC 105",
          section: "BSIT 2A",
          units: 5,
          days: "Tuesday",
          time: "1:00PM–6:00PM",
          campus: "CONGRESS",
        },
        {
          id: "r3",
          code: "CC 105",
          section: "BSIS 2-B",
          units: 5,
          days: "Wednesday",
          time: "1:30PM–6:30PM",
          campus: "CONGRESS",
        },
        {
          id: "r4",
          code: "CC 105",
          section: "BSIS 2-A",
          units: 5,
          days: "Thursday",
          time: "1:30PM–6:30PM",
          campus: "CONGRESS",
        },
      ],
    },
  ])

  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [topics, setTopics] = useState(
    "a) Aggregate Functions\nb) Group By, Order By, Desc and Desc",
  )
  const [tasks, setTasks] = useState(
    "a) Aggregate Functions and definitions.\nb) Giving Activities and setting PPT and Learning materials through G-Class.",
  )
  const [notes, setNotes] = useState("")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /* ── Column actions ── */
  const handleAddColumn = (courseId: string) => {
    const colName = prompt("Enter new column name (e.g. ROOM, MODE, REMARKS):")
    if (!colName || !colName.trim()) return
    const newColId = `col_${Date.now()}`
    const newColLabel = colName.trim().toUpperCase()
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        return {
          ...c,
          columns: [...c.columns, { id: newColId, label: newColLabel }],
          rows: c.rows.map((r) => ({ ...r, [newColId]: "" })),
        }
      }),
    )
  }

  const handleUpdateColumnHeader = (
    courseId: string,
    colId: string,
    newLabel: string,
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        return {
          ...c,
          columns: c.columns.map((col) =>
            col.id === colId ? { ...col, label: newLabel.toUpperCase() } : col,
          ),
        }
      }),
    )
  }

  const handleDeleteColumn = (courseId: string, colId: string) => {
    if (!confirm("Delete this column?")) return
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        return { ...c, columns: c.columns.filter((col) => col.id !== colId) }
      }),
    )
  }

  /* ── Row actions ── */
  const handleAddRow = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        const newRowId = `r_${Date.now()}`
        const newRow: RowData = { id: newRowId }
        c.columns.forEach((col) => {
          newRow[col.id] = col.id === "units" ? 3 : ""
        })
        return { ...c, rows: [...c.rows, newRow] }
      }),
    )
  }

  const handleUpdateCell = (
    courseId: string,
    rowId: string,
    colId: string,
    value: string | number,
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        return {
          ...c,
          rows: c.rows.map((r) =>
            r.id === rowId ? { ...r, [colId]: value } : r,
          ),
        }
      }),
    )
  }

  const handleDeleteRow = (courseId: string, rowId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        return { ...c, rows: c.rows.filter((r) => r.id !== rowId) }
      }),
    )
  }

  /* ── Course actions ── */
  const handleAddCourse = () => {
    const newCourse: CourseBlock = {
      id: `course_${Date.now()}`,
      title: `NEW COURSE SUBJECT ${courses.length + 1}`,
      datesHeld: "August 21–22, 2026",
      columns: [
        { id: "code", label: "CODE" },
        { id: "section", label: "PROGRAM, YEAR & SECTION" },
        { id: "units", label: "UNITS" },
        { id: "days", label: "DAYS" },
        { id: "time", label: "TIME" },
        { id: "campus", label: "CAMPUS" },
      ],
      rows: [
        {
          id: `r_${Date.now()}`,
          code: "",
          section: "",
          units: 3,
          days: "",
          time: "",
          campus: "",
        },
      ],
    }
    setCourses([...courses, newCourse])
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    const kind = recordType.startsWith("Accomplishment") ? "AR" : "DTR"
    const reference = `${kind}-${Date.now()}`
    const now = new Date().toLocaleString()
    const record = {
      id: reference,
      type: kind,
      period,
      units: `${courses.length} course${courses.length === 1 ? "" : "s"}`,
      submitted: now,
      status: "Pending",
      event: `${kind} submitted · ${period}`,
      record: {
        period,
        reference,
        facultyName,
        facultyNumber,
        college,
        tables: courses.map((course) => ({
          title: course.title,
          meta: course.datesHeld,
          columns: course.columns.map((column) => column.label),
          rows: course.rows.map((row) => course.columns.map((column) => row[column.id] ?? "")),
        })),
        topics,
        tasks,
        notes,
        attachment: uploadedFile ?? undefined,
        reviewer: "System — Intake",
        reviewedAt: now,
        remark: "Received and queued for review.",
      },
    }
    try {
      await saveResource("/professor/submissions", record)
      navigate("/prof/history")
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "Unable to submit this record.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-28 max-w-[1180px] mx-auto">
      <PageTitle
        title="Submit Record"
        subtitle="File an AR or DTR for the current cycle."
      />
      {submitError && <p role="alert" className="mb-4 text-[13px] text-red-700">{submitError}</p>}

      <form
        id="submit-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* ── SECTION 01: Record Information ── */}
        <SectionCard>
          <SectionHeader
            num="01"
            title="Record Information"
            subtitle="Choose the type of record and the submission period."
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Record Type</FieldLabel>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option>Accomplishment Report (AR)</option>
                <option>Daily Time Record (DTR)</option>
              </select>
            </div>
            <div>
              <FieldLabel>Period</FieldLabel>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option>September Cycle 1</option>
                <option>September Cycle 2</option>
                <option>October Cycle 1</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 02: Faculty Information ── */}
        <SectionCard>
          <SectionHeader
            num="02"
            title="Faculty Information"
            subtitle="Shared information applied to all course entries below."
          />
          <div className="grid grid-cols-[1.6fr_0.55fr_2fr] gap-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className={inputCls + " uppercase"}
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Faculty #</FieldLabel>
              <input
                type="text"
                value={facultyNumber}
                onChange={(e) => setFacultyNumber(e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>College</FieldLabel>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className={inputCls + " uppercase"}
                style={inputStyle}
              >
                <option>COLLEGE OF LIBERAL ARTS AND SCIENCES</option>
                <option>COLLEGE OF COMPUTER STUDIES</option>
                <option>COLLEGE OF ENGINEERING</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 03+: Course Blocks ── */}
        <div className="space-y-4">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border overflow-hidden"
              style={{
                borderColor: "#e8eeea",
                boxShadow:
                  "0 1px 4px 0 rgba(0,60,30,0.06), 0 0 0 0 transparent",
              }}
            >
              {/* Card header bar */}
              <div className="px-6 pt-5 pb-0">
                <SectionHeader
                  num={`0${idx + 3}`}
                  title={`Course ${idx + 1}`}
                  extra={
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => {
                        const v = e.target.value
                        setCourses((prev) =>
                          prev.map((c) =>
                            c.id === course.id ? { ...c, title: v } : c,
                          ),
                        )
                      }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-wide outline-none transition-colors"
                      style={{
                        borderColor: "#009668",
                        color: "#009668",
                        background: "#f0faf5",
                      }}
                    />
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddColumn(course.id)}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border flex items-center gap-1.5 transition-all hover:bg-[#eaf4ee] active:scale-95"
                        style={{
                          borderColor: "#009668",
                          color: "#009668",
                          background: "#ffffff",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          className="w-3.5 h-3.5"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Column
                      </button>

                      {courses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-1.5 rounded-lg border text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          style={{ borderColor: "#f0d8d8" }}
                          title="Remove Course"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-4 h-4"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </>
                  }
                />
              </div>

              {/* Table */}
              <div className="px-6 pb-2">
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "#e8eeea" }}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: "#f3f7f4" }}>
                        {course.columns.map((col) => (
                          <th
                            key={col.id}
                            className="px-3.5 py-3 text-[10px] uppercase font-bold tracking-widest border-b min-w-[110px]"
                            style={{
                              borderColor: "#e8eeea",
                              color: "#6b7f70",
                            }}
                          >
                            <div className="flex items-center justify-between group gap-1">
                              {editingColId === `${course.id}_${col.id}` ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={col.label}
                                  onBlur={() => setEditingColId(null)}
                                  onChange={(e) =>
                                    handleUpdateColumnHeader(
                                      course.id,
                                      col.id,
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && setEditingColId(null)
                                  }
                                  className="bg-white border px-2 py-0.5 rounded-md text-[10px] uppercase font-bold outline-none w-full"
                                  style={{
                                    borderColor: "#009668",
                                    color: "#111c14",
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingColId(`${course.id}_${col.id}`)
                                  }
                                  className="flex items-center gap-1 hover:text-[#009668] transition-colors cursor-pointer text-left"
                                  title="Click to rename column"
                                >
                                  {col.label}
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  >
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                              )}

                              {course.columns.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteColumn(course.id, col.id)
                                  }
                                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                  title="Remove column"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="w-3 h-3"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th
                          className="w-10 px-2 py-3 border-b text-[10px] text-center font-bold tracking-widest uppercase"
                          style={{ borderColor: "#e8eeea", color: "#b6c3ba" }}
                        />
                      </tr>
                    </thead>

                    <tbody>
                      {course.rows.map((row, rowIdx) => (
                        <tr
                          key={row.id}
                          className="group transition-colors"
                          style={{
                            background:
                              rowIdx % 2 === 0 ? "#ffffff" : "#f8fbf9",
                          }}
                        >
                          {course.columns.map((col) => (
                            <td
                              key={col.id}
                              className="px-3.5 py-2.5 border-b text-[12.5px]"
                              style={{
                                borderColor: "#f0f4f1",
                                color: "#111c14",
                              }}
                            >
                              <input
                                type="text"
                                value={row[col.id] ?? ""}
                                onChange={(e) =>
                                  handleUpdateCell(
                                    course.id,
                                    row.id,
                                    col.id,
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent outline-none py-0.5 border-b-2 border-transparent focus:border-[#009668] font-medium transition-colors placeholder:text-gray-300"
                                placeholder="—"
                              />
                            </td>
                          ))}
                          <td
                            className="px-2 py-2.5 border-b text-center"
                            style={{ borderColor: "#f0f4f1" }}
                          >
                            {course.rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteRow(course.id, row.id)
                                }
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                                title="Remove row"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-3.5 h-3.5"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table footer */}
              <div className="px-6 py-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleAddRow(course.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:bg-[#eaf4ee] active:scale-95"
                  style={{ color: "#009668" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="w-3.5 h-3.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Class Row
                </button>

                <div
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: "#8fa394" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-3.5 h-3.5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Classes held:</span>
                  <input
                    type="text"
                    value={course.datesHeld}
                    onChange={(e) => {
                      const v = e.target.value
                      setCourses((prev) =>
                        prev.map((c) =>
                          c.id === course.id ? { ...c, datesHeld: v } : c,
                        ),
                      )
                    }}
                    className="bg-transparent border-b-2 border-dashed outline-none font-semibold transition-colors focus:border-[#009668]"
                    style={{ borderColor: "#c8d5cc", color: "#4a5c4f" }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Course Button */}
          <button
            type="button"
            onClick={handleAddCourse}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed font-bold text-[13px] transition-all flex items-center justify-center gap-2 hover:bg-[#eaf4ee] hover:border-[#009668] active:scale-[0.995]"
            style={{ borderColor: "#a3d9bc", color: "#009668" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="w-4 h-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Course Subject Block
          </button>
        </div>

        {/* ── SECTIONS 04 & 05: Topics & Tasks ── */}
        <div className="grid grid-cols-2 gap-4">
          <SectionCard>
            <SectionHeader
              num="04"
              title="Topics Discussed"
              subtitle="List the specific topics taught this period."
            />
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={5}
              className="w-full p-4 rounded-xl border text-[13px] leading-relaxed outline-none transition-colors resize-none"
              style={{
                borderColor: "#e8eeea",
                color: "#3d4a41",
                background: "#fafbfa",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#009668")}
              onBlur={(e) => (e.target.style.borderColor = "#e8eeea")}
            />
          </SectionCard>

          <SectionCard>
            <SectionHeader
              num="05"
              title="Task / Activity Description"
              subtitle="Describe activities and materials prepared."
            />
            <textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={5}
              className="w-full p-4 rounded-xl border text-[13px] leading-relaxed outline-none transition-colors resize-none"
              style={{
                borderColor: "#e8eeea",
                color: "#3d4a41",
                background: "#fafbfa",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#009668")}
              onBlur={(e) => (e.target.style.borderColor = "#e8eeea")}
            />
          </SectionCard>
        </div>

        {/* ── SECTIONS 06 & 07: Attachment & Notes ── */}
        <div className="grid grid-cols-2 gap-4">
          <SectionCard>
            <SectionHeader
              num="06"
              title="Attachment"
              subtitle="Attach the supporting document for this record."
            />
            <div
              onClick={() =>
                setUploadedFile("Accomplishment_Report_Docs_Sept.pdf")
              }
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (e.dataTransfer.files[0])
                  setUploadedFile(e.dataTransfer.files[0].name)
              }}
              className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all select-none"
              style={{
                borderColor: isDragOver ? "#009668" : "#a3d9bc",
                background: isDragOver
                  ? "#eaf4ee"
                  : uploadedFile
                    ? "#f0faf5"
                    : "#fafbfa",
              }}
            >
              {uploadedFile ? (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#d4f0e4" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#009668"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                  </div>
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: "#009668" }}
                  >
                    {uploadedFile}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>
                    Click to replace
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#eaf4ee" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#009668"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "#3d4a41" }}
                  >
                    Browse or drag a file here
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>
                    PDF · DOC · DOCX · XLS · XLSX · JPG · PNG
                  </p>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              num="07"
              title="Notes"
              subtitle="Optional — for the approving officer's reference."
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Anything HR should know..."
              className="w-full p-4 rounded-xl border text-[13px] leading-relaxed outline-none transition-colors resize-none placeholder:text-gray-300"
              style={{
                borderColor: "#e8eeea",
                color: "#3d4a41",
                background: "#fafbfa",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#009668")}
              onBlur={(e) => (e.target.style.borderColor = "#e8eeea")}
            />
          </SectionCard>
        </div>
      </form>

      {/* ── STICKY FOOTER ── */}
      <div
        className="fixed bottom-0 left-64 right-0 z-30 px-8 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #e8eeea",
          boxShadow: "0 -2px 16px 0 rgba(0,60,30,0.07)",
        }}
      >
        {/* Draft saved */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#009668" }}
          />
          <span
            className="text-[12.5px] font-semibold"
            style={{ color: "#009668" }}
          >
            Draft saved automatically
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/prof")}
            className="px-5 py-2.5 rounded-xl border text-[13px] font-semibold transition-all hover:bg-[#f7f9f8] active:scale-[0.98]"
            style={{ borderColor: "#e8eeea", color: "#5a6b5e" }}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="submit-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-70"
            style={{
              background: isSubmitting
                ? "#5abf97"
                : "linear-gradient(135deg,#009668 0%,#00b87a 100%)",
              boxShadow: "0 2px 8px 0 rgba(0,150,104,0.30)",
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 animate-spin"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0110 10" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Submit AR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
