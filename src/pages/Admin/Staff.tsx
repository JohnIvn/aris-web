import { useState } from "react";
import { useNavigate } from "react-router";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
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
  Modal,
} from "@/components/ui";

// Staff IDs are prefixed by role: CHK (Checker), SEC (Secretary), HR (HR), ACC (Accounting)
type StaffMember = {
  id?: string;
  employee_id?: string;
  name?: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  email: string;
  role?: string;
  position?: string | null;
  dept?: string;
  department?: string | null;
  status?: "Active" | "On Leave";
  is_banned?: boolean;
};

const demoStaff: StaffMember[] = [
  { name: "James Reyes", email: "j.reyes@aris.edu.ph", id: "CHK-0142", role: "Checker", dept: "Attendance", status: "Active" as const },
  { name: "Marco Dela Cruz", email: "m.delacruz@aris.edu.ph", id: "CHK-0143", role: "Checker", dept: "Attendance", status: "Active" as const },
  { name: "Ben Salvador", email: "b.salvador@aris.edu.ph", id: "CHK-0144", role: "Checker", dept: "Records Review", status: "Active" as const },
  { name: "Carla Ramos", email: "c.ramos@aris.edu.ph", id: "SEC-0071", role: "Secretary", dept: "Dean's Office", status: "Active" as const },
  { name: "Liza Fernandez", email: "l.fernandez@aris.edu.ph", id: "SEC-0072", role: "Secretary", dept: "Registrar", status: "On Leave" as const },
  { name: "Ana Bautista", email: "a.bautista@aris.edu.ph", id: "HR-0035", role: "HR", dept: "Human Resources", status: "Active" as const },
  { name: "Rina Torres", email: "r.torres@aris.edu.ph", id: "HR-0036", role: "HR", dept: "Recruitment", status: "Active" as const },
  { name: "Paolo Garcia", email: "p.garcia@aris.edu.ph", id: "ACC-0028", role: "Accounting", dept: "Finance", status: "Active" as const },
  { name: "Nina Villanueva", email: "n.villanueva@aris.edu.ph", id: "ACC-0029", role: "Accounting", dept: "Payroll", status: "Active" as const },
];

const staffStatusTone = { Active: "green", "On Leave": "amber" } as const;
const roleColor: Record<string, string> = { Checker: "#3a7d4e", Secretary: "#3f8ecc", HR: "#8a63c4", Accounting: "#d99a2b" };

