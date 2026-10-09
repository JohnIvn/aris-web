import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Badge,
  Tabs,
  Toggle,
  Modal,
  StatCard,
  StatGrid,
} from "@/components/ui";

// Mock data for Backups & Snapshots
const initialBackups = [
  {
    id: "bk-1092",
    name: "db_backup_20260909_0200.sql.gz",
    type: "Automated Daily",
    size: "1.42 GB",
    date: "Today at 02:00 AM",
    status: "Verified",
    checksum: "sha256:8f9a2e...41b",
  },
  {
    id: "bk-1091",
    name: "pre_deploy_v2.4_snapshot",
    type: "Manual Snapshot",
    size: "1.39 GB",
    date: "Yesterday at 04:15 PM",
    status: "Verified",
    checksum: "sha256:3c1d9f...89e",
  },
  {
    id: "bk-1090",
    name: "db_backup_20260908_0200.sql.gz",
    type: "Automated Daily",
    size: "1.38 GB",
    date: "Sep 8, 2026 02:00 AM",
    status: "Verified",
    checksum: "sha256:7b4a11...02c",
  },
  {
    id: "bk-1089",
    name: "db_backup_20260907_0200.sql.gz",
    type: "Automated Daily",
    size: "1.37 GB",
    date: "Sep 7, 2026 02:00 AM",
    status: "Verified",
    checksum: "sha256:1a8e4f...99d",
  },
  {
    id: "bk-1088",
    name: "weekly_full_archive_20260901",
    type: "Weekly Full",
    size: "4.15 GB",
    date: "Sep 1, 2026 01:00 AM",
    status: "Archived",
    checksum: "sha256:9d2b7c...33a",
  },
  {
    id: "bk-1087",
    name: "manual_hotfix_backup",
    type: "Manual Snapshot",
    size: "1.35 GB",
    date: "Aug 28, 2026 11:20 AM",
    status: "Verified",
    checksum: "sha256:4f8c2b...77e",
  },
];

// Mock data for Automated Health Checks
const initialHealthChecks = [
  {
    id: "chk-1",
    name: "Database Integrity Check",
    desc: "Scans allocation pages, table headers, and B-Tree indexes for corruption.",
    frequency: "Every 6 hours",
    lastRun: "18 mins ago",
    status: "PASSED",
    latency: "1.2s",
    tone: "green" as const,
  },
  {
    id: "chk-2",
    name: "Sandbox Restore Test",
    desc: "Boots isolated temp container and restores latest snapshot to test recoverability.",
    frequency: "Daily at 03:00 AM",
    lastRun: "16 hours ago",
    status: "PASSED",
    latency: "38s",
    tone: "green" as const,
  },
  {
    id: "chk-3",
    name: "Replication Sync & Lag",
    desc: "Monitors WAL log streaming replication lag between primary and standby replicas.",
    frequency: "Continuous",
    lastRun: "Just now",
    status: "OPTIMAL",
    latency: "1.8 ms",
    tone: "green" as const,
  },
  {
    id: "chk-4",
    name: "Storage Threshold & Growth Rate",
    desc: "Calculates disk consumption trajectory and alerts on 85% capacity threshold.",
    frequency: "Hourly",
    lastRun: "22 mins ago",
    status: "HEALTHY",
    latency: "< 1s",
    tone: "blue" as const,
  },
  {
    id: "chk-5",
    name: "Index Fragmentation & Autovacuum",
    desc: "Analyzes dead tuple percentage and index bloat across high-traffic tables.",
    frequency: "Daily",
    lastRun: "5 hours ago",
    status: "PASSED",
    latency: "4.1s",
    tone: "green" as const,
  },
  {
    id: "chk-6",
    name: "TLS/SSL & Encryption Verification",
    desc: "Validates AES-256 tablespace encryption at rest and TLS 1.3 in-transit security.",
    frequency: "Every 12 hours",
    lastRun: "2 hours ago",
    status: "SECURE",
    latency: "< 1s",
    tone: "green" as const,
  },
  {
    id: "chk-7",
    name: "Connection Pool Saturation",
    desc: "Monitors active vs. max connection pool utilization and detects idle connection leaks across services.",
    frequency: "Every 5 minutes",
    lastRun: "3 mins ago",
    status: "WARNING",
    latency: "< 1s",
    tone: "amber" as const,
  },
  {
    id: "chk-8",
    name: "Query Performance Analyzer",
    desc: "Identifies long-running queries exceeding 500 ms and flags missing indexes via EXPLAIN ANALYZE.",
    frequency: "Every 30 minutes",
    lastRun: "12 mins ago",
    status: "PASSED",
    latency: "2.3s",
    tone: "green" as const,
  },
  {
    id: "chk-9",
    name: "Foreign Key & Constraint Integrity",
    desc: "Scans all relational tables for orphaned records, broken foreign keys, and constraint violations.",
    frequency: "Daily at 02:00 AM",
    lastRun: "14 hours ago",
    status: "PASSED",
    latency: "6.7s",
    tone: "green" as const,
  },
  {
    id: "chk-10",
    name: "WAL Archive & PITR Readiness",
    desc: "Verifies WAL archiving pipeline continuity and confirms point-in-time recovery target is reachable within the RPO window.",
    frequency: "Hourly",
    lastRun: "41 mins ago",
    status: "HEALTHY",
    latency: "< 1s",
    tone: "blue" as const,
  },
];

