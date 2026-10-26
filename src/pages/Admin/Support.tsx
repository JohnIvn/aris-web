import { useCallback, useState, type FormEvent } from "react";
import { Card, PageTitle, PrimaryButton } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { useSupportRealtime } from "@/hooks/useSupportRealtime";
import { saveResource } from "@/services/dataSource";

const supportEmail = "admin@ucc.edu.ph";

export default function Support() {
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
      <PageTitle title="Support Center" subtitle="Get help with your ARIS administrator account and campus workflows." />
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