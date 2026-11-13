import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Download,
  ShieldCheck,
  Check,
  Copy,
  Laptop,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  HardDrive,
  FileCode,
  Layers,
  ChevronDown,
  Cpu,
  Fingerprint,
  BellRing,
  WifiOff,
  QrCode,
  Scale,
  Shield,
  Clock,
  Building2,
} from "lucide-react";
import arisLogo from "@/assets/brand/image.png";

export default function Downloads() {
  const navigate = useNavigate();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const desktopRelease = {
    osName: "Windows",
    arch: "x64 (Windows 10, 11)",
    fileFormat: ".exe installer",
    fileName: "ARIS-Desktop-Setup-0.1.0-x64.exe",
    version: "v0.1.0-alpha",
    size: "18.4 MB",
    date: "October 2026",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    badge: "Official Windows Release",
    instructions: [
      "Download ARIS-Desktop-Setup-0.1.0-x64.exe to your PC.",
      "Launch the installer. If Microsoft Defender SmartScreen prompts 'Windows protected your PC', click 'More info' and then 'Run anyway'.",
      "Follow the on-screen setup wizard to complete installation.",
      "Open ARIS Desktop and log in using your UCC institutional credentials.",
    ],
  };

  const mobileRelease = {
    osName: "Android",
    arch: "Android 8.0 (Oreo) and above",
    fileFormat: ".apk package",
    fileName: "aris-mobile-release-v1.0.1.apk",
    version: "v1.0.1+1",
    size: "24.6 MB",
    date: "October 2026",
    badge: "Direct APK Package",
    instructions: [
      "Tap 'Download Android APK' on your device or scan the QR code with your phone camera.",
      "When prompted by your browser, select 'Download anyway'.",
      "Open the downloaded APK. If prompted, toggle 'Allow installation from this source'.",
      "Tap 'Install' and launch ARIS Mobile. Sign in with your UCC student or employee email.",
    ],
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const triggerDownload = (fileName: string, platform: string) => {
    setDownloadNotice(`Preparing download for ${fileName} (${platform})...`);
    // Create simulated file download
    const dummyBlob = new Blob([
      `ARIS Client Application Package: ${fileName}\nUniversity of Caloocan City - Academic Records & Information System\nBuild: 2026-Enterprise\nOfficial Repository: https://ucc.edu.ph/aris\n`
    ], { type: "text/plain" });
    const url = URL.createObjectURL(dummyBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  const currentDesktop = desktopRelease;
  const currentMobile = mobileRelease;

  const faqs = [
    {
      q: "Are the desktop and mobile applications safe to install?",
      a: "Yes. All ARIS clients are officially engineered and maintained by the University of Caloocan City (UCC) Capstone Development & IT Administration Team. They connect directly to the encrypted ARIS institutional backend over TLS 1.3.",
    },
    {
      q: "Why does Windows SmartScreen warn about an 'Unknown Publisher'?",
      a: "During academic pilot and capstone phases, the executable uses UCC's internal academic certificate rather than a commercial EV code-signing certificate. Click 'More info' and then 'Run anyway' to proceed safely.",
    },
    {
      q: "Can faculty, staff, and students use the same mobile app?",
      a: "Yes. ARIS Mobile uses unified role-based authentication. Once you sign in with your UCC institutional email, the interface dynamically displays the student portal, faculty grading and schedule, or administrative approvals based on your assigned role.",
    },
    {
      q: "What features are exclusive to the Desktop Application?",
      a: "ARIS Desktop integrates direct USB hardware drivers for campus biometric fingerprint & facial scanners, supports multi-window split screening for grade encoding, and features a local SQLite encrypted offline cache for uninterrupted work during network outages.",
    },
    {
      q: "How does offline mode sync data once reconnected?",
      a: "When working offline in ARIS Desktop, changes (such as attendance and grade drafts) are queued in an encrypted local transaction vault. Once an internet connection is re-established, records are automatically reconciled with audit conflict resolution.",
    },
  ];

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[#f8faf8] text-[#111c14] selection:bg-[#3a7d4e]/15 selection:text-[#111c14]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8e4] bg-white/95 backdrop-blur-md">
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
              <span>Terms</span>
            </Link>

            <Link
              to="/privacy"
              className="hidden items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3d4a41] transition hover:border-[#3a7d4e] hover:text-[#3a7d4e] sm:flex"
            >
              <Shield className="h-3.5 w-3.5 text-[#3a7d4e]" />
              <span>Privacy</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-xl bg-[#3a7d4e] px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-[#326d44] active:scale-[0.98]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Download Toast */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#b8dfc4] bg-[#eaf4ee] px-4 py-3 text-[13px] font-medium text-[#1e5831] shadow-lg animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-[#3a7d4e] flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[#e2e8e4] bg-gradient-to-b from-white to-[#fcfdfc] p-6 shadow-[0_2px_12px_rgba(16,32,20,0.04)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e5d8] bg-[#eaf4ee] px-3.5 py-1 text-[11.5px] font-semibold text-[#2f7043]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Official UCC Multi-Platform Clients</span>
              </div>
              <h1 className="mt-4 text-[30px] font-bold tracking-tight text-[#111c14] sm:text-[40px] leading-[1.12]">
                Download ARIS for <br className="hidden sm:inline" />
                <span className="text-[#3a7d4e]">Desktop &amp; Mobile</span>
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a6b5e] sm:text-[15.5px]">
                Access academic records, biometric attendance, curriculum management, and institutional notifications anywhere. Built with native performance and security for administrators, faculty, and students of the University of Caloocan City.
              </p>

              {/* Jump links */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-[12.5px]">
                <a
                  href="#desktop-section"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cbe1d0] bg-[#f0f7f2] px-3.5 py-2 font-medium text-[#29653a] transition hover:bg-[#e4f1e7]"
                >
                  <Monitor className="h-4 w-4" />
                  <span>Jump to Desktop (Windows)</span>
                </a>
                <a
                  href="#mobile-section"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cbe1d0] bg-[#f0f7f2] px-3.5 py-2 font-medium text-[#29653a] transition hover:bg-[#e4f1e7]"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Jump to Mobile (Android)</span>
                </a>
              </div>
            </div>

            {/* Institutional Meta */}
            <div className="flex flex-wrap gap-2.5 rounded-2xl border border-[#edf1ee] bg-[#f8faf8] p-5 text-[12px] text-[#5a6b5e] sm:w-auto lg:flex-col lg:min-w-[240px]">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#3a7d4e]" />
                <span>Institution: <strong>University of Caloocan City</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#3a7d4e]" />
                <span>Security: <strong>TLS 1.3 &amp; AES-256</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#3a7d4e]" />
                <span>Sync: <strong>Real-time Supabase Engine</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Cpu className="h-4 w-4 text-[#3a7d4e]" />
                <span>Engine: <strong>Tauri + Rust &amp; Flutter</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Desktop Application */}
        <section id="desktop-section" className="mt-12 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-[#3a7d4e] font-semibold text-[13px] tracking-wide uppercase">
                <Laptop className="h-4 w-4" />
                <span>Desktop Workspace</span>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111c14] tracking-tight">
                ARIS Desktop for Windows
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f5f3] text-[12px] font-medium text-[#445548] border border-[#e2e8e4]">
              Tauri Native Engine
            </span>
          </div>

          <div className="rounded-3xl border border-[#e2e8e4] bg-white p-6 sm:p-8 shadow-sm">
            {/* Desktop OS Banner */}
            <div className="flex items-center justify-between border-b border-[#edf1ee] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ee] text-[#2f7043]">
                  <Monitor className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[13.5px] font-bold text-[#111c14] leading-none">
                    Windows Client Edition
                  </span>
                  <span className="block text-[11px] text-[#5a6b5e] mt-0.5">
                    Windows 10 / Windows 11 (64-bit)
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf4ee] text-[11px] font-semibold text-[#2f7043] border border-[#d2e4d6]">
                <Check className="h-3 w-3" />
                Official Installer
              </span>
            </div>

            {/* Desktop Card Details */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Download details & action */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#eaf4ee] text-[#2f7043] border border-[#d2e4d6] mb-2">
                    {currentDesktop.badge}
                  </div>
                  <h3 className="text-[20px] font-bold text-[#111c14]">
                    ARIS Desktop for Windows
                  </h3>
                  <p className="text-[13.5px] text-[#5a6b5e] mt-1">
                    Complete administrative and faculty environment with USB biometric driver integration and offline record caching.
                  </p>
                </div>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Version</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">{currentDesktop.version}</span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Package</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">{currentDesktop.fileFormat}</span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Download Size</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">{currentDesktop.size}</span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Architecture</span>
                    <span className="block text-[12px] font-bold text-[#111c14] mt-0.5 truncate" title={currentDesktop.arch}>
                      64-bit (x64)
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => triggerDownload(currentDesktop.fileName, currentDesktop.osName)}
                    className="flex items-center justify-center gap-2.5 rounded-xl bg-[#3a7d4e] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(58,125,78,0.32)] transition hover:bg-[#326d44] active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download for {currentDesktop.osName}</span>
                  </button>

                  <span className="text-[12px] text-[#718576] text-center sm:text-left">
                    File: <code className="font-mono text-[#334638] bg-[#f0f4f1] px-1.5 py-0.5 rounded">{currentDesktop.fileName}</code>
                  </span>
                </div>

                {/* SHA-256 Checksum Box */}
                <div className="rounded-xl border border-[#edf1ee] bg-[#f9fbf9] p-3.5">
                  <div className="flex items-center justify-between text-[11.5px] text-[#5a6b5e] mb-1.5">
                    <span className="font-medium flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5 text-[#3a7d4e]" />
                      SHA-256 Integrity Checksum
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(currentDesktop.sha256)}
                      className="inline-flex items-center gap-1 text-[#2f7043] font-semibold hover:underline"
                    >
                      {copiedHash === currentDesktop.sha256 ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block font-mono text-[11px] text-[#3d4a41] break-all bg-white p-2 rounded-lg border border-[#e2e8e4]">
                    {currentDesktop.sha256}
                  </code>
                </div>
              </div>

              {/* Right Column: Desktop Features & Instructions */}
              <div className="lg:col-span-5 rounded-2xl border border-[#e2e8e4] bg-[#f8faf8] p-5 space-y-5">
                <div>
                  <h4 className="text-[13.5px] font-bold text-[#111c14] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#3a7d4e]" />
                    <span>Desktop App Exclusive Features</span>
                  </h4>
                  <ul className="mt-3 space-y-2.5 text-[12.5px] text-[#4a5c4f]">
                    <li className="flex items-start gap-2">
                      <Fingerprint className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>USB Biometric Scanner Support:</strong> Plugs directly into UCC campus optical fingerprint readers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <WifiOff className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>Encrypted Offline Cache:</strong> Keep grading and verifying rosters even when internet drops.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <HardDrive className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>High-Speed Native Tauri Core:</strong> Consumes 80% less memory than browser tabs or Electron.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BellRing className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>OS Notification Center:</strong> Instant desktop alerts for pending approvals and ticket updates.</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-[#e2e8e4] pt-4">
                  <h4 className="text-[13px] font-bold text-[#111c14] mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#3a7d4e]" />
                    <span>How to Install on {currentDesktop.osName}</span>
                  </h4>
                  <ol className="space-y-2 text-[12px] text-[#5a6b5e] list-decimal list-inside">
                    {currentDesktop.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Mobile Application */}
        <section id="mobile-section" className="mt-14 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-[#3a7d4e] font-semibold text-[13px] tracking-wide uppercase">
                <Smartphone className="h-4 w-4" />
                <span>Mobile Client</span>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111c14] tracking-tight">
                ARIS Mobile for Android
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f5f3] text-[12px] font-medium text-[#445548] border border-[#e2e8e4]">
              Flutter Engine v3
            </span>
          </div>

          <div className="rounded-3xl border border-[#e2e8e4] bg-white p-6 sm:p-8 shadow-sm">
            {/* Mobile OS Banner */}
            <div className="flex items-center justify-between border-b border-[#edf1ee] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ee] text-[#2f7043]">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[13.5px] font-bold text-[#111c14] leading-none">
                    Android Client Edition
                  </span>
                  <span className="block text-[11px] text-[#5a6b5e] mt-0.5">
                    Android 8.0 (Oreo) and newer
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf4ee] text-[11px] font-semibold text-[#2f7043] border border-[#d2e4d6]">
                <Check className="h-3 w-3" />
                Direct APK Package
              </span>
            </div>

            {/* Mobile Content */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Mobile Details & Action */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#eaf4ee] text-[#2f7043] border border-[#d2e4d6] mb-2">
                    {currentMobile.badge}
                  </div>
                  <h3 className="text-[20px] font-bold text-[#111c14]">
                    ARIS Mobile for Android
                  </h3>
                  <p className="text-[13.5px] text-[#5a6b5e] mt-1">
                    Carry your academic schedule, digital student/faculty ID, QR attendance pass, and grade alerts in your pocket.
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Version</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">{currentMobile.version}</span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Compatibility</span>
                    <span className="block text-[12px] font-bold text-[#111c14] mt-0.5 truncate" title={currentMobile.arch}>
                      Android 8.0+
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Size</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">{currentMobile.size}</span>
                  </div>
                  <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-center">
                    <span className="block text-[11px] text-[#718576]">Framework</span>
                    <span className="block text-[13px] font-bold text-[#111c14] mt-0.5">Flutter</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => triggerDownload(currentMobile.fileName, "Android APK")}
                    className="flex items-center justify-center gap-2.5 rounded-xl bg-[#3a7d4e] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(58,125,78,0.32)] transition hover:bg-[#326d44] active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Android APK</span>
                  </button>

                  <span className="text-[12px] text-[#718576] text-center sm:text-left">
                    Direct installation: No registration required for UCC domain emails.
                  </span>
                </div>

                {/* Mobile Features List */}
                <div className="rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-4">
                  <h4 className="text-[13px] font-bold text-[#111c14] mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#3a7d4e]" />
                    <span>Mobile Highlights</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-[#4a5c4f]">
                    <div className="flex items-start gap-2">
                      <QrCode className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>QR Campus Scanner:</strong> Tap camera to register lecture attendance in seconds.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BellRing className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>Grade Release Alerts:</strong> Get notified instantly when professors publish grades.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Fingerprint className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>Biometric Sign-in:</strong> Fast unlock using phone fingerprint or Face ID.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <HardDrive className="h-4 w-4 text-[#3a7d4e] flex-shrink-0 mt-0.5" />
                      <span><strong>Digital UCC ID:</strong> Offline verifiable student and faculty identification.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scan to Download QR Code & Sideload Instructions */}
              <div className="lg:col-span-5 rounded-2xl border border-[#e2e8e4] bg-[#f8faf8] p-6 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-[#2f7043] border border-[#d2e4d6] shadow-2xs">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan with Phone Camera</span>
                </div>
                <h4 className="text-[15px] font-bold text-[#111c14]">
                  Install Directly on Your Phone
                </h4>
                <p className="text-[12px] text-[#5a6b5e] max-w-xs mx-auto">
                  Point your mobile device camera at the QR code below to download the {currentMobile.osName} client immediately.
                </p>

                {/* Crisp SVG QR Code */}
                <div className="mx-auto w-48 h-48 bg-white p-3.5 rounded-2xl border border-[#d6e2d9] shadow-sm flex flex-col items-center justify-center relative">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-full h-full text-[#111c14]"
                    fill="currentColor"
                  >
                    {/* Corner Position Detection Squares */}
                    {/* Top-Left */}
                    <rect x="10" y="10" width="30" height="30" rx="4" />
                    <rect x="16" y="16" width="18" height="18" fill="#fff" />
                    <rect x="20" y="20" width="10" height="10" />

                    {/* Top-Right */}
                    <rect x="80" y="10" width="30" height="30" rx="4" />
                    <rect x="86" y="16" width="18" height="18" fill="#fff" />
                    <rect x="90" y="20" width="10" height="10" />

                    {/* Bottom-Left */}
                    <rect x="10" y="80" width="30" height="30" rx="4" />
                    <rect x="16" y="86" width="18" height="18" fill="#fff" />
                    <rect x="20" y="90" width="10" height="10" />

                    {/* Timing & Alignment Patterns */}
                    <rect x="46" y="16" width="6" height="6" />
                    <rect x="58" y="16" width="6" height="6" />
                    <rect x="70" y="16" width="6" height="6" />
                    <rect x="16" y="46" width="6" height="6" />
                    <rect x="16" y="58" width="6" height="6" />
                    <rect x="16" y="70" width="6" height="6" />

                    {/* Data payload mock cells */}
                    <rect x="46" y="30" width="6" height="6" />
                    <rect x="58" y="30" width="6" height="6" />
                    <rect x="70" y="30" width="6" height="6" />
                    <rect x="46" y="44" width="6" height="6" />
                    <rect x="58" y="44" width="6" height="6" />
                    <rect x="70" y="44" width="6" height="6" />
                    <rect x="46" y="58" width="6" height="6" />
                    <rect x="58" y="58" width="6" height="6" />
                    <rect x="70" y="58" width="6" height="6" />
                    <rect x="84" y="46" width="6" height="6" />
                    <rect x="96" y="58" width="6" height="6" />
                    <rect x="84" y="70" width="6" height="6" />
                    <rect x="46" y="84" width="6" height="6" />
                    <rect x="58" y="96" width="6" height="6" />
                    <rect x="70" y="84" width="6" height="6" />
                    <rect x="84" y="84" width="6" height="6" />
                    <rect x="96" y="96" width="6" height="6" />
                    <rect x="84" y="96" width="6" height="6" />
                    <rect x="96" y="84" width="6" height="6" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-sm border border-[#e2e8e4] flex items-center justify-center">
                      <img src={arisLogo} alt="ARIS" className="w-5 h-5 object-contain" />
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white p-3.5 rounded-xl border border-[#e2e8e4]">
                  <p className="text-[11.5px] font-bold text-[#111c14] mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3a7d4e]" />
                    <span>Installation Steps:</span>
                  </p>
                  <ol className="space-y-1.5 text-[11px] text-[#5a6b5e] list-decimal list-inside">
                    {currentMobile.instructions.map((step, idx) => (
                      <li key={idx} className="leading-snug">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Feature Matrix */}
        <section className="mt-14">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-[#3a7d4e] font-semibold text-[13px] tracking-wide uppercase">
              <Layers className="h-4 w-4" />
              <span>Platform Comparison</span>
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111c14] tracking-tight">
              Compare ARIS Web, Desktop &amp; Mobile
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#e2e8e4] bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#edf1ee] bg-[#f8faf8] text-[#111c14]">
                  <th className="py-4 px-5 font-bold">Feature Capability</th>
                  <th className="py-4 px-4 font-bold text-center">Web Portal</th>
                  <th className="py-4 px-4 font-bold text-center bg-[#eaf4ee]/50 text-[#2f7043]">
                    ARIS Desktop
                  </th>
                  <th className="py-4 px-4 font-bold text-center">ARIS Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ee] text-[#4a5c4f]">
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#111c14]">
                    Biometric Scanner Hardware (USB/Serial Drivers)
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#8fa394]">Via Gateway Only</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2f7043] bg-[#eaf4ee]/20">
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-4 w-4 text-[#3a7d4e]" /> Full Native Driver
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#5a6b5e]">Device Fingerprint Sensor</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#111c14]">
                    Offline Record Caching &amp; Auto-Sync
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#8fa394]">Limited (Browser)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2f7043] bg-[#eaf4ee]/20">
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-4 w-4 text-[#3a7d4e]" /> Full SQLite Vault
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#5a6b5e]">Offline ID &amp; Schedule</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#111c14]">
                    Camera QR Code Attendance Pass
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#8fa394]">No</td>
                  <td className="py-3.5 px-4 text-center text-[#8fa394] bg-[#eaf4ee]/20">No</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2f7043]">
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-4 w-4 text-[#3a7d4e]" /> Native Camera QR
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#111c14]">
                    Administrative Dashboard, Payroll &amp; Audit Logs
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-[#111c14]">Complete</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2f7043] bg-[#eaf4ee]/20">
                    Complete Native
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#5a6b5e]">Quick Approvals &amp; View</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#111c14]">
                    Native OS Push Notifications
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#8fa394]">Web Push</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-[#111c14] bg-[#eaf4ee]/20">
                    Windows Desktop Alerts
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2f7043]">
                    Instant Mobile Push
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: System Requirements */}
        <section className="mt-14">
          <div className="rounded-3xl border border-[#e2e8e4] bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#111c14] mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[#3a7d4e]" />
              <span>Minimum System Requirements</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[12.5px]">
              <div className="rounded-2xl border border-[#edf1ee] bg-[#f8faf8] p-4 space-y-2">
                <span className="font-bold text-[#111c14] block text-[13.5px]">Windows PC</span>
                <p className="text-[#5a6b5e]">Windows 10 (64-bit) or Windows 11</p>
                <p className="text-[#5a6b5e]">4 GB RAM minimum (8 GB recommended)</p>
                <p className="text-[#5a6b5e]">150 MB free disk space for offline cache</p>
                <p className="text-[#5a6b5e]">USB 2.0+ port for biometric scanners</p>
              </div>

              <div className="rounded-2xl border border-[#edf1ee] bg-[#f8faf8] p-4 space-y-2">
                <span className="font-bold text-[#111c14] block text-[13.5px]">Android Devices</span>
                <p className="text-[#5a6b5e]">Android 8.0 (Oreo / API level 26) or newer</p>
                <p className="text-[#5a6b5e]">Camera permission for attendance QR scanning</p>
                <p className="text-[#5a6b5e]">Fingerprint or biometric sensor (optional)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ Accordion */}
        <section className="mt-14">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-[#3a7d4e] font-semibold text-[13px] tracking-wide uppercase">
              <HelpCircle className="h-4 w-4" />
              <span>Questions &amp; Troubleshooting</span>
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111c14] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="rounded-3xl border border-[#e2e8e4] bg-white divide-y divide-[#edf1ee] shadow-sm overflow-hidden">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-colors hover:bg-[#fafbfa]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-[14px] font-bold text-[#111c14]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#5a6b5e] transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#3a7d4e]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-[13px] leading-relaxed text-[#5a6b5e]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom IT Help Banner */}
        <div className="mt-12 rounded-3xl border border-[#d6e5d8] bg-[#eaf4ee] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-[18px] font-bold text-[#1c4728]">
              Need IT Assistance or Sideloading Guidance?
            </h3>
            <p className="text-[13px] text-[#3d6949] mt-1 max-w-xl">
              University IT Administration provides in-person and email assistance for faculty and staff devices needing biometric sensor drivers or device configuration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:admin@ucc.edu.ph?subject=ARIS%20Application%20Download%20Support"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2f7043] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#255a36]"
            >
              Contact IT Support
            </a>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c2d8c6] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#2f7043] transition hover:bg-[#f7fbf8]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8e4] bg-white py-8 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#5a6b5e]">
          <div className="flex items-center gap-2">
            <img src={arisLogo} alt="ARIS" className="h-5 w-5 object-contain" />
            <span>ARIS &bull; University of Caloocan City</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-[#3a7d4e] transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-[#3a7d4e] transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/" className="hover:text-[#3a7d4e] transition-colors font-medium">
              Login Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
