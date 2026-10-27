import { useState, useMemo } from "react";
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

export type Department = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  professor_count?: number;
  staff_count?: number;
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
  departments: Department[];
  ranks: AcademicRank[];
  courses: Course[];
  stats: {
    total_departments: number;
    active_departments: number;
    total_ranks: number;
    active_ranks: number;
    total_courses: number;
    total_professors: number;
  };
};

const initialOverview: CurriculumOverview = {
  departments: [
    { id: "1", code: "ENG", name: "Engineering", description: "Engineering and technology disciplines", is_active: true, professor_count: 2 },
    { id: "2", code: "CS", name: "Computer Science", description: "Computing and software engineering", is_active: true, professor_count: 2 },
    { id: "3", code: "BUS", name: "Business", description: "Business administration and management", is_active: true, professor_count: 2 },
    { id: "4", code: "SCI", name: "Sciences", description: "Natural and applied sciences", is_active: true, professor_count: 1 },
    { id: "5", code: "HUM", name: "Arts & Humanities", description: "Liberal arts and communication", is_active: true, professor_count: 1 },
  ],
  ranks: [
    { id: "1", code: "PROF", name: "Professor", hierarchy_level: 1, description: "Full Professor with academic tenure", is_active: true, professor_count: 3 },
    { id: "2", code: "ASC_PROF", name: "Associate Prof.", hierarchy_level: 2, description: "Associate Professor rank", is_active: true, professor_count: 2 },
    { id: "3", code: "AST_PROF", name: "Assistant Prof.", hierarchy_level: 3, description: "Assistant Professor rank", is_active: true, professor_count: 1 },
    { id: "4", code: "LEC", name: "Lecturer", hierarchy_level: 4, description: "Academic lecturer for undergraduate curriculum", is_active: true, professor_count: 1 },
    { id: "5", code: "ADJ", name: "Adjunct", hierarchy_level: 5, description: "Adjunct / visiting faculty member", is_active: true, professor_count: 1 },
  ],
  courses: [
    { id: "1", code: "CS101", title: "Introduction to Computing", department_name: "Computer Science", units: 3, description: "Fundamental computer concepts and programming logic", is_active: true, professor_count: 2 },
    { id: "2", code: "CS201", title: "Data Structures & Algorithms", department_name: "Computer Science", units: 3, description: "Core algorithmic design and complexity", is_active: true, professor_count: 2 },
    { id: "3", code: "ENG101", title: "Engineering Mechanics", department_name: "Engineering", units: 3, description: "Statics and dynamics principles", is_active: true, professor_count: 2 },
    { id: "4", code: "BUS101", title: "Principles of Management", department_name: "Business", units: 3, description: "Organizational behavior and modern management", is_active: true, professor_count: 2 },
    { id: "5", code: "SCI101", title: "Applied Physics", department_name: "Sciences", units: 3, description: "Classical mechanics and laboratory applications", is_active: true, professor_count: 1 },
  ],
  stats: {
    total_departments: 5,
    active_departments: 5,
    total_ranks: 5,
    active_ranks: 5,
    total_courses: 5,
    total_professors: 8,
  },
};

