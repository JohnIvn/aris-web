import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Avatar,
  Badge,
  Card,
  GhostButton,
  Modal,
  PageTitle,
  PrimaryButton,
  SearchInput,
  Tabs,
  initialsColor,
} from "@/components/ui";
import { BRAND } from "@/config/navigation";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import { useSupportRealtime } from "@/hooks/useSupportRealtime";
import { loadResource, saveResource } from "@/services/dataSource";

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

function formatTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Tickets() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin" || user.role === "administrator";
  const { data: tickets, setData: setTickets, loading, error } = useResource<Ticket[]>("/support/tickets", []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Closed">("All");
  const [reply, setReply] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Ticket Modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Ticket["priority"]>("Normal");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesQuery = !normalizedQuery
        || ticket.title.toLowerCase().includes(normalizedQuery)
        || ticket.requester.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (statusFilter === "All" || ticket.status === statusFilter);
    });
  }, [query, statusFilter, tickets]);

  // Keep selectedId stable so background updates don't switch which ticket is open
  useEffect(() => {
    if (!selectedId && filteredTickets.length > 0) {
      setSelectedId(filteredTickets[0].id);
    }
  }, [selectedId, filteredTickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? filteredTickets[0] ?? null;

  // Real-time silent refresh that does not flash loading spinners
  const refreshTickets = useCallback(async () => {
    try {
      const latest = await loadResource<Ticket[]>("/support/tickets", []);
      setTickets(latest);
    } catch {
      // Background reload failure is non-fatal
    }
  }, [setTickets]);

  useSupportRealtime(refreshTickets);

  // Scroll only the message container internally without scrolling the window or main layout
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedTicket?.id, selectedTicket?.messages?.length]);

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
    void refreshTickets();
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
      setReply("");
      void refreshTickets();
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to send reply.");
    }
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newDescription.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const created = await saveResource<Ticket>("/support/tickets", {
        subject: newSubject.trim(),
        description: newDescription.trim(),
        priority: newPriority.toLowerCase(),
      }, "POST");

      setNewSubject("");
      setNewDescription("");
      setNewPriority("Normal");
      setNewModalOpen(false);
      if (created?.id) {
        setSelectedId(created.id);
      }
      await refreshTickets();
    } catch (reason) {
      setCreateError(reason instanceof Error ? reason.message : "Unable to submit support ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title={isAdmin ? "Support Tickets" : "My Tickets"}
        subtitle={isAdmin ? "Review and respond to support tickets from staff and faculty." : "Track your support requests and replies."}
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => void refreshTickets()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </GhostButton>
            <PrimaryButton onClick={() => { setNewModalOpen(true); setCreateError(null); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Ticket
            </PrimaryButton>
          </div>
        }
      />

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700">
          {error}
        </div>
      )}
      {saveError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700">
          {saveError}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-210px)] min-h-[580px]">
        {/* Left Column: Tickets Directory */}
        <Card className="flex flex-col overflow-hidden h-full" style={{ padding: 0 }}>
          <div className="p-4 border-b space-y-3" style={{ borderColor: "#eef1ef" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#111c14]">
                Tickets ({filteredTickets.length})
              </span>
              <Tabs
                tabs={["All", "Open", "Closed"]}
                value={statusFilter}
                onChange={(t) => setStatusFilter(t as "All" | "Open" | "Closed")}
              />
            </div>
            <SearchInput
              placeholder="Search tickets..."
              value={query}
              onChange={setQuery}
              className="w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f2f4f2]">
            {loading && tickets.length === 0 && (
              <div className="p-8 text-center text-[13px] text-[#8fa394]">Loading tickets...</div>
            )}
            {!loading && filteredTickets.length === 0 && (
              <div className="p-8 text-center text-[13px] text-[#8fa394]">No tickets found.</div>
            )}
            {filteredTickets.map((ticket, i) => {
              const isSelected = selectedTicket?.id === ticket.id;
              const lastMessage = ticket.messages[ticket.messages.length - 1];
              return (
                <div
                  key={ticket.id}
                  onClick={() => { setSelectedId(ticket.id); setSaveError(null); setConfirmOpen(false); }}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    isSelected ? "bg-[#f0f7f2] border-l-4 border-l-[#3a7d4e]" : "hover:bg-[#fafbfa]"
                  }`}
                >
                  <Avatar
                    initials={ticket.requester.slice(0, 2).toUpperCase()}
                    color={initialsColor(i)}
                    size={38}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-[13.5px] font-semibold truncate ${isSelected ? "text-[#2f7043]" : "text-[#111c14]"}`}>
                        {ticket.title}
                      </p>
                      <span className="shrink-0 text-[10.5px] text-[#8fa394]">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-[11.5px] truncate text-[#718076]">
                        {ticket.requester}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge tone={priorityTone[ticket.priority]}>{ticket.priority}</Badge>
                        <Badge tone={ticket.status === "Open" ? "blue" : "gray"}>{ticket.status}</Badge>
                      </div>
                    </div>

                    {lastMessage && (
                      <p className="text-[12px] truncate text-[#5a6b5e] mt-1 line-clamp-1">
                        {lastMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Chat Conversation Stream */}
        <Card className="flex flex-col overflow-hidden h-full" style={{ padding: 0 }}>
          {selectedTicket ? (
            <>
              {/* Active Ticket Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-[#fafbfa]" style={{ borderColor: "#eef1ef" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    initials={selectedTicket.requester.slice(0, 2).toUpperCase()}
                    color={BRAND}
                    size={42}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[15.5px] font-bold text-[#111c14] truncate">{selectedTicket.title}</h2>
                      <Badge tone={priorityTone[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                      <Badge tone={selectedTicket.status === "Open" ? "blue" : "gray"}>{selectedTicket.status}</Badge>
                    </div>
                    <p className="text-[12px] text-[#8fa394] mt-0.5">
                      Opened by <span className="font-medium text-[#405347]">{selectedTicket.requester}</span> · {formatDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="shrink-0 h-9 px-4 rounded-xl text-[12.5px] font-semibold text-white transition hover:opacity-90"
                    style={{ background: selectedTicket.status === "Open" ? "#3a7d4e" : "#5a6b5e" }}
                  >
                    {selectedTicket.status === "Open" ? "Close Ticket" : "Reopen Ticket"}
                  </button>
                )}
              </div>

              {/* Message Stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
              >
                {/* Initial Ticket Description Card */}
                {selectedTicket.description && (
                  <div className="rounded-2xl border border-[#e2e8e4] bg-[#f8faf8] p-4 text-[13px] text-[#3d4a41]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#eef1ef] text-[11px] font-semibold uppercase tracking-wider text-[#718076]">
                      <span>Ticket Details</span>
                      <span>{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  </div>
                )}

                {/* Messages list */}
                {selectedTicket.messages.map((message) => {
                  const fromAdmin = message.author === "admin";
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${fromAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-[#8fa394]">
                          {fromAdmin ? "Administrator" : selectedTicket.requester}
                        </span>
                        <span className="text-[10.5px] text-[#b6c3ba]">
                          {formatTime(message.time)}
                        </span>
                      </div>

                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm ${
                          fromAdmin
                            ? "bg-[#3a7d4e] text-white rounded-tr-sm"
                            : "bg-[#f4f6f5] text-[#111c14] rounded-tl-sm border border-[#eef1ef]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer Footer */}
              <form onSubmit={sendReply} className="p-4 border-t bg-[#fafbfa] flex items-center gap-2" style={{ borderColor: "#eef1ef" }}>
                <input
                  id="ticket-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={selectedTicket.status === "Open" ? "Type your response here..." : "Reopen this ticket to reply"}
                  disabled={selectedTicket.status === "Closed"}
                  className="flex-1 h-10 px-3.5 rounded-xl border bg-white text-[13px] text-[#111c14] outline-none placeholder:text-[#8fa394] focus:border-[#3a7d4e] disabled:bg-[#f4f6f5]"
                  style={{ borderColor: "#e2e8e4" }}
                />
                <button
                  type="submit"
                  disabled={selectedTicket.status === "Closed" || !reply.trim()}
                  className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: BRAND }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M22 2 11 13M22 2 15 22 11 13 2 9 22 2z" />
                  </svg>
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

      {/* Confirm Status Change Modal */}
      <Modal
        isOpen={confirmOpen && !!selectedTicket}
        onClose={() => !saving && setConfirmOpen(false)}
        title={nextStatus === "Closed" ? "Close this ticket?" : "Reopen this ticket?"}
        size="sm"
        align="center"
        actions={
          <div className="flex items-center justify-center gap-2 w-full">
            <GhostButton onClick={() => setConfirmOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={() => void confirmStatusChange()}>
              {saving ? "Saving..." : nextStatus === "Closed" ? "Confirm Close" : "Confirm Reopen"}
            </PrimaryButton>
          </div>
        }
      >
        <p className="text-[13px] leading-relaxed text-[#5a6b5e]">
          {nextStatus === "Closed"
            ? `"${selectedTicket?.title}" will be marked as closed and replies will be disabled.`
            : `"${selectedTicket?.title}" will be marked as open and replies will be enabled again.`}
        </p>
      </Modal>

      {/* New Support Ticket Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => !creating && setNewModalOpen(false)}
        title="New Support Ticket"
        size="lg"
        align="left"
        actions={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <GhostButton onClick={() => setNewModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={() => void handleCreateTicket()}>
              {creating ? "Submitting..." : "Submit Ticket"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {createError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
              {createError}
            </div>
          )}

          <div>
            <label htmlFor="ticket-subject" className="block text-[12.5px] font-medium text-[#3d4a41] mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="ticket-subject"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g., Cannot submit report / System error"
              className="h-10 w-full rounded-xl border bg-white px-3.5 text-[13px] text-[#111c14] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4" }}
            />
          </div>

          <div>
            <label htmlFor="ticket-priority" className="block text-[12.5px] font-medium text-[#3d4a41] mb-1.5">
              Priority
            </label>
            <select
              id="ticket-priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Ticket["priority"])}
              className="h-10 w-full rounded-xl border bg-white px-3 text-[13px] text-[#111c14] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4" }}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="ticket-description" className="block text-[12.5px] font-medium text-[#3d4a41] mb-1.5">
              What do you need help with? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ticket-description"
              required
              rows={5}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Please describe the issue in as much detail as possible..."
              className="w-full resize-y rounded-xl border bg-white p-3 text-[13px] text-[#111c14] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4" }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
