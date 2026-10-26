import { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  initialsColor,
  Modal,
} from "@/components/ui";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import { useAuth } from "@/app/authContext";

export type Contact = {
  id: string;
  name: string;
  email: string;
  role: "professor" | "staff";
  department: string;
  position: string;
  employee_id?: string;
  avatar_url?: string | null;
};

export type DirectMessage = {
  id: string;
  sender_id: string;
  sender_role: string;
  sender_name?: string;
  recipient_id: string;
  recipient_role: string;
  recipient_name?: string;
  subject?: string | null;
  body: string;
  is_read: boolean;
  time: string;
};

const fallbackContacts: Contact[] = [
  {
    id: "prof-1",
    name: "Dr. Maria Santos",
    email: "m.santos@aris.edu.ph",
    role: "professor",
    department: "Engineering",
    position: "Professor",
    employee_id: "PROF-0001",
  },
  {
    id: "prof-2",
    name: "Prof. Lito Cruz",
    email: "l.cruz@aris.edu.ph",
    role: "professor",
    department: "Computer Science",
    position: "Associate Prof.",
    employee_id: "PROF-0002",
  },
  {
    id: "prof-3",
    name: "Dr. Elena Reyes",
    email: "e.reyes@aris.edu.ph",
    role: "professor",
    department: "Business",
    position: "Professor",
    employee_id: "PROF-0003",
  },
  {
    id: "prof-4",
    name: "Dr. Sofia Mendoza",
    email: "s.mendoza@aris.edu.ph",
    role: "professor",
    department: "Computer Science",
    position: "Professor",
    employee_id: "PROF-0004",
  },
  {
    id: "staff-1",
    name: "Mark Villanueva",
    email: "m.villanueva@aris.edu.ph",
    role: "staff",
    department: "Attendance",
    position: "Checker",
    employee_id: "CHK-0001",
  },
  {
    id: "staff-2",
    name: "Patricia Ramos",
    email: "p.ramos@aris.edu.ph",
    role: "staff",
    department: "College Secretary",
    position: "Secretary",
    employee_id: "SEC-0001",
  },
  {
    id: "staff-3",
    name: "Carla Dizon",
    email: "c.dizon@aris.edu.ph",
    role: "staff",
    department: "Human Resources",
    position: "HR Officer",
    employee_id: "HR-0001",
  },
];

