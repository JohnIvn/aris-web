import { useState, useMemo } from "react";
import {
  Card,
  PageTitle,
  GhostButton,
  PrimaryButton,
  SearchInput,
  Badge,
  Tabs,
  Modal,
  StatCard,
  StatGrid,
} from "@/components/ui";
import { useResource } from "@/hooks/useResource";

interface ServiceItem {
  name: string;
  version: string;
  latency: string;
  uptime: string;
  status: "Healthy" | "Degraded" | "Down";
  dot: string;
}

interface EndpointItem {
  method: string;
  methodColor: string;
  methodTextColor: string;
  path: string;
  reqSec: number;
  p95: string;
  err: string;
  highP95: boolean;
  highErr: boolean;
}

interface ChartsPayload {
  timeLabels: string[];
  requestsSeries: number[];
  errorsSeries: number[];
  p50Series: number[];
  p95Series: number[];
  p99Series: number[];
}

interface SummaryPayload {
  avgReqSec: string;
  errorRate: string;
  p95Latency: string;
  p99Latency: string;
  servicesUp: string;
  downCount: number;
  degradedCount: number;
  healthyCount: number;
}

interface MonitoringResponse {
  services: ServiceItem[];
  topEndpoints: EndpointItem[];
  charts: ChartsPayload;
  summary: SummaryPayload;
}

const statusTone = {
  Healthy: "green",
  Degraded: "amber",
  Down: "red",
} as const;