export default function Staff() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [pendingStatus, setPendingStatus] = useState<StaffMember | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: resourceStaff, setData: setResourceStaff } = useResource<StaffMember[]>("/staff", demoStaff);
  const staff = resourceStaff.map((person) => ({
    ...person,
    id: person.id ?? person.employee_id ?? "",
    name: person.name ?? ([person.firstname, person.middlename, person.lastname].filter(Boolean).join(" ") || "Unknown staff member"),
    role: person.role ?? person.position ?? "Staff",
    dept: person.dept ?? person.department ?? "Unassigned",
    status: person.status ?? (person.is_banned ? "On Leave" : "Active"),
  }));
  const setStaff = (nextStaff: StaffMember[]) => setResourceStaff(nextStaff);
  const tabs = ["All", "Checker", "Secretary", "HR", "Accounting"];
  const rows = staff.filter((person) => {
    const matchesRole = tab === "All" || person.role === tab;
    const matchesStatus = statusFilter === "All statuses" || person.status === statusFilter;
    const matchesSearch = `${person.name} ${person.email} ${person.id} ${person.role} ${person.dept}`.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const updateStatus = async (person: StaffMember) => {
    const updated = staff.map((item) => item.id === person.id ? { ...item, status: item.status === "Active" ? "On Leave" as const : "Active" as const } : item);
    setStaff(updated);
    setPendingStatus(null);
    try {
      if (!person.id) throw new Error("This staff member does not have a server ID.");
      await saveResource(`/staff/${person.id}/status`, { active: person.status !== "Active" }, "PATCH");
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to update staff status.");
    }
  };
  const deleteStaff = async (person: StaffMember) => {
    setPendingDelete(null);
    try {
      if (!person.id) throw new Error("This staff member does not have a server ID.");
      await saveResource(`/staff/${person.id}`, undefined, "DELETE");
      setStaff(staff.filter((item) => item.id !== person.id));
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to delete staff member.");
    }
  };

  const counts = {
    Checker: staff.filter((s) => s.role === "Checker").length,
    Secretary: staff.filter((s) => s.role === "Secretary").length,
    HR: staff.filter((s) => s.role === "HR").length,
    Accounting: staff.filter((s) => s.role === "Accounting").length,
  };

  return (
    <div className="pb-2">
      <PageTitle title="Staff Management" subtitle="Support staff by role — checkers, secretaries, HR, and accounting." action={<PrimaryButton onClick={() => navigate("/staff/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>Add Staff</PrimaryButton>} />
      {saveError && <p role="alert" className="mb-3 text-[12px] text-red-700">{saveError}</p>}

      <StatGrid columns={5} className="mb-4">
        <StatCard label="Total Staff" value={staff.length} />
        {(["Checker", "Secretary", "HR", "Accounting"] as const).map((r) => (
          <StatCard key={r} label={<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: roleColor[r] }} />{r}</span>} value={counts[r]} />
        ))}
      </StatGrid>

      <Card className="p-0 overflow-x-auto">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#eef1ef" }}>
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2">
            <SearchInput placeholder="Search staff or ID" value={search} onChange={setSearch} />
            <div className="relative">
              <GhostButton onClick={() => setFilterOpen((open) => !open)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" /></svg>Filter</GhostButton>
              {filterOpen && <div className="absolute right-0 top-11 z-10 min-w-44 rounded-lg border bg-white p-3 shadow-lg" style={{ borderColor: "#e2e8e4" }}>
                <label className="block text-[11px] font-medium text-[#5a6b5e]" htmlFor="staff-status-filter">Status</label>
                <select id="staff-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border bg-white px-2 text-[12px]" style={{ borderColor: "#e2e8e4" }}>
                  {["All statuses", "Active", "On Leave"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>}
            </div>
          </div>
        </div>
        <div className="grid min-w-[760px] grid-cols-[2.2fr_1.1fr_1.2fr_1.4fr_1fr] gap-4 px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Name</span><span>Staff ID</span><span>Role</span><span>Department</span><span>Status</span><span className="text-right">Action</span>
        </div>
        {rows.map((s) => (
          <div key={s.id} onClick={() => setSelected(s)} className="grid min-w-[900px] grid-cols-[2.2fr_1.1fr_1.2fr_1.4fr_1fr_0.7fr] gap-4 items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer" style={{ borderColor: "#f2f4f2" }}>
            <button type="button" aria-label={`View details for ${s.name}`} onClick={(event) => { event.stopPropagation(); setSelected(s); }} className="flex min-w-0 items-center gap-3 text-left">
              <Avatar initials={s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} color={roleColor[s.role]} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{s.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{s.email}</p>
              </div>
            </button>
            <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "#3d4a41" }}>{s.id}</span>
            <span className="flex items-center gap-2 text-[13px]" style={{ color: "#3d4a41" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleColor[s.role] }} />{s.role}
            </span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{s.dept}</span>
            <span><Badge tone={staffStatusTone[s.status]} dot>{s.status}</Badge></span>
            <span className="relative flex justify-end">
              <button type="button" aria-label={`Actions for ${s.name}`} aria-expanded={openMenu === s.id} onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === s.id ? null : s.id); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
              </button>
              {openMenu === s.id && <div className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg" style={{ borderColor: "#e2e8e4" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(s); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">View details</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setPendingStatus(s); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">{s.status === "Active" ? "Set on leave" : "Reactivate"}</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setPendingDelete(s); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-[#fbecec]">Delete</button>
              </div>}
            </span>
          </div>
        ))}
      </Card>
      <ProfileDetailsModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Staff ID"
        name={selected?.name ?? ""}
        role={selected?.role ?? ""}
        fields={[
          { label: "Staff ID", value: selected?.id ?? "" },
          { label: "Email", value: selected?.email ?? "" },
          { label: "Department", value: selected?.dept ?? "" },
          { label: "Phone", value: "Not provided" },
          { label: "Address", value: "Not provided", wide: true },
        ]}
      />
      <Modal isOpen={Boolean(pendingStatus)} onClose={() => setPendingStatus(null)} title={pendingStatus?.status === "Active" ? "Set staff member on leave?" : "Reactivate staff member?"} actions={<><GhostButton onClick={() => setPendingStatus(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingStatus && void updateStatus(pendingStatus)}>{pendingStatus?.status === "Active" ? "Set on leave" : "Reactivate"}</PrimaryButton></>}>
        {pendingStatus && <>Confirm status change for {pendingStatus.name}?</>}
      </Modal>
      <Modal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete staff member?" actions={<><GhostButton onClick={() => setPendingDelete(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingDelete && void deleteStaff(pendingDelete)}>Delete</PrimaryButton></>}>
        {pendingDelete && <>Are you sure you want to permanently delete {pendingDelete.name}? This action cannot be undone.</>}
      </Modal>
    </div>
  );
}
