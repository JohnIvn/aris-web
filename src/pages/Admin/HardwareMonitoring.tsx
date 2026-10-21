import { useMemo, useState } from "react";
import { CloudUpload, Fingerprint } from "lucide-react";
import { Badge, Card, PageTitle } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

type HardwareEvent = {
  id: string;
  time: string;
  event: string;
  status: "Success" | "Failure";
  details: string;
};

const demoEvents: HardwareEvent[] = [
  { id: "hw-001", time: "Aug 31, 2026 10:23 AM", event: "Device Connected", status: "Success", details: "IP: 192.168.1.10" },
  { id: "hw-002", time: "Aug 31, 2026 10:23 AM", event: "DTR Recorded", status: "Success", details: "User ID: UCC-020-001" },
  { id: "hw-003", time: "Aug 31, 2026 10:23 AM", event: "Data Sent", status: "Success", details: "DTR Record: UCC-020-001 — Aug 31, 2026, 10:23 AM" },
  { id: "hw-004", time: "Aug 31, 2026 10:05 AM", event: "Device Connected", status: "Success", details: "IP: 192.168.1.10" },
  { id: "hw-005", time: "Aug 31, 2026 10:05 AM", event: "DTR Recorded", status: "Success", details: "User ID: UCC-021-011" },
  { id: "hw-006", time: "Aug 31, 2026 10:05 AM", event: "Data Sent", status: "Success", details: "DTR Record: UCC-021-011 — Aug 31, 2026, 10:05 AM" },
];

type EventFilter = "All" | HardwareEvent["status"];

export default function HardwareMonitoring() {
  const { data: events, loading, error } = useResource<HardwareEvent[]>("/system/hardware/events", demoEvents);
  const [filter, setFilter] = useState<EventFilter>("All");
  const filteredEvents = useMemo(
    () => events.filter((event) => filter === "All" || event.status === filter),
    [events, filter],
  );

  return (
    <div className="pb-4">
      <PageTitle title="Hardware Monitoring" subtitle="Monitor biometric device status and data transmission." />
      {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}

      <Card className="mb-3 !p-4 sm:!p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#18251c]">Biometric Status</h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">Current status of the fingerprint device and data transmission</p>
          </div>
          <Badge tone="green" dot>Active</Badge>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#e7ece8] p-3 sm:p-4">
            <span className="flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[#3a7d4e]">
              <Fingerprint size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Hardware Status</p>
              <p className="mt-0.5 text-[14px] font-semibold text-[#347849]">Active</p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">The biometric device is active and operational</p>
            </div>
          </div>

          <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#e7ece8] p-3 sm:p-4">
            <span className="flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[#3a7d4e]">
              <CloudUpload size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Data Transmission</p>
              <p className="mt-0.5 text-[14px] font-semibold text-[#347849]">Sending</p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">Device is sending data to the server</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="!p-13 sm:!p-10">
        <div className="mb-3 inline-flex rounded-xl bg-[#f1f4f1] p-1" role="group" aria-label="Filter hardware events">
          {(["All", "Success", "Failure"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${filter === option ? "bg-white text-[#3d4a41] shadow-sm" : "text-[#8fa394] hover:text-[#3d4a41]"}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8faf8] text-[9px] uppercase tracking-wide text-[#9aaba0]">
                <th className="px-3 py-2.5 font-medium" style={{ borderBottom: "1px solid #edf0ed" }}>Time</th>
                <th className="px-3 py-2.5 font-medium" style={{ borderBottom: "1px solid #edf0ed" }}>Event</th>
                <th className="px-3 py-2.5 font-medium" style={{ borderBottom: "1px solid #edf0ed" }}>Status</th>
                <th className="px-3 py-2.5 font-medium" style={{ borderBottom: "1px solid #edf0ed" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && events.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-[#8fa394]">Loading hardware events...</td></tr>}
              {!loading && filteredEvents.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-[#8fa394]">No hardware events for this filter.</td></tr>}
              {filteredEvents.map((event) => (
                <tr key={event.id} className="text-[10px] text-[#536258]">
                  <td className="whitespace-nowrap px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{event.time}</td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{event.event}</td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}><Badge tone={event.status === "Success" ? "green" : "red"} dot>{event.status}</Badge></td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
