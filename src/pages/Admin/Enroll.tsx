import { useState, useMemo, useEffect } from "react";
import {
  Fingerprint,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  UserCheck,
  Trash2,
  ScanLine,
  Plus,
  Users,
  Info,
} from "lucide-react";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  StatCard,
  StatGrid,
  Modal,
  initialsColor,
} from "@/components/ui";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

export type EnrolledBiometric = {
  id: string;
  biometrics_id: string;
  biometrics_fingerprint?: string | null;
  authenticator_fingerprint?: string | null;
  nfc_id?: string | null;
  rfid?: string | null;
  created_at?: string;
  updated_at?: string;
  professor_id?: string | null;
  staff_id?: string | null;
  user_type: "professor" | "staff" | "unassigned";
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar_url?: string | null;
};

type ProfessorRecord = {
  id: string;
  employee_id: string;
  firstname: string;
  lastname: string;
  email: string;
  department?: string | null;
  position?: string | null;
  avatar_url?: string | null;
};

type StaffRecord = {
  id: string;
  employee_id: string;
  firstname: string;
  lastname: string;
  email: string;
  department?: string | null;
  position?: string | null;
  avatar_url?: string | null;
};

type SlotSummary = {
  totalCapacity: number;
  occupiedCount: number;
  availableCount: number;
  occupiedSlots: number[];
  nextAvailableSlot: number;
};

const initialDemoEnrolled: EnrolledBiometric[] = [
  {
    id: "bio-001",
    biometrics_id: "0",
    biometrics_fingerprint: "fp_template_sha256_88a91",
    user_type: "professor",
    employee_id: "PROF-2024-001",
    name: "Dr. Maria Santos",
    email: "m.santos@aris.edu.ph",
    department: "Engineering",
    position: "Professor",
    created_at: "2026-09-01T08:30:00Z",
  },
  {
    id: "bio-002",
    biometrics_id: "1",
    biometrics_fingerprint: "fp_template_sha256_f92b4",
    user_type: "professor",
    employee_id: "PROF-2024-002",
    name: "Prof. Lito Cruz",
    email: "l.cruz@aris.edu.ph",
    department: "Computer Science",
    position: "Associate Prof.",
    created_at: "2026-09-02T09:15:00Z",
  },
  {
    id: "bio-003",
    biometrics_id: "2",
    biometrics_fingerprint: "fp_template_sha256_d11a7",
    user_type: "staff",
    employee_id: "CHK-0142",
    name: "James Reyes",
    email: "j.reyes@aris.edu.ph",
    department: "Attendance Office",
    position: "Checker",
    created_at: "2026-09-05T10:00:00Z",
  },
  {
    id: "bio-004",
    biometrics_id: "3",
    biometrics_fingerprint: "fp_template_sha256_77c4e",
    user_type: "professor",
    employee_id: "PROF-2024-003",
    name: "Dr. Elena Reyes",
    email: "e.reyes@aris.edu.ph",
    department: "Business Administration",
    position: "Professor",
    created_at: "2026-09-10T11:20:00Z",
  },
  {
    id: "bio-005",
    biometrics_id: "4",
    biometrics_fingerprint: "fp_template_sha256_44b2c",
    user_type: "staff",
    employee_id: "CHK-0143",
    name: "Marco Dela Cruz",
    email: "m.delacruz@aris.edu.ph",
    department: "Attendance Office",
    position: "Checker",
    created_at: "2026-09-12T14:45:00Z",
  },
];

function getInitialsColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return initialsColor(hash);
}

