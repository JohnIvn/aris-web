import { useNavigate } from "react-router";
import { Badge, Card, PageTitle, PrimaryButton, StatCard, StatGrid } from "@/components/ui";

const queue = [
  { name: "Amelia Torres", period: "September Cycle 1", report: "AR-0926-01", status: "Pending review" },
  { name: "Marco Santos", period: "September Cycle 1", report: "AR-0926-02", status: "Awaiting HR" },
  { name: "Liza Abad", period: "August Cycle 2", report: "AR-0826-14", status: "For revision" },
];

export default function StaffOverview() {
  const navigate = useNavigate();

  return (
    <div className="pb-2">
      <PageTitle title="Overview" subtitle="Your report review queue and recent activity." action={<PrimaryButton onClick={() => navigate("/staff/approvals")}>Open approvals</PrimaryButton>} />

      <StatGrid className="mb-4">
        <StatCard label="Pending approvals" value="14" badge={<Badge tone="amber">Needs review</Badge>} />
        <StatCard label="Reviewed this month" value="128" badge={<Badge tone="green">On track</Badge>} />
        <StatCard label="Average review time" value="2.4 days" detail="Target: under 3 days" />
        <StatCard label="Compliance rate" value="96%" badge={<Badge tone="green">Monthly</Badge>} />
      </StatGrid>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Priority review queue</h2>
            <p className="mt-0.5 text-[12px]" style={{ color: "#8fa394" }}>Reports requiring staff review</p>
          </div>
          <button onClick={() => navigate("/staff/approvals")} className="text-[12.5px] font-semibold" style={{ color: "#3a7d4e" }}>View all</button>
        </div>
        <div className="divide-y" style={{ borderColor: "#eef1ef" }}>
          {queue.map((item) => (
            <button key={item.report} onClick={() => navigate("/staff/approvals")} className="flex w-full flex-col gap-2 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block text-[13px] font-semibold" style={{ color: "#111c14" }}>{item.name}</span>
                <span className="mt-0.5 block text-[12px]" style={{ color: "#8fa394" }}>{item.period} · {item.report}</span>
              </span>
              <Badge tone={item.status === "Pending review" ? "amber" : item.status === "For revision" ? "red" : "blue"}>{item.status}</Badge>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}