function buildSvgPath(
  points: number[],
  width = 440,
  height = 140,
  offsetX = 40,
  offsetY = 15,
  maxVal?: number
): string {
  if (!points || points.length === 0) return "";
  const max = maxVal && maxVal > 0 ? maxVal : Math.max(...points, 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : width;

  const coords = points.map((val, idx) => {
    const x = offsetX + idx * stepX;
    const y = offsetY + height - (Math.min(val, max) / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${coords.join(" L ")}`;
}

function buildSvgArea(
  points: number[],
  width = 440,
  height = 140,
  offsetX = 40,
  offsetY = 15,
  maxVal?: number
): string {
  if (!points || points.length === 0) return "";
  const max = maxVal && maxVal > 0 ? maxVal : Math.max(...points, 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const bottomY = offsetY + height;

  const coords = points.map((val, idx) => {
    const x = offsetX + idx * stepX;
    const y = bottomY - (Math.min(val, max) / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const firstX = offsetX;
  const lastX = offsetX + (points.length - 1) * stepX;
  return `M ${firstX},${bottomY} L ${coords.join(" L ")} L ${lastX},${bottomY} Z`;
}

export default function SoftwareMonitoring() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [tab, setTab] = useState("Top Endpoints");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [copied, setCopied] = useState(false);

  const tabs = ["Top Endpoints", "Service Health"];

  const { data, loading, error, reload } = useResource<Partial<MonitoringResponse>>(
    `/system/monitoring?range=${timeRange}`,
    {}
  );

  const serviceData = useMemo(() => data?.services || [], [data?.services]);
  const endpointData = useMemo(() => data?.topEndpoints || [], [data?.topEndpoints]);
  const charts = data?.charts;
  const summary = data?.summary;

  const downCount =
    summary?.downCount ?? serviceData.filter((s) => s.status === "Down").length;
  const degradedCount =
    summary?.degradedCount ?? serviceData.filter((s) => s.status === "Degraded").length;
  const healthyCount =
    summary?.healthyCount ?? serviceData.filter((s) => s.status === "Healthy").length;

  const alertTone =
    downCount > 0
      ? { bg: "#fbecec", border: "#f9d6d6", text: "#c0392b", dot: "#c0392b" }
      : degradedCount > 0
      ? { bg: "#fbf1de", border: "#f5e2b8", text: "#996515", dot: "#d99a2b" }
      : { bg: "#eaf4ee", border: "#cfe6d7", text: "#2f7043", dot: "#2f7043" };

  const averageRequests =
    summary?.avgReqSec ||
    (endpointData.length === 0
      ? "0"
      : endpointData.reduce((acc, curr) => acc + curr.reqSec, 0).toFixed(0));

  const averageErrorRate =
    summary?.errorRate ||
    (endpointData.length === 0
      ? "0.0%"
      : `${(
          endpointData.reduce((acc, curr) => acc + parseFloat(curr.err), 0) /
          endpointData.length
        ).toFixed(1)}%`);

  const p95Latency = summary?.p95Latency || "42 ms";
  const p99Latency = summary?.p99Latency ? `p99 at ${summary.p99Latency}` : "p99 at 115 ms";
  const servicesUp =
    summary?.servicesUp || `${healthyCount} / ${Math.max(serviceData.length, 1)}`;

  // Filtered rows for each tab
  const endpointRows = useMemo(() => {
    return endpointData.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.path.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q) ||
        item.p95.toLowerCase().includes(q)
      );
    });
  }, [endpointData, searchQuery]);

  const serviceRows = useMemo(() => {
    return serviceData.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.version.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [serviceData, searchQuery]);

  // Chart data
  const requestsSeries = charts?.requestsSeries || [30, 42, 55, 68, 75, 90, 85, 70, 60, 50, 45, 40];
  const errorsSeries = charts?.errorsSeries || [0.2, 0.4, 0.1, 0.5, 0.8, 0.3, 0.2, 0.1, 0.2, 0.3, 0.1, 0.2];
  const maxReq = Math.max(...requestsSeries, 10);
  const reqYGrid = [
    { y: 15, label: String(Math.round(maxReq)) },
    { y: 50, label: String(Math.round(maxReq * 0.75)) },
    { y: 85, label: String(Math.round(maxReq * 0.5)) },
    { y: 120, label: String(Math.round(maxReq * 0.25)) },
    { y: 155, label: "0" },
  ];

  const p50Series = charts?.p50Series || [18, 20, 22, 25, 24, 26, 25, 23, 21, 19, 20, 21];
  const p95Series = charts?.p95Series || [42, 45, 48, 55, 52, 60, 58, 50, 46, 44, 45, 46];
  const p99Series = charts?.p99Series || [95, 105, 110, 125, 120, 140, 135, 115, 105, 98, 100, 102];
  const maxLatency = Math.max(...p99Series, 50);
  const latencyYGrid = [
    { y: 15, label: String(Math.round(maxLatency)) },
    { y: 50, label: String(Math.round(maxLatency * 0.75)) },
    { y: 85, label: String(Math.round(maxLatency * 0.5)) },
    { y: 120, label: String(Math.round(maxLatency * 0.25)) },
    { y: 155, label: "0" },
  ];

  const timeLabels = charts?.timeLabels || [
    "00:00",
    "02:00",
    "04:00",
    "06:00",
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "Now",
  ];

  const handleExportCsv = () => {
    let headers: string[] = [];
    let lines: (string | number)[][] = [];

    if (tab === "Top Endpoints") {
      headers = ["Method", "Endpoint Path", "Requests/sec", "P95 Latency", "Error Rate", "Status"];
      lines = endpointRows.map((e) => [
        e.method,
        `"${e.path.replace(/"/g, '""')}"`,
        e.reqSec,
        `"${e.p95}"`,
        `"${e.err}"`,
        e.highErr ? "Degraded" : e.highP95 ? "Warning" : "Optimal",
      ]);
    } else {
      headers = ["Subsystem Name", "Version", "Latency", "Uptime", "Status"];
      lines = serviceRows.map((s) => [
        `"${s.name.replace(/"/g, '""')}"`,
        s.version,
        `"${s.latency}"`,
        `"${s.uptime}"`,
        s.status,
      ]);
    }

    const csvContent = [headers.join(","), ...lines.map((l) => l.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `software_monitoring_${tab.toLowerCase().replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setShowExportConfirm(false);
    setShowExportSuccess(true);
  };

  const handleCopyJson = (payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-6">
      {/* Page Title with SystemLogs Action Format */}
      <PageTitle
        title="Software Monitoring"
        subtitle="Live subsystem health probes, endpoint performance, and HTTP telemetry."
        action={
          <div className="flex flex-wrap items-center gap-2 ">
            <span title="Refresh software monitoring">
              <GhostButton onClick={() => reload()}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className={`w-4 h-4 ${loading ? "animate-spin text-[#3a7d4e]" : ""}`}
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </GhostButton>
            </span>
            <GhostButton onClick={() => setShowExportConfirm(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </GhostButton>
            <div className="flex items-center gap-1 bg-[#eef1ef] p-1 rounded-xl">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1 text-[12.5px] font-semibold rounded-lg transition-colors cursor-pointer"
                  style={{
                    background: timeRange === range ? "#2f7043" : "transparent",
                    color: timeRange === range ? "#ffffff" : "#5a6b5e",
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {error && (
        <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="Confirm Export"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowExportConfirm(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton onClick={handleExportCsv}>
              Yes, Export
            </PrimaryButton>
          </>
        }
      >
        Export the current {tab.toLowerCase()} data ({tab === "Top Endpoints" ? endpointRows.length : serviceRows.length} records) to a CSV file?
      </Modal>

      {/* Export Success Modal */}
      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export Successful"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowExportSuccess(false)}>
            OK
          </PrimaryButton>
        }
      >
        The software monitoring metrics have been successfully exported and downloaded.
      </Modal>

      {/* Endpoint Detail Modal */}
      <Modal
        isOpen={selectedEndpoint !== null}
        onClose={() => setSelectedEndpoint(null)}
        title="Endpoint Performance Details"
        size="lg"
        align="left"
        icon={
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        }
        actions={
          <div className="flex w-full items-center justify-between gap-3">
            <GhostButton onClick={() => handleCopyJson(selectedEndpoint)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? "Copied JSON!" : "Copy Details"}
            </GhostButton>
            <PrimaryButton onClick={() => setSelectedEndpoint(null)}>
              Close
            </PrimaryButton>
          </div>
        }
      >
        {selectedEndpoint && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef1ef]">
              <div>
                <span className="text-[12px] uppercase font-semibold tracking-wider text-[#8fa394]">
                  Route
                </span>
                <p className="text-[16px] font-bold font-mono text-[#111c14] mt-0.5">
                  {selectedEndpoint.method} {selectedEndpoint.path}
                </p>
              </div>
              <Badge tone={selectedEndpoint.highErr ? "red" : selectedEndpoint.highP95 ? "amber" : "green"} dot>
                {selectedEndpoint.highErr ? "Degraded" : selectedEndpoint.highP95 ? "High Latency" : "Healthy"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Request Volume
                </span>
                <p className="text-[18px] font-bold font-mono text-[#111c14] mt-1">
                  {selectedEndpoint.reqSec} <span className="text-[13px] font-normal text-[#8fa394]">req / sec</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  P95 Latency
                </span>
                <p className="text-[18px] font-bold font-mono text-[#111c14] mt-1">
                  {selectedEndpoint.p95}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  HTTP Error Rate
                </span>
                <p className="text-[18px] font-bold font-mono text-[#c0392b] mt-1">
                  {selectedEndpoint.err}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  HTTP Method
                </span>
                <p className="text-[14px] font-bold font-mono text-[#111c14] mt-1">
                  {selectedEndpoint.method}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8ece8]">
              <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                Telemetry Assessment
              </span>
              <p className="text-[13px] text-[#2d3830] mt-1.5 leading-relaxed">
                {selectedEndpoint.highErr
                  ? "This endpoint has experienced elevated HTTP 4xx or 5xx error responses exceeding the 5% threshold."
                  : selectedEndpoint.highP95
                  ? "This endpoint exhibits elevated tail latency exceeding 400ms under load."
                  : "This endpoint is executing within normal operating boundaries with low latency and optimal throughput."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Service Detail Modal */}
      <Modal
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title="Subsystem Diagnostic Details"
        size="lg"
        align="left"
        icon={
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background:
                selectedService?.status === "Down"
                  ? "#fbecec"
                  : selectedService?.status === "Degraded"
                  ? "#fbf1de"
                  : "#eaf4ee",
              color:
                selectedService?.status === "Down"
                  ? "#c0392b"
                  : selectedService?.status === "Degraded"
                  ? "#996515"
                  : "#2f7043",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        }
        actions={
          <div className="flex w-full items-center justify-between gap-3">
            <GhostButton onClick={() => handleCopyJson(selectedService)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? "Copied JSON!" : "Copy Details"}
            </GhostButton>
            <PrimaryButton onClick={() => setSelectedService(null)}>
              Close
            </PrimaryButton>
          </div>
        }
      >
        {selectedService && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef1ef]">
              <div>
                <span className="text-[12px] uppercase font-semibold tracking-wider text-[#8fa394]">
                  Subsystem Name
                </span>
                <p className="text-[16px] font-bold text-[#111c14] mt-0.5">
                  {selectedService.name}
                </p>
              </div>
              <Badge tone={statusTone[selectedService.status]} dot>
                {selectedService.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Response Latency
                </span>
                <p className="text-[18px] font-bold font-mono text-[#111c14] mt-1">
                  {selectedService.latency}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Uptime Availability
                </span>
                <p className="text-[18px] font-bold font-mono text-[#2f7043] mt-1">
                  {selectedService.uptime}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Version / Runtime
                </span>
                <p className="text-[14px] font-mono text-[#111c14] mt-1">
                  {selectedService.version}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#fafbfa] border border-[#f0f2f0]">
                <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                  Service State
                </span>
                <p className="text-[14px] font-semibold text-[#111c14] mt-1">
                  {selectedService.status}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8ece8]">
              <span className="text-[11px] uppercase font-semibold text-[#8fa394]">
                Diagnostic Details
              </span>
              <p className="text-[13px] text-[#2d3830] mt-1.5 leading-relaxed">
                {selectedService.status === "Healthy"
                  ? "Live health probes confirmed database connectivity, event loop responsiveness, and active query execution without degradation."
                  : selectedService.status === "Degraded"
                  ? "Subsystem probe responded with elevated latency. Recommend reviewing resource usage and background queries."
                  : "Subsystem probe timed out or could not establish a connection."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert Banner */}
      <div
        className="mb-4 p-3.5 rounded-2xl flex items-center gap-2.5 text-[13px] font-medium transition-colors"
        style={{
          background: alertTone.bg,
          border: `1px solid ${alertTone.border}`,
          color: alertTone.text,
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: alertTone.dot }} />
        <span>
          <strong>
            {downCount > 0 || degradedCount > 0
              ? `${downCount} service${downCount === 1 ? "" : "s"} down — ${degradedCount} degraded`
              : "All core subsystems operational"}
          </strong>
          {downCount > 0 || degradedCount > 0
            ? " — review service health and top endpoints below."
            : " — database, API gateway, and auth session store healthy."}
        </span>
      </div>

      {/* 4 Summary Cards */}
      <StatGrid className="mb-4">
        <StatCard label="Avg req / s" value={averageRequests} detail="from monitored API endpoints" />
        <StatCard
          label="Error rate"
          value={averageErrorRate}
          valueColor={parseFloat(averageErrorRate) >= 5 ? "#c0392b" : "#111c14"}
          detail="across HTTP response status"
        />
        <StatCard label="p95 latency" value={p95Latency} detail={p99Latency} />
        <StatCard
          label="Services up"
          value={servicesUp}
          detail={`${downCount} down, ${degradedCount} degraded`}
        />
      </StatGrid>

      {/* Dynamic Charts Section */}
      <div className="grid grid-cols-1 gap-3 mb-4 xl:grid-cols-2">
        {/* Request Rate & Errors Chart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-[14.5px] font-bold" style={{ color: "#111c14" }}>
                Request Rate & Errors
              </h3>
              <p className="text-[11.5px] text-[#8fa394]">Requests/sec vs HTTP error rate</p>
            </div>
            <span
              className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f2f0]"
              style={{ color: "#5a6b5e" }}
            >
              {timeRange}
            </span>
          </div>

          <div className="relative h-48 w-full mt-3">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3a7d4e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3a7d4e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {reqYGrid.map((g, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    y1={g.y}
                    x2="480"
                    y2={g.y}
                    stroke="#eef1ef"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x="5"
                    y={g.y + 3.5}
                    fill="#b6c3ba"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {g.label.padStart(3, " ")}
                  </text>
                </g>
              ))}

              <path
                d={buildSvgArea(requestsSeries, 440, 140, 40, 15, maxReq)}
                fill="url(#reqGradient)"
              />

              <path
                d={buildSvgPath(requestsSeries, 440, 140, 40, 15, maxReq)}
                fill="none"
                stroke="#3a7d4e"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={buildSvgPath(errorsSeries, 440, 140, 40, 15, maxReq)}
                fill="none"
                stroke="#c0392b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex justify-between text-[10.5px] pl-9 pr-4 mt-1 font-mono" style={{ color: "#b6c3ba" }}>
              {timeLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className={idx % 2 === 0 || timeLabels.length <= 7 ? "block" : "hidden sm:block"}
                >
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 mt-4 text-[12px] font-medium" style={{ color: "#3d4a41" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a7d4e" }} />
              <span>Requests / s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#c0392b" }} />
              <span>Errors / s</span>
            </div>
          </div>
        </Card>

        {/* Latency Percentiles Chart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-[14.5px] font-bold" style={{ color: "#111c14" }}>
                Latency Percentiles
              </h3>
              <p className="text-[11.5px] text-[#8fa394]">Response time distribution (ms)</p>
            </div>
            <span
              className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f2f0]"
              style={{ color: "#5a6b5e" }}
            >
              ms
            </span>
          </div>

          <div className="relative h-48 w-full mt-3">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {latencyYGrid.map((g, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    y1={g.y}
                    x2="480"
                    y2={g.y}
                    stroke="#eef1ef"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x="5"
                    y={g.y + 3.5}
                    fill="#b6c3ba"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {g.label.padStart(3, " ")}
                  </text>
                </g>
              ))}

              <path
                d={buildSvgPath(p99Series, 440, 140, 40, 15, maxLatency)}
                fill="none"
                stroke="#c0392b"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={buildSvgPath(p95Series, 440, 140, 40, 15, maxLatency)}
                fill="none"
                stroke="#d99a2b"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={buildSvgPath(p50Series, 440, 140, 40, 15, maxLatency)}
                fill="none"
                stroke="#3a7d4e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex justify-between text-[10.5px] pl-9 pr-4 mt-1 font-mono" style={{ color: "#b6c3ba" }}>
              {timeLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className={idx % 2 === 0 || timeLabels.length <= 7 ? "block" : "hidden sm:block"}
                >
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 mt-4 text-[12px] font-medium" style={{ color: "#3d4a41" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a7d4e" }} />
              <span>p50 (Median)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#d99a2b" }} />
              <span>p95</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#c0392b" }} />
              <span>p99</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card matching System Logs Table Format */}
      <Card className="p-0 overflow-x-auto">
        <div
          className="flex items-center justify-between p-4 border-b flex-wrap gap-3"
          style={{ borderColor: "#eef1ef" }}
        >
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2 items-center">
            <SearchInput
              placeholder={
                tab === "Top Endpoints"
                  ? "Search endpoints by path or method..."
                  : "Search services by name or status..."
              }
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-64"
            />
          </div>
        </div>

        {tab === "Top Endpoints" ? (
          <>
            <div
              className="grid min-w-[960px] grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_0.9fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Endpoint Route</span>
              <span>Req / sec</span>
              <span>P95 Latency</span>
              <span>Error Rate</span>
              <span>Performance</span>
              <span className="text-right">Status</span>
            </div>

            {loading && endpointRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-[#8fa394]">
                Measuring endpoint traffic...
              </p>
            )}

            {!loading && endpointRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-[#8fa394]">
                {searchQuery
                  ? "No matching endpoints found."
                  : "No endpoint activity recorded yet."}
              </p>
            )}

            {endpointRows.map((e, i) => (
              <div
                key={`${e.method}-${e.path}-${i}`}
                onClick={() => setSelectedEndpoint(e)}
                role="button"
                tabIndex={0}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter" || evt.key === " ") {
                    evt.preventDefault();
                    setSelectedEndpoint(e);
                  }
                }}
                className="grid min-w-[960px] grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_0.9fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#f6f9f7] active:bg-[#edf3ef] cursor-pointer"
                style={{ borderColor: "#f2f4f2" }}
                title="Click to view endpoint performance details"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <span
                    className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: e.methodColor, color: e.methodTextColor }}
                  >
                    {e.method}
                  </span>
                  <span className="font-mono text-[13px] font-medium text-[#111c14] truncate">
                    {e.path}
                  </span>
                </div>
                <span className="text-[13px] font-semibold font-mono text-[#111c14]">
                  {e.reqSec} req/s
                </span>
                <span
                  className="text-[13px] font-medium font-mono"
                  style={{ color: e.highP95 ? "#d99a2b" : "#5a6b5e" }}
                >
                  {e.p95}
                </span>
                <span
                  className="text-[13px] font-semibold font-mono"
                  style={{ color: e.highErr ? "#c0392b" : "#5a6b5e" }}
                >
                  {e.err}
                </span>
                <span className="text-[12.5px] font-medium text-[#5a6b5e]">
                  {e.highErr ? "High Error Rate" : e.highP95 ? "High Latency" : "Normal"}
                </span>
                <span className="flex justify-end items-center gap-2">
                  <Badge tone={e.highErr ? "red" : e.highP95 ? "amber" : "green"} dot>
                    {e.highErr ? "Degraded" : e.highP95 ? "Warning" : "Optimal"}
                  </Badge>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#b6c3ba"
                    strokeWidth="1.6"
                    className="w-3.5 h-3.5 opacity-60"
                  >
                    <path d="M6 12l4-4-4-4" />
                  </svg>
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div
              className="grid min-w-[960px] grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_0.9fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <span>Subsystem / Service</span>
              <span>Response Latency</span>
              <span>Availability</span>
              <span>Version</span>
              <span>Health Indicator</span>
              <span className="text-right">Status</span>
            </div>

            {loading && serviceRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-[#8fa394]">
                Probing active services...
              </p>
            )}

            {!loading && serviceRows.length === 0 && (
              <p className="py-6 text-center text-[12px] text-[#8fa394]">
                {searchQuery
                  ? "No matching services found."
                  : "No services monitored."}
              </p>
            )}

            {serviceRows.map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                onClick={() => setSelectedService(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter" || evt.key === " ") {
                    evt.preventDefault();
                    setSelectedService(s);
                  }
                }}
                className="grid min-w-[960px] grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_0.9fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#f6f9f7] active:bg-[#edf3ef] cursor-pointer"
                style={{ borderColor: "#f2f4f2" }}
                title="Click to view subsystem diagnostic details"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: s.dot }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#111c14] truncate">
                      {s.name}
                    </p>
                    <p className="text-[11px] font-mono text-[#8fa394] truncate">
                      {s.version}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-mono font-medium text-[#3d4a41]">
                  {s.latency}
                </span>
                <span className="text-[13px] font-mono font-semibold text-[#5a6b5e]">
                  {s.uptime}
                </span>
                <span className="text-[12.5px] font-mono text-[#8fa394]">
                  {s.version}
                </span>
                <span className="text-[12.5px] font-medium text-[#5a6b5e]">
                  {s.status === "Healthy"
                    ? "Responsive"
                    : s.status === "Degraded"
                    ? "High Latency"
                    : "Unreachable"}
                </span>
                <span className="flex justify-end items-center gap-2">
                  <Badge tone={statusTone[s.status] || "gray"} dot>
                    {s.status}
                  </Badge>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#b6c3ba"
                    strokeWidth="1.6"
                    className="w-3.5 h-3.5 opacity-60"
                  >
                    <path d="M6 12l4-4-4-4" />
                  </svg>
                </span>
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
}