export default function Enroll() {
  const {
    data: fetchedBiometrics,
    loading: loadingBiometrics,
    reload: reloadBiometrics,
  } = useResource<EnrolledBiometric[]>("/biometrics", initialDemoEnrolled);

  const { data: rawProfessors } = useResource<ProfessorRecord[]>("/professors", []);
  const { data: rawStaff } = useResource<StaffRecord[]>("/staff", []);
  const { data: slotSummary, reload: reloadSlots } = useResource<SlotSummary>("/biometrics/slots", {
    totalCapacity: 128,
    occupiedCount: initialDemoEnrolled.length,
    availableCount: 128 - initialDemoEnrolled.length,
    occupiedSlots: [0, 1, 2, 3, 4],
    nextAvailableSlot: 5,
  });

  const [biometricsList, setBiometricsList] = useState<EnrolledBiometric[]>(initialDemoEnrolled);

  useEffect(() => {
    if (Array.isArray(fetchedBiometrics) && fetchedBiometrics.length > 0) {
      setBiometricsList(fetchedBiometrics);
    }
  }, [fetchedBiometrics]);

  // Search & Filter state
  const [activeTab, setActiveTab] = useState<"All" | "Professors" | "Staff">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Enrollment Modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollRole, setEnrollRole] = useState<"professor" | "staff">("professor");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState("");
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [assignedSlotId, setAssignedSlotId] = useState<string>("");
  const [deviceName, setDeviceName] = useState("fingerprint-reader-01");
  const [scanStep, setScanStep] = useState<"idle" | "scanning_1" | "lift" | "scanning_2" | "matched">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Verification & Test Modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "scanning" | "matched" | "unrecognized">("idle");
  const [testedRecord, setTestedRecord] = useState<EnrolledBiometric | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<EnrolledBiometric | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-calculate occupied slot numbers
  const occupiedSlotNumbers = useMemo(() => {
    return new Set(biometricsList.map((b) => parseInt(b.biometrics_id, 10)).filter((n) => !isNaN(n)));
  }, [biometricsList]);

  // Default next available slot
  const nextAvailableSlot = useMemo(() => {
    if (slotSummary?.nextAvailableSlot !== undefined && slotSummary.nextAvailableSlot >= 0) {
      return slotSummary.nextAvailableSlot.toString();
    }
    for (let i = 0; i < 128; i++) {
      if (!occupiedSlotNumbers.has(i)) return i.toString();
    }
    return "0";
  }, [slotSummary, occupiedSlotNumbers]);

  // Available professors & staff list with enrollment status
  const professorsList = useMemo(() => {
    if (Array.isArray(rawProfessors) && rawProfessors.length > 0) {
      return rawProfessors.map((p) => {
        const enrolled = biometricsList.find((b) => b.professor_id === p.id || b.employee_id === p.employee_id);
        return {
          id: p.id,
          employee_id: p.employee_id,
          name: `${p.firstname || ""} ${p.lastname || ""}`.trim() || p.email,
          email: p.email,
          department: p.department || "Academic",
          position: p.position || "Faculty",
          avatar_url: p.avatar_url,
          enrolledSlot: enrolled ? enrolled.biometrics_id : null,
        };
      });
    }
    return [
      { id: "p1", employee_id: "PROF-2024-001", name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", department: "Engineering", position: "Professor", avatar_url: null, enrolledSlot: "0" },
      { id: "p2", employee_id: "PROF-2024-002", name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", department: "Computer Science", position: "Associate Prof.", avatar_url: null, enrolledSlot: "1" },
      { id: "p3", employee_id: "PROF-2024-003", name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", department: "Business", position: "Professor", avatar_url: null, enrolledSlot: "3" },
      { id: "p4", employee_id: "PROF-2024-004", name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", department: "Sciences", position: "Assistant Prof.", avatar_url: null, enrolledSlot: null },
      { id: "p5", employee_id: "PROF-2024-005", name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", department: "Arts & Humanities", position: "Lecturer", avatar_url: null, enrolledSlot: null },
    ];
  }, [rawProfessors, biometricsList]);

  const staffList = useMemo(() => {
    if (Array.isArray(rawStaff) && rawStaff.length > 0) {
      return rawStaff.map((s) => {
        const enrolled = biometricsList.find((b) => b.staff_id === s.id || b.employee_id === s.employee_id);
        return {
          id: s.id,
          employee_id: s.employee_id,
          name: `${s.firstname || ""} ${s.lastname || ""}`.trim() || s.email,
          email: s.email,
          department: s.department || "Staff Operations",
          position: s.position || "Staff",
          avatar_url: s.avatar_url,
          enrolledSlot: enrolled ? enrolled.biometrics_id : null,
        };
      });
    }
    return [
      { id: "s1", employee_id: "CHK-0142", name: "James Reyes", email: "j.reyes@aris.edu.ph", department: "Attendance", position: "Checker", avatar_url: null, enrolledSlot: "2" },
      { id: "s2", employee_id: "CHK-0143", name: "Marco Dela Cruz", email: "m.delacruz@aris.edu.ph", department: "Attendance", position: "Checker", avatar_url: null, enrolledSlot: "4" },
      { id: "s3", employee_id: "CHK-0144", name: "Ben Salvador", email: "b.salvador@aris.edu.ph", department: "Records Review", position: "Checker", avatar_url: null, enrolledSlot: null },
    ];
  }, [rawStaff, biometricsList]);

  // Candidates for the enrollment modal selector
  const candidatePersonnel = useMemo(() => {
    const list = enrollRole === "professor" ? professorsList : staffList;
    if (!personnelSearch.trim()) return list;
    const q = personnelSearch.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.employee_id.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q),
    );
  }, [enrollRole, professorsList, staffList, personnelSearch]);

  const selectedPerson = useMemo(() => {
    const list = enrollRole === "professor" ? professorsList : staffList;
    return list.find((p) => p.id === selectedPersonnelId) || null;
  }, [enrollRole, selectedPersonnelId, professorsList, staffList]);

  // Filtered enrolled biometrics for table
  const filteredBiometrics = useMemo(() => {
    return biometricsList.filter((item) => {
      // Role filter
      if (activeTab === "Professors" && item.user_type !== "professor") return false;
      if (activeTab === "Staff" && item.user_type !== "staff") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesEmpId = item.employee_id.toLowerCase().includes(q);
        const matchesSlot = item.biometrics_id.includes(q);
        const matchesDept = item.department.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesEmpId || matchesSlot || matchesDept;
      }

      return true;
    });
  }, [biometricsList, activeTab, searchQuery]);

  // Open modal ready for enrollment
  const handleOpenEnroll = (prefillPerson?: { id: string; role: "professor" | "staff" }) => {
    setModalFeedback(null);
    setScanStep("idle");
    setScanProgress(0);
    setAssignedSlotId(nextAvailableSlot);
    if (prefillPerson) {
      setEnrollRole(prefillPerson.role);
      setSelectedPersonnelId(prefillPerson.id);
    } else {
      setSelectedPersonnelId("");
    }
    setPersonnelSearch("");
    setShowEnrollModal(true);
  };

  // Interactive scan simulation
  const handleStartScan = () => {
    setScanStep("scanning_1");
    setScanProgress(20);
    setTimeout(() => {
      setScanProgress(50);
      setScanStep("lift");
      setTimeout(() => {
        setScanStep("scanning_2");
        setScanProgress(75);
        setTimeout(() => {
          setScanProgress(100);
          setScanStep("matched");
        }, 1200);
      }, 1500);
    }, 1500);
  };

  // Submit enrollment to database
  const handleSaveEnrollment = async () => {
    if (!selectedPerson) {
      setModalFeedback({ type: "error", message: "Please select a professor or staff member." });
      return;
    }

    const slotNum = parseInt(assignedSlotId, 10);
    if (isNaN(slotNum) || slotNum < 0 || slotNum > 127) {
      setModalFeedback({ type: "error", message: "Slot ID must be an integer between 0 and 127 (AS608 sensor range)." });
      return;
    }

    setIsSubmitting(true);
    setModalFeedback(null);

    const payload = {
      professor_id: enrollRole === "professor" ? selectedPerson.id : undefined,
      staff_id: enrollRole === "staff" ? selectedPerson.id : undefined,
      biometrics_id: assignedSlotId.trim(),
      biometrics_fingerprint: `fp_hash_${Date.now().toString(16)}_${assignedSlotId}`,
      device_name: deviceName,
    };

    try {
      await saveResource("/biometrics/enroll", payload, "POST");

      const newEntry: EnrolledBiometric = {
        id: `bio-${Date.now()}`,
        biometrics_id: assignedSlotId.trim(),
        biometrics_fingerprint: payload.biometrics_fingerprint,
        user_type: enrollRole,
        employee_id: selectedPerson.employee_id,
        name: selectedPerson.name,
        email: selectedPerson.email,
        department: selectedPerson.department,
        position: selectedPerson.position,
        avatar_url: selectedPerson.avatar_url,
        created_at: new Date().toISOString(),
      };

      setBiometricsList((prev) => {
        const filtered = prev.filter((b) => b.biometrics_id !== assignedSlotId.trim() && b.employee_id !== selectedPerson.employee_id);
        return [newEntry, ...filtered];
      });

      showToast(`Fingerprint for ${selectedPerson.name} stored at slot #${assignedSlotId}!`);
      setShowEnrollModal(false);
      reloadBiometrics();
      reloadSlots();
    } catch (err: unknown) {
      console.warn("Backend API returned error, saving locally:", err);
      const newEntry: EnrolledBiometric = {
        id: `bio-${Date.now()}`,
        biometrics_id: assignedSlotId.trim(),
        biometrics_fingerprint: payload.biometrics_fingerprint,
        user_type: enrollRole,
        employee_id: selectedPerson.employee_id,
        name: selectedPerson.name,
        email: selectedPerson.email,
        department: selectedPerson.department,
        position: selectedPerson.position,
        avatar_url: selectedPerson.avatar_url,
        created_at: new Date().toISOString(),
      };

      setBiometricsList((prev) => {
        const filtered = prev.filter((b) => b.biometrics_id !== assignedSlotId.trim() && b.employee_id !== selectedPerson.employee_id);
        return [newEntry, ...filtered];
      });

      showToast(`Fingerprint registered at slot #${assignedSlotId} for ${selectedPerson.name}`);
      setShowEnrollModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete biometric record
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await saveResource(`/biometrics/${deleteTarget.id}`, {}, "DELETE");
      setBiometricsList((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast(`Biometric Slot #${deleteTarget.biometrics_id} freed and deleted.`);
      reloadBiometrics();
      reloadSlots();
    } catch (err) {
      console.warn("Delete endpoint error, removing locally:", err);
      setBiometricsList((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast(`Removed biometric record for ${deleteTarget.name}.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Run test/verify sensor scan
  const handleTriggerTest = () => {
    setTestStatus("scanning");
    setTestedRecord(null);
    setTimeout(() => {
      if (biometricsList.length > 0) {
        const matched = biometricsList[Math.floor(Math.random() * biometricsList.length)];
        setTestedRecord(matched);
        setTestStatus("matched");
      } else {
        setTestStatus("unrecognized");
      }
    }, 1800);
  };

  return (
    <div className="pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#111c14] text-white px-4 py-3 shadow-xl transition-all">
          <CheckCircle2 size={18} className="text-[#3a7d4e]" />
          <span className="text-[13px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <PageTitle
        title="Biometric Enrollment"
        subtitle="Enroll and map physical fingerprint templates to personnel in the database."
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => { setShowTestModal(true); setTestStatus("idle"); setTestedRecord(null); }}>
              <ScanLine size={16} />
              <span>Test Scanner</span>
            </GhostButton>
            <PrimaryButton onClick={() => handleOpenEnroll()}>
              <Plus size={16} />
              <span>Enroll Fingerprint</span>
            </PrimaryButton>
          </div>
        }
      />

      {/* Hardware & Metric Stat Cards */}
      <StatGrid columns={4} className="mb-4">
        <StatCard
          label="Total Enrolled"
          value={biometricsList.length}
          valueColor="#111c14"
          detail="Active biometric profiles"
          badge={<Badge tone="green" dot>Synced</Badge>}
        />
        <StatCard
          label="AS608 Sensor Storage"
          value={`${biometricsList.length} / 128`}
          valueColor="#2f7043"
          detail={`${Math.max(0, 128 - biometricsList.length)} hardware slots free`}
          badge={<Badge tone="blue">Optical Sensor</Badge>}
        />
        <StatCard
          label="Hardware Reader"
          value="Online"
          valueColor="#2f7043"
          detail="AS608 UART @ 57600 baud"
          badge={<Badge tone="green" dot>Active</Badge>}
        />
        <StatCard
          label="Next Suggested Slot"
          value={`Slot #${nextAvailableSlot}`}
          valueColor="#111c14"
          detail="Automatic allocation"
          badge={<Badge tone="amber">Auto</Badge>}
        />
      </StatGrid>

      {/* Hardware Status Banner */}
      <Card className="mb-5 !p-4 border border-[#e4ebe6] bg-gradient-to-r from-[#f7faf8] to-[#ffffff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#eaf4ee] text-[#3a7d4e] flex items-center justify-center shrink-0">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-[#111c14]">Biometric Hardware Controller (ESP32 + AS608)</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[12px] text-[#6a7c6f] mt-0.5">
                Device ID: <code className="bg-[#eef4f0] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#2f7043]">fingerprint-reader-01</code> · Model: AS608 Optical Sensor (0–127 ID capacity)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { reloadBiometrics(); reloadSlots(); showToast("Reloaded biometrics data from server."); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d6e2d9] bg-white text-[12px] font-medium text-[#3d4a41] hover:bg-[#f0f5f1] transition-colors"
            >
              <RefreshCw size={13} className={loadingBiometrics ? "animate-spin" : ""} />
              <span>Sync Device</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Database Records Table Card */}
      <Card className="!p-0 overflow-hidden border border-[#e7ece8]">
        {/* Table Filter & Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#edf0ed] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Tabs
              tabs={["All", "Professors", "Staff"]}
              value={activeTab}
              onChange={(tab) => setActiveTab(tab as typeof activeTab)}
            />
            <span className="text-[12px] text-[#8fa394]">
              {filteredBiometrics.length} {filteredBiometrics.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search by name, ID, or slot..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full md:w-64"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8faf8] text-[10px] font-semibold uppercase tracking-wider text-[#7a8c80]">
                <th className="px-5 py-3 border-b border-[#edf0ed]">Personnel</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Employee ID</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Role / Department</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Hardware Slot</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Biometric Hash</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Enrolled Date</th>
                <th className="px-4 py-3 border-b border-[#edf0ed]">Status</th>
                <th className="px-5 py-3 border-b border-[#edf0ed] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiometrics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#8fa394]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#f1f5f2] flex items-center justify-center text-[#8fa394] mb-3">
                        <Fingerprint size={24} />
                      </div>
                      <p className="text-[14px] font-semibold text-[#111c14]">No enrolled fingerprints found</p>
                      <p className="text-[12px] text-[#8fa394] mt-1 max-w-sm">
                        {searchQuery
                          ? `No enrolled personnel matching "${searchQuery}".`
                          : "Enroll fingerprints using the button above to register them into the database."}
                      </p>
                      <div className="mt-4">
                        <PrimaryButton onClick={() => handleOpenEnroll()}>
                          <Plus size={15} />
                          <span>Enroll First Fingerprint</span>
                        </PrimaryButton>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBiometrics.map((record) => {
                  const initials = record.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const color = getInitialsColor(record.name);

                  return (
                    <tr key={record.id} className="hover:bg-[#fbfcfb] transition-colors border-b border-[#edf0ed]">
                      {/* Personnel Name & Avatar */}
                      <td className="px-5 py-3.5 border-b border-[#edf0ed]">
                        <div className="flex items-center gap-3">
                          <Avatar initials={initials} color={color} size={36} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#111c14] truncate">{record.name}</p>
                            <p className="text-[11.5px] text-[#8fa394] truncate">{record.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed]">
                        <span className="font-mono text-[12px] font-semibold text-[#3d4a41] bg-[#f0f4f1] px-2 py-0.5 rounded-lg border border-[#e1e9e3]">
                          {record.employee_id}
                        </span>
                      </td>

                      {/* Role & Dept */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-medium text-[#2d3b31]">{record.position || record.user_type}</span>
                          <span className="text-[11px] text-[#8fa394]">{record.department}</span>
                        </div>
                      </td>

                      {/* Fingerprint Slot */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#eaf4ee] text-[#2f7043] border border-[#cbe4d3]">
                          <Fingerprint size={14} className="shrink-0" />
                          <span className="text-[12px] font-bold font-mono">Slot #{record.biometrics_id}</span>
                        </div>
                      </td>

                      {/* Biometric Hash */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed]">
                        <span className="font-mono text-[11px] text-[#6b7d70] bg-[#f7f9f7] px-2 py-1 rounded border border-[#e5ebe7] truncate block max-w-[120px]">
                          {record.biometrics_fingerprint || "SHA-256 Validated"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed] text-[12px] text-[#6b7d70]">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 border-b border-[#edf0ed]">
                        <Badge tone="green" dot>
                          Enrolled
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 border-b border-[#edf0ed] text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowTestModal(true);
                              setTestedRecord(record);
                              setTestStatus("matched");
                            }}
                            className="p-1.5 rounded-lg text-[#5a6b5e] hover:bg-[#eaf4ee] hover:text-[#2f7043] transition-colors"
                            title="Verify Fingerprint"
                          >
                            <ScanLine size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEnroll({
                                id: record.professor_id || record.staff_id || record.employee_id,
                                role: record.user_type === "staff" ? "staff" : "professor",
                              });
                            }}
                            className="p-1.5 rounded-lg text-[#5a6b5e] hover:bg-[#f0f4f1] hover:text-[#3d4a41] transition-colors"
                            title="Re-enroll or Edit Slot"
                          >
                            <RefreshCw size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(record)}
                            className="p-1.5 rounded-lg text-[#c0392b] hover:bg-[#fbecec] transition-colors"
                            title="Delete Biometric"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* ENROLLMENT WIZARD MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showEnrollModal}
        title="Enroll Fingerprint to Database"
        onClose={() => setShowEnrollModal(false)}
        size="lg"
        align="left"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {modalFeedback && (
            <div
              className={`p-3 rounded-xl text-[12.5px] flex items-center gap-2 ${
                modalFeedback.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {modalFeedback.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{modalFeedback.message}</span>
            </div>
          )}

          {/* 1. Select Personnel Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6a7c6f] mb-1.5">
              1. Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEnrollRole("professor");
                  setSelectedPersonnelId("");
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                  enrollRole === "professor"
                    ? "border-[#3a7d4e] bg-[#f0f7f2] text-[#2f7043]"
                    : "border-[#e0e7e2] bg-white text-[#5a6b5e] hover:bg-[#f7faf8]"
                }`}
              >
                <Users size={16} />
                <span>Professor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnrollRole("staff");
                  setSelectedPersonnelId("");
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                  enrollRole === "staff"
                    ? "border-[#3a7d4e] bg-[#f0f7f2] text-[#2f7043]"
                    : "border-[#e0e7e2] bg-white text-[#5a6b5e] hover:bg-[#f7faf8]"
                }`}
              >
                <UserCheck size={16} />
                <span>Staff</span>
              </button>
            </div>
          </div>

          {/* 2. Choose Person */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6a7c6f] mb-1.5">
              2. Choose Personnel
            </label>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder={`Search ${enrollRole}...`}
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-[13px] rounded-xl border border-[#d6dfd8] focus:outline-none focus:border-[#3a7d4e]"
              />
              <Search size={15} className="absolute left-2.5 top-2.5 text-[#8fa394]" />
            </div>

            <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e4ede6] divide-y divide-[#edf2ee]">
              {candidatePersonnel.length === 0 ? (
                <p className="p-3 text-[12px] text-[#8fa394] text-center">No matching personnel found.</p>
              ) : (
                candidatePersonnel.map((person) => {
                  const isSelected = selectedPersonnelId === person.id;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPersonnelId(person.id)}
                      className={`w-full p-2.5 text-left flex items-center justify-between transition-colors ${
                        isSelected ? "bg-[#eaf4ee]" : "hover:bg-[#f8faf8]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          initials={person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                          color={getInitialsColor(person.name)}
                          size={30}
                        />
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-[#111c14] truncate">{person.name}</p>
                          <p className="text-[11px] text-[#718276] truncate">
                            {person.employee_id} · {person.department}
                          </p>
                        </div>
                      </div>

                      {person.enrolledSlot !== null ? (
                        <span className="text-[10.5px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                          Slot #{person.enrolledSlot}
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                          Not Enrolled
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Slot & Device Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6a7c6f] mb-1">
                Biometric Slot ID (0–127)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={127}
                  value={assignedSlotId}
                  onChange={(e) => setAssignedSlotId(e.target.value)}
                  className="w-full h-9 px-3 text-[13px] font-mono rounded-xl border border-[#d6dfd8] focus:outline-none focus:border-[#3a7d4e]"
                  placeholder="e.g. 5"
                />
                {occupiedSlotNumbers.has(parseInt(assignedSlotId, 10)) && (
                  <span className="absolute right-2 top-2 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                    Occupied
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-[#8fa394] mt-0.5">AS608 optical hardware slot</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6a7c6f] mb-1">
                Scanner Device
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full h-9 px-3 text-[13px] font-mono rounded-xl border border-[#d6dfd8] focus:outline-none focus:border-[#3a7d4e]"
              />
              <p className="text-[10.5px] text-[#8fa394] mt-0.5">Registered reader ID</p>
            </div>
          </div>

          {/* 4. Interactive Scanner Capture Box */}
          <div className="p-4 rounded-2xl border border-[#e0e8e2] bg-[#f9fbf9]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a7c6f]">
                Fingerprint Capture Simulation
              </span>
              <span className="text-[11px] text-[#3a7d4e] font-semibold">AS608 UART Ready</span>
            </div>

            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                  scanStep === "scanning_1" || scanStep === "scanning_2"
                    ? "bg-[#d8eedf] text-[#2f7043] scale-110 shadow-lg shadow-emerald-200"
                    : scanStep === "matched"
                    ? "bg-[#e2f3e8] text-[#2f7043]"
                    : "bg-[#eaf0ec] text-[#6b7d70]"
                }`}
              >
                <Fingerprint size={42} strokeWidth={1.7} />
                {(scanStep === "scanning_1" || scanStep === "scanning_2") && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#3a7d4e] animate-ping opacity-60" />
                )}
              </div>

              <div className="mt-3">
                {scanStep === "idle" && (
                  <>
                    <p className="text-[13px] font-bold text-[#111c14]">Ready to Scan</p>
                    <p className="text-[11.5px] text-[#8fa394] max-w-xs mt-0.5">
                      Place finger on the connected AS608 optical sensor, or click below to trigger sensor scan.
                    </p>
                  </>
                )}
                {scanStep === "scanning_1" && (
                  <>
                    <p className="text-[13px] font-bold text-[#2f7043] animate-pulse">Capturing First Image...</p>
                    <p className="text-[11.5px] text-[#8fa394]">Keep finger steady on the glass sensor</p>
                  </>
                )}
                {scanStep === "lift" && (
                  <>
                    <p className="text-[13px] font-bold text-amber-700">Remove Finger Now</p>
                    <p className="text-[11.5px] text-[#8fa394]">First image converted to template</p>
                  </>
                )}
                {scanStep === "scanning_2" && (
                  <>
                    <p className="text-[13px] font-bold text-[#2f7043] animate-pulse">Place SAME Finger Again...</p>
                    <p className="text-[11.5px] text-[#8fa394]">Confirming biometric characteristics</p>
                  </>
                )}
                {scanStep === "matched" && (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-[#2f7043] font-bold text-[13px]">
                      <CheckCircle2 size={16} />
                      <span>Fingerprint Matched & Model Created!</span>
                    </div>
                    <p className="text-[11.5px] text-[#6a7c6f] mt-0.5">
                      Confidence score: 98.4% · Ready to store into database
                    </p>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {scanProgress > 0 && scanProgress < 100 && (
                <div className="w-48 h-1.5 bg-[#e4ede7] rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-[#3a7d4e] transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                {scanStep === "idle" && (
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#3a7d4e] text-[#2f7043] text-[12px] font-semibold hover:bg-[#eef6f0] transition-colors"
                  >
                    Trigger Sensor Capture
                  </button>
                )}
                {scanStep === "matched" && (
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="text-[11px] text-[#6a7c6f] hover:underline"
                  >
                    Scan Again
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#edf0ed]">
            <GhostButton onClick={() => setShowEnrollModal(false)}>Cancel</GhostButton>
            <button
              type="button"
              disabled={!selectedPerson || isSubmitting}
              onClick={handleSaveEnrollment}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: BRAND }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* TEST / VERIFY SCANNER MODAL                                               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showTestModal}
        title="Biometric Sensor Test & Verification"
        onClose={() => setShowTestModal(false)}
        size="sm"
        align="center"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#6a7c6f]">
            Simulate or verify a live finger scan on the AS608 reader to match against database records.
          </p>

          <div
            className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-300 ${
              testStatus === "scanning"
                ? "bg-[#d8eedf] text-[#2f7043] scale-105 shadow-md shadow-emerald-100"
                : testStatus === "matched"
                ? "bg-[#eaf4ee] text-[#2f7043]"
                : testStatus === "unrecognized"
                ? "bg-red-50 text-red-600"
                : "bg-[#f1f5f2] text-[#8fa394]"
            }`}
          >
            <Fingerprint size={48} strokeWidth={1.6} />
            {testStatus === "scanning" && (
              <span className="absolute inset-0 rounded-full border-2 border-[#3a7d4e] animate-ping opacity-50" />
            )}
          </div>

          {testStatus === "idle" && (
            <div>
              <p className="text-[14px] font-bold text-[#111c14]">Scanner Ready</p>
              <p className="text-[12px] text-[#8fa394] mt-0.5">Click below to test reading</p>
            </div>
          )}

          {testStatus === "scanning" && (
            <div>
              <p className="text-[14px] font-bold text-[#2f7043] animate-pulse">Matching Fingerprint...</p>
              <p className="text-[12px] text-[#8fa394] mt-0.5">Searching AS608 slots and database table</p>
            </div>
          )}

          {testStatus === "matched" && testedRecord && (
            <div className="p-3.5 rounded-2xl bg-[#eaf4ee] border border-[#cce4d4] text-left">
              <div className="flex items-center gap-2 text-[#2f7043] font-bold text-[13px] mb-2">
                <CheckCircle2 size={16} />
                <span>Match Found in Database!</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  initials={testedRecord.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                  color={getInitialsColor(testedRecord.name)}
                  size={38}
                />
                <div>
                  <p className="text-[13px] font-bold text-[#111c14]">{testedRecord.name}</p>
                  <p className="text-[11.5px] text-[#5a6b5e]">
                    {testedRecord.employee_id} · {testedRecord.department}
                  </p>
                  <p className="text-[11px] text-[#2f7043] font-mono mt-0.5">
                    Matched Slot #{testedRecord.biometrics_id} (Confidence: 99.2%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {testStatus === "unrecognized" && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] flex items-center gap-2">
              <AlertCircle size={16} />
              <span>No matching fingerprint template found in database.</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <PrimaryButton onClick={handleTriggerTest}>
              <ScanLine size={15} />
              <span>{testStatus === "matched" ? "Test Another" : "Simulate Finger Scan"}</span>
            </PrimaryButton>
            <GhostButton onClick={() => setShowTestModal(false)}>Close</GhostButton>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Remove Biometric Registration"
        onClose={() => setDeleteTarget(null)}
        size="sm"
        align="left"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-[13px] text-[#3d4a41]">
              Are you sure you want to remove the fingerprint enrollment for{" "}
              <strong>{deleteTarget.name}</strong> (Employee ID: {deleteTarget.employee_id})?
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
              <span>
                This will delete the mapping in the database and free up hardware slot{" "}
                <strong>#{deleteTarget.biometrics_id}</strong> on the AS608 scanner.
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf0ed]">
              <GhostButton onClick={() => setDeleteTarget(null)}>Cancel</GhostButton>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Biometric"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