const fallbackMessages: DirectMessage[] = [
  {
    id: "msg-1",
    sender_id: "admin-1",
    sender_role: "admin",
    sender_name: "Administration",
    recipient_id: "prof-1",
    recipient_role: "professor",
    recipient_name: "Dr. Maria Santos",
    subject: "Upcoming Syllabus Review",
    body: "Good day Dr. Santos, please ensure the updated Engineering syllabus is submitted before Friday.",
    is_read: true,
    time: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "msg-2",
    sender_id: "prof-1",
    sender_role: "professor",
    sender_name: "Dr. Maria Santos",
    recipient_id: "admin-1",
    recipient_role: "admin",
    recipient_name: "Administration",
    body: "Noted, thank you! I will send the finalized department draft tomorrow morning.",
    is_read: true,
    time: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export default function StaffProfMessages() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contactsData } = useResource<Contact[]>("/support/contacts", fallbackContacts);
  const { data: messagesData, setData: setMessagesData, reload: reloadMessages } = useResource<DirectMessage[]>(
    "/support/messages",
    fallbackMessages,
  );

  const contacts = useMemo(() => {
    return Array.isArray(contactsData) && contactsData.length > 0 ? contactsData : fallbackContacts;
  }, [contactsData]);

  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || "prof-1");
  const [roleFilter, setRoleFilter] = useState<"All" | "Professors" | "Staff">("All");
  const [search, setSearch] = useState("");

  const [messageText, setMessageText] = useState("");
  const [subjectText, setSubjectText] = useState("");
  const [showSubject, setShowSubject] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New conversation modal
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeRecipientId, setComposeRecipientId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;
  }, [contacts, selectedContactId]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesRole =
        roleFilter === "All" ||
        (roleFilter === "Professors" && contact.role === "professor") ||
        (roleFilter === "Staff" && contact.role === "staff");

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.department.toLowerCase().includes(query) ||
        contact.position.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [contacts, roleFilter, search]);

  // Filter messages for current thread
  const threadMessages = useMemo(() => {
    if (!selectedContact) return [];
    return messagesData.filter((m) => {
      return (
        (m.recipient_id === selectedContact.id && (m.sender_id === user.id || m.sender_role === "admin")) ||
        (m.sender_id === selectedContact.id)
      );
    });
  }, [messagesData, selectedContact, user.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContact) return;
    setSending(true);
    setError(null);
    try {
      const payload = {
        recipientId: selectedContact.id,
        recipientRole: selectedContact.role,
        recipientName: selectedContact.name,
        subject: subjectText.trim() || undefined,
        body: messageText.trim(),
      };

      const saved = await saveResource<DirectMessage>("/support/messages", payload, "POST");

      setMessagesData((prev) => [
        ...prev,
        saved || {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          sender_role: user.role,
          sender_name: "Administration",
          recipient_id: selectedContact.id,
          recipient_role: selectedContact.role,
          recipient_name: selectedContact.name,
          subject: subjectText.trim() || null,
          body: messageText.trim(),
          is_read: false,
          time: new Date().toISOString(),
        },
      ]);

      setMessageText("");
      setSubjectText("");
      setShowSubject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleComposeSubmit = async () => {
    if (!composeRecipientId || !composeBody.trim()) {
      setError("Please select a recipient and enter a message.");
      return;
    }
    const targetContact = contacts.find((c) => c.id === composeRecipientId);
    if (!targetContact) return;

    setSending(true);
    setError(null);
    try {
      const payload = {
        recipientId: targetContact.id,
        recipientRole: targetContact.role,
        recipientName: targetContact.name,
        subject: composeSubject.trim() || undefined,
        body: composeBody.trim(),
      };

      const saved = await saveResource<DirectMessage>("/support/messages", payload, "POST");

      setMessagesData((prev) => [
        ...prev,
        saved || {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          sender_role: user.role,
          sender_name: "Administration",
          recipient_id: targetContact.id,
          recipient_role: targetContact.role,
          recipient_name: targetContact.name,
          subject: composeSubject.trim() || null,
          body: composeBody.trim(),
          is_read: false,
          time: new Date().toISOString(),
        },
      ]);

      setSelectedContactId(targetContact.id);
      setComposeModalOpen(false);
      setComposeBody("");
      setComposeSubject("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title="Staff & Faculty Messaging"
        subtitle="Direct two-way messaging with university professors and support staff."
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={reloadMessages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </GhostButton>
            <PrimaryButton
              onClick={() => {
                setComposeRecipientId(contacts[0]?.id || "");
                setComposeSubject("");
                setComposeBody("");
                setComposeModalOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Message
            </PrimaryButton>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-210px)] min-h-[580px]">
        {/* Left Column: Directory & Conversations */}
        <Card className="p-0 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b space-y-3" style={{ borderColor: "#eef1ef" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#111c14]">
                Directory ({filteredContacts.length})
              </span>
              <Tabs
                tabs={["All", "Professors", "Staff"]}
                value={roleFilter}
                onChange={(t) => setRoleFilter(t as any)}
              />
            </div>
            <SearchInput
              placeholder="Search faculty or staff..."
              value={search}
              onChange={setSearch}
              className="w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f2f4f2]">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#8fa394]">
                No contacts found matching your criteria.
              </div>
            ) : (
              filteredContacts.map((contact, i) => {
                const isSelected = selectedContact?.id === contact.id;
                const contactMsgs = messagesData.filter(
                  (m) => m.recipient_id === contact.id || m.sender_id === contact.id,
                );
                const lastMsg = contactMsgs[contactMsgs.length - 1];

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      isSelected ? "bg-[#f0f7f2]" : "hover:bg-[#fafbfa]"
                    }`}
                  >
                    <Avatar
                      initials={contact.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      color={initialsColor(i)}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`text-[13.5px] font-medium truncate ${
                            isSelected ? "text-[#2f7043]" : "text-[#111c14]"
                          }`}
                        >
                          {contact.name}
                        </p>
                        <Badge tone={contact.role === "professor" ? "green" : "amber"}>
                          {contact.role === "professor" ? "Faculty" : "Staff"}
                        </Badge>
                      </div>
                      <p className="text-[11.5px] truncate text-[#8fa394]">
                        {contact.department} · {contact.position}
                      </p>
                      {lastMsg && (
                        <p className="text-[12px] truncate text-[#5a6b5e] mt-1 line-clamp-1">
                          {lastMsg.body}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: Chat Conversation Stream */}
        <Card className="p-0 flex flex-col overflow-hidden h-full">
          {selectedContact ? (
            <>
              {/* Active Contact Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b bg-[#fafbfa]"
                style={{ borderColor: "#eef1ef" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={selectedContact.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    color={BRAND}
                    size={42}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-bold text-[#111c14]">
                        {selectedContact.name}
                      </h2>
                      <Badge tone={selectedContact.role === "professor" ? "green" : "amber"}>
                        {selectedContact.role === "professor" ? "Professor" : "Staff"}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-[#8fa394]">
                      {selectedContact.email} · {selectedContact.department} ({selectedContact.position})
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[11.5px] font-mono text-[#8fa394]">
                    ID: {selectedContact.employee_id || selectedContact.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {threadMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#8fa394] space-y-2 py-12">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#f0f7f2] text-[#3a7d4e]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-[14px] font-medium text-[#111c14]">No conversation yet</p>
                    <p className="text-[12.5px] max-w-sm">
                      Send a message below to start communicating with {selectedContact.name}.
                    </p>
                  </div>
                ) : (
                  threadMessages.map((msg) => {
                    const isOutgoing = msg.sender_id === user.id || msg.sender_role === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[11px] font-semibold text-[#8fa394]">
                            {isOutgoing ? "Administrator (You)" : msg.sender_name || selectedContact.name}
                          </span>
                          <span className="text-[10.5px] text-[#b6c3ba]">
                            {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[75%] rounded-2xl p-4 text-[13.5px] leading-relaxed shadow-sm ${
                            isOutgoing
                              ? "bg-[#3a7d4e] text-white rounded-tr-sm"
                              : "bg-[#f4f6f5] text-[#111c14] rounded-tl-sm border border-[#eef1ef]"
                          }`}
                        >
                          {msg.subject && (
                            <p
                              className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 pb-1 border-b ${
                                isOutgoing ? "border-white/20 text-white/90" : "border-[#e2e8e4] text-[#2f7043]"
                              }`}
                            >
                              Subject: {msg.subject}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer */}
              <div className="p-4 border-t bg-[#fafbfa] space-y-2" style={{ borderColor: "#eef1ef" }}>
                {showSubject ? (
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Subject (e.g. Schedule inquiry, Document review)..."
                      value={subjectText}
                      onChange={(e) => setSubjectText(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-xl border bg-white text-[13px] outline-none focus:border-[#3a7d4e]"
                      style={{ borderColor: "#e2e8e4" }}
                    />
                    <button
                      onClick={() => {
                        setShowSubject(false);
                        setSubjectText("");
                      }}
                      className="text-[12px] text-[#8fa394] hover:text-[#111c14] px-2"
                    >
                      Remove Subject
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-1">
                    <button
                      onClick={() => setShowSubject(true)}
                      className="text-[12px] font-medium text-[#2f7043] hover:underline"
                    >
                      + Add Subject Line
                    </button>
                    <span className="text-[11.5px] text-[#8fa394]">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px]">Enter</kbd> to send
                    </span>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    placeholder={`Message ${selectedContact.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 p-3 rounded-2xl border bg-white text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                  <PrimaryButton onClick={handleSendMessage}>
                    {sending ? (
                      "Sending..."
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Send
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#8fa394] p-8">
              <p className="text-[15px] font-medium text-[#111c14]">Select a contact</p>
              <p className="text-[13px] mt-1">Choose a professor or staff member from the left pane.</p>
            </div>
          )}
        </Card>
      </div>

      {/* NEW MESSAGE MODAL */}
      <Modal
        isOpen={composeModalOpen}
        onClose={() => setComposeModalOpen(false)}
        title="Compose New Message"
        align="left"
        size="sm"
        actions={
          <div className="flex w-full items-center justify-end gap-2 pt-2">
            <GhostButton onClick={() => setComposeModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleComposeSubmit}>
              {sending ? "Sending..." : "Send Message"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Recipient <span className="text-red-500">*</span>
            </label>
            <select
              value={composeRecipientId}
              onChange={(e) => setComposeRecipientId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border bg-white text-[13px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4" }}
            >
              <optgroup label="Professors">
                {contacts
                  .filter((c) => c.role === "professor")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department} - {c.position})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Staff">
                {contacts
                  .filter((c) => c.role === "staff")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department} - {c.position})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Subject (Optional)
            </label>
            <input
              placeholder="e.g. Inquiry regarding grade submission"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write your message here..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className="w-full p-3 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e] resize-none"
              style={{ borderColor: "#e2e8e4" }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

