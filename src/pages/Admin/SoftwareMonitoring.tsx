import { useState } from "react";
import { Card, Badge, StatCard, StatGrid } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

// Mock data for services
const services = [
  { name: "API Gateway", version: "v3.4.1", latency: "18 ms", uptime: "99.98%", status: "Healthy" as const, dot: "#2f7043" },
  { name: "Auth Service", version: "v2.1.0", latency: "22 ms", uptime: "99.99%", status: "Healthy" as const, dot: "#2f7043" },
  { name: "Enrollment Engine", version: "v1.8.4", latency: "148 ms", uptime: "99.71%", status: "Degraded" as const, dot: "#d99a2b" },
  { name: "Grade Processor", version: "v2.0.2", latency: "31 ms", uptime: "99.95%", status: "Healthy" as const, dot: "#2f7043" },
  { name: "Notification Bus", version: "v1.3.0", latency: "12 ms", uptime: "99.87%", status: "Healthy" as const, dot: "#2f7043" },
  { name: "Report Generator", version: "v1.6.1", latency: "—", uptime: "98.40%", status: "Down" as const, dot: "#c0392b" },
  { name: "File Storage API", version: "v2.2.0", latency: "9 ms", uptime: "99.99%", status: "Healthy" as const, dot: "#2f7043" },
];

const statusTone = {
  Healthy: "green",
  Degraded: "amber",
  Down: "red",
} as const;

// Mock data for top endpoints
const topEndpoints = [
  { method: "GET", methodColor: "#eaf4ee", methodTextColor: "#2f7043", path: "/api/v1/students", reqSec: 84, p95: "62 ms", err: "0.2%", highP95: false, highErr: false },
  { method: "GET", methodColor: "#eaf4ee", methodTextColor: "#2f7043", path: "/api/v1/enrollments", reqSec: 61, p95: "78 ms", err: "0.4%", highP95: false, highErr: false },
  { method: "POST", methodColor: "#e7f1fa", methodTextColor: "#2b6ca3", path: "/api/v1/auth/login", reqSec: 38, p95: "44 ms", err: "0.8%", highP95: false, highErr: false },
  { method: "PUT", methodColor: "#fbf1de", methodTextColor: "#996515", path: "/api/v1/grades/:id", reqSec: 22, p95: "96 ms", err: "1.1%", highP95: false, highErr: false },
  { method: "GET", methodColor: "#eaf4ee", methodTextColor: "#2f7043", path: "/api/v1/reports/generate", reqSec: 14, p95: "880 ms", err: "6.4%", highP95: true, highErr: true },
  { method: "DELETE", methodColor: "#fbecec", methodTextColor: "#c0392b", path: "/api/v1/enrollments/:id", reqSec: 8, p95: "52 ms", err: "0.0%", highP95: false, highErr: false },
  { method: "PATCH", methodColor: "#f0f2f0", methodTextColor: "#5a6b5e", path: "/api/v1/students/:id", reqSec: 6, p95: "40 ms", err: "0.0%", highP95: false, highErr: false },
];
const demoMonitoring = { services, topEndpoints };

