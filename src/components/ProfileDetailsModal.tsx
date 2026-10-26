import { useState, useEffect, useRef } from "react";

export type ProfileModalData = {
  id?: string;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  email: string;
  department?: string;
  roleOrRank?: string;
  status?: string;
  phone?: string;
  address?: string;
  oauthConnected?: boolean;
};

export type ProfileDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  initialMode?: "view" | "edit";
  data: ProfileModalData | null;
  departmentOptions?: string[];
  roleOrRankOptions?: string[];
  roleOrRankLabel?: string;
  statusOptions?: { label: string; value: string }[];
  onSave?: (updatedData: ProfileModalData) => Promise<void>;
};

export default function ProfileDetailsModal({
  isOpen,
  onClose,
  heading,
  initialMode = "view",
  data,
  departmentOptions = [],
  roleOrRankOptions = [],
  roleOrRankLabel = "Role",
  statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Deactivated", value: "Deactivated" },
  ],
  onSave,
}: ProfileDetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(initialMode === "edit");
  const [formData, setFormData] = useState<ProfileModalData>({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    department: "",
    roleOrRank: "",
    status: "Active",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when data or open state changes
  useEffect(() => {
    if (isOpen && data) {
      setIsEditing(initialMode === "edit");
      setFormData({
        id: data.id,
        firstname: data.firstname || "",
        middlename: data.middlename || "",
        lastname: data.lastname || "",
        email: data.email || "",
        department: data.department || "",
        roleOrRank: data.roleOrRank || "",
        status: data.status || "Active",
        phone: data.phone === "Not provided" ? "" : (data.phone || ""),
        address: data.address === "Not provided" ? "" : (data.address || ""),
        oauthConnected: data.oauthConnected ?? false,
      });
      setSaveError(null);
    }
  }, [isOpen, data, initialMode]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const main = overlayRef.current?.closest("main");
    if (!main) return;

    const previousOverflow = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const fullName = [formData.firstname, formData.middlename, formData.lastname]
    .filter(Boolean)
    .join(" ") || "Unnamed";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[620px] overflow-y-auto overscroll-contain rounded-[24px] bg-white p-6 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b pb-4" style={{ borderColor: "#f0f2f0" }}>
          <div>
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-[#111c14]">
              {isEditing ? `Edit ${heading.replace(/ ID$/i, "")}` : heading}
            </h2>
            <p className="text-[12px] text-[#718076]">
              {isEditing ? "Modify account fields and details below." : "Account and profile information."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && onSave && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#d6ded8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2d4a36] hover:bg-[#f4f6f5] transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              aria-label="Close profile details"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#718076] hover:bg-[#f4f6f5]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Name Banner */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f8faf9] p-4 border border-[#e8ece9]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#536258]">Profile Name</p>
            <p className="text-[18px] font-semibold leading-tight text-[#17251c]">{fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#fbf1de] px-3 py-1 text-[11px] font-semibold uppercase text-[#996515]">
              {formData.roleOrRank || "Member"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                formData.status === "Active"
                  ? "bg-[#eaf5ed] text-[#2d6a4f]"
                  : "bg-[#f3f4f6] text-[#6b7280]"
              }`}
            >
              {formData.status}
            </span>
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-[12px] text-red-700 border border-red-200">
            {saveError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">
                First Name {isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                required={isEditing}
                readOnly={!isEditing}
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                  isEditing
                    ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                    : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
                }`}
              />
            </div>
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">Middle Name</label>
              <input
                readOnly={!isEditing}
                placeholder={isEditing ? "Optional" : "Not provided"}
                value={isEditing ? (formData.middlename || "") : (formData.middlename || "Not provided")}
                onChange={(e) => setFormData({ ...formData, middlename: e.target.value })}
                className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                  isEditing
                    ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                    : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
                }`}
              />
            </div>
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">
                Last Name {isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                required={isEditing}
                readOnly={!isEditing}
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                  isEditing
                    ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                    : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">
                Email Address {isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                required={isEditing}
                readOnly={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                  isEditing
                    ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                    : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
                }`}
              />
            </div>

            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">Department</label>
              {isEditing && departmentOptions.length > 0 ? (
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-[13px] text-[#17251c] outline-none focus:border-[#2d4a36] shadow-sm"
                >
                  <option value="">Unassigned</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={formData.department || "Unassigned"}
                  className="h-11 w-full rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] px-3 text-[13px] text-[#334237] outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">{roleOrRankLabel}</label>
              {isEditing && roleOrRankOptions.length > 0 ? (
                <select
                  value={formData.roleOrRank}
                  onChange={(e) => setFormData({ ...formData, roleOrRank: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-[13px] text-[#17251c] outline-none focus:border-[#2d4a36] shadow-sm"
                >
                  {roleOrRankOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={formData.roleOrRank || "None"}
                  className="h-11 w-full rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] px-3 text-[13px] text-[#334237] outline-none"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">Status</label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-[13px] text-[#17251c] outline-none focus:border-[#2d4a36] shadow-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={formData.status || "Active"}
                  className="h-11 w-full rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] px-3 text-[13px] text-[#334237] outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">OAuth Account</label>
              <div className="flex h-11 items-center rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] px-3 text-[13px] text-[#334237]">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      formData.oauthConnected ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {formData.oauthConnected ? "Connected via Google" : "Not connected"}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">Phone</label>
              <input
                readOnly={!isEditing}
                type="tel"
                placeholder={isEditing ? "e.g. +63 912 345 6789" : "Not provided"}
                value={isEditing ? (formData.phone || "") : (formData.phone || "Not provided")}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                  isEditing
                    ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                    : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]">Address</label>
            <input
              readOnly={!isEditing}
              type="text"
              placeholder={isEditing ? "e.g. 123 University Ave, Manila" : "Not provided"}
              value={isEditing ? (formData.address || "") : (formData.address || "Not provided")}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`h-11 w-full rounded-xl border px-3 text-[13px] outline-none transition-colors ${
                isEditing
                  ? "border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm"
                  : "border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]"
              }`}
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5 border-t pt-4" style={{ borderColor: "#f0f2f0" }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (initialMode === "edit") {
                      onClose();
                    } else {
                      setIsEditing(false);
                      setSaveError(null);
                    }
                  }}
                  className="rounded-xl border border-[#d6ded8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#536258] hover:bg-[#f4f6f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#2d4a36] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#233b2b] transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                {onSave && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#2d4a36] bg-[#2d4a36] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#233b2b] transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#d6ded8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#536258] hover:bg-[#f4f6f5] transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
