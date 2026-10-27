import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Scale,
  Shield,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import arisLogo from "@/assets/brand/image.png";

const sections = [
  { id: "acceptance", title: "1. Institutional Scope & Acceptance of Terms" },
  { id: "accounts", title: "2. User Eligibility & Account Security" },
  { id: "academic-integrity", title: "3. Academic Records, Grading & Audit Integrity" },
  { id: "acceptable-use", title: "4. Acceptable Use & System Security" },
  { id: "confidentiality", title: "5. Data Confidentiality & Student Privacy" },
  { id: "intellectual-property", title: "6. Institutional Intellectual Property" },
  { id: "availability", title: "7. System Availability, Backups & Maintenance" },
  { id: "violations", title: "8. Violations, Sanctions & Legal Liability" },
  { id: "contact", title: "9. Governance, Amendments & IT Inquiries" },
];

export default function TermsOfService() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[#f8faf8] text-[#111c14] selection:bg-[#3a7d4e]/15 selection:text-[#111c14]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8e4] bg-white/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-xl px-2 py-1 transition hover:bg-[#f2f5f3]"
              title="Return to ARIS Login"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d1a10] p-1.5 shadow-sm">
                <img src={arisLogo} alt="ARIS Logo" className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <span className="block text-[14px] font-bold leading-none tracking-tight text-[#111c14]">
                  ARIS
                </span>
                <span className="block text-[10.5px] font-medium text-[#5a6b5e]">
                  Academic Records &amp; Information System
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/privacy"
              className="hidden items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3d4a41] transition hover:border-[#3a7d4e] hover:text-[#3a7d4e] sm:flex"
            >
              <Shield className="h-3.5 w-3.5 text-[#3a7d4e]" />
              <span>Privacy Policy</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3d4a41] transition hover:bg-[#f7f9f8]"
              title="Print or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-[#5a6b5e]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-xl bg-[#3a7d4e] px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-[#326d44] active:scale-[0.98]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Document Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-[0_2px_12px_rgba(16,32,20,0.04)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e5d8] bg-[#eaf4ee] px-3 py-1 text-[11px] font-semibold text-[#2f7043]">
                <Scale className="h-3.5 w-3.5" />
                <span>Official Institutional Regulations</span>
              </div>
              <h1 className="mt-4 text-[28px] font-bold tracking-tight text-[#111c14] sm:text-[36px]">
                Terms of Service
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#5a6b5e] sm:text-[15px]">
                These Terms of Service govern the access, utilization, and responsibilities associated
                with the Academic Records &amp; Information System (ARIS) for administrators, staff,
                faculty members, and students at the University of Caloocan City (UCC).
              </p>
            </div>

            {/* Badges / Meta */}
            <div className="flex flex-wrap gap-2.5 rounded-2xl border border-[#edf1ee] bg-[#f8faf8] p-4 text-[12px] text-[#5a6b5e] sm:w-auto lg:flex-col lg:min-w-[220px]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#3a7d4e]" />
                <span>Last Updated: <strong>October 2026</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#3a7d4e]" />
                <span>Institution: <strong>University of Caloocan City</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#3a7d4e]" />
                <span>Version: <strong>2.4.0 (Enterprise)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#3a7d4e]" />
                <span>Compliance: <strong>RA 10173 &amp; RA 10175</strong></span>
              </div>
            </div>
          </div>

          {/* Search bar inside document */}
          <div className="mt-6 pt-6 border-t border-[#edf1ee] print:hidden">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa394]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms, policies, or regulations..."
                className="h-10 w-full rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] pl-10 pr-4 text-[13px] text-[#111c14] outline-none transition focus:border-[#3a7d4e] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8fa394] hover:text-[#111c14]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout with Table of Contents */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Table of contents (sticky sidebar on desktop) */}
          <aside className="hidden lg:block print:hidden">
            <div className="sticky top-20 rounded-2xl border border-[#e2e8e4] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8fa394]">
                Table of Contents
              </p>
              <nav className="mt-3 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-[12.5px] transition ${
                      activeSection === section.id
                        ? "bg-[#eaf4ee] font-semibold text-[#2f7043]"
                        : "text-[#5a6b5e] hover:bg-[#f5f8f5] hover:text-[#111c14]"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-5 border-t border-[#eef2ee] pt-4">
                <Link
                  to="/privacy"
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-medium text-[#3a7d4e] hover:bg-[#f0f7f2]"
                >
                  <span>View Privacy Policy</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Body Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section
              id="acceptance"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <FileText className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  1. Institutional Scope &amp; Acceptance of Terms
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  By accessing, browsing, or logging into the <strong>Academic Records &amp; Information System (ARIS)</strong>,
                  including its web portal, desktop client, and mobile endpoints, you explicitly acknowledge and agree to be
                  bound by these Terms of Service, the University of Caloocan City Code of Student and Employee Conduct,
                  and all applicable statutory laws of the Republic of the Philippines.
                </p>
                <p>
                  ARIS is the official enterprise academic repository and management infrastructure of University of Caloocan City.
                  If you do not agree with any provision set forth herein, you are strictly prohibited from accessing this system
                  and must immediately cease using all ARIS accounts and associated university digital services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="accounts"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Shield className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  2. User Eligibility &amp; Account Security
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Access to ARIS is strictly reserved for active faculty members, administrative staff, authorized IT personnel,
                  and officially enrolled students. All accounts are provisioned exclusively through authorized university
                  domain credentials (<code className="rounded bg-[#f0f4f1] px-1.5 py-0.5 text-[13px] font-mono text-[#245f37]">@ucc.edu.ph</code>).
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[#455449]">
                  <li>
                    <strong>Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your
                    login credentials, password, multi-factor tokens, and session keys. Account sharing, lending, or delegation of
                    administrative rights is strictly prohibited.
                  </li>
                  <li>
                    <strong>Single Sign-On (SSO) &amp; Biometrics:</strong> Where Campus SSO or biometric authentication is enabled,
                    you must not attempt to circumvent verification protocols or simulate identity via proxy.
                  </li>
                  <li>
                    <strong>Duty to Report:</strong> Any suspected credential compromise, unauthorized session, or anomalous account
                    activity must be reported immediately to the IT Administration (<a href="mailto:admin@ucc.edu.ph" className="font-medium text-[#3a7d4e] underline">admin@ucc.edu.ph</a>).
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="academic-integrity"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Scale className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  3. Academic Records, Grading &amp; Audit Integrity
                </h2>
              </div>

              {/* Critical Callout Box */}
              <div className="mt-4 rounded-2xl border border-[#f5c6cb] bg-[#fff5f5] p-4 text-[#842029]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#c0392b] mt-0.5" />
                  <div className="text-[13px] leading-relaxed">
                    <p className="font-bold text-[#a71d2a]">
                      Critical Notice on Academic Record Tampering:
                    </p>
                    <p className="mt-1">
                      Falsification of scholastic records, unauthorized grade adjustments, illicit unit crediting,
                      or manipulation of faculty evaluation scores constitutes criminal forgery under the Revised Penal Code
                      and an offense punishable by perpetual disqualification from academic service and criminal prosecution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Faculty and administrative staff are entrusted with privileged authority to enter, compute, and certify student
                  evaluations. In exercising this role, users agree to:
                </p>
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#edf2ee] bg-[#fbfdfb] p-3.5">
                    <p className="text-[13px] font-semibold text-[#111c14]">Permanent Audit Logs</p>
                    <p className="mt-1 text-[12px] text-[#637267]">
                      Every grade entry, modification, syllabus approval, and transcript export is permanently cryptographically
                      timestamped with user ID and originating IP.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#edf2ee] bg-[#fbfdfb] p-3.5">
                    <p className="text-[13px] font-semibold text-[#111c14]">Submission Deadlines</p>
                    <p className="mt-1 text-[12px] text-[#637267]">
                      All midterm and final grade submissions must comply with the Academic Calendar deadlines set by the
                      University Registrar and Academic Council.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section
              id="acceptable-use"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Lock className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  4. Acceptable Use &amp; System Security
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Users must use ARIS strictly for lawful, authorized university operational and pedagogical functions.
                  You agree NOT to engage in any of the following restricted actions:
                </p>
                <ul className="space-y-2 text-[13.5px]">
                  {[
                    "Attempting to circumvent, probe, scan, or breach system security, firewalls, or authentication barriers.",
                    "Executing automated scripts, scrapers, data crawlers, or unauthorized API stress tests against ARIS endpoints.",
                    "Introducing viruses, trojan routines, ransomware, or malicious payloads into the system architecture.",
                    "Intercepting, sniffing, or decrypting network traffic transmitted between clients and ARIS servers.",
                    "Exporting bulk student personally identifiable information (PII) without prior written clearance from the University Data Protection Officer.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section
              id="confidentiality"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Shield className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  5. Data Confidentiality &amp; Student Privacy
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Student academic and biographical records are legally classified as confidential and protected under
                  <strong> Republic Act No. 10173 (Data Privacy Act of 2012)</strong>.
                </p>
                <p>
                  Personnel granted administrative or faculty access to ARIS act as authorized data handlers. You must never
                  divulge student scores, behavioral infractions, payroll calculations, or home addresses to third parties,
                  private commercial entities, or unverified callers without formal authorization from the University Registrar.
                </p>
                <div className="pt-2">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#eaf4ee] px-4 py-2 text-[13px] font-semibold text-[#2f7043] transition hover:bg-[#d8ecdf]"
                  >
                    <span>Read Full ARIS Privacy Policy</span>
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section
              id="intellectual-property"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Building2 className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  6. Institutional Intellectual Property
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  All proprietary rights, software source code, database architectures, graphics, user interface designs,
                  and institutional brand marks displayed on ARIS are the exclusive intellectual property of the
                  University of Caloocan City and its designated technology development team.
                </p>
                <p>
                  Users may not decompile, reverse engineer, copy, or redistribute any component of the ARIS codebase
                  without explicit, written consent from the University Board of Regents.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section
              id="availability"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Clock className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  7. System Availability, Backups &amp; Maintenance
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  The University IT Administration endeavors to ensure 99.5% system availability during active academic terms.
                  However, scheduled maintenance, critical security patches, server migrations, and power contingencies
                  may necessitate temporary downtime.
                </p>
                <p>
                  Users will receive advance notice via the ARIS Announcement Board and official email alerts whenever feasible.
                  Routine database snapshots and automated backups are performed daily to preserve record integrity.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section
              id="violations"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  8. Violations, Sanctions &amp; Legal Liability
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Failure to comply with any provision of these Terms may result in immediate administrative intervention,
                  including but not limited to:
                </p>
                <div className="grid gap-3 pt-1 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-3 text-center">
                    <span className="block text-[14px] font-bold text-[#c0392b]">Administrative</span>
                    <span className="mt-1 block text-[12px] text-[#5a6b5e]">
                      Immediate account revocation, suspension of faculty loading, or disciplinary hearings.
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-3 text-center">
                    <span className="block text-[14px] font-bold text-[#c0392b]">Civil Action</span>
                    <span className="mt-1 block text-[12px] text-[#5a6b5e]">
                      Indemnification for institutional damage, forensic recovery expenses, and reputational injury.
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-3 text-center">
                    <span className="block text-[14px] font-bold text-[#c0392b]">Criminal Prosecution</span>
                    <span className="mt-1 block text-[12px] text-[#5a6b5e]">
                      Formal charges under RA 10175 (Cybercrime Act) and Revised Penal Code.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section
              id="contact"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Building2 className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  9. Governance, Amendments &amp; IT Inquiries
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  These Terms of Service are reviewed annually by the University Academic Council and the Management
                  Information Systems (MIS) Directorate. We reserve the right to amend these guidelines to align with
                  new CHED directives and statutory updates.
                </p>
                <div className="mt-4 rounded-2xl border border-[#d6e5d8] bg-[#f0f7f2] p-4 text-[13px] text-[#245f37]">
                  <p className="font-semibold">IT Administration Contact:</p>
                  <p className="mt-1">
                    Management Information Systems (MIS) / IT Directorate
                    <br />
                    University of Caloocan City - Main Campus
                    <br />
                    Official Email:{" "}
                    <a href="mailto:admin@ucc.edu.ph" className="font-bold underline">
                      admin@ucc.edu.ph
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Return Card */}
            <div className="rounded-3xl border border-[#e2e8e4] bg-white p-6 text-center shadow-sm sm:p-8 print:hidden">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4ee] text-[#2f7043]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-[17px] font-bold text-[#111c14]">
                Ready to proceed?
              </h3>
              <p className="mx-auto mt-1 max-w-md text-[13px] text-[#5a6b5e]">
                Return to the ARIS sign-in page to access your administrator, staff, or faculty workspace.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-xl bg-[#3a7d4e] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#326d44] active:scale-[0.98]"
                >
                  Return to Login
                </button>
                <Link
                  to="/privacy"
                  className="rounded-xl border border-[#e2e8e4] bg-white px-5 py-2.5 text-[13.5px] font-medium text-[#3d4a41] transition hover:bg-[#f7f9f8]"
                >
                  Read Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#e2e8e4] bg-white py-6 text-center text-[12px] text-[#8fa394] print:hidden">
        <p>ARIS &copy; {new Date().getFullYear()} University of Caloocan City. All rights reserved.</p>
        <p className="mt-1">
          Academic Records &amp; Information System • Republic Act No. 10173 &amp; 10175 Compliant
        </p>
      </footer>
    </div>
  );
}

