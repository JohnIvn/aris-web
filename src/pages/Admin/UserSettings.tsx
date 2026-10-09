import { useState } from "react";
import { BRAND } from "@/config/navigation";
import { useAuth } from "@/app/routes";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  Toggle,
  Badge,
  Modal,
} from "@/components/ui";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[12.5px] font-medium mb-1.5"
        style={{ color: "#3d4a41" }}
      >
        {label}
      </p>
      <input
        defaultValue={value}
        className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]"
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
  const { data: prefs, setData: setPrefs } = useResource("/users/me/preferences", defaultPreferences);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const set = (k: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const savePreferences = async () => {
    try {
      await saveResource("/users/me/preferences", prefs, "PUT");
      setShowConfirm(false);
      setShowSaved(true);
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to save preferences.");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
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

      <div className="grid grid-cols-[1fr_1.6fr] gap-4 flex-1 min-h-0">
        {/* Profile summary */}
        <Card className="flex flex-col items-center text-center overflow-hidden">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[26px] font-semibold"
            style={{ background: BRAND }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <p
            className="text-[16px] font-semibold mt-3"
            style={{ color: "#111c14" }}
          >
            {user.name}
          </p>
          <p className="text-[13px]" style={{ color: "#8fa394" }}>
            {user.email}
          </p>
          <div className="mt-2">
            <Badge tone="green" dot>
              {user.role === "administrator" ? "Administrator" : "Professor"}
            </Badge>
          </div>
          <div className="mt-4">
            <GhostButton>
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
            <p
              className="text-[15px] font-semibold mb-4"
              style={{ color: "#111c14" }}
            >
              Profile
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" value={user.name.split(" ")[0] ?? ""} />
              <Field label="Last name" value={user.name.split(" ").slice(1).join(" ")} />
              <Field label="Email" value={user.email} />
              <Field label="Phone" value="+63 917 555 0142" />
            </div>
          </Card>

          <Card>
            <p
              className="text-[15px] font-semibold mb-3"
              style={{ color: "#111c14" }}
            >
              Password
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p
                  className="text-[12.5px] font-medium mb-1.5"
                  style={{ color: "#3d4a41" }}
                >
                  New password
                </p>
                <input
                  type="password"
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
