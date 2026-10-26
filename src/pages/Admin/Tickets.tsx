import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Avatar, Badge, Card, PageTitle } from "@/components/ui";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import { useSupportRealtime } from "@/hooks/useSupportRealtime";
import { saveResource } from "@/services/dataSource";

type TicketMessage = {
  id: string;
  author: "requester" | "admin";
  text: string;
  time: string;
};

type Ticket = {
  id: string;
  title: string;
  requester: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  description?: string | null;
  messages: TicketMessage[];
};
const priorityTone = { Low: "green", Normal: "amber", High: "red", Urgent: "red" } as const;

export default function Tickets() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin" || user.role === "administrator";
  const { data: tickets, setData: setTickets, loading, error, reload } = useResource<Ticket[]>("/support/tickets", []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Ticket["status"]>("All");
  const [reply, setReply] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesQuery = !normalizedQuery
        || ticket.title.toLowerCase().includes(normalizedQuery)
        || ticket.requester.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (statusFilter === "All" || ticket.status === statusFilter);
    });
  }, [query, statusFilter, tickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? filteredTickets[0] ?? null;

  const refreshTickets = useCallback(() => reload(), [reload]);
  useSupportRealtime(refreshTickets);

  const updateTicket = async (updatedTicket: Ticket) => {
    setSaveError(null);
    try {
      const status = updatedTicket.status.toLowerCase().replace(" ", "_");
      const saved = await saveResource<Ticket>(`/support/tickets/${updatedTicket.id}`, { status }, "PATCH");
      setTickets((current) => current.map((ticket) => ticket.id === saved.id ? { ...ticket, ...saved } : ticket));
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to save ticket changes.");
    }
  };

  const nextStatus: Ticket["status"] = selectedTicket?.status === "Open" ? "Closed" : "Open";

  const confirmStatusChange = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    await updateTicket({ ...selectedTicket, status: nextStatus });
    setSaving(false);
    setConfirmOpen(false);
  };

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !selectedTicket) return;

    try {
      const message = await saveResource<TicketMessage>(`/support/tickets/${selectedTicket.id}/messages`, { body: text }, "POST");
      setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id
        ? { ...ticket, messages: [...ticket.messages, message] }
        : ticket));
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to send reply.");
    }
    setReply("");
  };

  return (
    <div className="pb-4">
      <PageTitle title={isAdmin ? "Support" : "My Tickets"} subtitle={isAdmin ? "Review and respond to administrator support tickets." : "Track your support requests and replies."} />
      {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
      {saveError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{saveError}</p>}

      <div className="grid min-h-[min(680px,calc(100svh-12rem))] gap-3 lg:grid-cols-[minmax(250px,0.38fr)_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col !p-3">
          <div className="flex gap-2">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e2e8e4] bg-white px-3">
              <svg viewBox="0 0 16 16" fill="none" stroke="#8fa394" strokeWidth="1.6" className="h-4 w-4 shrink-0">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5l3 3" />
              </svg>
              <input
                aria-label="Search tickets"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tickets..."
                className="w-full min-w-0 bg-transparent text-[11px] text-[#3d4a41] outline-none placeholder:text-[#8fa394]"
              />
            </label>
            <select
              aria-label="Filter tickets by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="h-9 rounded-xl border border-[#e2e8e4] bg-white px-2 text-[11px] text-[#5a6b5e] outline-none"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {loading && tickets.length === 0 && <p className="p-3 text-[12px] text-[#8fa394]">Loading tickets...</p>}
            {!loading && filteredTickets.length === 0 && <p className="p-3 text-[12px] text-[#8fa394]">No tickets match your search.</p>}
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => { setSelectedId(ticket.id); setSaveError(null); setConfirmOpen(false); }}
                aria-pressed={selectedTicket?.id === ticket.id}
                className={`w-full rounded-xl border p-2 text-left transition-colors ${selectedTicket?.id === ticket.id ? "border-[#b9d4c0] bg-[#f4f8f4]" : "border-[#edf0ed] bg-white hover:bg-[#f8faf8]"}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-[12px] font-semibold text-[#405347]">{ticket.title}</span>
                  <span className="shrink-0 text-[9px] text-[#8fa394]">{ticket.createdAt}</span>
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] text-[#718076]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5 shrink-0"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0114 0" /></svg>
                    {ticket.requester}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={priorityTone[ticket.priority]}>{ticket.priority}</Badge>
                    <Badge tone={ticket.status === "Open" ? "blue" : "gray"}>{ticket.status}</Badge>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[420px] min-w-0 flex-col !p-0">
          {selectedTicket ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0ed] p-4 sm:p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-semibold text-[#18251c]">{selectedTicket.title}</h2>
                    <Badge tone={priorityTone[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#718076]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0114 0" /></svg>
                    {selectedTicket.requester} · <span>{selectedTicket.createdAt}</span>
                  </p>
                </div>
                {isAdmin && <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="h-9 rounded-xl bg-[#397c4d] px-4 text-[12px] font-semibold text-white transition hover:bg-[#2e6c41]"
                >
                  {selectedTicket.status === "Open" ? "Close Ticket" : "Reopen Ticket"}
                </button>}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
                {selectedTicket.messages.map((message) => {
                  const fromAdmin = message.author === "admin";
                  return (
                    <div key={message.id} className={`flex items-end gap-2 ${fromAdmin ? "justify-end" : "justify-start"}`}>
                      {!fromAdmin && <Avatar initials={selectedTicket.requester.slice(0, 2).toUpperCase()} size={28} color="#687d6e" />}
                      <div className={`flex min-w-0 max-w-[82%] flex-col ${fromAdmin ? "items-end" : "items-start"}`}>
                        <p className={`w-fit max-w-full whitespace-pre-wrap break-words rounded-2xl px-3 py-2.5 text-left text-[12px] leading-relaxed ${fromAdmin ? "bg-[#347849] text-white" : "bg-[#f1f4f1] text-[#405347]"}`}>
                          {message.text}
                        </p>
                        <span className="mt-1 px-1 text-[9px] text-[#8fa394]">{message.time}</span>
                      </div>
                      {fromAdmin && <Avatar initials="AD" size={28} />}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendReply} className="flex gap-2 border-t border-[#edf0ed] p-3 sm:p-4">
                <label className="sr-only" htmlFor="ticket-reply">Type your response</label>
                <input
                  id="ticket-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={selectedTicket.status === "Open" ? "Type your response here..." : "Reopen this ticket to reply"}
                  disabled={selectedTicket.status === "Closed"}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2e8e4] px-3 text-[12px] text-[#3d4a41] outline-none placeholder:text-[#8fa394] focus:border-[#3a7d4e] disabled:bg-[#f4f6f5]"
                />
                <button type="submit" disabled={selectedTicket.status === "Closed" || !reply.trim()} className="flex h-10 items-center gap-2 rounded-xl bg-[#397c4d] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2e6c41] disabled:cursor-not-allowed disabled:opacity-50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-[#8fa394]">
              Select a ticket to review its conversation.
            </div>
          )}
        </Card>
      </div>

      {confirmOpen && selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setConfirmOpen(false)}
          onKeyDown={(event) => { if (event.key === "Escape" && !saving) setConfirmOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          >
            <h3 id="confirm-title" className="text-[15px] font-semibold text-[#18251c]">
              {nextStatus === "Closed" ? "Close this ticket?" : "Reopen this ticket?"}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5a6b5e]">
              {nextStatus === "Closed"
                ? `"${selectedTicket.title}" will be marked as closed and replies will be disabled.`
                : `"${selectedTicket.title}" will be marked as open and replies will be enabled again.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                disabled={saving}
                onClick={() => setConfirmOpen(false)}
                className="h-9 rounded-xl border border-[#e2e8e4] bg-white px-4 text-[12px] font-semibold text-[#5a6b5e] transition hover:bg-[#f8faf8] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void confirmStatusChange()}
                className="h-9 rounded-xl bg-[#397c4d] px-4 text-[12px] font-semibold text-white transition hover:bg-[#2e6c41] disabled:opacity-50"
              >
                {saving ? "Saving..." : nextStatus === "Closed" ? "Yes, close" : "Yes, reopen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}