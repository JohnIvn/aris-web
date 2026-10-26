import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Card, PageTitle, PrimaryButton, GhostButton } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { useSupportRealtime } from "@/hooks/useSupportRealtime";
import { saveResource } from "@/services/dataSource";

const supportEmail = "admin@ucc.edu.ph";

export default function Support() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { data: tickets, reload } = useResource<Array<{ id: string; title: string; status: string; createdAt: string }>>("/support/tickets", []);
  const refreshTickets = useCallback(() => reload(), [reload]);
  useSupportRealtime(refreshTickets);

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    try {
      await saveResource("/support/tickets", { subject, description: details }, "POST");
      setSubject("");
      setDetails("");
      setMessage("Your support ticket was submitted.");
      reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to submit support ticket.");
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title="Support Center"
        subtitle="Get help with your ARIS administrator account and campus workflows."
        action={
          <PrimaryButton onClick={() => navigate("/support/messages")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message Staff / Profs
          </PrimaryButton>
        }
      />

      {/* Banner linking to direct messaging */}
      <Card className="mb-4 bg-gradient-to-r from-[#f0f7f2] to-white border border-[#c3dfcb] flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#3a7d4e] text-white flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#111c14]">Direct Staff &amp; Faculty Messaging</h2>
            <p className="text-[12px] text-[#5a6b5e]">Send direct messages and inquiries to department professors or administrative staff.</p>
          </div>
        </div>
        <GhostButton onClick={() => navigate("/support/messages")}>
          Open Messages
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 ml-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </GhostButton>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card>
          <h2 className="text-[15px] font-semibold text-[#111c14]">Contact IT administration</h2>
          <p className="mt-1 text-[12.5px] text-[#8fa394]">Describe the issue and the support team will respond here.</p>
          {message && <p role="status" className="mt-3 rounded-lg bg-[#eef7f0] px-3 py-2 text-[12px] text-[#2f7043]">{message}</p>}
          <form onSubmit={submitRequest} className="mt-5 space-y-4">
            <label className="block text-[12px] font-medium text-[#3d4a41]">
              Subject
              <input required value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4" }} />
            </label>
            <label className="block text-[12px] font-medium text-[#3d4a41]">
              What do you need help with?
              <textarea required rows={5} value={details} onChange={(event) => setDetails(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border bg-white p-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4" }} />
            </label>
            <PrimaryButton onClick={() => {}}>Email support</PrimaryButton>
          </form>
          <p className="mt-4 text-[12px] text-[#738176]">Support email: {supportEmail}</p>
        </Card>
        <Card>
          <h2 className="text-[15px] font-semibold text-[#111c14]">My tickets</h2>
          <div className="mt-3 space-y-2">
            {tickets.length === 0 && <p className="text-[12px] text-[#8fa394]">No support tickets yet.</p>}
            {tickets.map((ticket) => <div key={ticket.id} className="rounded-lg border border-[#edf0ed] p-3">
              <p className="text-[13px] font-medium text-[#3d4a41]">{ticket.title}</p>
              <p className="mt-1 text-[11px] text-[#8fa394]">{ticket.status} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>)}
          </div>
          <h2 className="mt-6 text-[15px] font-semibold text-[#111c14]">Common questions</h2>
          <div className="mt-3 divide-y divide-[#eef1ef]">
            <details className="py-3">
              <summary className="cursor-pointer text-[13px] font-medium text-[#3d4a41]">How do I reset my password?</summary>
              <p className="mt-2 text-[12px] leading-relaxed text-[#738176]">Use Forgot? on the sign-in screen to prepare a password-reset request for IT.</p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer text-[13px] font-medium text-[#3d4a41]">Where can I review backup status?</summary>
              <p className="mt-2 text-[12px] leading-relaxed text-[#738176]">Open Database from the main navigation and select Backups &amp; Snapshots.</p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer text-[13px] font-medium text-[#3d4a41]">How do I report an account issue?</summary>
              <p className="mt-2 text-[12px] leading-relaxed text-[#738176]">Send the support form with your account email and the steps that led to the issue.</p>
            </details>
          </div>
        </Card>
      </div>
    </div>
  );
}
