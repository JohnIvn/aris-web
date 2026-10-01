import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, PageTitle, PrimaryButton, GhostButton, SearchInput, Badge, Avatar, Tabs, initialsColor } from "@/components/ui";

const people = [
  { name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", dept: "Engineering", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", dept: "Computer Science", rank: "Associate Prof.", courses: 3, active: true },
  { name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", dept: "Business", rank: "Professor", courses: 5, active: true },
  { name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", dept: "Sciences", rank: "Assistant Prof.", courses: 2, active: false },
  { name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", dept: "Arts & Humanities", rank: "Lecturer", courses: 3, active: true },
  { name: "Dr. Nestor Villar", email: "n.villar@aris.edu.ph", dept: "Engineering", rank: "Adjunct", courses: 1, active: false },
  { name: "Dr. Sofia Mendoza", email: "s.mendoza@aris.edu.ph", dept: "Computer Science", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Daniel Ong", email: "d.ong@aris.edu.ph", dept: "Business", rank: "Associate Prof.", courses: 3, active: false },
];

export default function Professors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [items, setItems] = useState(people);
  const tabs = ["All", "Active", "Deactivated"];

  const toggle = (email: string) => setItems((list) => list.map((p) => (p.email === email ? { ...p, active: !p.active } : p)));
  const rows = items.filter((p) => tab === "All" || (tab === "Active" ? p.active : !p.active));

  const activeCount = items.filter((p) => p.active).length;
  const stats = [["Total Faculty", String(items.length)], ["Active", String(activeCount)], ["Deactivated", String(items.length - activeCount)], ["Colleges", "6"]];

  return (
    <div className="pb-2">
      <PageTitle title="Professor Management" subtitle="312 faculty across 6 colleges." action={<PrimaryButton onClick={() => navigate("/professors/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>Add Professor</PrimaryButton>} />

      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map(([l, v]) => (
          <Card key={l} className="py-4">
            <p className="text-[12px]" style={{ color: "#8fa394" }}>{l}</p>
            <p className="text-[24px] font-bold mt-1 tracking-tight" style={{ color: "#111c14" }}>{v}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#eef1ef" }}>
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2">
            <SearchInput placeholder="Search faculty" />
            <GhostButton><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" /></svg>Filter</GhostButton>
          </div>
        </div>
        <div className="grid grid-cols-[2.2fr_1.4fr_1.2fr_0.7fr_1fr_1.2fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Name</span><span>Department</span><span>Rank</span><span>Courses</span><span>Status</span><span className="text-right">Action</span>
        </div>
        {rows.map((p, i) => (
          <div key={p.email} className="grid grid-cols-[2.2fr_1.4fr_1.2fr_0.7fr_1fr_1.2fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa]" style={{ borderColor: "#f2f4f2" }}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={p.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()} color={initialsColor(i)} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{p.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{p.email}</p>
              </div>
            </div>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{p.dept}</span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{p.rank}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>{p.courses}</span>
            <span><Badge tone={p.active ? "green" : "gray"} dot>{p.active ? "Active" : "Deactivated"}</Badge></span>
            <span className="flex justify-end">
              <button
                onClick={() => toggle(p.email)}
                className="h-8 px-3 rounded-lg text-[12.5px] font-semibold border transition-colors"
                style={p.active
                  ? { color: "#d0674a", borderColor: "#f0d9d2", background: "#fdf3f0" }
                  : { color: "#3a7d4e", borderColor: "#cfe3d6", background: "#f0f7f2" }}
              >
                {p.active ? "Deactivate" : "Activate"}
              </button>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