// Mock data for Restore Logs
const restoreLogs = [
  {
    id: "rst-881",
    target: "Staging DB (aris_staging)",
    snapshot: "pre_deploy_v2.4_snapshot",
    initiatedBy: "Administrator",
    duration: "2m 14s",
    date: "Yesterday at 04:30 PM",
    status: "Success",
  },
  {
    id: "rst-880",
    target: "Sandbox Test Environment",
    snapshot: "db_backup_20260908_0200.sql.gz",
    initiatedBy: "Auto Sandbox Bot",
    duration: "38s",
    date: "Sep 8, 2026 03:00 AM",
    status: "Success",
  },
  {
    id: "rst-879",
    target: "Dev Replica (aris_dev)",
    snapshot: "weekly_full_archive_20260901",
    initiatedBy: "Dr. Maria Santos",
    duration: "5m 40s",
    date: "Sep 2, 2026 10:15 AM",
    status: "Success",
  },
];

export default function Database() {
  const [activeTab, setActiveTab] = useState("Backups & Snapshots");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [crossRegionEnabled, setCrossRegionEnabled] = useState(true);
  const [pointInTimeEnabled, setPointInTimeEnabled] = useState(true);

  // Modal states
  const [showDiagConfirm, setShowDiagConfirm] = useState(false);
  const [showDiagSuccess, setShowDiagSuccess] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [showBackupSuccess, setShowBackupSuccess] = useState(false);

  // Interactive action feedback
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: backupsList, setData: setBackupsList } = useResource("/system/database/backups", initialBackups);
  const { data: healthChecks, setData: setHealthChecks } = useResource("/system/database/health-checks", initialHealthChecks);
  const { data: restoreLogData } = useResource("/system/database/restore-logs", restoreLogs);

  const tabs = [
    "Backups & Snapshots",
    "Health & Diagnostics",
    "Restore Logs",
    "Backup Settings",
  ];

  const handleTriggerBackupConfirm = () => {
    setShowBackupConfirm(false);
    setIsProcessing(true);
    setBannerMessage("Creating new manual database backup snapshot...");
    setTimeout(() => {
      const now = new Date();
      const newBackup = {
        id: `bk-${Date.now().toString().slice(-4)}`,
        name: `manual_snapshot_${now.toISOString().slice(0, 10).replace(/-/g, "")}_${now.getHours()}${now.getMinutes()}`,
        type: "Manual Snapshot",
        size: "1.43 GB",
        date: "Just now",
        status: "Verified",
        checksum: "sha256:a9f23c...11e",
      };
      const updatedBackups = [newBackup, ...backupsList];
      setBackupsList(updatedBackups);
      void saveResource("/system/database/backups", updatedBackups, "PUT").catch((reason: unknown) => {
        setBannerMessage(reason instanceof Error ? reason.message : "Unable to save backup.");
      });
      setIsProcessing(false);
      setBannerMessage(null);
      setShowBackupSuccess(true);
    }, 1500);
  };

  const handleRunDiagnosticsConfirm = () => {
    setShowDiagConfirm(false);
    setIsProcessing(true);
    setBannerMessage(
      "Running full database integrity and backup diagnostic suite...",
    );
    setTimeout(() => {
      const updatedChecks = healthChecks.map((check) => ({ ...check, lastRun: "Just now" }));
      setHealthChecks(updatedChecks);
      void saveResource("/system/database/health-checks", updatedChecks, "PUT").catch((reason: unknown) => {
        setBannerMessage(reason instanceof Error ? reason.message : "Unable to save diagnostics.");
      });
      setIsProcessing(false);
      setBannerMessage(null);
      setShowDiagSuccess(true);
    }, 1200);
  };

  const filteredBackups = backupsList.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || b.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="pb-6">
      <PageTitle
        title="Database & Backup Management"
        subtitle="Monitor cluster health, automated integrity checks, point-in-time snapshots, and restoration logs."
        action={
          <div className="flex gap-2">
            <GhostButton onClick={() => setShowDiagConfirm(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Run Diagnostics
            </GhostButton>
            <PrimaryButton onClick={() => setShowBackupConfirm(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Trigger Manual Backup
            </PrimaryButton>
          </div>
        }
      />

      <Modal
        isOpen={showDiagConfirm}
        onClose={() => setShowDiagConfirm(false)}
        title="Confirm Diagnostics"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowDiagConfirm(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton onClick={handleRunDiagnosticsConfirm}>
              Yes, Run
            </PrimaryButton>
          </>
        }
      >
        Are you sure you want to run the full database integrity and diagnostic
        suite?
      </Modal>

      <Modal
        isOpen={showDiagSuccess}
        onClose={() => setShowDiagSuccess(false)}
        title="Diagnostics Complete"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowDiagSuccess(false)}>
            OK
          </PrimaryButton>
        }
      >
        All automated database & backup checks passed successfully!
      </Modal>

      <Modal
        isOpen={showBackupConfirm}
        onClose={() => setShowBackupConfirm(false)}
        title="Confirm Backup"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#fbf1de] text-[#996515]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowBackupConfirm(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton onClick={handleTriggerBackupConfirm}>
              Yes, Backup
            </PrimaryButton>
          </>
        }
      >
        Are you sure you want to trigger a manual database backup?
      </Modal>

      <Modal
        isOpen={showBackupSuccess}
        onClose={() => setShowBackupSuccess(false)}
        title="Backup Complete"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowBackupSuccess(false)}>
            OK
          </PrimaryButton>
        }
      >
        New database backup snapshot created and verified successfully!
      </Modal>

      {/* Action Notification Banner */}
      {bannerMessage && (
        <div
          className="mb-4 p-3.5 rounded-2xl flex items-center justify-between text-[13px] font-medium transition-all"
          style={{
            background: "#eaf4ee",
            color: "#2f7043",
            border: "1px solid #c8e6d2",
          }}
        >
          <div className="flex items-center gap-2.5">
            {isProcessing ? (
              <svg
                className="animate-spin w-4 h-4 text-[#2f7043]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4.5 h-4.5"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-[#2f7043] opacity-70 hover:opacity-100 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <StatGrid className="mb-4">
        <StatCard label="Cluster Status" value="99.99% Uptime" detail="Primary / Standby WAL Sync" badge={<Badge tone="green" dot>Healthy</Badge>} />
        <StatCard label="Database Size" value="42.8 GB / 100 GB" detail="42.8% used" footer={<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f2f0]"><div className="h-full rounded-full bg-[#3a7d4e]" style={{ width: "42.8%" }} /></div>} />
        <StatCard label="Latest Snapshot" value="18 mins ago" detail="Automated Daily · Verified" badge={<Badge tone="blue">1.42 GB</Badge>} />
        <StatCard label="Connections & IOPS" value="1,240 IOPS" detail="Avg Latency: 2.1 ms" badge={<Badge tone="gray">48 / 200</Badge>} />
      </StatGrid>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 border-b flex-wrap gap-3"
          style={{ borderColor: "#eef1ef" }}
        >
          <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
          {activeTab === "Backups & Snapshots" && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-0.5 rounded-xl bg-[#f0f2f0]">
                {["All", "Automated", "Manual"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className="text-[12px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                    style={{
                      background: filterType === f ? "#fff" : "transparent",
                      color: filterType === f ? "#111c14" : "#8fa394",
                      boxShadow:
                        filterType === f
                          ? "0 1px 2px rgba(0,0,0,0.06)"
                          : "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <SearchInput placeholder="Search snapshots" value={searchQuery} onChange={setSearchQuery} />
            </div>
          )}
        </div>

        {/* Tab 1: Backups & Snapshots */}
        {activeTab === "Backups & Snapshots" && (
          <div>
            <div
              className="grid grid-cols-[1.2fr_2fr_1.2fr_1.5fr_1.5fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Backup ID</span>
              <span>Snapshot File</span>
              <span>Type</span>
              <span>Created</span>
              <span>Size & Checksum</span>
              <span className="text-right">Actions</span>
            </div>
            {filteredBackups.length === 0 ? (
              <div
                className="p-8 text-center text-sm"
                style={{ color: "#8fa394" }}
              >
                No backup snapshots match your search criteria.
              </div>
            ) : (
              filteredBackups.map((b) => (
                <div
                  key={b.id}
                  className="grid grid-cols-[1.2fr_2fr_1.2fr_1.5fr_1.5fr_1fr] items-center px-5 py-3.5 border-t transition-colors hover:bg-[#fafbfa]"
                  style={{ borderColor: "#f2f4f2" }}
                >
                  <span
                    className="text-[12.5px] font-mono font-semibold"
                    style={{ color: "#111c14" }}
                  >
                    {b.id}
                  </span>
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3a7d4e"
                      strokeWidth="1.6"
                      className="w-4 h-4 flex-shrink-0"
                    >
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{ color: "#111c14" }}
                    >
                      {b.name}
                    </span>
                  </div>
                  <div>
                    <Badge
                      tone={
                        b.type.includes("Automated")
                          ? "green"
                          : b.type.includes("Manual")
                            ? "blue"
                            : "amber"
                      }
                    >
                      {b.type}
                    </Badge>
                  </div>
                  <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
                    {b.date}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: "#3d4a41" }}
                    >
                      {b.size}
                    </span>
                    <span
                      className="text-[10.5px] font-mono truncate max-w-[140px]"
                      style={{ color: "#8fa394" }}
                    >
                      {b.checksum}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setBannerMessage(
                          `Initiating restoration test preview for ${b.name}...`,
                        );
                        setTimeout(
                          () =>
                            setBannerMessage(
                              `Restoration check verified for ${b.name}`,
                            ),
                          1000,
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors hover:bg-[#eaf4ee]"
                      style={{ color: "#2f7043" }}
                      title="Restore from snapshot"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        setBannerMessage(
                          `Preparing download link for ${b.name}...`,
                        );
                        setTimeout(
                          () =>
                            setBannerMessage(`Download started for ${b.name}`),
                          1000,
                        );
                      }}
                      className="p-1 rounded-lg transition-colors hover:bg-[#f0f2f0]"
                      style={{ color: "#5a6b5e" }}
                      title="Download SQL archive"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="w-4 h-4"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Automated Health Checks & Diagnostics */}
        {activeTab === "Health & Diagnostics" && (
          <div>
            {/* Table Header */}
            <div
              className="grid grid-cols-[2.2fr_3fr_1.4fr_0.8fr_1.1fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Check Name</span>
              <span>Description</span>
              <span>Frequency</span>
              <span>Execution</span>
              <span>Last Run</span>
              <span className="text-right">Status</span>
            </div>

            {/* Table Body */}
            {healthChecks.map((chk) => (
              <div
                key={chk.id}
                className="grid grid-cols-[2.2fr_3fr_1.4fr_0.8fr_1.1fr_1fr] items-center px-5 py-3.5 border-t transition-colors hover:bg-[#fafbfa]"
                style={{ borderColor: "#f2f4f2" }}
              >
                <span
                  className="text-[13px] font-semibold pr-3"
                  style={{ color: "#111c14" }}
                >
                  {chk.name}
                </span>
                <span
                  className="text-[12px] leading-relaxed pr-4"
                  style={{ color: "#5a6b5e" }}
                >
                  {chk.desc}
                </span>
                <span
                  className="text-[12.5px] font-medium pr-2"
                  style={{ color: "#3d4a41" }}
                >
                  {chk.frequency}
                </span>
                <span
                  className="text-[12.5px] font-mono"
                  style={{ color: "#5a6b5e" }}
                >
                  {chk.latency}
                </span>
                <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
                  {chk.lastRun}
                </span>
                <div className="flex justify-end">
                  <Badge tone={chk.tone} dot>
                    {chk.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Restore Logs & History */}
        {activeTab === "Restore Logs" && (
          <div>
            <div
              className="grid grid-cols-[1fr_1.8fr_2fr_1.5fr_1fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Log ID</span>
              <span>Target Database</span>
              <span>Source Snapshot</span>
              <span>Initiated By</span>
              <span>Duration</span>
              <span className="text-right">Result</span>
            </div>
            {restoreLogData.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_1.8fr_2fr_1.5fr_1fr_1fr] items-center px-5 py-3.5 border-t transition-colors hover:bg-[#fafbfa]"
                style={{ borderColor: "#f2f4f2" }}
              >
                <span
                  className="text-[12.5px] font-mono font-semibold"
                  style={{ color: "#111c14" }}
                >
                  {log.id}
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "#111c14" }}
                >
                  {log.target}
                </span>
                <span className="text-[12.5px] font-mono text-[#5a6b5e] truncate pr-2">
                  {log.snapshot}
                </span>
                <div className="flex flex-col">
                  <span
                    className="text-[12.5px] font-medium"
                    style={{ color: "#3d4a41" }}
                  >
                    {log.initiatedBy}
                  </span>
                  <span className="text-[11px]" style={{ color: "#8fa394" }}>
                    {log.date}
                  </span>
                </div>
                <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
                  {log.duration}
                </span>
                <div className="flex justify-end">
                  <Badge tone="green" dot>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Backup Settings & Schedule */}
        {activeTab === "Backup Settings" && (
          <div className="p-6 max-w-3xl space-y-6">
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: "#eef1ef" }}
            >
              <div>
                <h3
                  className="text-[14.5px] font-semibold"
                  style={{ color: "#111c14" }}
                >
                  Automated Daily Snapshot Schedule
                </h3>
                <p
                  className="text-[12.5px] mt-0.5"
                  style={{ color: "#8fa394" }}
                >
                  Automatically capture full database state daily at off-peak
                  hours.
                </p>
              </div>
              <Toggle on={autoBackupEnabled} onChange={setAutoBackupEnabled} />
            </div>

            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: "#eef1ef" }}
            >
              <div>
                <h3
                  className="text-[14.5px] font-semibold"
                  style={{ color: "#111c14" }}
                >
                  Cross-Region Storage Replication (AWS S3)
                </h3>
                <p
                  className="text-[12.5px] mt-0.5"
                  style={{ color: "#8fa394" }}
                >
                  Mirror backup snapshots to secondary disaster recovery region
                  (ap-southeast-1).
                </p>
              </div>
              <Toggle
                on={crossRegionEnabled}
                onChange={setCrossRegionEnabled}
              />
            </div>

            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: "#eef1ef" }}
            >
              <div>
                <h3
                  className="text-[14.5px] font-semibold"
                  style={{ color: "#111c14" }}
                >
                  Point-in-Time Recovery (WAL Archiving)
                </h3>
                <p
                  className="text-[12.5px] mt-0.5"
                  style={{ color: "#8fa394" }}
                >
                  Stream Write-Ahead Logs continuously to allow recovery to any
                  second within 14 days.
                </p>
              </div>
              <Toggle
                on={pointInTimeEnabled}
                onChange={setPointInTimeEnabled}
              />
            </div>

            <div className="pt-2">
              <h3
                className="text-[14.5px] font-semibold mb-3"
                style={{ color: "#111c14" }}
              >
                Retention & Archival Policy
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="p-3.5 rounded-2xl border"
                  style={{ borderColor: "#e2e8e4", background: "#fafbfa" }}
                >
                  <p
                    className="text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: "#8fa394" }}
                  >
                    Daily Backups
                  </p>
                  <p
                    className="text-[18px] font-bold mt-1"
                    style={{ color: "#111c14" }}
                  >
                    Retain 30 Days
                  </p>
                </div>
                <div
                  className="p-3.5 rounded-2xl border"
                  style={{ borderColor: "#e2e8e4", background: "#fafbfa" }}
                >
                  <p
                    className="text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: "#8fa394" }}
                  >
                    Weekly Archives
                  </p>
                  <p
                    className="text-[18px] font-bold mt-1"
                    style={{ color: "#111c14" }}
                  >
                    Retain 12 Weeks
                  </p>
                </div>
                <div
                  className="p-3.5 rounded-2xl border"
                  style={{ borderColor: "#e2e8e4", background: "#fafbfa" }}
                >
                  <p
                    className="text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: "#8fa394" }}
                  >
                    Monthly Snapshots
                  </p>
                  <p
                    className="text-[18px] font-bold mt-1"
                    style={{ color: "#111c14" }}
                  >
                    Retain 7 Years
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
