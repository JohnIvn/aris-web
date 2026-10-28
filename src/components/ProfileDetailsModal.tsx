import { useState, useEffect, useRef } from "react";
import { isPasswordValid } from "@/components/PasswordField";

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
  password?: string;
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
  canEditDepartment?: boolean;
  canEditRoleOrRank?: boolean;
  canEditStatus?: boolean;
  onSave?: (updatedData: ProfileModalData) => Promise<void>;
};

/* Shared field styles. min-w-0 + truncate keep long values inside the box. */
const FIELD = "h-11 w-full min-w-0 rounded-xl border px-3 text-[13px] outline-none transition-colors truncate";
const FIELD_VIEW = `${FIELD} border-[#e2e8e4] bg-[#fbfcfb] text-[#334237]`;
const FIELD_EDIT = `${FIELD} border-[#d6ded8] bg-white text-[#17251c] focus:border-[#2d4a36] shadow-sm`;
const LABEL = "mb-1 block pl-0.5 text-[12px] font-medium text-[#536258]";

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
  canEditDepartment = true,
  canEditRoleOrRank = true,
  canEditStatus = true,
  onSave,
}: ProfileDetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(initialMode === "edit");
  const [showPassword, setShowPassword] = useState(false);
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
    password: "",
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
        password: "",
      });
      setShowPassword(false);
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

  // FIX 2: with the X gone, Esc is another way to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, saving, onClose]);

  if (!isOpen || !data) return null;

  const fullName = [formData.firstname, formData.middlename, formData.lastname]
    .filter(Boolean)
    .join(" ") || "Unnamed";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    if (formData.password && !isPasswordValid(formData.password)) {
      setSaveError("Password needs 8–15 characters with a capital letter, a number, and a symbol.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(formData);
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: "" }));
      setShowPassword(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = isEditing ? FIELD_EDIT : FIELD_VIEW;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      {/* FIX 5: the shell is a flex column that clips (overflow-hidden) so nothing
          can poke through the rounded border. Header and footer stay put and
          only the middle body scrolls. */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header (fixed). FIX 2: X close button removed. */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-6 py-4 sm:px-8 sm:py-5" style={{ borderColor: "#f0f2f0" }}>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-[#111c14]">
              {isEditing ? `Edit ${heading.replace(/ ID$/i, "")}` : heading}
            </h2>
            <p className="text-[12px] text-[#718076]">
              {isEditing ? "Modify account fields and details below." : "Account and profile information."}
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrolling body */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-5 sm:px-8">
            {/* Name Banner */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e8ece9] bg-[#f8faf9] p-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#536258]">Profile Name</p>
                <p className="break-words text-[18px] font-semibold leading-tight text-[#17251c]">{fullName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
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

            {saveError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
                {saveError}
              </div>
            )}

            {/* [&>*]:min-w-0 lets grid children shrink so long text can't widen the modal */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3 [&>*]:min-w-0">
                <div>
                  <label className={LABEL}>First Name {isEditing && <span className="text-red-500">*</span>}</label>
                  <input
                    required={isEditing}
                    readOnly={!isEditing}
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={LABEL}>Middle Name</label>
                  <input
                    readOnly={!isEditing}
                    placeholder={isEditing ? "Optional" : "Not provided"}
                    value={isEditing ? (formData.middlename || "") : (formData.middlename || "Not provided")}
                    onChange={(e) => setFormData({ ...formData, middlename: e.target.value })}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={LABEL}>Last Name {isEditing && <span className="text-red-500">*</span>}</label>
                  <input
                    required={isEditing}
                    readOnly={!isEditing}
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <label className={LABEL}>Email Address {isEditing && <span className="text-red-500">*</span>}</label>
                  <input
                    type="email"
                    required={isEditing}
                    readOnly={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={fieldClass}
                  />
                </div>

                {/* FIX 3: selects are w-full min-w-0 inside a min-w-0 grid cell, so the
                    control (and its long option text) stays inside the modal. */}
                <div>
                  <label className={LABEL}>Department</label>
                  {isEditing && canEditDepartment && departmentOptions.length > 0 ? (
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className={FIELD_EDIT}
                    >
                      <option value="">Unassigned</option>
                      {departmentOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input readOnly value={formData.department || "Unassigned"} className={FIELD_VIEW} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <label className={LABEL}>{roleOrRankLabel}</label>
                  {isEditing && canEditRoleOrRank && roleOrRankOptions.length > 0 ? (
                    <select
                      value={formData.roleOrRank}
                      onChange={(e) => setFormData({ ...formData, roleOrRank: e.target.value })}
                      className={FIELD_EDIT}
                    >
                      {roleOrRankOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input readOnly value={formData.roleOrRank || "None"} className={FIELD_VIEW} />
                  )}
                </div>

                <div>
                  <label className={LABEL}>Status</label>
                  {isEditing && canEditStatus && statusOptions.length > 0 ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={FIELD_EDIT}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input readOnly value={formData.status || "Active"} className={FIELD_VIEW} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <label className={LABEL}>OAuth Account</label>
                  <div className="flex h-11 items-center rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] px-3 text-[13px] text-[#334237]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${formData.oauthConnected ? "bg-emerald-500" : "bg-gray-400"}`} />
                      <span className="truncate">{formData.oauthConnected ? "Connected via Google" : "Not connected"}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Phone</label>
                  <input
                    readOnly={!isEditing}
                    type="tel"
                    placeholder={isEditing ? "e.g. +63 912 345 6789" : "Not provided"}
                    value={isEditing ? (formData.phone || "") : (formData.phone || "Not provided")}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Address</label>
                <input
                  readOnly={!isEditing}
                  type="text"
                  placeholder={isEditing ? "e.g. 123 University Ave, Manila" : "Not provided"}
                  value={isEditing ? (formData.address || "") : (formData.address || "Not provided")}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="profile-password" className={LABEL}>
                  Password {isEditing && <span className="text-[11px] text-[#718076] font-normal">(leave blank to keep existing)</span>}
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <input
                        id="profile-password"
                        type={showPassword ? "text" : "password"}
                        maxLength={15}
                        autoComplete="new-password"
                        placeholder="Leave blank to keep current password"
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`${FIELD_EDIT} pr-14 ${
                          formData.password && !isPasswordValid(formData.password)
                            ? "border-red-300 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#718076] hover:text-[#2d4a36] transition-colors"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p
                      className={`mt-1 pl-0.5 text-[11.5px] ${
                        formData.password && !isPasswordValid(formData.password)
                          ? "text-red-600"
                          : "text-[#718076]"
                      }`}
                    >
                      {formData.password
                        ? isPasswordValid(formData.password)
                          ? "Password meets requirements."
                          : "Must be 8–15 characters with a capital letter, a number, and a symbol."
                        : "Leave blank to keep current password, or enter 8–15 characters with a capital letter, a number, and a symbol."}
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      id="profile-password"
                      type="password"
                      disabled
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${FIELD_VIEW} cursor-not-allowed placeholder:text-[#8fa394]`}
                    />
                    <p className="mt-1 pl-0.5 text-[11.5px] text-[#8fa394]">
                      {formData.oauthConnected
                        ? "Account connected via Google. You can set a password in edit mode to allow password sign-in."
                        : "Password is set. Click Edit Profile to change it."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer (fixed) */}
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t px-6 py-4 sm:px-8" style={{ borderColor: "#f0f2f0" }}>
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
                      setFormData((prev) => ({ ...prev, password: "" }));
                      setShowPassword(false);
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