import { useState } from "react";
import { Card, PageTitle, PrimaryButton, Toggle } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

type SystemSettingsData = {
  siteName: string;
  maintenanceMode: boolean;
  requireMfa: boolean;
  sessionTimeoutMinutes: number;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  automaticBackups: boolean;
  backupFrequencyHours: number;
  backupRetentionDays: number;
  academicYear: string;
  maxUploadMb: number;
};

const defaultSettings: SystemSettingsData = {
  siteName: "ARIS",
  maintenanceMode: false,
  requireMfa: true,
  sessionTimeoutMinutes: 30,
  emailNotifications: true,
  weeklyDigest: true,
  automaticBackups: true,
  backupFrequencyHours: 24,
  backupRetentionDays: 30,
  academicYear: "2026-2027",
  maxUploadMb: 25,
};

function SettingRow({
  title,
  control,
}: {
  title: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-3 first:border-0" style={{ borderColor: "#f2f4f2" }}>
      <p className="text-[13px] font-medium" style={{ color: "#111c14" }}>{title}</p>
      {control}
    </div>
  );
}

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
        subtitle="Configure ARIS operations."
        action={<PrimaryButton onClick={save}>{saving ? "Saving..." : "Save changes"}</PrimaryButton>}
      />

      {message && <p role="status" className="mb-3 text-[12px]" style={{ color: message === "Settings saved." ? "#2f7043" : "#c0392b" }}>{message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-[14px] font-semibold" style={{ color: "#111c14" }}>General</h2>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>System name</span>
            <input value={settings.siteName} onChange={(event) => update("siteName", event.target.value)} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Academic year</span>
            <input value={settings.academicYear} onChange={(event) => update("academicYear", event.target.value)} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Maximum upload size (MB)</span>
            <input type="number" min="1" value={settings.maxUploadMb} onChange={(event) => update("maxUploadMb", Number(event.target.value))} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </label>
        </Card>

        <Card>
          <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "#111c14" }}>Security</h2>
          <SettingRow title="Require multi-factor authentication" control={<Toggle on={settings.requireMfa} onChange={(value) => update("requireMfa", value)} />} />
          <SettingRow title="Maintenance mode" control={<Toggle on={settings.maintenanceMode} onChange={(value) => update("maintenanceMode", value)} />} />
          <label className="mt-3 block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Session timeout (minutes)</span>
            <input type="number" min="5" value={settings.sessionTimeoutMinutes} onChange={(event) => update("sessionTimeoutMinutes", Number(event.target.value))} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </label>
        </Card>

        <Card>
          <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "#111c14" }}>Notifications</h2>
          <SettingRow title="Email notifications" control={<Toggle on={settings.emailNotifications} onChange={(value) => update("emailNotifications", value)} />} />
          <SettingRow title="Weekly activity digest" control={<Toggle on={settings.weeklyDigest} onChange={(value) => update("weeklyDigest", value)} />} />
        </Card>

        <Card>
          <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "#111c14" }}>Data backups</h2>
          <SettingRow title="Automatic backups" control={<Toggle on={settings.automaticBackups} onChange={(value) => update("automaticBackups", value)} />} />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Backup frequency (hours)</span>
              <input type="number" min="1" value={settings.backupFrequencyHours} onChange={(event) => update("backupFrequencyHours", Number(event.target.value))} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Retention (days)</span>
              <input type="number" min="1" value={settings.backupRetentionDays} onChange={(event) => update("backupRetentionDays", Number(event.target.value))} className="h-10 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
