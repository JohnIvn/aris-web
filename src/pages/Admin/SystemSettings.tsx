import { useState } from "react";
import { Badge, Card, PageTitle, PrimaryButton, Toggle } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

type SystemSettingsData = {
  siteName: string;
  theme: "Light" | "Dark" | "System";
  maintenanceMode: boolean;
  requireMfa: boolean;
  campusSso: boolean;
  sessionTimeoutMinutes: number;
  emailNotifications: boolean;
  aiGrading: boolean; 
  googleGateway: boolean;
  weeklyDigest: boolean;
  automaticBackups: boolean;
  backupFrequencyHours: number;
  backupRetentionDays: number;
  academicYear: string;
  maxUploadMb: number;
};

const defaultSettings: SystemSettingsData = {
  siteName: "ARIS University",
  theme: "Light",
  maintenanceMode: false,
  requireMfa: true,
  campusSso: true,
  sessionTimeoutMinutes: 30,
  emailNotifications: true,
  aiGrading: true,
  googleGateway: true,
  weeklyDigest: true,
  automaticBackups: true,
  backupFrequencyHours: 24,
  backupRetentionDays: 30,
  academicYear: "2026-2027",
  maxUploadMb: 25,
};

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[47px] items-center justify-between gap-3 border-t border-[#f0f3f0] py-2 first:border-0">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#17251c]">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-[#8fa394]">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

const inputClassName =
  "h-[34px] w-full rounded-xl border border-[#e2e8e4] bg-white px-2.5 text-[10px] text-[#17251c] outline-none focus:border-[#3a7d4e]";

export default function SystemSettings() {
  const { data: storedSettings, setData: setSettings } = useResource<SystemSettingsData>("/system/settings", defaultSettings);
  const settings = { ...defaultSettings, ...storedSettings };
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const update = <K extends keyof SystemSettingsData>(key: K, value: SystemSettingsData[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveResource("/system/settings", settings, "PUT");
      setMessage("Settings saved.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title="System Settings"
        subtitle="Institution-wide configuration for ARIS."
        action={<PrimaryButton onClick={save}>{saving ? "Saving..." : "Save Changes"}</PrimaryButton>}
      />

      {message && (
        <p role="status" className={`mb-3 text-[12px] ${message === "Settings saved." ? "text-[#2f7043]" : "text-[#c0392b]"}`}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="!p-3 sm:!p-3.5">
          <h2 className="mb-1 text-[11px] font-semibold text-[#17251c]">General</h2>
          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] font-medium text-[#405347]">Institution name</span>
            <input
              value={settings.siteName}
              onChange={(event) => update("siteName", event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="mb-2 block">
            <span className="mb-1 block text-[10px] font-medium text-[#405347]">Theme</span>
            <select
              value={settings.theme}
              onChange={(event) => update("theme", event.target.value as SystemSettingsData["theme"])}
              className={inputClassName}
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </label>
          <SettingRow
            title="Maintenance mode"
            description="Take ARIS offline for scheduled work."
            control={<Toggle on={settings.maintenanceMode} onChange={(value) => update("maintenanceMode", value)} />}
          />
        </Card>

        <Card className="!p-3 sm:!p-3.5">
          <h2 className="mb-1 text-[11px] font-semibold text-[#17251c]">Security</h2>
          <SettingRow
            title="Two-factor authentication"
            description="Require 2FA for all administrator accounts."
            control={<Toggle on={settings.requireMfa} onChange={(value) => update("requireMfa", value)} />}
          />
          <SettingRow
            title="Campus SSO"
            description="Allow sign-in with institutional accounts."
            control={<Toggle on={settings.campusSso} onChange={(value) => update("campusSso", value)} />}
          />
          <SettingRow
            title="Session timeout"
            description="Auto sign-out after inactivity."
            control={
              <select
                aria-label="Session timeout"
                value={settings.sessionTimeoutMinutes}
                onChange={(event) => update("sessionTimeoutMinutes", Number(event.target.value))}
                className="h-[30px] rounded-xl border border-[#e2e8e4] bg-white px-2 text-[10px] text-[#17251c] outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            }
          />
        </Card>

        <Card className="!p-3 sm:!p-3.5">
          <h2 className="mb-2 text-[11px] font-semibold text-[#17251c]">Data &amp; Backups</h2>
          <SettingRow
            title="Automatic backups"
            description="Nightly encrypted snapshots at 2:00 AM."
            control={<Toggle on={settings.automaticBackups} onChange={(value) => update("automaticBackups", value)} />}
          />
          <SettingRow
            title="Last backup"
            description="Today at 2:00 AM · 4.2 GB"
            control={<Badge tone="green" dot>Healthy</Badge>}
          />
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              <p className="text-[11px] font-medium text-[#17251c]">Storage used</p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">312 GB of 500 GB</p>
            </div>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-[#e8ede9]">
              <div className="h-full w-[62.4%] rounded-full bg-[#3a7d4e]" />
            </div>
          </div>
        </Card>

        <Card className="!p-3 sm:!p-3.5">
          <h2 className="mb-2 text-[11px] font-semibold text-[#17251c]">Notifications &amp; Integrations</h2>
          <SettingRow
            title="AI grading"
            description="Enable machine-assisted assessment scoring."
            control={<Toggle on={settings.aiGrading} onChange={(value) => update("aiGrading", value)} />}
          />
          <SettingRow
            title="Email alerts"
            description="Send critical system alerts to administrators."
            control={<Toggle on={settings.emailNotifications} onChange={(value) => update("emailNotifications", value)} />}
          />
          <SettingRow
            title="Google gateway"
            description="Connected via Google."
            control={settings.googleGateway ? <Badge tone="green" dot>Connected</Badge> : <Badge tone="gray">Disconnected</Badge>}
          />
        </Card>
      </div>
    </div>
  );
}
