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

function Field({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
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
        className="w-full h-10 px-3.5 rounded-lg bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f7f9f8] disabled:text-[#738176]"
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
  const defaultProfile = { firstName: user.name.split(" ")[0] ?? "", lastName: user.name.split(" ").slice(1).join(" "), email: user.email, phone: "", avatar_url: "" };
  const { data: storedProfile, setData: setProfile } = useResource("/users/me/profile", defaultProfile);
  const apiProfile = storedProfile as typeof defaultProfile & { firstname?: string; lastname?: string };
  const profile = {
    ...defaultProfile,
    ...(Array.isArray(apiProfile) ? {} : apiProfile),
    firstName: Array.isArray(apiProfile) ? defaultProfile.firstName : apiProfile.firstName ?? apiProfile.firstname ?? defaultProfile.firstName,
    lastName: Array.isArray(apiProfile) ? defaultProfile.lastName : apiProfile.lastName ?? apiProfile.lastname ?? defaultProfile.lastName,
  };
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const { data: prefs, setData: setPrefs } = useResource("/users/me/preferences", defaultPreferences);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setProfileMessage(null);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      await saveResource("/users/me/profile", profile, "PATCH");
      setEditingProfile(false);
      setProfileMessage("Information saved.");
    } catch (reason) {
      setProfileMessage(reason instanceof Error ? reason.message : "Unable to save profile information.");
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    setPasswordMessage(null);
    try {
      await saveResource("/users/me/password", { password: newPassword, confirmPassword }, "POST");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch (reason) {
      setPasswordMessage(reason instanceof Error ? reason.message : "Unable to update password.");
    }
  };

  const uploadPhoto = async (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    try {
      const response = await saveResource<{ avatar_url: string }>("/users/me/photo", form, "POST");
      setProfile((current) => ({ ...current, avatar_url: response.avatar_url }));
    } catch (reason) {
      setProfileMessage(reason instanceof Error ? reason.message : "Unable to update photo.");
    }
  };

  const savePreferences = async () => {
    try {
      await saveResource("/users/me/preferences", prefs, "PATCH");
      setShowConfirm(false);
      setShowSaved(true);
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to save preferences.");
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title="User Settings"
        subtitle="Manage your profile and preferences."
        action={
          <PrimaryButton onClick={() => setShowConfirm(true)}>
            Save Changes
          </PrimaryButton>
        }
      />
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
            <PrimaryButton onClick={savePreferences}>
              Yes, Save
            </PrimaryButton>
          </>
        }
      >
        {saveError ?? "Are you sure you want to save these changes?"}
      </Modal>

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
        Your changes have been saved successfully.
      </Modal>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Profile summary */}
        <Card className="flex flex-col items-center text-center overflow-hidden">
          {profile.avatar_url ? (
            <img src={`${getBaseUrl()}${profile.avatar_url}`} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          ) : <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[26px] font-semibold"
            style={{ background: BRAND }}
          >
            {`${profile.firstName} ${profile.lastName}`.trim().slice(0, 2).toUpperCase()}
          </div>}
          <p
            className="text-[16px] font-semibold mt-3"
            style={{ color: "#111c14" }}
          >
            {`${profile.firstName} ${profile.lastName}`.trim()}
          </p>
          <p className="text-[13px]" style={{ color: "#8fa394" }}>
            {profile.email}
          </p>
          <div className="mt-2">
            <Badge tone="green" dot>
              Administrator
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
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadPhoto(file);
              event.target.value = "";
            }} />
          </div>
          <div
            className="w-full mt-auto pt-5 border-t space-y-2.5 text-left"
            style={{ borderColor: "#eef1ef" }}
          >
            {[
              ["Member since", "Aug 2021"],
              ["Last sign-in", "Today, 8:12 AM"],
              ["Department", "IT Administration"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[13px]">
                <span style={{ color: "#8fa394" }}>{l}</span>
                <span className="font-medium" style={{ color: "#111c14" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Profile</p>
              <PrimaryButton onClick={() => editingProfile ? void saveProfile() : setEditingProfile(true)}>
                {profileSaving ? "Saving..." : editingProfile ? "Save information" : "Edit information"}
              </PrimaryButton>
            </div>
            {profileMessage && <p role="status" className="mb-3 text-[12px]" style={{ color: profileMessage === "Information saved." ? "#2f7043" : "#c0392b" }}>{profileMessage}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="First name" value={profile.firstName} disabled={!editingProfile} onChange={(value) => updateProfile("firstName", value)} />
              <Field label="Last name" value={profile.lastName} disabled={!editingProfile} onChange={(value) => updateProfile("lastName", value)} />
              <Field label="Email" value={profile.email} disabled={!editingProfile} onChange={(value) => updateProfile("email", value)} />
              <Field label="Phone" value={profile.phone} disabled={!editingProfile} onChange={(value) => updateProfile("phone", value)} />
            </div>
            {passwordMessage && <p role="status" className="mt-3 text-[12px]" style={{ color: passwordMessage === "Password updated." ? "#2f7043" : "#c0392b" }}>{passwordMessage}</p>}
            <div className="mt-3 flex justify-end"><PrimaryButton onClick={() => void savePassword()}>Update password</PrimaryButton></div>
          </Card>

          <Card>
            <p
              className="text-[15px] font-semibold mb-3"
              style={{ color: "#111c14" }}
            >
              Password
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
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]"
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
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]"
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
              Notifications
            </p>
            <Row
              title="Desktop notifications"
              desc="Show alerts in the browser."
            >
              <Toggle on={prefs.desktop} onChange={() => set("desktop")} />
            </Row>
            <Row
              title="Weekly digest"
              desc="A Monday summary of campus activity."
            >
              <Toggle on={prefs.weekly} onChange={() => set("weekly")} />
            </Row>
            <Row
              title="Mentions only"
              desc="Only notify when directly mentioned."
            >
              <Toggle on={prefs.mentions} onChange={() => set("mentions")} />
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
