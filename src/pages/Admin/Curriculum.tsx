import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  StatCard,
  StatGrid,
  initialsColor,
  Modal,
} from "@/components/ui";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

export type College = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  department_count?: number;
  program_count?: number;
  professor_count?: number;
  created_at?: string;
};

export type Department = {
  id: string;
  code: string;
  name: string;
  college_id?: string | null;
  college_name?: string | null;
  description?: string | null;
  is_active: boolean;
  program_count?: number;
  course_count?: number;
  professor_count?: number;
  staff_count?: number;
  created_at?: string;
};

export type Program = {
  id: string;
  code: string;
  name: string;
  department_id?: string | null;
  department_name?: string | null;
  college_id?: string | null;
  college_name?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
};

export type AcademicRank = {
  id: string;
  code?: string | null;
  name: string;
  hierarchy_level: number;
  description?: string | null;
  is_active: boolean;
  professor_count?: number;
  created_at?: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  department_id?: string | null;
  department_name?: string | null;
  units: number;
  description?: string | null;
  is_active: boolean;
  professor_count?: number;
  created_at?: string;
};

export type Professor = {
  id?: string;
  name?: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  email: string;
  dept?: string;
  department?: string | null;
  rank?: string;
  position?: string | null;
  courses?: number;
  active?: boolean;
  is_banned?: boolean;
};

type CurriculumOverview = {
  colleges: College[];
  departments: Department[];
  programs: Program[];
  ranks: AcademicRank[];
  courses: Course[];
  stats: {
    total_colleges: number;
    active_colleges: number;
    total_departments: number;
    active_departments: number;
    total_programs: number;
    active_programs: number;
    total_ranks: number;
    active_ranks: number;
    total_courses: number;
    total_professors: number;
  };
};

type MemberView = Professor & {
  name: string;
  dept: string;
  rank: string;
  active: boolean;
};

type EntityType = "college" | "department" | "program" | "rank" | "course";

const initialOverview: CurriculumOverview = {
  colleges: [
    { id: "1", code: "CLAS", name: "College of Liberal Arts and Sciences", description: "AB Political Science\nBA Communication\nBachelor of Science in Information Technology\nBachelor of Science in Computer Science", is_active: true, department_count: 3, program_count: 10, professor_count: 3 },
    { id: "2", code: "CBA", name: "College of Business and Accountancy", description: "BS Accountancy\nBS Business Administration, Major in Marketing Management\nBS Hospitality Management", is_active: true, department_count: 2, program_count: 9, professor_count: 2 },
    { id: "3", code: "CCJE", name: "College of Criminal Justice Education", description: "Bachelor of Science in Criminology\nBachelor of Science in Industrial Security Management", is_active: true, department_count: 1, program_count: 2, professor_count: 1 },
    { id: "4", code: "CEDUC", name: "College of Education", description: "Bachelor in Secondary Education Major in English\nBachelor of Early Childhood Education", is_active: true, department_count: 1, program_count: 7, professor_count: 1 },
    { id: "5", code: "CENG", name: "College of Engineering", description: "Bachelor of Science in Computer Engineering\nBachelor of Science in Electrical Engineering", is_active: true, department_count: 1, program_count: 4, professor_count: 1 },
  ],
  departments: [
    { id: "1", code: "CSD", name: "Computer Studies Department", college_name: "College of Liberal Arts and Sciences", description: "Computing, Software Engineering, and Information Technology", is_active: true, program_count: 3, professor_count: 2 },
    { id: "2", code: "LANG", name: "Languages & Humanities Department", college_name: "College of Liberal Arts and Sciences", description: "Languages, Literature, and Communication", is_active: true, program_count: 1, professor_count: 1 },
    { id: "3", code: "MATH", name: "Mathematics & Natural Sciences Department", college_name: "College of Liberal Arts and Sciences", description: "Mathematics, Statistics, and Physical Sciences", is_active: true, program_count: 1, professor_count: 1 },
    { id: "4", code: "BA", name: "Business Administration Department", college_name: "College of Business and Accountancy", description: "Business administration and management", is_active: true, program_count: 1, professor_count: 1 },
    { id: "5", code: "ACCT", name: "Accountancy Department", college_name: "College of Business and Accountancy", description: "Professional accountancy and finance", is_active: true, program_count: 1, professor_count: 1 },
  ],
  programs: [
    { id: "1", code: "BSIT", name: "Bachelor of Science in Information Technology", department_name: "Computer Studies Department", college_name: "College of Liberal Arts and Sciences", description: "Four-year undergraduate degree program focusing on information technology, software, and systems.", is_active: true },
    { id: "2", code: "BSCS", name: "Bachelor of Science in Computer Science", department_name: "Computer Studies Department", college_name: "College of Liberal Arts and Sciences", description: "Undergraduate degree in computer science and algorithms.", is_active: true },
    { id: "3", code: "BSIS", name: "Bachelor of Science in Information System", department_name: "Computer Studies Department", college_name: "College of Liberal Arts and Sciences", description: "Undergraduate degree in information systems.", is_active: true },
    { id: "4", code: "BSA", name: "Bachelor of Science in Accountancy", department_name: "Accountancy Department", college_name: "College of Business and Accountancy", description: "Professional degree program in accountancy.", is_active: true },
  ],
  ranks: [
    { id: "1", code: "PROF", name: "Professor", hierarchy_level: 1, description: "Full Professor with academic tenure", is_active: true, professor_count: 3 },
    { id: "2", code: "ASC_PROF", name: "Associate Prof.", hierarchy_level: 2, description: "Associate Professor rank", is_active: true, professor_count: 2 },
    { id: "3", code: "AST_PROF", name: "Assistant Prof.", hierarchy_level: 3, description: "Assistant Professor rank", is_active: true, professor_count: 1 },
    { id: "4", code: "LEC", name: "Lecturer", hierarchy_level: 4, description: "Academic lecturer for undergraduate curriculum", is_active: true, professor_count: 1 },
    { id: "5", code: "ADJ", name: "Adjunct", hierarchy_level: 5, description: "Adjunct / visiting faculty member", is_active: true, professor_count: 1 },
  ],
  courses: [
    { id: "1", code: "CS101", title: "Introduction to Computing", department_name: "Computer Studies Department", units: 3, description: "Fundamental computer concepts and programming logic", is_active: true, professor_count: 2 },
    { id: "2", code: "CS201", title: "Data Structures & Algorithms", department_name: "Computer Studies Department", units: 3, description: "Core algorithmic design and complexity", is_active: true, professor_count: 2 },
    { id: "3", code: "ENG101", title: "Engineering Mechanics", department_name: "Engineering Department", units: 3, description: "Statics and dynamics principles", is_active: true, professor_count: 2 },
    { id: "4", code: "BUS101", title: "Principles of Management", department_name: "Business Administration Department", units: 3, description: "Organizational behavior and modern management", is_active: true, professor_count: 2 },
    { id: "5", code: "SCI101", title: "Applied Physics", department_name: "Mathematics & Natural Sciences Department", units: 3, description: "Classical mechanics and laboratory applications", is_active: true, professor_count: 1 },
  ],
  stats: {
    total_colleges: 5,
    active_colleges: 5,
    total_departments: 5,
    active_departments: 5,
    total_programs: 4,
    active_programs: 4,
    total_ranks: 5,
    active_ranks: 5,
    total_courses: 5,
    total_professors: 8,
  },
};

