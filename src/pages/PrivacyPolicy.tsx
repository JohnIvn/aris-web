import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Shield,
  Scale,
  Printer,
  Search,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Clock,
  Database,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import arisLogo from "@/assets/brand/image.png";

const privacySections = [
  { id: "statutory-framework", title: "1. Policy Statement & Statutory Framework" },
  { id: "categories", title: "2. Categories of Personal & Academic Data Collected" },
  { id: "processing-purposes", title: "3. Lawful Basis & Purposes of Data Processing" },
  { id: "principles", title: "4. Core Data Privacy Principles" },
  { id: "security-safeguards", title: "5. Security Safeguards & Technical Measures" },
  { id: "disclosures", title: "6. Controlled Data Sharing & Regulatory Disclosures" },
  { id: "retention", title: "7. Data Retention Schedules & Archival Standards" },
  { id: "rights", title: "8. Data Subject Rights under RA 10173" },
  { id: "dpo-contact", title: "9. Data Protection Officer (DPO) Inquiries" },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("statutory-framework");

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
              to="/terms"
              className="hidden items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3d4a41] transition hover:border-[#3a7d4e] hover:text-[#3a7d4e] sm:flex"
            >
              <Scale className="h-3.5 w-3.5 text-[#3a7d4e]" />
              <span>Terms of Service</span>
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
                <Shield className="h-3.5 w-3.5" />
                <span>Republic Act No. 10173 (DPA 2012) Compliant</span>
              </div>
              <h1 className="mt-4 text-[28px] font-bold tracking-tight text-[#111c14] sm:text-[36px]">
                Privacy Policy
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#5a6b5e] sm:text-[15px]">
                This Privacy Policy establishes how the University of Caloocan City (UCC) collects,
                safeguards, and processes personal, sensitive, and academic data within the
                Academic Records &amp; Information System (ARIS).
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
                <span>Authority: <strong>National Privacy Commission</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3a7d4e]" />
                <span>Scope: <strong>Students, Faculty &amp; Staff</strong></span>
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
                placeholder="Search privacy topics, DPA rights, retention..."
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
                {privacySections.map((section) => (
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
                  to="/terms"
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-medium text-[#3a7d4e] hover:bg-[#f0f7f2]"
                >
                  <span>View Terms of Service</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Body Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section
              id="statutory-framework"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Shield className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  1. Policy Statement &amp; Statutory Framework
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  The University of Caloocan City (UCC) recognizes and respects the fundamental constitutional right of every
                  individual to privacy and the protection of personal data. In operating the{" "}
                  <strong>Academic Records &amp; Information System (ARIS)</strong>, the university commits to rigorous compliance
                  with <strong>Republic Act No. 10173</strong>, otherwise known as the{" "}
                  <strong>Data Privacy Act of 2012 (DPA)</strong>, its Implementing Rules and Regulations (IRR), and all issuance
                  directives by the National Privacy Commission (NPC).
                </p>
                <p>
                  This Privacy Policy details the types of personal data collected, lawful bases for processing, retention intervals,
                  safeguards deployed, and the mechanisms through which data subjects may exercise their statutory rights.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="categories"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Database className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  2. Categories of Personal &amp; Academic Data Collected
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  To manage academic services, institutional reporting, and faculty workflows, ARIS processes the following categories:
                </p>
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#e8ece9] bg-[#fbfdfb] p-4">
                    <p className="text-[13.5px] font-bold text-[#111c14]">Personal &amp; Demographic Data</p>
                    <ul className="mt-2 list-disc pl-4 space-y-1 text-[12.5px] text-[#5a6b5e]">
                      <li>Full name, student ID / employee number</li>
                      <li>Official institutional email (<code className="font-mono text-[#245f37]">@ucc.edu.ph</code>)</li>
                      <li>Contact phone numbers &amp; home address</li>
                      <li>Official identification photographs</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e8ece9] bg-[#fbfdfb] p-4">
                    <p className="text-[13.5px] font-bold text-[#111c14]">Academic &amp; Faculty Records</p>
                    <ul className="mt-2 list-disc pl-4 space-y-1 text-[12.5px] text-[#5a6b5e]">
                      <li>Curricular enrollments &amp; semester registrations</li>
                      <li>Official midterm, finals, and completion grades</li>
                      <li>Class attendance, academic standing &amp; honors</li>
                      <li>Faculty teaching loads &amp; compensation metrics</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e8ece9] bg-[#fbfdfb] p-4">
                    <p className="text-[13.5px] font-bold text-[#111c14]">System Telemetry &amp; Audit Logs</p>
                    <ul className="mt-2 list-disc pl-4 space-y-1 text-[12.5px] text-[#5a6b5e]">
                      <li>IPv4/IPv6 addresses, browser types &amp; user agents</li>
                      <li>Timestamped login and session activity records</li>
                      <li>Audit trails of grade submissions and record edits</li>
                      <li>Hardware and software performance diagnostics</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e8ece9] bg-[#fbfdfb] p-4">
                    <p className="text-[13.5px] font-bold text-[#111c14]">Biometric &amp; Verification Data</p>
                    <ul className="mt-2 list-disc pl-4 space-y-1 text-[12.5px] text-[#5a6b5e]">
                      <li>Campus biometric check-in timestamps</li>
                      <li>Encrypted biometric templates (where enrolled)</li>
                      <li>Campus SSO tokens and OAuth assertions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="processing-purposes"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <FileText className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  3. Lawful Basis &amp; Purposes of Data Processing
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  Processing of personal and sensitive data in ARIS is anchored on lawful criteria under Sections 12 and 13 of RA 10173:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[#455449]">
                  <li>
                    <strong>Fulfillment of Academic Mandates:</strong> Processing is necessary to carry out institutional educational
                    functions, enrollment certification, transcript issuance, and degree conferrals under CHED regulations.
                  </li>
                  <li>
                    <strong>Compliance with Statutory Obligations:</strong> Generating mandatory institutional reports required by the
                    Commission on Higher Education (CHED), Department of Education (DepEd), and Philippine Professional Regulation Commission (PRC).
                  </li>
                  <li>
                    <strong>System Security &amp; Fraud Prevention:</strong> Preserving the authenticity of academic transcripts and preventing
                    unauthorized alterations through immutable cryptographic audit logging.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section
              id="principles"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Scale className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  4. Core Data Privacy Principles
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  ARIS operates strictly adhering to the three pillars of data protection mandated by the National Privacy Commission:
                </p>
                <div className="grid gap-3 pt-1 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-4">
                    <p className="text-[14px] font-bold text-[#2f7043]">Transparency</p>
                    <p className="mt-1 text-[12px] text-[#5a6b5e]">
                      Data subjects are notified of the exact purpose, nature, and extent of personal data processing prior to collection.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-4">
                    <p className="text-[14px] font-bold text-[#2f7043]">Legitimate Purpose</p>
                    <p className="mt-1 text-[12px] text-[#5a6b5e]">
                      Data is processed solely for lawful educational, administrative, and statutory reporting requirements of UCC.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-4">
                    <p className="text-[14px] font-bold text-[#2f7043]">Proportionality</p>
                    <p className="mt-1 text-[12px] text-[#5a6b5e]">
                      Only the minimum necessary data points required to execute specific university operations are gathered and stored.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section
              id="security-safeguards"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Lock className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  5. Security Safeguards &amp; Technical Measures
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  To prevent unauthorized disclosure, tampering, or data leakage, the following institutional safeguards are implemented:
                </p>
                <ul className="space-y-2 text-[13.5px]">
                  {[
                    "Encryption in Transit: All data transfers between user browsers, desktop clients, and ARIS servers enforce TLS 1.3 encryption.",
                    "Encryption at Rest: Database records and backups are protected using industry-standard AES-256 cryptographic algorithms.",
                    "Role-Based Access Control (RBAC): System permissions are strictly compartmentalized by institutional role (Administrator, Staff, Faculty, Student).",
                    "Session Security & Auto-Timeout: Inactive sessions are automatically invalidated after specified idle thresholds to prevent unauthorized workstation hijacking.",
                    "Immutable Audit Trails: System transactions, grade edits, and administrative overrides are permanently written to tamper-resistant audit stores.",
                  ].map((safeguard, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[10px] font-bold text-[#2f7043]">
                        ✓
                      </span>
                      <span>{safeguard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section
              id="disclosures"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Building2 className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  6. Controlled Data Sharing &amp; Regulatory Disclosures
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  <strong>ARIS does not sell, rent, monetize, or disclose student or faculty data to commercial advertising platforms.</strong>
                </p>
                <p>
                  Disclosures of records are strictly restricted to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#455449]">
                  <li>Statutory regulatory agencies: Commission on Higher Education (CHED), Civil Service Commission (CSC), Bureau of Internal Revenue (BIR).</li>
                  <li>Legal court orders, subpoenas, or statutory warrants issued by Philippine courts of competent jurisdiction.</li>
                  <li>Accreditation bodies (e.g., ALCUCOA) during formal, authorized institutional evaluation visits.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section
              id="retention"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Clock className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  7. Data Retention Schedules &amp; Archival Standards
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  In accordance with the <strong>National Archives of the Philippines Act (RA 9470)</strong> and CHED Memorandum Orders:
                </p>
                <div className="space-y-2 pt-1 text-[13px]">
                  <div className="flex items-center justify-between rounded-xl border border-[#edf2ee] bg-[#fbfdfb] p-3">
                    <span className="font-semibold text-[#111c14]">Permanent Academic Records (TOR, Degrees)</span>
                    <span className="font-medium text-[#2f7043]">Retained Indefinitely</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#edf2ee] bg-[#fbfdfb] p-3">
                    <span className="font-semibold text-[#111c14]">Class Attendance &amp; Interim Course Work</span>
                    <span className="font-medium text-[#5a6b5e]">5 Years after Term Conclusion</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#edf2ee] bg-[#fbfdfb] p-3">
                    <span className="font-semibold text-[#111c14]">System Access &amp; Security Audit Logs</span>
                    <span className="font-medium text-[#5a6b5e]">3 Years for Forensic Compliance</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section
              id="rights"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <UserCheck className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  8. Data Subject Rights under RA 10173
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  As an individual whose personal data is processed by ARIS, you are guaranteed the following statutory rights:
                </p>
                <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
                  {[
                    { title: "Right to be Informed", desc: "Know whether personal data pertaining to you is being processed." },
                    { title: "Right to Access", desc: "Request access to your personal files, transcript copies, and audit events." },
                    { title: "Right to Rectification", desc: "Dispute inaccuracy or error in records and have it corrected." },
                    { title: "Right to Erasure or Blocking", desc: "Request suspension or removal when lawful grounds exist." },
                    { title: "Right to Damages", desc: "Be indemnified for damages sustained due to inaccurate or unlawful data." },
                    { title: "Right to File Complaint", desc: "Lodge formal complaints with the National Privacy Commission (NPC)." },
                  ].map((right, idx) => (
                    <div key={idx} className="rounded-xl border border-[#e2e8e4] bg-[#fcfdfc] p-3">
                      <p className="text-[13px] font-bold text-[#111c14]">{right.title}</p>
                      <p className="mt-0.5 text-[12px] text-[#5a6b5e]">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section
              id="dpo-contact"
              className="scroll-mt-24 rounded-3xl border border-[#e2e8e4] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-2.5 text-[#3a7d4e]">
                <Building2 className="h-5 w-5" />
                <h2 className="text-[18px] font-bold tracking-tight text-[#111c14]">
                  9. Data Protection Officer (DPO) Inquiries
                </h2>
              </div>
              <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-[#455449]">
                <p>
                  For privacy concerns, exercising your data subject rights, or reporting potential data breaches, please
                  contact the University Data Protection Officer:
                </p>
                <div className="mt-3 rounded-2xl border border-[#d6e5d8] bg-[#f0f7f2] p-4 text-[13px] text-[#245f37]">
                  <p className="font-semibold">University of Caloocan City - Data Protection Office</p>
                  <p className="mt-1">
                    Administration Building, UCC Main Campus
                    <br />
                    Caloocan City, Metro Manila, Philippines
                    <br />
                    Email:{" "}
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
                  to="/terms"
                  className="rounded-xl border border-[#e2e8e4] bg-white px-5 py-2.5 text-[13.5px] font-medium text-[#3d4a41] transition hover:bg-[#f7f9f8]"
                >
                  Read Terms of Service
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

