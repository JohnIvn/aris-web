import { useState, type FormEvent } from "react";
import { Card, PageTitle, PrimaryButton } from "@/components/ui";

const supportEmail = "admin@ucc.edu.ph";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
    window.location.href = mailto;
  };

  return (
    <div className="pb-4">
      <PageTitle title="Support Center" subtitle="Get help with your ARIS administrator account and campus workflows." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card>
          <h2 className="text-[15px] font-semibold text-[#111c14]">Contact IT administration</h2>
          <p className="mt-1 text-[12.5px] text-[#8fa394]">Describe the issue and your email app will open a prepared support request.</p>
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
          <a href={`mailto:${supportEmail}`} className="mt-4 inline-block text-[12px] font-medium text-[#3a7d4e] hover:underline">{supportEmail}</a>
        </Card>
        <Card>
          <h2 className="text-[15px] font-semibold text-[#111c14]">Common questions</h2>
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