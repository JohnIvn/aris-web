import { useState } from "react";
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
  created_at?: string;
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
    { id: "1", code: "CS101", title: "Introduction to Computing", department_name: "Computer Science", units: 3, description: "Fundamental computer concepts and programming logic", is_active: true },
    { id: "2", code: "CS201", title: "Data Structures & Algorithms", department_name: "Computer Science", units: 3, description: "Core algorithmic design and complexity", is_active: true },
    { id: "3", code: "ENG101", title: "Engineering Mechanics", department_name: "Engineering", units: 3, description: "Statics and dynamics principles", is_active: true },
    { id: "4", code: "BUS101", title: "Principles of Management", department_name: "Business", units: 3, description: "Organizational behavior and modern management", is_active: true },
    { id: "5", code: "SCI101", title: "Applied Physics", department_name: "Sciences", units: 3, description: "Classical mechanics and laboratory applications", is_active: true },
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

export default function Curriculum() {
  const { data: overview, setData: setOverview, reload } = useResource<CurriculumOverview>(
    "/curriculum",
    initialOverview,
  );

  const [activeTab, setActiveTab] = useState<"Departments" | "Academic Ranks" | "Courses">("Departments");
  const [tab, setTab] = useState<"All" | "Active" | "Deactivated">("All");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptActive, setDeptActive] = useState(true);

  // Rank Modal State
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<AcademicRank | null>(null);
  const [rankName, setRankName] = useState("");
  const [rankCode, setRankCode] = useState("");
  const [rankLevel, setRankLevel] = useState(1);
  const [rankDesc, setRankDesc] = useState("");
  const [rankActive, setRankActive] = useState(true);

  // Course Modal State
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
              className="grid min-w-[1000px] grid-cols-[2.2fr_1.2fr_2fr_1.2fr_1.2fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Department / College</span>
              <span>Code</span>
              <span>Description</span>
              <span>Faculty Assigned</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredDepartments.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No departments found matching your criteria.
              </div>
            ) : (
              filteredDepartments.map((dept, i) => (
                <div
                  key={dept.id}
                  onClick={() => openEditDept(dept)}
                  className="grid min-w-[1000px] grid-cols-[2.2fr_1.2fr_2fr_1.2fr_1.2fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                  style={{ borderColor: "#f2f4f2" }}
                >
                  <button
                    type="button"
                    aria-label={`Edit ${dept.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditDept(dept);
                    }}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <Avatar initials={dept.code.slice(0, 2).toUpperCase()} color={initialsColor(i)} />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                        {dept.name}
                      </p>
                      <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                        {dept.code} · Academic Department
                      </p>
                    </div>
                  </button>

                  <span className="text-[13px] font-mono font-medium" style={{ color: "#3d4a41" }}>
                    {dept.code}
                  </span>

                  <span className="text-[13px] truncate pr-4" style={{ color: "#3d4a41" }}>
                    {dept.description || "—"}
                  </span>

                  <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>
                    {dept.professor_count ?? 0} professors
                  </span>

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
              ))
            )}
          </>
        )}

        {/* --- ACADEMIC RANKS TABLE --- */}
        {activeTab === "Academic Ranks" && (
          <>
            <div
              className="grid min-w-[1000px] grid-cols-[2.2fr_1fr_1fr_2fr_1.2fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Rank Title</span>
              <span>Code / Abbr</span>
              <span>Level</span>
              <span>Description</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredRanks.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No academic ranks found matching your criteria.
              </div>
            ) : (
              filteredRanks.map((rank, i) => (
                <div
                  key={rank.id}
                  onClick={() => openEditRank(rank)}
                  className="grid min-w-[1000px] grid-cols-[2.2fr_1fr_1fr_2fr_1.2fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                  style={{ borderColor: "#f2f4f2" }}
                >
                  <button
                    type="button"
                    aria-label={`Edit ${rank.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditRank(rank);
                    }}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <Avatar initials={`L${rank.hierarchy_level}`} color={initialsColor(i + 2)} />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                        {rank.name}
                      </p>
                      <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                        {rank.code || "Faculty Rank"} · Level {rank.hierarchy_level}
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
              ))
            )}
          </>
        )}

        {/* --- COURSES TABLE --- */}
        {activeTab === "Courses" && (
          <>
            <div
              className="grid min-w-[1000px] grid-cols-[2.2fr_1fr_1.5fr_0.8fr_1.8fr_1.2fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Course Title</span>
              <span>Code</span>
              <span>Department</span>
              <span>Units</span>
              <span>Description</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
                No courses found matching your criteria.
              </div>
            ) : (
              filteredCourses.map((course, i) => (
                <div
                  key={course.id}
                  onClick={() => openEditCourse(course)}
                  className="grid min-w-[1000px] grid-cols-[2.2fr_1fr_1.5fr_0.8fr_1.8fr_1.2fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
                  style={{ borderColor: "#f2f4f2" }}
                >
                  <button
                    type="button"
                    aria-label={`Edit ${course.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditCourse(course);
                    }}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <Avatar initials={course.code.slice(0, 2).toUpperCase()} color={initialsColor(i + 4)} />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>
                        {course.title}
                      </p>
                      <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>
                        {course.code} · {course.units} units
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
              ))
            )}
          </>
        )}
      </Card>

      {/* MODAL: Department Add/Edit */}
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

      {/* MODAL: Rank Add/Edit */}
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

      {/* MODAL: Course Add/Edit */}
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

      {/* CONFIRM TOGGLE MODAL matching Professors.tsx */}
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

      {/* CONFIRM DELETE MODAL matching Professors.tsx */}
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