const defaultProfessors: Professor[] = [
  { name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", dept: "Engineering", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", dept: "Computer Science", rank: "Associate Prof.", courses: 3, active: true },
  { name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", dept: "Business", rank: "Professor", courses: 5, active: true },
  { name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", dept: "Sciences", rank: "Assistant Prof.", courses: 2, active: false },
  { name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", dept: "Arts & Humanities", rank: "Lecturer", courses: 3, active: true },
  { name: "Dr. Nestor Villar", email: "n.villar@aris.edu.ph", dept: "Engineering", rank: "Adjunct", courses: 1, active: false },
  { name: "Dr. Sofia Mendoza", email: "s.mendoza@aris.edu.ph", dept: "Computer Science", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Daniel Ong", email: "d.ong@aris.edu.ph", dept: "Business", rank: "Associate Prof.", courses: 3, active: false },
];

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#e2e8e4] p-3 text-[12px] space-y-1">
        <p className="font-bold text-[#111c14] border-b border-[#eef1ef] pb-1">
          {data.name} ({label})
        </p>
        <p className="text-[#2f7043] flex items-center justify-between gap-4">
          <span>Faculty:</span>
          <span className="font-semibold">{data.faculty}</span>
        </p>
        <p className="text-[#2b6ca3] flex items-center justify-between gap-4">
          <span>Courses:</span>
          <span className="font-semibold">{data.courses}</span>
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
          Tier #{data.level} · <span className="font-semibold text-[#111c14]">{data.value} faculty</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function Curriculum() {
  const { data: overview, setData: setOverview, reload } = useResource<CurriculumOverview>(
    "/curriculum",
    initialOverview,
  );
  const { data: rawProfessors } = useResource<Professor[]>("/professors", defaultProfessors);

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

  const [activeTab, setActiveTab] = useState<"Departments" | "Academic Ranks" | "Courses">("Departments");
  const [tab, setTab] = useState<"All" | "Active" | "Deactivated">("All");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Row Click Members Modals
  const [viewDeptMembers, setViewDeptMembers] = useState<Department | null>(null);
  const [viewRankMembers, setViewRankMembers] = useState<AcademicRank | null>(null);
  const [viewCourseMembers, setViewCourseMembers] = useState<Course | null>(null);

  // Department Modal State (Edit / Add)
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptActive, setDeptActive] = useState(true);

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
    type: "department" | "rank" | "course";
    id: string;
    name: string;
    active: boolean;
  } | null>(null);

  // Delete Confirm Modal
  const [pendingDelete, setPendingDelete] = useState<{
    type: "department" | "rank" | "course";
    id: string;
    name: string;
    count?: number;
  } | null>(null);

  // Feedback notifications
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper functions to get users/professors for each entity
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

  // Members lists filtered for detail modals
  const deptMembersList = useMemo(() => {
    if (!viewDeptMembers) return [];
    return getDeptMembers(viewDeptMembers);
  }, [viewDeptMembers, professors]);

  const rankMembersList = useMemo(() => {
    if (!viewRankMembers) return [];
    return getRankMembers(viewRankMembers);
  }, [viewRankMembers, professors]);

  const courseMembersList = useMemo(() => {
    if (!viewCourseMembers) return [];
    return getCourseMembers(viewCourseMembers);
  }, [viewCourseMembers, professors]);

  // --- Department Actions ---
  const openAddDept = () => {
    setEditingDept(null);
    setDeptCode("");
    setDeptName("");
    setDeptDesc("");
    setDeptActive(true);
    setSaveError(null);
    setDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptCode(dept.code);
    setDeptName(dept.name);
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
            code: deptCode.trim(),
            name: deptName.trim(),
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
            code: deptCode.trim(),
            name: deptName.trim(),
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

  const executeToggle = async (item: { type: "department" | "rank" | "course"; id: string; active: boolean }) => {
    const nextState = !item.active;
    setPendingToggle(null);
    try {
      if (item.type === "department") {
        await saveResource(`/curriculum/departments/${item.id}`, { is_active: nextState }, "PATCH");
        setOverview({
          ...overview,
          departments: overview.departments.map((d) => (d.id === item.id ? { ...d, is_active: nextState } : d)),
          stats: {
            ...overview.stats,
            active_departments: nextState ? overview.stats.active_departments + 1 : overview.stats.active_departments - 1,
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
            code: courseCode.trim(),
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
            code: courseCode.trim(),
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

  // --- Delete Handler ---
  const executeDelete = async (item: { type: "department" | "rank" | "course"; id: string; name: string }) => {
    setPendingDelete(null);
    try {
      if (item.type === "department") {
        await saveResource(`/curriculum/departments/${item.id}`, undefined, "DELETE");
        setOverview({
          ...overview,
          departments: overview.departments.filter((d) => d.id !== item.id),
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
  const filteredDepartments = overview.departments.filter((d) => {
    const matchesTab = tab === "All" || (tab === "Active" ? d.is_active : !d.is_active);
    const matchesSearch = `${d.code} ${d.name} ${d.description || ""}`.toLowerCase().includes(search.toLowerCase());
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

  // Chart datasets
  const deptChartData = useMemo(() => {
    return overview.departments.map((dept) => {
      const courseCount = overview.courses.filter(
        (c) => (c.department_name || "").toLowerCase().trim() === dept.name.toLowerCase().trim()
      ).length;
      return {
        name: dept.name,
        code: dept.code,
        faculty: dept.professor_count ?? 0,
        courses: courseCount,
      };
    });
  }, [overview.departments, overview.courses]);

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

  const categoryTabs = ["Departments", "Academic Ranks", "Courses"];
  const statusTabs = ["All", "Active", "Deactivated"];

  const activeDeptCount = overview.departments.filter((d) => d.is_active).length;
  const activeRankCount = overview.ranks.filter((r) => r.is_active).length;
  const activeCourseCount = overview.courses.filter((c) => c.is_active).length;

  const stats = [
    ["Colleges / Departments", String(overview.departments.length)],
    ["Active Departments", String(activeDeptCount)],
    ["Academic Ranks", String(overview.ranks.length)],
    ["Cataloged Courses", String(overview.courses.length)],
  ];

  return (
    <div className="pb-2">
      <PageTitle
        title="Curriculum Management"
        subtitle={`${overview.departments.length} departments, ${overview.ranks.length} ranks, and ${overview.courses.length} cataloged courses.`}
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={reload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </GhostButton>
            {activeTab === "Departments" && (
              <PrimaryButton onClick={openAddDept}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Department
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

      {/* --- VISUAL ANALYTICS & GRAPHS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Graph 1: Department Capacity & Course Load (Bar Chart) */}
        <Card className="flex flex-col min-h-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">Department Capacity &amp; Course Load</h2>
              <p className="text-[12px] text-[#8fa394]">Assigned faculty vs. cataloged courses across colleges</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND }} /> Faculty
              </span>
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3f8ecc" }} /> Courses
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={{ stroke: "#eef1ef" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="faculty" fill={BRAND} radius={[5, 5, 0, 0]} maxBarSize={24} />
                <Bar dataKey="courses" fill="#3f8ecc" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graph 2: Academic Rank Distribution (Donut Chart) */}
        {/* Graph 2: Academic Rank Distribution (Donut Chart) */}
        <Card className="relative z-10 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">Academic Rank Distribution</h2>
              <p className="text-[12px] text-[#8fa394]">Faculty proportion across academic seniority tiers</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-1/2 h-[190px] flex items-center justify-center">
              {/* center label: behind the chart */}
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#111c14] leading-none">{totalFacultyCount}</span>
                <span className="text-[10px] uppercase tracking-wide text-[#8fa394] mt-0.5 font-semibold">Faculty</span>
              </div>

              {/* chart: in front */}
              <div className="relative z-10 h-full w-full">
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
      <Card className="p-0 overflow-x-auto">
        {/* Top Control Bar matching Professors.tsx exactly */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#eef1ef" }}>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              tabs={categoryTabs}
              value={activeTab}
              onChange={(v) => {
                setActiveTab(v as any);
                setSearch("");
                setOpenMenu(null);
              }}
            />
            <Tabs
              tabs={statusTabs}
              value={tab}
              onChange={(v) => {
                setTab(v as any);
                setOpenMenu(null);
              }}
            />
          </div>
          <div className="flex gap-2">
            <SearchInput
              placeholder={`Search ${activeTab.toLowerCase()}`}
              value={search}
              onChange={setSearch}
              className="w-48 sm:w-60"
            />
          </div>
        </div>

        {/* --- DEPARTMENTS TABLE --- */}
        {activeTab === "Departments" && (
          <>
            <div
              className="grid min-w-[1050px] grid-cols-[2.2fr_1.1fr_2fr_1.3fr_1.1fr_0.8fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Department / College</span>
              <span>Code</span>
              <span>Description</span>
              <span>No. of Users / State</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredDepartments.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No departments found matching your criteria.
              </div>
            ) : (
              filteredDepartments.map((dept, i) => {
                const members = getDeptMembers(dept);
                const total = members.length > 0 ? members.length : (dept.professor_count ?? 0);
                const active = members.length > 0 ? members.filter((m) => m.active).length : (dept.is_active ? total : 0);
                const inactive = total - active;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setViewDeptMembers(dept)}
                    className="grid min-w-[1050px] grid-cols-[2.2fr_1.1fr_2fr_1.3fr_1.1fr_0.8fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                    style={{ borderColor: "#f2f4f2" }}
                  >
                    <button
                      type="button"
                      aria-label={`View faculty in ${dept.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setViewDeptMembers(dept);
                      }}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <Avatar initials={dept.code.slice(0, 2).toUpperCase()} color={initialsColor(i)} />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                          {dept.name}
                        </p>
                        <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                          {dept.code} · Click to view faculty ({total})
                        </p>
                      </div>
                    </button>

                    <span className="text-[13px] font-mono font-medium" style={{ color: "#3d4a41" }}>
                      {dept.code}
                    </span>

                    <span className="text-[13px] truncate pr-4" style={{ color: "#3d4a41" }}>
                      {dept.description || "—"}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                        {total} {total === 1 ? "user" : "users"}
                      </span>
                      <span className="text-[11.5px]" style={{ color: active > 0 ? "#2f7043" : "#8fa394" }}>
                        {active} active {inactive > 0 ? `· ${inactive} inactive` : ""}
                      </span>
                    </div>

                    <span>
                      <Badge tone={dept.is_active ? "green" : "gray"} dot>
                        {dept.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </span>

                    <span className="relative flex justify-end">
                      <button
                        type="button"
                        aria-label={`Actions for ${dept.name}`}
                        aria-expanded={openMenu === dept.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenu(openMenu === dept.id ? null : dept.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>
                      {openMenu === dept.id && (
                        <div
                          className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewDeptMembers(dept);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            View faculty
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditDept(dept);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingToggle({
                                type: "department",
                                id: dept.id,
                                name: dept.name,
                                active: dept.is_active,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            {dept.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingDelete({
                                type: "department",
                                id: dept.id,
                                name: dept.name,
                                count: dept.professor_count,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-[#fbecec]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* --- ACADEMIC RANKS TABLE --- */}
        {activeTab === "Academic Ranks" && (
          <>
            <div
              className="grid min-w-[1050px] grid-cols-[2.2fr_1fr_0.9fr_1.8fr_1.3fr_1.1fr_0.8fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Rank Title</span>
              <span>Code / Abbr</span>
              <span>Level</span>
              <span>Description</span>
              <span>No. of Users / State</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredRanks.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No academic ranks found matching your criteria.
              </div>
            ) : (
              filteredRanks.map((rank, i) => {
                const members = getRankMembers(rank);
                const total = members.length > 0 ? members.length : (rank.professor_count ?? 0);
                const active = members.length > 0 ? members.filter((m) => m.active).length : (rank.is_active ? total : 0);
                const inactive = total - active;

                return (
                  <div
                    key={rank.id}
                    onClick={() => setViewRankMembers(rank)}
                    className="grid min-w-[1050px] grid-cols-[2.2fr_1fr_0.9fr_1.8fr_1.3fr_1.1fr_0.8fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                    style={{ borderColor: "#f2f4f2" }}
                  >
                    <button
                      type="button"
                      aria-label={`View accounts with rank ${rank.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setViewRankMembers(rank);
                      }}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <Avatar initials={`L${rank.hierarchy_level}`} color={initialsColor(i + 2)} />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                          {rank.name}
                        </p>
                        <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                          Level {rank.hierarchy_level} · Click to view faculty ({total})
                        </p>
                      </div>
                    </button>

                    <span className="text-[13px] font-mono" style={{ color: "#3d4a41" }}>
                      {rank.code || "—"}
                    </span>

                    <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                      Tier #{rank.hierarchy_level}
                    </span>

                    <span className="text-[13px] truncate pr-4" style={{ color: "#3d4a41" }}>
                      {rank.description || "—"}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                        {total} {total === 1 ? "user" : "users"}
                      </span>
                      <span className="text-[11.5px]" style={{ color: active > 0 ? "#2f7043" : "#8fa394" }}>
                        {active} active {inactive > 0 ? `· ${inactive} inactive` : ""}
                      </span>
                    </div>

                    <span>
                      <Badge tone={rank.is_active ? "green" : "gray"} dot>
                        {rank.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </span>

                    <span className="relative flex justify-end">
                      <button
                        type="button"
                        aria-label={`Actions for ${rank.name}`}
                        aria-expanded={openMenu === rank.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenu(openMenu === rank.id ? null : rank.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>
                      {openMenu === rank.id && (
                        <div
                          className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewRankMembers(rank);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            View accounts
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditRank(rank);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingToggle({
                                type: "rank",
                                id: rank.id,
                                name: rank.name,
                                active: rank.is_active,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            {rank.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingDelete({
                                type: "rank",
                                id: rank.id,
                                name: rank.name,
                                count: rank.professor_count,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-[#fbecec]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* --- COURSES TABLE --- */}
        {activeTab === "Courses" && (
          <>
            <div
              className="grid min-w-[1050px] grid-cols-[2fr_0.9fr_1.3fr_0.7fr_1.6fr_1.3fr_1.1fr_0.8fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Course Title</span>
              <span>Code</span>
              <span>Department</span>
              <span>Units</span>
              <span>Description</span>
              <span>No. of Users / State</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No courses found matching your criteria.
              </div>
            ) : (
              filteredCourses.map((course, i) => {
                const members = getCourseMembers(course);
                const total = members.length > 0 ? members.length : (course.professor_count ?? 0);
                const active = members.length > 0 ? members.filter((m) => m.active).length : (course.is_active ? total : 0);
                const inactive = total - active;

                return (
                  <div
                    key={course.id}
                    onClick={() => setViewCourseMembers(course)}
                    className="grid min-w-[1050px] grid-cols-[2fr_0.9fr_1.3fr_0.7fr_1.6fr_1.3fr_1.1fr_0.8fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                    style={{ borderColor: "#f2f4f2" }}
                  >
                    <button
                      type="button"
                      aria-label={`View faculty for ${course.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setViewCourseMembers(course);
                      }}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <Avatar initials={course.code.slice(0, 2).toUpperCase()} color={initialsColor(i + 4)} />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                          {course.title}
                        </p>
                        <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                          {course.code} · Click to view faculty ({total})
                        </p>
                      </div>
                    </button>

                    <span className="text-[13px] font-mono font-medium" style={{ color: "#3d4a41" }}>
                      {course.code}
                    </span>

                    <span className="text-[13px]" style={{ color: "#3d4a41" }}>
                      {course.department_name || "Unassigned"}
                    </span>

                    <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                      {course.units}
                    </span>

                    <span className="text-[13px] truncate pr-4" style={{ color: "#3d4a41" }}>
                      {course.description || "—"}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                        {total} {total === 1 ? "user" : "users"}
                      </span>
                      <span className="text-[11.5px]" style={{ color: active > 0 ? "#2f7043" : "#8fa394" }}>
                        {active} active {inactive > 0 ? `· ${inactive} inactive` : ""}
                      </span>
                    </div>

                    <span>
                      <Badge tone={course.is_active ? "green" : "gray"} dot>
                        {course.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </span>

                    <span className="relative flex justify-end">
                      <button
                        type="button"
                        aria-label={`Actions for ${course.title}`}
                        aria-expanded={openMenu === course.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenu(openMenu === course.id ? null : course.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>
                      {openMenu === course.id && (
                        <div
                          className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewCourseMembers(course);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            View faculty
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditCourse(course);
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingToggle({
                                type: "course",
                                id: course.id,
                                name: course.title,
                                active: course.is_active,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]"
                          >
                            {course.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingDelete({
                                type: "course",
                                id: course.id,
                                name: course.title,
                              });
                              setOpenMenu(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-[#fbecec]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </>
        )}
      </Card>

      {/* ============================================================== */}
      {/* MODAL 1: Department Faculty Members List (on Row Click)       */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewDeptMembers)}
        onClose={() => setViewDeptMembers(null)}
        title={viewDeptMembers ? `Faculty Members · ${viewDeptMembers.name}` : ""}
        align="left"
        size="lg"
        actions={
          <div className="flex w-full items-center justify-between pt-2">
            <span className="text-[12px] text-[#8fa394]">
              {deptMembersList.length} faculty member(s) found
            </span>
            <GhostButton onClick={() => setViewDeptMembers(null)}>Close</GhostButton>
          </div>
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Faculty assigned to <strong>{viewDeptMembers?.name}</strong> ({viewDeptMembers?.code}).
          </p>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {deptMembersList.length === 0 ? (
              <div className="py-8 text-center text-[#8fa394] bg-[#fafbfa] rounded-2xl border border-dashed border-[#e2e8e4]">
                <p className="text-[13px] font-medium text-[#111c14]">No faculty assigned yet</p>
                <p className="text-[12px] mt-0.5">Faculty assigned to this department will appear here.</p>
              </div>
            ) : (
              deptMembersList.map((p, idx) => (
                <div
                  key={p.email || p.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#eef1ef] bg-white hover:bg-[#fafbfa] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      initials={p.name?.split(" ").slice(-1)[0].slice(0, 2).toUpperCase() || "PR"}
                      color={initialsColor(idx)}
                      size={38}
                    />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#111c14] truncate">{p.name}</p>
                      <p className="text-[12px] text-[#8fa394] truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#f0f2f0] text-[#3d4a41] font-medium">
                      {p.rank}
                    </span>
                    <Badge tone={p.active ? "green" : "gray"} dot>
                      {p.active ? "Active" : "Deactivated"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: Academic Rank Accounts List (on Row Click)            */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewRankMembers)}
        onClose={() => setViewRankMembers(null)}
        title={viewRankMembers ? `Faculty with Rank: ${viewRankMembers.name}` : ""}
        align="left"
        size="lg"
        actions={
          <div className="flex w-full items-center justify-between pt-2">
            <span className="text-[12px] text-[#8fa394]">
              {rankMembersList.length} faculty member(s) holding this rank
            </span>
            <GhostButton onClick={() => setViewRankMembers(null)}>Close</GhostButton>
          </div>
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Faculty holding <strong>{viewRankMembers?.name}</strong> (Tier #{viewRankMembers?.hierarchy_level}).
          </p>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {rankMembersList.length === 0 ? (
              <div className="py-8 text-center text-[#8fa394] bg-[#fafbfa] rounded-2xl border border-dashed border-[#e2e8e4]">
                <p className="text-[13px] font-medium text-[#111c14]">No faculty assigned this rank</p>
                <p className="text-[12px] mt-0.5">Faculty appointed to this rank will appear here.</p>
              </div>
            ) : (
              rankMembersList.map((p, idx) => (
                <div
                  key={p.email || p.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#eef1ef] bg-white hover:bg-[#fafbfa] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      initials={p.name?.split(" ").slice(-1)[0].slice(0, 2).toUpperCase() || "PR"}
                      color={initialsColor(idx + 1)}
                      size={38}
                    />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#111c14] truncate">{p.name}</p>
                      <p className="text-[12px] text-[#8fa394] truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#eaf4ee] text-[#2f7043] font-medium">
                      {p.dept}
                    </span>
                    <Badge tone={p.active ? "green" : "gray"} dot>
                      {p.active ? "Active" : "Deactivated"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: Course Assigned Faculty List (on Row Click)           */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(viewCourseMembers)}
        onClose={() => setViewCourseMembers(null)}
        title={viewCourseMembers ? `Faculty for Course: ${viewCourseMembers.code}` : ""}
        align="left"
        size="lg"
        actions={
          <div className="flex w-full items-center justify-between pt-2">
            <span className="text-[12px] text-[#8fa394]">
              {courseMembersList.length} faculty member(s) eligible / assigned
            </span>
            <GhostButton onClick={() => setViewCourseMembers(null)}>Close</GhostButton>
          </div>
        }
      >
        <div className="space-y-3 pt-1">
          <p className="text-[12.5px] text-[#8fa394]">
            Faculty for <strong>{viewCourseMembers?.code} - {viewCourseMembers?.title}</strong> ({viewCourseMembers?.units} units · {viewCourseMembers?.department_name || "General Department"}).
          </p>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {courseMembersList.length === 0 ? (
              <div className="py-8 text-center text-[#8fa394] bg-[#fafbfa] rounded-2xl border border-dashed border-[#e2e8e4]">
                <p className="text-[13px] font-medium text-[#111c14]">No faculty assigned yet</p>
                <p className="text-[12px] mt-0.5">Faculty teaching or assigned to this course will appear here.</p>
              </div>
            ) : (
              courseMembersList.map((p, idx) => (
                <div
                  key={p.email || p.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#eef1ef] bg-white hover:bg-[#fafbfa] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      initials={p.name?.split(" ").slice(-1)[0].slice(0, 2).toUpperCase() || "PR"}
                      color={initialsColor(idx + 3)}
                      size={38}
                    />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#111c14] truncate">{p.name}</p>
                      <p className="text-[12px] text-[#8fa394] truncate">{p.email} · {p.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#f0f2f0] text-[#3d4a41] font-medium">
                      {p.rank}
                    </span>
                    <Badge tone={p.active ? "green" : "gray"} dot>
                      {p.active ? "Active" : "Deactivated"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
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
              placeholder="e.g. ENG, CS, BUS"
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
              placeholder="e.g. Computer Science"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>Description</label>
            <textarea
              placeholder="Department purpose or overview..."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
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