const defaultProfessors: Professor[] = [
  { name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", dept: "Computer Studies Department", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", dept: "Computer Studies Department", rank: "Associate Prof.", courses: 3, active: true },
  { name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", dept: "Business Administration Department", rank: "Professor", courses: 5, active: true },
  { name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", dept: "Mathematics & Natural Sciences Department", rank: "Assistant Prof.", courses: 2, active: false },
  { name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", dept: "Languages & Humanities Department", rank: "Lecturer", courses: 3, active: true },
  { name: "Dr. Nestor Villar", email: "n.villar@aris.edu.ph", dept: "Engineering Department", rank: "Adjunct", courses: 1, active: false },
  { name: "Dr. Sofia Mendoza", email: "s.mendoza@aris.edu.ph", dept: "Computer Studies Department", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Daniel Ong", email: "d.ong@aris.edu.ph", dept: "Accountancy Department", rank: "Associate Prof.", courses: 3, active: false },
];

/* ------------------------------------------------------------------ */
/* Chart tooltips                                                      */
/* ------------------------------------------------------------------ */

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#e2e8e4] p-3 text-[12px] space-y-1">
        <p className="font-bold text-[#111c14] border-b border-[#eef1ef] pb-1">
          {data.name} ({label})
        </p>
        <p className="text-[#2f7043] flex items-center justify-between gap-4">
          <span>Departments:</span>
          <span className="font-semibold">{data.departments}</span>
        </p>
        <p className="text-[#2b6ca3] flex items-center justify-between gap-4">
          <span>Programs:</span>
          <span className="font-semibold">{data.programs}</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#e2e8e4] p-2.5 text-[12px]">
        <p className="font-bold text-[#111c14]">{data.name}</p>
        <p className="text-[#5a6b5e] mt-0.5">
          Tier #{data.level} • <span className="font-semibold text-[#111c14]">{data.value} faculty</span>
        </p>
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Members modal pieces                                                */
/* ------------------------------------------------------------------ */

function MemberRow({
  p, colorIndex, chip, chipClass, subtitle,
}: {
  p: MemberView;
  colorIndex: number;
  chip: string;
  chipClass: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-[#eef1ef] bg-white p-3 transition-colors hover:bg-[#fafbfa]">
      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <Avatar
          initials={p.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase() || "PR"}
          color={initialsColor(colorIndex)}
          size={38}
        />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-[#111c14]">{p.name}</p>
          <p className="truncate text-[12px] text-[#8fa394]">{subtitle ?? p.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`max-w-full truncate rounded-lg px-2.5 py-1 text-[12px] font-medium ${chipClass}`}>
          {chip}
        </span>
        <Badge tone={p.active ? "green" : "gray"} dot>
          {p.active ? "Active" : "Deactivated"}
        </Badge>
      </div>
    </div>
  );
}

function MembersFooter({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="flex w-fit flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-center text-[12px] text-[#8fa394] sm:text-left">{text}</span>
      <GhostButton onClick={onClose}>Close</GhostButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row action menu                                                     */
/* ------------------------------------------------------------------ */

type MenuItem = { label: string; onClick: () => void; danger?: boolean };

function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos, close]);

  const toggle = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (pos) {
      close();
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = items.length * 36 + 8;
    const right = Math.max(8, window.innerWidth - rect.right);
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight && rect.top > menuHeight + 8;
    setPos(
      openUp
        ? { bottom: window.innerHeight - rect.top + 4, right }
        : { top: rect.bottom + 4, right },
    );
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(pos)}
        onClick={toggle}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0] active:bg-[#e8ece9]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[60] min-w-40 rounded-lg border bg-white p-1 shadow-lg"
            style={{ borderColor: "#e2e8e4", top: pos.top, bottom: pos.bottom, right: pos.right }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  item.onClick();
                }}
                className={`block h-9 w-full rounded-md px-3 text-left text-[12.5px] ${
                  item.danger ? "text-red-700 hover:bg-[#fbecec]" : "text-[#111c14] hover:bg-[#f4f6f5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Responsive data table                                               */
/* ------------------------------------------------------------------ */

type TableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  maxWidth?: number;
  minWidth?: number;
};

function DataTable<T extends { id: string }>({
  rows,
  primaryHeader,
  renderPrimary,
  columns,
  getMenu,
  menuLabel,
  rowLabel,
  onRowClick,
  mobileMeta,
  emptyText,
}: {
  rows: T[];
  primaryHeader: string;
  renderPrimary: (row: T, index: number) => ReactNode;
  columns: TableColumn<T>[];
  getMenu: (row: T) => MenuItem[];
  menuLabel: (row: T) => string;
  rowLabel: (row: T) => string;
  onRowClick: (row: T) => void;
  mobileMeta?: (row: T) => ReactNode;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <th className="w-full whitespace-nowrap py-2.5 pl-5 pr-4 font-semibold">{primaryHeader}</th>
              {columns.map((c) => (
                <th key={c.header} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {c.header}
                </th>
              ))}
              <th className="whitespace-nowrap py-2.5 pl-4 pr-5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className="cursor-pointer border-t transition-colors hover:bg-[#fafbfa]"
                style={{ borderColor: "#f2f4f2" }}
              >
                <td className="min-w-[240px] py-3 pl-5 pr-4 align-middle">
                  <button
                    type="button"
                    aria-label={rowLabel(row)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(row);
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    {renderPrimary(row, i)}
                  </button>
                </td>

                {columns.map((c) => (
                  <td key={c.header} className="px-4 py-3 align-middle text-[13px]" style={{ color: "#3d4a41" }}>
                    {c.maxWidth ? (
                      <div
                        className="whitespace-normal break-words"
                        style={{ maxWidth: c.maxWidth, minWidth: c.minWidth }}
                      >
                        {c.cell(row)}
                      </div>
                    ) : (
                      <div className="whitespace-nowrap">{c.cell(row)}</div>
                    )}
                  </td>
                ))}

                <td className="whitespace-nowrap py-3 pl-4 pr-5 text-right align-middle">
                  <RowMenu label={menuLabel(row)} items={getMenu(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y lg:hidden" style={{ borderColor: "#f2f4f2" }}>
        {rows.map((row, i) => (
          <div
            key={row.id}
            onClick={() => onRowClick(row)}
            className="flex items-center justify-between gap-3 p-3 transition-colors active:bg-[#fafbfa]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {renderPrimary(row, i)}
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {mobileMeta && mobileMeta(row)}
              <RowMenu label={menuLabel(row)} items={getMenu(row)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: active ? BRAND : "#b6c3ba" }}
      aria-label={active ? "Active" : "Deactivated"}
    />
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "green" : "gray"} dot>
      {active ? "Active" : "Deactivated"}
    </Badge>
  );
}

function PrimaryText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[13.5px] font-medium" style={{ color: "#111c14" }}>
        {title}
      </p>
      {subtitle && (
        <p className="truncate text-[11.5px]" style={{ color: "#8fa394" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function UsersState({ total, active }: { total: number; active: number }) {
  return (
    <div>
      <span className="font-medium" style={{ color: "#111c14" }}>
        {total}
      </span>
      <span className="text-[11px] block text-[#8fa394]">
        {active} active
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Curriculum() {
  const { data: rawOverview, reload } = useResource<CurriculumOverview>("/curriculum", initialOverview);
  const { data: rawProfessors } = useResource<Professor[]>("/professors", defaultProfessors);

  const [overview, setOverview] = useState<CurriculumOverview>(initialOverview);

  useEffect(() => {
    if (rawOverview) {
      setOverview({
        colleges: Array.isArray(rawOverview.colleges) ? rawOverview.colleges : initialOverview.colleges,
        departments: Array.isArray(rawOverview.departments) ? rawOverview.departments : initialOverview.departments,
        programs: Array.isArray(rawOverview.programs) ? rawOverview.programs : initialOverview.programs,
        ranks: Array.isArray(rawOverview.ranks) ? rawOverview.ranks : initialOverview.ranks,
        courses: Array.isArray(rawOverview.courses) ? rawOverview.courses : initialOverview.courses,
        stats: rawOverview.stats ?? initialOverview.stats,
      });
    }
  }, [rawOverview]);

  const professors = useMemo(() => {
    const list = Array.isArray(rawProfessors) && rawProfessors.length > 0 ? rawProfessors : defaultProfessors;
    return list.map((p) => ({
      ...p,
      name: p.name ?? ([p.firstname, p.middlename, p.lastname].filter(Boolean).join(" ") || "Unknown professor"),
      dept: p.dept ?? p.department ?? "Unassigned",
      rank: p.rank ?? p.position ?? "Professor",
      active: p.active ?? !p.is_banned,
    }));
  }, [rawProfessors]);

  const [activeTab, setActiveTab] = useState<"Colleges" | "Departments" | "Programs" | "Academic Ranks" | "Courses">("Colleges");
  const [tab, setTab] = useState<"All" | "Active" | "Deactivated">("All");
  const [search, setSearch] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  // Row Click Members / Offerings Modals
  const [viewCollegePrograms, setViewCollegePrograms] = useState<College | null>(null);
  const [viewDeptPrograms, setViewDeptPrograms] = useState<Department | null>(null);
  const [viewRankMembers, setViewRankMembers] = useState<AcademicRank | null>(null);
  const [viewCourseMembers, setViewCourseMembers] = useState<Course | null>(null);

  // College Modal State (Edit / Add)
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeDesc, setCollegeDesc] = useState("");
  const [collegeActive, setCollegeActive] = useState(true);

  // Department Modal State (Edit / Add)
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptCollegeName, setDeptCollegeName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptActive, setDeptActive] = useState(true);

  // Program Modal State (Edit / Add)
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [programDeptName, setProgramDeptName] = useState("");
  const [programCollegeName, setProgramCollegeName] = useState("");
  const [programDesc, setProgramDesc] = useState("");
  const [programActive, setProgramActive] = useState(true);

  // Rank Modal State (Edit / Add)
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<AcademicRank | null>(null);
  const [rankName, setRankName] = useState("");
  const [rankCode, setRankCode] = useState("");
  const [rankLevel, setRankLevel] = useState(1);
  const [rankDesc, setRankDesc] = useState("");
  const [rankActive, setRankActive] = useState(true);

  // Course Modal State (Edit / Add)
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDept, setCourseDept] = useState("");
  const [courseUnits, setCourseUnits] = useState(3);
  const [courseDesc, setCourseDesc] = useState("");
  const [courseActive, setCourseActive] = useState(true);

  // Toggle Confirm Modal
  const [pendingToggle, setPendingToggle] = useState<{
    type: EntityType;
    id: string;
    name: string;
    active: boolean;
  } | null>(null);

  // Delete Confirm Modal
  const [pendingDelete, setPendingDelete] = useState<{
    type: EntityType;
    id: string;
    name: string;
    count?: number;
  } | null>(null);

  // Feedback notifications
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Extract all assigned academic programs / degree offerings for a college
  const getCollegePrograms = useCallback((col: College) => {
    const fromDesc = (col.description || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => Boolean(l) && !l.includes("|"));
    const fromProgTable = overview.programs
      .filter((p) => (p.college_name || "").toLowerCase().trim() === col.name.toLowerCase().trim() || p.college_id === col.id)
      .map((p) => p.name);
    return [...new Set([...fromDesc, ...fromProgTable])];
  }, [overview.programs]);

  // Extract all assigned academic programs / degree offerings for a department
  const getDeptPrograms = useCallback((dept: Department) => {
    const fromDesc = (dept.description || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => Boolean(l) && !l.includes("|"));
    const fromProgTable = overview.programs
      .filter((p) => (p.department_name || "").toLowerCase().trim() === dept.name.toLowerCase().trim() || p.department_id === dept.id)
      .map((p) => p.name);
    return [...new Set([...fromDesc, ...fromProgTable])];
  }, [overview.programs]);

  // Helper functions to get users/professors for ranks, courses
  const getDeptMembers = (dept: Department) => {
    const targetName = dept.name.toLowerCase().trim();
    const targetCode = (dept.code || "").toLowerCase().trim();
    return professors.filter((p) => {
      const d = (p.dept || "").toLowerCase().trim();
      return d === targetName || (targetCode && d === targetCode);
    });
  };

  const getRankMembers = (rank: AcademicRank) => {
    const targetRank = rank.name.toLowerCase().trim();
    const targetCode = (rank.code || "").toLowerCase().trim();
    return professors.filter((p) => {
      const r = (p.rank || "").toLowerCase().trim();
      return r === targetRank || (targetCode && r === targetCode);
    });
  };

  const getCourseMembers = (course: Course) => {
    const targetDept = (course.department_name || "").toLowerCase().trim();
    return professors.filter((p) => {
      const d = (p.dept || "").toLowerCase().trim();
      return targetDept ? d === targetDept : false;
    });
  };

  const countsFor = (members: MemberView[], fallbackTotal: number, isActive: boolean) => {
    const total = members.length > 0 ? members.length : fallbackTotal;
    const active = members.length > 0 ? members.filter((m) => m.active).length : isActive ? total : 0;
    return { total, active };
  };

  // Members lists filtered for detail modals
  const rankMembersList = useMemo(
    () => (viewRankMembers ? getRankMembers(viewRankMembers) : []),
    [viewRankMembers, professors],
  );
  const courseMembersList = useMemo(
    () => (viewCourseMembers ? getCourseMembers(viewCourseMembers) : []),
    [viewCourseMembers, professors],
  );

  // --- College Actions ---
  const openAddCollege = () => {
    setEditingCollege(null);
    setCollegeCode("");
    setCollegeName("");
    setCollegeDesc("");
    setCollegeActive(true);
    setSaveError(null);
    setCollegeModalOpen(true);
  };

  const openEditCollege = (col: College) => {
    setEditingCollege(col);
    setCollegeCode(col.code);
    setCollegeName(col.name);
    setCollegeDesc(col.description || "");
    setCollegeActive(col.is_active);
    setSaveError(null);
    setCollegeModalOpen(true);
  };

  const handleSaveCollege = async () => {
    if (!collegeCode.trim() || !collegeName.trim()) {
      setSaveError("College Code and College Name are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editingCollege) {
        const updated = await saveResource<College>(
          `/curriculum/colleges/${editingCollege.id}`,
          {
            code: collegeCode.trim().toUpperCase(),
            name: collegeName.trim(),
            description: collegeDesc.trim() || null,
            is_active: collegeActive,
          },
          "PATCH",
        );
        setOverview({
          ...overview,
          colleges: overview.colleges.map((c) => (c.id === editingCollege.id ? { ...c, ...updated } : c)),
        });
      } else {
        const created = await saveResource<College>(
          "/curriculum/colleges",
          {
            code: collegeCode.trim().toUpperCase(),
            name: collegeName.trim(),
            description: collegeDesc.trim() || null,
            is_active: collegeActive,
          },
          "POST",
        );
        setOverview({
          ...overview,
          colleges: [...overview.colleges, created],
          stats: {
            ...overview.stats,
            total_colleges: (overview.stats.total_colleges || overview.colleges.length) + 1,
            active_colleges: collegeActive ? (overview.stats.active_colleges || 0) + 1 : overview.stats.active_colleges,
          },
        });
      }
      setCollegeModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save college.");
    } finally {
      setSaving(false);
    }
  };

  // --- Department Actions ---
  const openAddDept = () => {
    setEditingDept(null);
    setDeptCode("");
    setDeptName("");
    setDeptCollegeName(overview.colleges[0]?.name || "");
    setDeptDesc("");
    setDeptActive(true);
    setSaveError(null);
    setDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptCode(dept.code);
    setDeptName(dept.name);
    setDeptCollegeName(dept.college_name || overview.colleges[0]?.name || "");
    setDeptDesc(dept.description || "");
    setDeptActive(dept.is_active);
    setSaveError(null);
    setDeptModalOpen(true);
  };

  const handleSaveDept = async () => {
    if (!deptCode.trim() || !deptName.trim()) {
      setSaveError("Department Code and Department Name are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editingDept) {
        const updated = await saveResource<Department>(
          `/curriculum/departments/${editingDept.id}`,
          {
            code: deptCode.trim().toUpperCase(),
            name: deptName.trim(),
            college_name: deptCollegeName.trim() || null,
            description: deptDesc.trim() || null,
            is_active: deptActive,
          },
          "PATCH",
        );
        setOverview({
          ...overview,
          departments: overview.departments.map((d) => (d.id === editingDept.id ? { ...d, ...updated } : d)),
        });
      } else {
        const created = await saveResource<Department>(
          "/curriculum/departments",
          {
            code: deptCode.trim().toUpperCase(),
            name: deptName.trim(),
            college_name: deptCollegeName.trim() || null,
            description: deptDesc.trim() || null,
            is_active: deptActive,
          },
          "POST",
        );
        setOverview({
          ...overview,
          departments: [...overview.departments, created],
          stats: {
            ...overview.stats,
            total_departments: overview.stats.total_departments + 1,
            active_departments: deptActive ? overview.stats.active_departments + 1 : overview.stats.active_departments,
          },
        });
      }
      setDeptModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save department.");
    } finally {
      setSaving(false);
    }
  };

  // --- Program Actions ---
  const openAddProgram = () => {
    setEditingProgram(null);
    setProgramCode("");
    setProgramName("");
    setProgramDeptName(overview.departments[0]?.name || "");
    setProgramCollegeName(overview.departments[0]?.college_name || overview.colleges[0]?.name || "");
    setProgramDesc("");
    setProgramActive(true);
    setSaveError(null);
    setProgramModalOpen(true);
  };

  const openEditProgram = (prog: Program) => {
    setEditingProgram(prog);
    setProgramCode(prog.code);
    setProgramName(prog.name);
    setProgramDeptName(prog.department_name || overview.departments[0]?.name || "");
    setProgramCollegeName(prog.college_name || overview.colleges[0]?.name || "");
    setProgramDesc(prog.description || "");
    setProgramActive(prog.is_active);
    setSaveError(null);
    setProgramModalOpen(true);
  };

  const handleSaveProgram = async () => {
    if (!programCode.trim() || !programName.trim()) {
      setSaveError("Program Code and Program Name are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editingProgram) {
        const updated = await saveResource<Program>(
          `/curriculum/programs/${editingProgram.id}`,
          {
            code: programCode.trim().toUpperCase(),
            name: programName.trim(),
            department_name: programDeptName.trim() || null,
            college_name: programCollegeName.trim() || null,
            description: programDesc.trim() || null,
            is_active: programActive,
          },
          "PATCH",
        );
        setOverview({
          ...overview,
          programs: overview.programs.map((p) => (p.id === editingProgram.id ? { ...p, ...updated } : p)),
        });
      } else {
        const created = await saveResource<Program>(
          "/curriculum/programs",
          {
            code: programCode.trim().toUpperCase(),
            name: programName.trim(),
            department_name: programDeptName.trim() || null,
            college_name: programCollegeName.trim() || null,
            description: programDesc.trim() || null,
            is_active: programActive,
          },
          "POST",
        );
        setOverview({
          ...overview,
          programs: [...overview.programs, created],
          stats: {
            ...overview.stats,
            total_programs: (overview.stats.total_programs || overview.programs.length) + 1,
            active_programs: programActive ? (overview.stats.active_programs || 0) + 1 : overview.stats.active_programs,
          },
        });
      }
      setProgramModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save program.");
    } finally {
      setSaving(false);
    }
  };

  // --- Rank Actions ---
  const openAddRank = () => {
    setEditingRank(null);
    setRankName("");
    setRankCode("");
    setRankLevel(overview.ranks.length + 1);
    setRankDesc("");
    setRankActive(true);
    setSaveError(null);
    setRankModalOpen(true);
  };

  const openEditRank = (rank: AcademicRank) => {
    setEditingRank(rank);
    setRankName(rank.name);
    setRankCode(rank.code || "");
    setRankLevel(rank.hierarchy_level);
    setRankDesc(rank.description || "");
    setRankActive(rank.is_active);
    setSaveError(null);
    setRankModalOpen(true);
  };

  const handleSaveRank = async () => {
    if (!rankName.trim()) {
      setSaveError("Academic Rank name is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editingRank) {
        const updated = await saveResource<AcademicRank>(
          `/curriculum/ranks/${editingRank.id}`,
          {
            name: rankName.trim(),
            code: rankCode.trim() || null,
            hierarchy_level: Number(rankLevel),
            description: rankDesc.trim() || null,
            is_active: rankActive,
          },
          "PATCH",
        );
        setOverview({
          ...overview,
          ranks: overview.ranks.map((r) => (r.id === editingRank.id ? { ...r, ...updated } : r)),
        });
      } else {
        const created = await saveResource<AcademicRank>(
          "/curriculum/ranks",
          {
            name: rankName.trim(),
            code: rankCode.trim() || null,
            hierarchy_level: Number(rankLevel),
            description: rankDesc.trim() || null,
            is_active: rankActive,
          },
          "POST",
        );
        setOverview({
          ...overview,
          ranks: [...overview.ranks, created],
          stats: {
            ...overview.stats,
            total_ranks: overview.stats.total_ranks + 1,
            active_ranks: rankActive ? overview.stats.active_ranks + 1 : overview.stats.active_ranks,
          },
        });
      }
      setRankModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save academic rank.");
    } finally {
      setSaving(false);
    }
  };

  // --- Course Actions ---
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseCode("");
    setCourseTitle("");
    setCourseDept(overview.departments[0]?.name || "");
    setCourseUnits(3);
    setCourseDesc("");
    setCourseActive(true);
    setSaveError(null);
    setCourseModalOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.code);
    setCourseTitle(course.title);
    setCourseDept(course.department_name || overview.departments[0]?.name || "");
    setCourseUnits(course.units);
    setCourseDesc(course.description || "");
    setCourseActive(course.is_active);
    setSaveError(null);
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseCode.trim() || !courseTitle.trim()) {
      setSaveError("Course Code and Course Title are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editingCourse) {
        const updated = await saveResource<Course>(
          `/curriculum/courses/${editingCourse.id}`,
          {
            code: courseCode.trim().toUpperCase(),
            title: courseTitle.trim(),
            department_name: courseDept.trim() || null,
            units: Number(courseUnits),
            description: courseDesc.trim() || null,
            is_active: courseActive,
          },
          "PATCH",
        );
        setOverview({
          ...overview,
          courses: overview.courses.map((c) => (c.id === editingCourse.id ? { ...c, ...updated } : c)),
        });
      } else {
        const created = await saveResource<Course>(
          "/curriculum/courses",
          {
            code: courseCode.trim().toUpperCase(),
            title: courseTitle.trim(),
            department_name: courseDept.trim() || null,
            units: Number(courseUnits),
            description: courseDesc.trim() || null,
            is_active: courseActive,
          },
          "POST",
        );
        setOverview({
          ...overview,
          courses: [...overview.courses, created],
          stats: {
            ...overview.stats,
            total_courses: overview.stats.total_courses + 1,
          },
        });
      }
      setCourseModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save course.");
    } finally {
      setSaving(false);
    }
  };

  // --- Toggle Handler ---
  const executeToggle = async (item: { type: EntityType; id: string; active: boolean }) => {
    const nextState = !item.active;
    setPendingToggle(null);
    try {
      if (item.type === "college") {
        await saveResource(`/curriculum/colleges/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          colleges: overview.colleges.map((c) => (c.id === item.id ? { ...c, is_active: nextState } : c)),
          stats: {
            ...overview.stats,
            active_colleges: nextState ? overview.stats.active_colleges + 1 : overview.stats.active_colleges - 1,
          },
        });
      } else if (item.type === "department") {
        await saveResource(`/curriculum/departments/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          departments: overview.departments.map((d) => (d.id === item.id ? { ...d, is_active: nextState } : d)),
          stats: {
            ...overview.stats,
            active_departments: nextState ? overview.stats.active_departments + 1 : overview.stats.active_departments - 1,
          },
        });
      } else if (item.type === "program") {
        await saveResource(`/curriculum/programs/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          programs: overview.programs.map((p) => (p.id === item.id ? { ...p, is_active: nextState } : p)),
          stats: {
            ...overview.stats,
            active_programs: nextState ? (overview.stats.active_programs || 0) + 1 : (overview.stats.active_programs || 1) - 1,
          },
        });
      } else if (item.type === "rank") {
        await saveResource(`/curriculum/ranks/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          ranks: overview.ranks.map((r) => (r.id === item.id ? { ...r, is_active: nextState } : r)),
          stats: {
            ...overview.stats,
            active_ranks: nextState ? overview.stats.active_ranks + 1 : overview.stats.active_ranks - 1,
          },
        });
      } else if (item.type === "course") {
        await saveResource(`/curriculum/courses/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          courses: overview.courses.map((c) => (c.id === item.id ? { ...c, is_active: nextState } : c)),
        });
      }
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to toggle status.");
    }
  };

  // --- Delete Handler ---
  const executeDelete = async (item: { type: EntityType; id: string; name: string }) => {
    setPendingDelete(null);
    try {
      if (item.type === "college") {
        await saveResource(`/curriculum/colleges/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          colleges: overview.colleges.filter((c) => c.id !== item.id),
        });
      } else if (item.type === "department") {
        await saveResource(`/curriculum/departments/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          departments: overview.departments.filter((d) => d.id !== item.id),
        });
      } else if (item.type === "program") {
        await saveResource(`/curriculum/programs/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          programs: overview.programs.filter((p) => p.id !== item.id),
        });
      } else if (item.type === "rank") {
        await saveResource(`/curriculum/ranks/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          ranks: overview.ranks.filter((r) => r.id !== item.id),
        });
      } else if (item.type === "course") {
        await saveResource(`/curriculum/courses/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          courses: overview.courses.filter((c) => c.id !== item.id),
        });
      }
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to delete item.");
    }
  };

  // Filter items
  const filteredColleges = overview.colleges.filter((c) => {
    const matchesTab = tab === "All" || (tab === "Active" ? c.is_active : !c.is_active);
    const matchesSearch = `${c.code} ${c.name} ${c.description || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredDepartments = overview.departments.filter((d) => {
    const matchesTab = tab === "All" || (tab === "Active" ? d.is_active : !d.is_active);
    const matchesSearch = `${d.code} ${d.name} ${d.college_name || ""} ${d.description || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredPrograms = overview.programs.filter((p) => {
    const matchesTab = tab === "All" || (tab === "Active" ? p.is_active : !p.is_active);
    const matchesSearch = `${p.code} ${p.name} ${p.department_name || ""} ${p.college_name || ""} ${p.description || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredRanks = overview.ranks.filter((r) => {
    const matchesTab = tab === "All" || (tab === "Active" ? r.is_active : !r.is_active);
    const matchesSearch = `${r.code || ""} ${r.name} ${r.description || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredCourses = overview.courses.filter((c) => {
    const matchesTab = tab === "All" || (tab === "Active" ? c.is_active : !c.is_active);
    const matchesSearch = `${c.code} ${c.title} ${c.department_name || ""} ${c.description || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Chart datasets: College Capacity shows Departments and Assigned Programs
  const collegeChartData = useMemo(() => {
    return overview.colleges.map((col) => {
      const depts = overview.departments.filter(
        (d) => (d.college_name || "").toLowerCase().trim() === col.name.toLowerCase().trim(),
      ).length;
      const progs = getCollegePrograms(col).length;
      return {
        name: col.name,
        code: col.code,
        departments: depts,
        programs: progs,
      };
    });
  }, [overview.colleges, overview.departments, getCollegePrograms]);

  const rankPalette = [BRAND, "#3f8ecc", "#d99a2b", "#8a63c4", "#c0563a", "#2b9c8a"];
  const rankChartData = useMemo(() => {
    return overview.ranks.map((rank, index) => ({
      name: rank.name,
      code: rank.code || rank.name,
      value: rank.professor_count && rank.professor_count > 0 ? rank.professor_count : (6 - rank.hierarchy_level > 0 ? 6 - rank.hierarchy_level : 1),
      level: rank.hierarchy_level,
      color: rankPalette[index % rankPalette.length],
    }));
  }, [overview.ranks]);

  const totalFacultyCount = useMemo(() => {
    return rankChartData.reduce((acc, r) => acc + r.value, 0);
  }, [rankChartData]);

  const categoryTabs = ["Colleges", "Departments", "Programs", "Academic Ranks", "Courses"];
  const statusTabs = ["All", "Active", "Deactivated"];

  const stats = [
    ["Colleges", String(overview.colleges.length)],
    ["Departments", String(overview.departments.length)],
    ["Academic Programs", String(overview.programs.length)],
    ["Academic Ranks", String(overview.ranks.length)],
    ["Cataloged Courses", String(overview.courses.length)],
  ];

  /* ---------------- Table definitions ---------------- */

  const collegeColumns: TableColumn<College>[] = [
    { header: "Code", cell: (c) => <span className="font-mono font-medium">{c.code}</span> },
    {
      header: "Assigned Programs / Offerings",
      maxWidth: 420,
      minWidth: 260,
      cell: (c) => {
        const progs = getCollegePrograms(c);
        if (progs.length === 0) return <span className="text-[#8fa394]">No programs assigned</span>;
        return (
          <div className="flex flex-wrap gap-1.5 py-1">
            {progs.slice(0, 3).map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-[#eef3ef] px-2 py-0.5 text-[11.5px] font-medium text-[#2f7043]"
              >
                {p}
              </span>
            ))}
            {progs.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-[#f0f2f0] px-1.5 py-0.5 text-[11px] font-medium text-[#5a6b5e]">
                +{progs.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Departments",
      cell: (c) => (
        <span className="font-medium" style={{ color: "#111c14" }}>
          {c.department_count ?? overview.departments.filter((d) => d.college_name === c.name).length}
        </span>
      ),
    },
    {
      header: "Programs Count",
      cell: (c) => (
        <span className="font-medium" style={{ color: "#111c14" }}>
          {getCollegePrograms(c).length}
        </span>
      ),
    },
    { header: "Status", cell: (c) => <StatusBadge active={c.is_active} /> },
  ];

  const deptColumns: TableColumn<Department>[] = [
    { header: "Code", cell: (d) => <span className="font-mono font-medium">{d.code}</span> },
    { header: "College", maxWidth: 220, minWidth: 140, cell: (d) => d.college_name || "Unassigned" },
    {
      header: "Assigned Programs / Offerings",
      maxWidth: 320,
      minWidth: 200,
      cell: (d) => {
        const progs = getDeptPrograms(d);
        if (progs.length === 0) return <span className="text-[#8fa394] text-[12px] italic">None assigned</span>;
        return (
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {progs.slice(0, 2).map((prog, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0f4f1] text-[#2b5a38] border border-[#d8e2da] max-w-[150px] truncate"
                title={prog}
              >
                {prog}
              </span>
            ))}
            {progs.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef1ef] text-[#556359]">
                +{progs.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Programs Count",
      cell: (d) => (
        <span className="font-medium" style={{ color: "#111c14" }}>
          {getDeptPrograms(d).length}
        </span>
      ),
    },
    { header: "Status", cell: (d) => <StatusBadge active={d.is_active} /> },
  ];

  const programColumns: TableColumn<Program>[] = [
    { header: "Code", cell: (p) => <span className="font-mono font-medium">{p.code}</span> },
    { header: "Department", maxWidth: 220, minWidth: 140, cell: (p) => p.department_name || "Unassigned" },
    { header: "College", maxWidth: 220, minWidth: 140, cell: (p) => p.college_name || "Unassigned" },
    { header: "Description", maxWidth: 280, minWidth: 160, cell: (p) => p.description || "—" },
    { header: "Status", cell: (p) => <StatusBadge active={p.is_active} /> },
  ];

  const rankColumns: TableColumn<AcademicRank>[] = [
    { header: "Code", cell: (r) => <span className="font-mono">{r.code || "—"}</span> },
    { header: "Level", cell: (r) => <span className="font-medium" style={{ color: "#111c14" }}>Tier #{r.hierarchy_level}</span> },
    { header: "Description", maxWidth: 360, minWidth: 200, cell: (r) => r.description || "—" },
    {
      header: "Users / State",
      cell: (r) => {
        const { total, active } = countsFor(getRankMembers(r), r.professor_count ?? 0, r.is_active);
        return <UsersState total={total} active={active} />;
      },
    },
    { header: "Status", cell: (r) => <StatusBadge active={r.is_active} /> },
  ];

  const courseColumns: TableColumn<Course>[] = [
    { header: "Code", cell: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { header: "Department", maxWidth: 200, minWidth: 120, cell: (c) => c.department_name || "Unassigned" },
    { header: "Units", cell: (c) => <span className="font-medium" style={{ color: "#111c14" }}>{c.units}</span> },
    { header: "Description", maxWidth: 360, minWidth: 200, cell: (c) => c.description || "—" },
    {
      header: "Users / State",
      cell: (c) => {
        const { total, active } = countsFor(getCourseMembers(c), c.professor_count ?? 0, c.is_active);
        return <UsersState total={total} active={active} />;
      },
    },
    { header: "Status", cell: (c) => <StatusBadge active={c.is_active} /> },
  ];

  return (
    <div className="pb-2">
      <PageTitle
        title="Curriculum Management"
        subtitle={`${overview.colleges.length} colleges, ${overview.departments.length} departments, ${overview.programs.length} programs, and ${overview.courses.length} courses.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GhostButton onClick={reload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </GhostButton>
            {activeTab === "Colleges" && (
              <PrimaryButton onClick={openAddCollege}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add College
              </PrimaryButton>
            )}
            {activeTab === "Departments" && (
              <PrimaryButton onClick={openAddDept}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Department
              </PrimaryButton>
            )}
            {activeTab === "Programs" && (
              <PrimaryButton onClick={openAddProgram}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Program
              </PrimaryButton>
            )}
            {activeTab === "Academic Ranks" && (
              <PrimaryButton onClick={openAddRank}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Rank
              </PrimaryButton>
            )}
            {activeTab === "Courses" && (
              <PrimaryButton onClick={openAddCourse}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Course
              </PrimaryButton>
            )}
          </div>
        }
      />

      {saveError && <p role="alert" className="mb-3 text-[12px] text-red-700">{saveError}</p>}

      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      {/* Mobile-only toggle for the analytics block */}
      <button
        type="button"
        onClick={() => setShowCharts((v) => !v)}
        aria-expanded={showCharts}
        className="mb-3 flex h-10 w-full items-center justify-between rounded-xl border bg-white px-4 text-[13px] font-medium lg:hidden"
        style={{ borderColor: "#e2e8e4", color: "#3d4a41" }}
      >
        {showCharts ? "Hide analytics" : "Show analytics"}
        <span aria-hidden="true">{showCharts ? "▲" : "+"}</span>
      </button>

      {/* --- VISUAL ANALYTICS & GRAPHS --- */}
      <div className={`${showCharts ? "grid" : "hidden"} lg:grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4`}>
        {/* Graph 1: College Capacity & Academic Offerings */}
        <Card className="flex flex-col min-h-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">College Capacity &amp; Academic Offerings</h2>
              <p className="text-[12px] text-[#8fa394]">Departments and assigned degree programs across academic colleges</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND }} /> Departments
              </span>
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3f8ecc" }} /> Programs
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={collegeChartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={{ stroke: "#eef1ef" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="departments" fill={BRAND} radius={[5, 5, 0, 0]} maxBarSize={24} />
                <Bar dataKey="programs" fill="#3f8ecc" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graph 2: Academic Rank Distribution */}
        <Card className="relative z-10 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">Academic Rank Distribution</h2>
              <p className="text-[12px] text-[#8fa394]">Faculty proportion across academic seniority tiers</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-1/2 h-[190px] flex items-center justify-center">
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#111c14] leading-none">{totalFacultyCount}</span>
                <span className="text-[10px] uppercase tracking-wide text-[#8fa394] mt-0.5 font-semibold">Faculty</span>
              </div>

              <div className="relative z-[1] h-full w-full">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Tooltip
                      content={<CustomPieTooltip />}
                      allowEscapeViewBox={{ x: true, y: true }}
                      wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
                    />
                    <Pie data={rankChartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
                      {rankChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 pr-1">
              {rankChartData.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 truncate" style={{ color: "#3d4a41" }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="font-semibold text-[#111c14] ml-2 font-mono">
                    {r.value}{" "}
                    <span className="text-[#8fa394] text-[11px] font-normal">
                      ({totalFacultyCount ? Math.round((r.value / totalFacultyCount) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* --- TABLE CARD --- */}
      <Card className="min-w-0 overflow-hidden p-0">
        <div
          className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:justify-between lg:p-4"
          style={{ borderColor: "#eef1ef" }}
        >
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
            <div className="min-w-0 overflow-x-auto [&_button]:flex-shrink-0 [&_button]:whitespace-nowrap">
              <Tabs
                tabs={categoryTabs}
                value={activeTab}
                onChange={(v) => {
                  setActiveTab(v as any);
                  setSearch("");
                }}
              />
            </div>
            <div className="min-w-0 overflow-x-auto [&_button]:flex-shrink-0 [&_button]:whitespace-nowrap">
              <Tabs tabs={statusTabs} value={tab} onChange={(v) => setTab(v as any)} />
            </div>
          </div>
          <SearchInput
            placeholder={`Search ${activeTab.toLowerCase()}`}
            value={search}
            onChange={setSearch}
            className="w-full lg:w-60"
          />
        </div>

        {/* --- COLLEGES --- */}
        {activeTab === "Colleges" && (
          <DataTable<College>
            rows={filteredColleges}
            primaryHeader="College Title"
            columns={collegeColumns}
            emptyText="No colleges found matching your criteria."
            onRowClick={setViewCollegePrograms}
            rowLabel={(c) => `View assigned programs in ${c.name}`}
            menuLabel={(c) => `Actions for ${c.name}`}
            mobileMeta={(c) => <StatusDot active={c.is_active} />}
            renderPrimary={(col, i) => {
              const assignedPrograms = getCollegePrograms(col);
              return (
                <>
                  <Avatar initials={col.code.slice(0, 2).toUpperCase()} color={initialsColor(i)} />
                  <PrimaryText title={col.name} subtitle={`${col.code} • ${assignedPrograms.length} assigned programs`} />
                </>
              );
            }}
            getMenu={(col) => [
              { label: "View assigned programs", onClick: () => setViewCollegePrograms(col) },
              { label: "Edit details", onClick: () => openEditCollege(col) },
              {
                label: col.is_active ? "Deactivate" : "Reactivate",
                onClick: () => setPendingToggle({ type: "college", id: col.id, name: col.name, active: col.is_active }),
              },
              {
                label: "Delete",
                danger: true,
                onClick: () => setPendingDelete({ type: "college", id: col.id, name: col.name, count: getCollegePrograms(col).length }),
              },
            ]}
          />
        )}

        {/* --- DEPARTMENTS --- */}
        {activeTab === "Departments" && (
          <DataTable<Department>
            rows={filteredDepartments}
            primaryHeader="Department"
            columns={deptColumns}
            emptyText="No departments found matching your criteria."
            onRowClick={setViewDeptPrograms}
            rowLabel={(d) => `View assigned programs in ${d.name}`}
            menuLabel={(d) => `Actions for ${d.name}`}
            mobileMeta={(d) => <StatusDot active={d.is_active} />}
            renderPrimary={(dept, i) => {
              const assignedPrograms = getDeptPrograms(dept);
              return (
                <>
                  <Avatar initials={dept.code.slice(0, 2).toUpperCase()} color={initialsColor(i + 1)} />
                  <PrimaryText
                    title={dept.name}
                    subtitle={`${dept.code} • ${assignedPrograms.length} assigned program${assignedPrograms.length === 1 ? "" : "s"}`}
                  />
                </>
              );
            }}
            getMenu={(dept) => [
              { label: "View assigned programs", onClick: () => setViewDeptPrograms(dept) },
              { label: "Edit details", onClick: () => openEditDept(dept) },
              {
                label: dept.is_active ? "Deactivate" : "Reactivate",
                onClick: () => setPendingToggle({ type: "department", id: dept.id, name: dept.name, active: dept.is_active }),
              },
              {
                label: "Delete",
                danger: true,
                onClick: () => setPendingDelete({ type: "department", id: dept.id, name: dept.name, count: getDeptPrograms(dept).length }),
              },
            ]}
          />
        )}

        {/* --- PROGRAMS --- */}
        {activeTab === "Programs" && (
          <DataTable<Program>
            rows={filteredPrograms}
            primaryHeader="Program Degree"
            columns={programColumns}
            emptyText="No programs found matching your criteria."
            onRowClick={() => {}}
            rowLabel={(p) => `View details for ${p.name}`}
            menuLabel={(p) => `Actions for ${p.name}`}
            mobileMeta={(p) => <StatusDot active={p.is_active} />}
            renderPrimary={(prog, i) => {
              return (
                <>
                  <Avatar initials={prog.code.slice(0, 2).toUpperCase()} color={initialsColor(i + 2)} />
                  <PrimaryText title={prog.name} subtitle={`${prog.code} • ${prog.department_name || prog.college_name || "General"}`} />
                </>
              );
            }}
            getMenu={(prog) => [
              { label: "Edit details", onClick: () => openEditProgram(prog) },
              {
                label: prog.is_active ? "Deactivate" : "Reactivate",
                onClick: () => setPendingToggle({ type: "program", id: prog.id, name: prog.name, active: prog.is_active }),
              },
              {
                label: "Delete",
                danger: true,
                onClick: () => setPendingDelete({ type: "program", id: prog.id, name: prog.name }),
              },
            ]}
          />
        )}

        {/* --- ACADEMIC RANKS --- */}
        {activeTab === "Academic Ranks" && (
          <DataTable<AcademicRank>
            rows={filteredRanks}
            primaryHeader="Rank Title"
            columns={rankColumns}
            emptyText="No academic ranks found matching your criteria."
            onRowClick={setViewRankMembers}
            rowLabel={(r) => `View accounts with rank ${r.name}`}
            menuLabel={(r) => `Actions for ${r.name}`}
            mobileMeta={(r) => <StatusDot active={r.is_active} />}
            renderPrimary={(rank, i) => {
              const { total } = countsFor(getRankMembers(rank), rank.professor_count ?? 0, rank.is_active);
              return (
                <>
                  <Avatar initials={`L${rank.hierarchy_level}`} color={initialsColor(i + 3)} />
                  <PrimaryText title={rank.name} subtitle={`Level ${rank.hierarchy_level} • ${total} faculty`} />
                </>
              );
            }}
            getMenu={(rank) => [
              { label: "View accounts", onClick: () => setViewRankMembers(rank) },
              { label: "Edit details", onClick: () => openEditRank(rank) },
              {
                label: rank.is_active ? "Deactivate" : "Reactivate",
                onClick: () => setPendingToggle({ type: "rank", id: rank.id, name: rank.name, active: rank.is_active }),
              },
              {
                label: "Delete",
                danger: true,
                onClick: () => setPendingDelete({ type: "rank", id: rank.id, name: rank.name, count: rank.professor_count }),
              },
            ]}
          />
        )}

        {/* --- COURSES --- */}
        {activeTab === "Courses" && (
          <DataTable<Course>
            rows={filteredCourses}
            primaryHeader="Course Title"
            columns={courseColumns}
            emptyText="No courses found matching your criteria."
            onRowClick={setViewCourseMembers}
            rowLabel={(c) => `View faculty for ${c.title}`}
            menuLabel={(c) => `Actions for ${c.title}`}
            mobileMeta={(c) => <StatusDot active={c.is_active} />}
            renderPrimary={(course, i) => {
              const { total } = countsFor(getCourseMembers(course), course.professor_count ?? 0, course.is_active);
              return (
                <>
                  <Avatar initials={course.code.slice(0, 2).toUpperCase()} color={initialsColor(i + 4)} />
                  <PrimaryText title={course.title} subtitle={`${course.code} • ${total} faculty`} />
                </>
              );
            }}
            getMenu={(course) => [
              { label: "View faculty", onClick: () => setViewCourseMembers(course) },
              { label: "Edit details", onClick: () => openEditCourse(course) },
              {
                label: course.is_active ? "Deactivate" : "Reactivate",
                onClick: () => setPendingToggle({ type: "course", id: course.id, name: course.title, active: course.is_active }),
              },
              {
                label: "Delete",
                danger: true,
                onClick: () => setPendingDelete({ type: "course", id: course.id, name: course.title }),
              },
            ]}
          />
        )}
      </Card>

      {/* ============================================================== */}
      {/* MODAL: College Assigned Programs List                          */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewCollegePrograms)}
        onClose={() => setViewCollegePrograms(null)}
        title={viewCollegePrograms ? `Assigned Programs • ${viewCollegePrograms.name}` : ""}
        align="left"
        size="lg"
        actions={
          <MembersFooter
            text={`${viewCollegePrograms ? getCollegePrograms(viewCollegePrograms).length : 0} academic program(s) assigned`}
            onClose={() => setViewCollegePrograms(null)}
          />
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Academic degree programs and offerings assigned to <strong>{viewCollegePrograms?.name}</strong> ({viewCollegePrograms?.code}).
          </p>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[380px]">
            {(!viewCollegePrograms || getCollegePrograms(viewCollegePrograms).length === 0) ? (
              <div className="rounded-2xl border border-dashed border-[#e2e8e4] bg-[#fafbfa] py-8 text-center text-[#8fa394]">
                <p className="text-[13px] font-medium text-[#111c14]">No programs assigned yet</p>
                <p className="mt-0.5 text-[12px]">Academic degree programs assigned to this college will appear here.</p>
              </div>
            ) : (
              getCollegePrograms(viewCollegePrograms).map((progName, idx) => {
                const matchedProg = overview.programs.find(
                  (p) => p.name.toLowerCase().trim() === progName.toLowerCase().trim()
                );
                return (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-[#eef1ef] bg-white p-3.5 transition-colors hover:bg-[#fafbfa]"
                  >
                    <div className="flex min-w-[200px] flex-1 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-[12px] font-bold text-white shadow-sm"
                        style={{ background: initialsColor(idx) }}
                      >
                        {matchedProg?.code || progName.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#111c14]">{progName}</p>
                        <p className="text-[12px] text-[#8fa394]">
                          {matchedProg?.department_name
                            ? `Department: ${matchedProg.department_name}`
                            : "College Degree Offering"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="green" dot>
                        Assigned Offering
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Department Assigned Programs List                       */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewDeptPrograms)}
        onClose={() => setViewDeptPrograms(null)}
        title={viewDeptPrograms ? `Assigned Programs • ${viewDeptPrograms.name}` : ""}
        align="left"
        size="lg"
        actions={
          <MembersFooter
            text={`${viewDeptPrograms ? getDeptPrograms(viewDeptPrograms).length : 0} academic program(s) assigned`}
            onClose={() => setViewDeptPrograms(null)}
          />
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Academic degree programs assigned to <strong>{viewDeptPrograms?.name}</strong> ({viewDeptPrograms?.code}).
          </p>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[380px]">
            {(!viewDeptPrograms || getDeptPrograms(viewDeptPrograms).length === 0) ? (
              <div className="rounded-2xl border border-dashed border-[#e2e8e4] bg-[#fafbfa] py-8 text-center text-[#8fa394]">
                <p className="text-[13px] font-medium text-[#111c14]">No programs assigned yet</p>
                <p className="mt-0.5 text-[12px]">Academic degree programs assigned to this department will appear here.</p>
              </div>
            ) : (
              getDeptPrograms(viewDeptPrograms).map((progName, idx) => {
                const matchedProg = overview.programs.find(
                  (p) => p.name.toLowerCase().trim() === progName.toLowerCase().trim()
                );
                return (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-[#eef1ef] bg-white p-3.5 transition-colors hover:bg-[#fafbfa]"
                  >
                    <div className="flex min-w-[200px] flex-1 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-[12px] font-bold text-white shadow-sm"
                        style={{ background: initialsColor(idx + 1) }}
                      >
                        {matchedProg?.code || progName.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#111c14]">{progName}</p>
                        <p className="text-[12px] text-[#8fa394]">
                          {matchedProg?.college_name
                            ? `College: ${matchedProg.college_name}`
                            : viewDeptPrograms.college_name
                            ? `College: ${viewDeptPrograms.college_name}`
                            : "Department Degree Offering"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="green" dot>
                        Assigned Program
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Academic Rank Accounts List                             */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewRankMembers)}
        onClose={() => setViewRankMembers(null)}
        title={viewRankMembers ? `Faculty with Rank: ${viewRankMembers.name}` : ""}
        align="left"
        size="lg"
        actions={
          <MembersFooter
            text={`${rankMembersList.length} faculty member(s) holding this rank`}
            onClose={() => setViewRankMembers(null)}
          />
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Faculty holding <strong>{viewRankMembers?.name}</strong> (Tier #{viewRankMembers?.hierarchy_level}).
            {viewRankMembers?.description ? ` ${viewRankMembers.description}` : ""}
          </p>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[380px]">
            {rankMembersList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e2e8e4] bg-[#fafbfa] py-8 text-center text-[#8fa394]">
                <p className="text-[13px] font-medium text-[#111c14]">No faculty holding this rank yet</p>
                <p className="mt-0.5 text-[12px]">Faculty with this rank will appear here.</p>
              </div>
            ) : (
              rankMembersList.map((p, idx) => (
                <MemberRow
                  key={p.email || p.id || idx}
                  p={p}
                  colorIndex={idx + 2}
                  chip={p.dept}
                  chipClass="bg-[#eef3ef] text-[#2f7043]"
                />
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Course Faculty Members List                             */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewCourseMembers)}
        onClose={() => setViewCourseMembers(null)}
        title={viewCourseMembers ? `Course: ${viewCourseMembers.code} - ${viewCourseMembers.title}` : ""}
        align="left"
        size="lg"
        actions={
          <MembersFooter
            text={`${courseMembersList.length} faculty member(s) eligible / assigned`}
            onClose={() => setViewCourseMembers(null)}
          />
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Faculty for <strong>{viewCourseMembers?.code} - {viewCourseMembers?.title}</strong> ({viewCourseMembers?.units} units • {viewCourseMembers?.department_name || "General Department"}).
            {viewCourseMembers?.description ? ` ${viewCourseMembers.description}` : ""}
          </p>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[380px]">
            {courseMembersList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e2e8e4] bg-[#fafbfa] py-8 text-center text-[#8fa394]">
                <p className="text-[13px] font-medium text-[#111c14]">No faculty assigned yet</p>
                <p className="mt-0.5 text-[12px]">Faculty teaching or assigned to this course will appear here.</p>
              </div>
            ) : (
              courseMembersList.map((p, idx) => (
                <MemberRow
                  key={p.email || p.id || idx}
                  p={p}
                  colorIndex={idx + 3}
                  chip={p.rank}
                  chipClass="bg-[#f0f2f0] text-[#3d4a41]"
                  subtitle={`${p.email} • ${p.dept}`}
                />
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: College Add/Edit                                        */}
      {/* ============================================================== */}
      <Modal
        isOpen={collegeModalOpen}
        onClose={() => setCollegeModalOpen(false)}
        title={editingCollege ? "Edit College" : "Add College"}
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setCollegeModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSaveCollege}>
              {saving ? "Saving..." : editingCollege ? "Save Changes" : "Create College"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              College Code <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. CLAS, CBA, CENG"
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] uppercase font-mono outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              College Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. College of Liberal Arts and Sciences"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Assigned Academic Programs / Offerings
            </label>
            <textarea
              placeholder={"e.g.\nBS Accountancy\nBS Business Administration, Major in Marketing Management\nBS Hospitality Management"}
              value={collegeDesc}
              onChange={(e) => setCollegeDesc(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none font-sans"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
            <p className="text-[11.5px] text-[#8fa394] mt-1">
              List the academic degree programs assigned to this college (e.g. BS Accountancy), one per line.
            </p>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Department Add/Edit                                     */}
      {/* ============================================================== */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add Department"}
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setDeptModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSaveDept}>
              {saving ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. CSD, LANG, MATH"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] uppercase font-mono outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. Computer Studies Department"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>College</label>
            <select
              value={deptCollegeName}
              onChange={(e) => setDeptCollegeName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-[13.5px] bg-white outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            >
              <option value="">None / Unassigned</option>
              {overview.colleges.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name} ({col.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Assigned Academic Programs / Offerings
            </label>
            <textarea
              placeholder={"e.g.\nBachelor of Science in Information Technology\nBachelor of Science in Computer Science"}
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none font-sans"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
            <p className="text-[11.5px] text-[#8fa394] mt-1">
              List the academic degree programs assigned to this department, one per line.
            </p>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Program Add/Edit                                        */}
      {/* ============================================================== */}
      <Modal
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        title={editingProgram ? "Edit Academic Program" : "Add Academic Program"}
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setProgramModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSaveProgram}>
              {saving ? "Saving..." : editingProgram ? "Save Changes" : "Create Program"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Program Code <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. BSIT, BSCS, BSA"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] uppercase font-mono outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Program Name / Degree <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. Bachelor of Science in Information Technology"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Department</label>
              <select
                value={programDeptName}
                onChange={(e) => {
                  const dName = e.target.value;
                  setProgramDeptName(dName);
                  const foundDept = overview.departments.find((d) => d.name === dName);
                  if (foundDept && foundDept.college_name) {
                    setProgramCollegeName(foundDept.college_name);
                  }
                }}
                className="w-full h-10 px-2.5 rounded-xl border text-[13px] bg-white outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="">None / Unassigned</option>
                {overview.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>College</label>
              <select
                value={programCollegeName}
                onChange={(e) => setProgramCollegeName(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl border text-[13px] bg-white outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="">None / Unassigned</option>
                {overview.colleges.map((col) => (
                  <option key={col.id} value={col.name}>
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Description</label>
            <textarea
              placeholder="Program degree scope, curriculum objectives..."
              value={programDesc}
              onChange={(e) => setProgramDesc(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Rank Add/Edit                                           */}
      {/* ============================================================== */}
      <Modal
        isOpen={rankModalOpen}
        onClose={() => setRankModalOpen(false)}
        title={editingRank ? "Edit Academic Rank" : "Add Academic Rank"}
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setRankModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSaveRank}>
              {saving ? "Saving..." : editingRank ? "Save Changes" : "Create Rank"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Rank Title <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="e.g. Senior Lecturer, Associate Prof."
              value={rankName}
              onChange={(e) => setRankName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Code / Abbr</label>
              <input
                placeholder="e.g. PROF, LEC"
                value={rankCode}
                onChange={(e) => setRankCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] font-mono outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Hierarchy Level</label>
              <input
                type="number"
                min={1}
                max={20}
                value={rankLevel}
                onChange={(e) => setRankLevel(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Description</label>
            <textarea
              placeholder="Qualifications, teaching criteria..."
              value={rankDesc}
              onChange={(e) => setRankDesc(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: Course Add/Edit                                         */}
      {/* ============================================================== */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? "Edit Course" : "Add Course"}
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setCourseModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSaveCourse}>
              {saving ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
                Code <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="e.g. CS101"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-xl border text-[13px] font-mono outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="e.g. Operating Systems"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Department</label>
              <select
                value={courseDept}
                onChange={(e) => setCourseDept(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl border text-[13px] bg-white outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="">General / None</option>
                {overview.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Units</label>
              <input
                type="number"
                min={1}
                max={12}
                value={courseUnits}
                onChange={(e) => setCourseUnits(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Description</label>
            <textarea
              placeholder="Syllabus scope and prerequisites..."
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border text-[13px] outline-none focus:border-[#3a7d4e] resize-none"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>
        </div>
      </Modal>

      {/* CONFIRM TOGGLE MODAL */}
      <Modal
        isOpen={Boolean(pendingToggle)}
        onClose={() => setPendingToggle(null)}
        title={pendingToggle?.active ? `Deactivate ${pendingToggle?.type}?` : `Reactivate ${pendingToggle?.type}?`}
        actions={
          <>
            <GhostButton onClick={() => setPendingToggle(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={() => pendingToggle && void executeToggle(pendingToggle)}>
              {pendingToggle?.active ? "Deactivate" : "Reactivate"}
            </PrimaryButton>
          </>
        }
      >
        {pendingToggle && (
          <>Are you sure you want to {pendingToggle.active ? "deactivate" : "reactivate"} {pendingToggle.name}?</>
        )}
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title={`Delete ${pendingDelete?.type}?`}
        actions={
          <>
            <GhostButton onClick={() => setPendingDelete(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={() => pendingDelete && void executeDelete(pendingDelete)}>
              Delete
            </PrimaryButton>
          </>
        }
      >
        {pendingDelete && (
          <>Are you sure you want to permanently delete {pendingDelete.name}? This action cannot be undone.</>
        )}
      </Modal>
    </div>
  );
}
