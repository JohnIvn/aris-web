import { BRAND } from "@/config/navigation";
import { Card, PageTitle, PrimaryButton, GhostButton } from "@/components/ui";

const faqs = [
  { q: "When are AR / DTR submissions due?", a: "Each cycle closes Friday at 5:00 PM. Late entries roll to the next cycle and may affect your on-time rate." },
  { q: "Why was my DTR flagged?", a: "The most common reason is a name that does not match the official roster. Re-check spelling and resubmit." },
  { q: "How long does HR verification take?", a: "Most records are reviewed within one business day. Pending items appear in your History with an amber badge." },
  { q: "Can I edit a submitted record?", a: "Submitted records are locked. If a correction is needed, contact HR and file a new record for the same period." },
];

const channels = [
  { label: "HR Help Desk", detail: "hr@aris.edu.ph · ext. 204", icon: <path d="M4 4h16v12H5.17L4 17.17V4z" /> },
  { label: "IT Support", detail: "it@aris.edu.ph · ext. 118", icon: <><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></> },
];

export default function ProfSupport() {
  return (
    <div className="pb-2">
      <PageTitle title="Support" subtitle="Answers to common AR / DTR questions and how to reach a person." />

      <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
        <Card>
          <p className="text-[15px] font-semibold mb-1" style={{ color: "#111c14" }}>Frequently asked</p>
          <p className="text-[12.5px] mb-4" style={{ color: "#8fa394" }}>Quick answers about submissions and verification.</p>
          <div className="divide-y" style={{ borderColor: "#f2f4f2" }}>
            {faqs.map((f) => (
              <div key={f.q} className="py-3.5 first:pt-0">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[11px] font-bold" style={{ background: BRAND }}>Q</span>
                  <div>
                    <p className="text-[13.5px] font-medium" style={{ color: "#111c14" }}>{f.q}</p>
                    <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#5a6b5e" }}>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>Contact</p>
            <div className="space-y-3">
              {channels.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0f7f2", color: BRAND }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">{c.icon}</svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: "#111c14" }}>{c.label}</p>
                    <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ background: "linear-gradient(180deg,#f4faf6,#ffffff)", border: "1px solid #dcebe1" }}>
            <p className="text-[13.5px] font-semibold" style={{ color: "#111c14" }}>Still stuck?</p>
            <p className="text-[12.5px] mt-1 mb-3 leading-relaxed" style={{ color: "#5a6b5e" }}>Open a ticket and the help desk will follow up by email.</p>
            <div className="flex gap-2">
              <PrimaryButton>New Ticket</PrimaryButton>
              <GhostButton>Live Chat</GhostButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