export default function SoftwareMonitoring() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const { data } = useResource("/system/monitoring", demoMonitoring);
  const { services: serviceData, topEndpoints: endpointData } = data;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#111c14" }}>
            Software Monitoring
          </h1>
          <p className="text-[13.5px] mt-0.5" style={{ color: "#8fa394" }}>
            API performance, service health, and error tracking.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#eef1ef] p-1 rounded-xl">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1 text-[12.5px] font-semibold rounded-lg transition-colors"
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

      {/* Alert Banner */}
      <div className="mb-4 p-3.5 rounded-2xl flex items-center gap-2.5 text-[13px] font-medium" style={{ background: "#fbecec", border: "1px solid #f9d6d6", color: "#c0392b" }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#c0392b" }} />
        <span>
          <strong>1 service down — 1 degraded</strong> — check Recent Errors for details.
        </span>
      </div>

      {/* 4 Summary Cards */}
      <StatGrid className="mb-4">
        <StatCard label="Avg req / s" value="186" detail="peak 241 at 11:00" />
        <StatCard label="Error rate" value="1.4%" valueColor="#c0392b" detail="34 errors today" />
        <StatCard label="p95 latency" value="84 ms" detail="p99 at 210 ms" />
        <StatCard label="Services up" value="5 / 7" detail="1 down, 1 degraded" />
      </StatGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-3 mb-4 xl:grid-cols-2">
        {/* Request Rate & Errors Chart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14.5px] font-bold" style={{ color: "#111c14" }}>
              Request Rate & Errors
            </h3>
            <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f2f0]" style={{ color: "#5a6b5e" }}>
              Last 24 h
            </span>
          </div>

          <div className="relative h-48 w-full mt-3">
            {/* SVG Chart */}
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Y Grid lines and labels */}
              {[
                { y: 15, label: "260" },
                { y: 55, label: "195" },
                { y: 95, label: "130" },
                { y: 135, label: "65" },
                { y: 165, label: "0" },
              ].map((g, i) => (
                <g key={i}>
                  <line x1="30" y1={g.y} x2="490" y2={g.y} stroke="#eef1ef" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="5" y={g.y + 4} fill="#b6c3ba" fontSize="10" fontFamily="sans-serif">
                    {g.label}
                  </text>
                </g>
              ))}

              {/* Requests / s Line (Green curve) */}
              <path
                d="M 30 148 C 70 145, 100 135, 130 90 C 160 45, 175 30, 200 48 C 225 65, 240 38, 260 42 C 290 48, 310 60, 350 78 C 390 98, 430 135, 490 145"
                fill="none"
                stroke="#3a7d4e"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Errors / s Line (Red baseline curve) */}
              <path
                d="M 30 162 C 100 162, 200 160, 300 160 C 400 161, 460 162, 490 162"
                fill="none"
                stroke="#c0392b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10.5px] pl-7 pr-1 mt-1" style={{ color: "#b6c3ba" }}>
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 mt-4 text-[12px] font-medium" style={{ color: "#3d4a41" }}>
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
            <h3 className="text-[14.5px] font-bold" style={{ color: "#111c14" }}>
              Latency Percentiles
            </h3>
            <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f2f0]" style={{ color: "#5a6b5e" }}>
              ms
            </span>
          </div>

          <div className="relative h-48 w-full mt-3">
            {/* SVG Chart */}
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Y Grid lines and labels */}
              {[
                { y: 15, label: "260" },
                { y: 55, label: "195" },
                { y: 95, label: "130" },
                { y: 135, label: "65" },
                { y: 165, label: "0" },
              ].map((g, i) => (
                <g key={i}>
                  <line x1="30" y1={g.y} x2="490" y2={g.y} stroke="#eef1ef" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="5" y={g.y + 4} fill="#b6c3ba" fontSize="10" fontFamily="sans-serif">
                    {g.label}
                  </text>
                </g>
              ))}

              {/* p99 (Red Dotted Line) */}
              <path
                d="M 30 115 C 80 120, 110 80, 150 45 C 190 35, 210 20, 230 45 C 250 65, 280 50, 310 55 C 350 32, 380 75, 430 110 C 460 125, 480 130, 490 132"
                fill="none"
                stroke="#c0392b"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* p95 (Amber Line) */}
              <path
                d="M 30 148 C 80 148, 120 135, 160 122 C 200 118, 230 115, 260 122 C 290 125, 330 118, 370 125 C 410 135, 460 145, 490 148"
                fill="none"
                stroke="#d99a2b"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* p50 (Green Line) */}
              <path
                d="M 30 158 C 80 156, 150 152, 220 148 C 290 150, 360 152, 430 155 C 470 157, 485 158, 490 158"
                fill="none"
                stroke="#3a7d4e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10.5px] pl-7 pr-1 mt-1" style={{ color: "#b6c3ba" }}>
              <span>00:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>17:00</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 mt-4 text-[12px] font-medium" style={{ color: "#3d4a41" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a7d4e" }} />
              <span>p50</span>
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

      {/* Bottom Dual Cards Section */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* Service Health List */}
        <Card className="p-4">
          <h3 className="text-[14.5px] font-bold mb-3" style={{ color: "#111c14" }}>
            Service Health
          </h3>
          <div className="divide-y" style={{ borderColor: "#f2f4f2" }}>
            {serviceData.map((s) => (
              <div key={s.name} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                  <div>
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: "#111c14" }}>
                      {s.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "#8fa394" }}>
                      {s.version}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[12.5px]">
                  <span className="w-14 text-right" style={{ color: "#8fa394" }}>
                    {s.latency}
                  </span>
                  <span className="w-14 text-right font-medium" style={{ color: "#5a6b5e" }}>
                    {s.uptime}
                  </span>
                  <div className="w-20 flex justify-end">
                    <Badge tone={statusTone[s.status]}>{s.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Endpoints Table */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14.5px] font-bold" style={{ color: "#111c14" }}>
              Top Endpoints
            </h3>
            <span className="text-[11px]" style={{ color: "#b6c3ba" }}>
              by request volume
            </span>
          </div>

          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr] pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-right border-b" style={{ color: "#b6c3ba", borderColor: "#f2f4f2" }}>
              <span className="text-left pl-1">Endpoint</span>
              <span>Req/s</span>
              <span>p95</span>
              <span>Err %</span>
            </div>

            {/* Table Body */}
            <div className="divide-y" style={{ borderColor: "#f2f4f2" }}>
              {endpointData.map((e) => (
                <div key={e.path} className="grid grid-cols-[3fr_1fr_1fr_1fr] items-center py-2.5 text-[12.5px] text-right">
                  <div className="flex items-center gap-2 min-w-0 pr-2 text-left">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: e.methodColor, color: e.methodTextColor }}
                    >
                      {e.method}
                    </span>
                    <span className="font-mono text-[12px] truncate" style={{ color: "#3d4a41" }}>
                      {e.path}
                    </span>
                  </div>
                  <span className="font-semibold" style={{ color: "#111c14" }}>
                    {e.reqSec}
                  </span>
                  <span className="font-medium" style={{ color: e.highP95 ? "#d99a2b" : "#5a6b5e" }}>
                    {e.p95}
                  </span>
                  <span className="font-semibold" style={{ color: e.highErr ? "#c0392b" : "#5a6b5e" }}>
                    {e.err}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

