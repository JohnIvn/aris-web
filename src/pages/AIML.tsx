import { useState } from "react";
import { BRAND } from "@/config/navigation";
import { Card, PageTitle, Toggle, Badge } from "@/components/ui";

// Computed by the model from the 372 analyzed records
const insights = [
  {
    label: "Forecast",
    tone: "green" as const,
    text: "Expect ~410 records next week (+10%), driven by the month-end DTR cycle.",
    confidence: 88,
    icon: <path d="M3 3v18h18M7 14l4-4 4 4 5-6" />,
  },
  {
    label: "Anomaly",
    tone: "amber" as const,
    text: "14 DTRs submitted after the Friday 7 PM cut-off — 3× the usual late rate.",
    confidence: 94,
    icon: <><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></>,
  },
  {
    label: "Pattern",
    tone: "blue" as const,
    text: "Rejections concentrate in ARs missing output attachments (9 of 12).",
    confidence: 81,
    icon: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  },
];

const toneColor = { green: BRAND, amber: "#d99a2b", blue: "#3f8ecc" } as const;

export default function AIML() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="pb-2">
      <PageTitle title="AI / ML" subtitle="Automated analytics on submitted AR / DTR records." />

      {/* Prominent AI Analytics control */}
      <Card
        className="flex items-center gap-4 mb-4"
        style={{ background: enabled ? "linear-gradient(90deg,#f0f9f3,#ffffff)" : "#fff", border: enabled ? "1px solid #cfe3d6" : "1px solid #e2e8e4" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: enabled ? BRAND : "#f0f2f0", color: enabled ? "#fff" : "#b6c3ba" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-semibold" style={{ color: "#111c14" }}>AI Analytics Engine</p>
            <Badge tone={enabled ? "green" : "gray"} dot>{enabled ? "Active" : "Off"}</Badge>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: "#8fa394" }}>
            Analyzes AR / DTR submissions for volume, timing, and approval outcomes.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[13px] font-medium" style={{ color: enabled ? BRAND : "#8fa394" }}>{enabled ? "On" : "Off"}</span>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>
      </Card>

      {!enabled ? (
        <Card className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f0f2f0", color: "#b6c3ba" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
          </div>
          <p className="text-[16px] font-semibold mt-4" style={{ color: "#111c14" }}>AI Analytics is turned off</p>
          <p className="text-[13.5px] mt-1 max-w-sm" style={{ color: "#8fa394" }}>
            Turn on the engine above to compute insights from AR / DTR submissions.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              ["Records Submitted", "372", "green", "+8.4%"],
              ["On-time Rate", "86%", "green", "+3.1%"],
              ["Approved", "312", "green", "+5.2%"],
              ["Pending Review", "48", "amber", "-1.6%"],
            ].map(([l, v, tone, d]) => (
              <Card key={l} className="py-4">
                <p className="text-[12px]" style={{ color: "#8fa394" }}>{l}</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-[24px] font-bold tracking-tight" style={{ color: "#111c14" }}>{v}</p>
                  <Badge tone={tone as "green" | "amber"}>{d}</Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* AI computed analysis */}
          <Card style={{ background: "linear-gradient(180deg,#f4faf6,#ffffff)", border: "1px solid #dcebe1" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: BRAND }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>AI Analysis</p>
                  <p className="text-[11.5px]" style={{ color: "#8fa394" }}>Computed from 372 records · updated 2 min ago</p>
                </div>
              </div>
              <Badge tone="green" dot>Model confidence 88%</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {insights.map((ins) => (
                <div key={ins.label} className="rounded-2xl p-3.5" style={{ background: "#fff", border: "1px solid #eef1ef" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: toneColor[ins.tone] + "1f", color: toneColor[ins.tone] }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">{ins.icon}</svg>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: toneColor[ins.tone] }}>{ins.label}</span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "#3d4a41" }}>{ins.text}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: "#f0f2f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${ins.confidence}%`, background: toneColor[ins.tone] }} />
                    </div>
                    <span className="text-[10.5px] font-medium" style={{ color: "#8fa394" }}>{ins.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t text-[12.5px]" style={{ borderColor: "#e6efe9" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
              <span style={{ color: "#3d4a41" }}><span className="font-semibold" style={{ color: BRAND }}>Recommended action:</span> send an automated reminder Thursday 3 PM to cut the Friday backlog by an estimated 22%.</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
