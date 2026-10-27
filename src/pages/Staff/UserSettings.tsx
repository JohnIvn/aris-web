import { useRef, useState } from "react";
import { BRAND } from "@/config/navigation";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import getBaseUrl from "@/utils/GetBaseUrl";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  Toggle,
  Badge,
  Modal,
} from "@/components/ui";

function Field({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p
        className="text-[12.5px] font-medium mb-1.5"
        style={{ color: "#3d4a41" }}
      >
        {label}
      </p>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f7f9f8] disabled:text-[#738176]"
        style={{ borderColor: "#e2e8e4", color: "#111c14" }}
      />
    </div>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-t first:border-t-0"
      style={{ borderColor: "#f2f4f2" }}
    >
      <div className="pr-6">
        <p className="text-[13.5px] font-medium" style={{ color: "#111c14" }}>
          {title}
        </p>
        <p className="text-[12.5px] mt-0.5" style={{ color: "#8fa394" }}>
          {desc}
        </p>
      </div>
      {children}
    </div>
  );
}

const defaultPreferences = { desktop: true, weekly: true, mentions: false };

export default function UserSettings() {
  const { user } = useAuth();
  const defaultProfile = {
    firstName: user.name.split(" ")[0] ?? "",
    lastName: user.name.split(" ").slice(1).join(" "),
    email: user.email,
    phone: "",
    avatar_url: "",
  };

  const { data: storedProfile, setData: setProfile } = useResource(
    "/users/me/profile",
    defaultProfile
  );
  const apiProfile = storedProfile as typeof defaultProfile & {
    firstname?: string;
    lastname?: string;
    department?: string | null;
    position?: string | null;
    created_at?: string | null;
  };

  const profile = {
    ...defaultProfile,
    ...(Array.isArray(apiProfile) ? {} : apiProfile),
    firstName: Array.isArray(apiProfile)
      ? defaultProfile.firstName
      : apiProfile.firstName ?? apiProfile.firstname ?? defaultProfile.firstName,
    lastName: Array.isArray(apiProfile)
      ? defaultProfile.lastName
      : apiProfile.lastName ?? apiProfile.lastname ?? defaultProfile.lastName,
  };

  const { data: prefs, setData: setPrefs } = useResource(
    "/users/me/preferences",
    defaultPreferences
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  // Snapshot taken when editing starts, used to restore values on "Discard Changes"
  const snapshot = useRef<{ profile: typeof profile; prefs: typeof prefs } | null>(null);

  const set = (k: keyof typeof prefs) => {
    if (!editing) return;
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  };

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setProfileMessage(null);
  };

  const startEditing = () => {
    snapshot.current = { profile: { ...profile }, prefs: { ...prefs } };
    setSaveError(null);
    setProfileMessage(null);
    setEditing(true);
  };

  const discardChanges = () => {
    if (snapshot.current) {
      setProfile(() => snapshot.current!.profile);
      setPrefs(() => snapshot.current!.prefs);
    }
    setNewPassword("");
    setConfirmPassword("");
    setProfileMessage(null);
    setSaveError(null);
    setShowDiscard(false);
    setEditing(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveResource("/users/me/profile", profile, "PATCH");
      await saveResource("/users/me/preferences", prefs, "PATCH");
      if (newPassword || confirmPassword) {
        await saveResource(
          "/users/me/password",
          { password: newPassword, confirmPassword },
          "POST"
        );
      }
      setNewPassword("");
      setConfirmPassword("");
      setShowConfirm(false);
      setEditing(false);
      setShowSaved(true);
    } catch (reason) {
      setSaveError(
        reason instanceof Error ? reason.message : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    try {
      const response = await saveResource<{ avatar_url: string }>(
        "/users/me/photo",
        form,
        "POST"
      );
      setProfile((current) => ({ ...current, avatar_url: response.avatar_url }));
    } catch (reason) {
      setProfileMessage(
        reason instanceof Error ? reason.message : "Unable to update photo."
      );
    }
  };

  const memberSince = apiProfile.created_at
    ? new Date(apiProfile.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "Academic Year 2026";

  return (
    <div className="pb-4">
      <PageTitle
        title="User Settings"
        subtitle="Manage your profile credentials and staff notification preferences."
        action={
          editing ? (
            <div className="flex items-center gap-2">
              <GhostButton onClick={() => setShowDiscard(true)}>
                Discard Changes
              </GhostButton>
              <PrimaryButton
                onClick={() => {
                  setSaveError(null);
                  setShowConfirm(true);
                }}
              >
                Save Changes
              </PrimaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={startEditing}>
              Edit Information
            </PrimaryButton>
          )
        }
      />

      {/* Confirm save */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Changes"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#fbf1de] text-[#996515]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowConfirm(false)}>
              No, Cancel
            </GhostButton>
            <PrimaryButton onClick={() => void saveChanges()}>
              {saving ? "Saving..." : "Yes, Save"}
            </PrimaryButton>
          </>
        }
      >
        {saveError ?? "Are you sure you want to save these profile changes?"}
      </Modal>

      {/* Confirm discard */}
      <Modal
        isOpen={showDiscard}
        onClose={() => setShowDiscard(false)}
        title="Discard Changes"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#fbecec] text-[#c0392b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowDiscard(false)}>
              Keep Editing
            </GhostButton>
            <PrimaryButton onClick={discardChanges}>
              Yes, Discard
            </PrimaryButton>
          </>
        }
      >
        Your unsaved changes will be lost. Do you want to discard them?
      </Modal>

      {/* Saved */}
      <Modal
        isOpen={showSaved}
        onClose={() => setShowSaved(false)}
        title="Success"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowSaved(false)}>OK</PrimaryButton>
        }
      >
        Your user settings have been updated successfully.
      </Modal>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Profile summary card */}
        <Card className="flex flex-col items-center text-center overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={`${getBaseUrl()}${profile.avatar_url}`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[26px] font-semibold"
              style={{ background: BRAND }}
            >
              {`${profile.firstName} ${profile.lastName}`
                .trim()
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <p
            className="text-[16px] font-semibold mt-3"
            style={{ color: "#111c14" }}
          >
            {`${profile.firstName} ${profile.lastName}`.trim() || user.name}
          </p>
          <p className="text-[13px]" style={{ color: "#8fa394" }}>
            {profile.email}
          </p>
          <div className="mt-2">
            <Badge tone="green" dot>
              {apiProfile.position || "Staff Member"}
            </Badge>
          </div>
          <div className="mt-4">
            <GhostButton onClick={() => photoInput.current?.click()}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M4 16l4.5-4.5a2 2 0 013 0L16 15M14 13l1.5-1.5a2 2 0 013 0L21 14M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Change photo
            </GhostButton>
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPhoto(file);
                event.target.value = "";
              }}
            />
          </div>
          <div
            className="w-full mt-auto pt-5 border-t space-y-2.5 text-left"
            style={{ borderColor: "#eef1ef" }}
          >
            {[
              ["Role", "Academic Affairs Staff"],
              ["Department", apiProfile.department || "Academic Affairs"],
              ["Member since", memberSince],
              ["Account Email", user.email],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[13px]">
                <span style={{ color: "#8fa394" }}>{l}</span>
                <span
                  className="font-medium truncate max-w-[180px]"
                  style={{ color: "#111c14" }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column: Edit fields & Settings */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card>
            <div className="mb-4">
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#111c14" }}
              >
                Profile Details
              </p>
            </div>
            {profileMessage && (
              <p
                role="status"
                className="mb-3 text-[12px]"
                style={{ color: "#c0392b" }}
              >
                {profileMessage}
              </p>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="First name"
                value={profile.firstName}
                disabled={!editing}
                onChange={(value) => updateProfile("firstName", value)}
              />
              <Field
                label="Last name"
                value={profile.lastName}
                disabled={!editing}
                onChange={(value) => updateProfile("lastName", value)}
              />
              <Field
                label="Email"
                value={profile.email}
                disabled={!editing}
                onChange={(value) => updateProfile("email", value)}
              />
              <Field
                label="Phone"
                value={profile.phone}
                disabled={!editing}
                onChange={(value) => updateProfile("phone", value)}
              />
            </div>
          </Card>

          <Card>
            <p
              className="text-[15px] font-semibold mb-3"
              style={{ color: "#111c14" }}
            >
              Security & Password
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p
                  className="text-[12.5px] font-medium mb-1.5"
                  style={{ color: "#3d4a41" }}
                >
                  New password
                </p>
                <input
                  type="password"
                  value={newPassword}
                  disabled={!editing}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f7f9f8] disabled:text-[#738176]"
                  style={{ borderColor: "#e2e8e4" }}
                />
              </div>
              <div>
                <p
                  className="text-[12.5px] font-medium mb-1.5"
                  style={{ color: "#3d4a41" }}
                >
                  Confirm password
                </p>
                <input
                  type="password"
                  value={confirmPassword}
                  disabled={!editing}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f7f9f8] disabled:text-[#738176]"
                  style={{ borderColor: "#e2e8e4" }}
                />
              </div>
            </div>
          </Card>

          <Card className="flex-1 min-h-0">
            <p
              className="text-[15px] font-semibold mb-1"
              style={{ color: "#111c14" }}
            >
              Notifications & Digest
            </p>
            <Row
              title="Desktop notifications"
              desc="Show alerts in the browser when submissions arrive."
            >
              <Toggle on={prefs.desktop} onChange={() => set("desktop")} />
            </Row>
            <Row
              title="Weekly digest"
              desc="A Monday summary of campus submission activity."
            >
              <Toggle on={prefs.weekly} onChange={() => set("weekly")} />
            </Row>
            <Row
              title="Mentions only"
              desc="Only notify when directly assigned or mentioned."
            >
              <Toggle on={prefs.mentions} onChange={() => set("mentions")} />
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
