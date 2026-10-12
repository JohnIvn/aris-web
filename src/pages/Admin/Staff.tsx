import { useState } from "react";
import { useNavigate } from "react-router";
import { useResource } from "@/hooks/useResource";
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
} from "@/components/ui";

// Staff IDs are prefixed by role: CHK (Checker), SEC (Secretary), HR (HR), ACC (Accounting)
const demoStaff = [
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
  const { data: staff } = useResource("/staff", demoStaff);
  const tabs = ["All", "Checker", "Secretary", "HR", "Accounting"];
  const rows = staff.filter((s) => tab === "All" || s.role === tab);

  const counts = {
    Checker: staff.filter((s) => s.role === "Checker").length,
    Secretary: staff.filter((s) => s.role === "Secretary").length,
    HR: staff.filter((s) => s.role === "HR").length,
    Accounting: staff.filter((s) => s.role === "Accounting").length,
  };

  return (
    <div className="pb-2">
      <PageTitle title="Staff Management" subtitle="Support staff by role — checkers, secretaries, HR, and accounting." action={<PrimaryButton onClick={() => navigate("/staff/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>Add Staff</PrimaryButton>} />

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
            <SearchInput placeholder="Search staff or ID" />
            <GhostButton><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" /></svg>Filter</GhostButton>
          </div>
        </div>
        <div className="grid min-w-[760px] grid-cols-[2.2fr_1.1fr_1.2fr_1.4fr_1fr] gap-4 px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Name</span><span>Staff ID</span><span>Role</span><span>Department</span><span className="text-right">Status</span>
        </div>
        {rows.map((s) => (
          <div key={s.id} className="grid min-w-[760px] grid-cols-[2.2fr_1.1fr_1.2fr_1.4fr_1fr] gap-4 items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa]" style={{ borderColor: "#f2f4f2" }}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} color={roleColor[s.role]} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{s.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{s.email}</p>
              </div>
            </div>
            <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "#3d4a41" }}>{s.id}</span>
            <span className="flex items-center gap-2 text-[13px]" style={{ color: "#3d4a41" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleColor[s.role] }} />{s.role}
            </span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{s.dept}</span>
            <span className="flex justify-end"><Badge tone={staffStatusTone[s.status]} dot>{s.status}</Badge></span>
          </div>
        ))}
      </Card>
    </div>
  );
}

