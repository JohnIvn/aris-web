import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Link2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge, Card, PageTitle } from "@/components/ui";
import { apiClient } from "@/services/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type UnassignedBiometric = {
  biometrics_emp_id: string;
  emp_code: string | null;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  position: string | null;
  last_punch_time: string | null;
};

type AssignableUser = {
  id: string;
  employee_id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  position: string;
  department: string;
};

type AssignableUsers = {
  professors: AssignableUser[];
  staffs: AssignableUser[];
};

type UserRow = AssignableUser & { role: "Professor" | "Staff" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function errMessage(e: unknown, fallback: string): string {
  return (
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Devices() {
  const [unassigned, setUnassigned] = useState<UnassignedBiometric[]>([]);
  const [users, setUsers] = useState<AssignableUsers>({
    professors: [],
    staffs: [],
  });
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [unassignedRes, usersRes] = await Promise.all([
        apiClient.get<ApiResponse<UnassignedBiometric[]>>(
          "/biometrics/unassigned",
        ),
        apiClient.get<ApiResponse<AssignableUsers>>("/admin", {
          params: { for: "biometrics" },
        }),
      ]);
      setUnassigned(unassignedRes.data.data ?? []);
      setUsers(usersRes.data.data ?? { professors: [], staffs: [] });
      setError(null);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(errMessage(e, "Could not load unassigned biometrics or users."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedEmpId || !selectedUserId) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await apiClient.post<ApiResponse<unknown>>(
        "/biometrics/assign",
        {
          biometrics_emp_id: selectedEmpId,
          user_id: selectedUserId,
        },
      );
      if (res.data.success === false) {
        setError(res.data.message ?? "Could not assign biometrics ID.");
        return;
      }
      setSelectedEmpId("");
      setSelectedUserId("");
      setSearch("");
      setMessage("Biometrics ID assigned successfully.");
      setTimeout(() => setMessage(null), 3000);
      await fetchData();
    } catch (e) {
      setError(errMessage(e, "Could not assign biometrics ID."));
    } finally {
      setAssigning(false);
    }
  };

  const q = search.trim().toLowerCase();
  const userRows: UserRow[] = [
    ...users.professors.map((u) => ({ ...u, role: "Professor" as const })),
    ...users.staffs.map((u) => ({ ...u, role: "Staff" as const })),
  ].filter(
    (u) =>
      !q ||
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
      u.employee_id?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q),
  );

  const selectedBio = unassigned.find(
    (b) => b.biometrics_emp_id === selectedEmpId,
  );
  const selectedUser = userRows.find((u) => u.id === selectedUserId);

  return (
    <div className="pb-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <PageTitle
          title="Assign Biometrics"
          subtitle="Link biometrics IDs detected from the terminal to professor or staff accounts."
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8fa394] flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3d4a41] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
        >
          <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {/* ── Unassigned biometrics IDs ─────────────────────── */}
        <Card className="!p-4 sm:!p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#18251c]">
                Unassigned Biometrics IDs
              </h2>
              <p className="mt-0.5 text-[12px] text-[#8fa394]">
                Select the ID you want to assign.
              </p>
            </div>
            <Badge tone={unassigned.length > 0 ? "green" : "gray"} dot>
              {loading ? "Loading…" : `${unassigned.length} unassigned`}
            </Badge>
          </div>

          {!loading && unassigned.length === 0 ? (
            <p className="text-[12px] text-[#8fa394]">
              No unassigned biometrics IDs.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-[#e7ece8] divide-y divide-[#edf0ed]">
              {unassigned.map((b) => {
                const name =
                  `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() ||
                  "Unknown name";
                const active = b.biometrics_emp_id === selectedEmpId;
                return (
                  <button
                    key={b.biometrics_emp_id}
                    type="button"
                    onClick={() => setSelectedEmpId(b.biometrics_emp_id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      active ? "bg-[#eaf4ee]" : "bg-white hover:bg-[#f7f9f8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#18251c] truncate">
                        {name}
                      </span>
                      <span className="text-[11px] font-mono text-[#3a7d4e] shrink-0">
                        ID {b.biometrics_emp_id}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8fa394] truncate">
                      {[
                        b.emp_code && `Code ${b.emp_code}`,
                        b.department,
                        b.position,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                      {" · "}Last punch {fmtDate(b.last_punch_time)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Users ─────────────────────────────────────────── */}
        <Card className="!p-4 sm:!p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#18251c]">
                Users
              </h2>
              <p className="mt-0.5 text-[12px] text-[#8fa394]">
                Professors and staff without a biometrics ID.
              </p>
            </div>
            <Badge tone="gray" dot>
              {userRows.length} shown
            </Badge>
          </div>

          <div className="relative mb-2">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa394]"
              aria-hidden
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, employee ID or email..."
              className="w-full rounded-xl border border-[#e2e8e4] bg-white pl-8 pr-3 py-1.5 text-[12px] text-[#3d4a41] focus:outline-none focus:ring-2 focus:ring-[#3a7d4e]/30"
            />
          </div>

          {!loading && userRows.length === 0 ? (
            <p className="text-[12px] text-[#8fa394]">No users found.</p>
          ) : (
            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#e7ece8] divide-y divide-[#edf0ed]">
              {userRows.map((u) => {
                const active = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      active ? "bg-[#eaf4ee]" : "bg-white hover:bg-[#f7f9f8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#18251c] truncate">
                        {u.lastname}, {u.firstname}
                      </span>
                      <span className="text-[11px] text-[#8fa394] shrink-0">
                        {u.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8fa394] truncate">
                      {[u.employee_id, u.department, u.position]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7ece8] bg-[#f8faf8] px-3 py-2.5">
            <p className="text-[12px] text-[#3d4a41]">
              {selectedBio && selectedUser
                ? `ID ${selectedBio.biometrics_emp_id} → ${selectedUser.firstname} ${selectedUser.lastname}`
                : "Select a biometrics ID and a user."}
            </p>
            <button
              type="button"
              disabled={!selectedEmpId || !selectedUserId || assigning}
              onClick={() => void handleAssign()}
              className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: "#3a7d4e" }}
            >
              <Link2 size={13} aria-hidden />
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </div>

          {message && (
            <p className="mt-2 text-[12px] text-[#3a7d4e] flex items-center gap-1 font-medium">
              <Check size={13} />
              {message}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
