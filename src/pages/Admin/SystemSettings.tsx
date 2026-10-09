import { useState } from "react";
import { Card, PageTitle, PrimaryButton, Toggle } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

type SystemSettingsData = {
  maintenanceMode: boolean;
  emailNotifications: boolean;
  automaticBackups: boolean;
  academicYear: string;
  maxUploadMb: number;
};

const defaultSettings: SystemSettingsData = {
  maintenanceMode: false,
  emailNotifications: true,
  automaticBackups: true,
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
  const { data: settings, setData: setSettings } = useResource<SystemSettingsData>("/system/settings", defaultSettings);
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
          <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "#111c14" }}>Platform</h2>
          <SettingRow title="Maintenance mode" control={<Toggle on={settings.maintenanceMode} onChange={(value) => update("maintenanceMode", value)} />} />
          <SettingRow title="Email notifications" control={<Toggle on={settings.emailNotifications} onChange={(value) => update("emailNotifications", value)} />} />
          <SettingRow title="Automatic backups" control={<Toggle on={settings.automaticBackups} onChange={(value) => update("automaticBackups", value)} />} />
        </Card>

        <Card>
          <h2 className="mb-4 text-[14px] font-semibold" style={{ color: "#111c14" }}>Academic and storage</h2>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Academic year</span>
            <input
              value={settings.academicYear}
              onChange={(event) => update("academicYear", event.target.value)}
              className="h-10 w-full rounded-xl border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "#5a6b5e" }}>Maximum upload size (MB)</span>
            <input
              type="number"
              min="1"
              value={settings.maxUploadMb}
              onChange={(event) => update("maxUploadMb", Number(event.target.value))}
              className="h-10 w-full rounded-xl border bg-white px-3 text-[13px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </label>
        </Card>
      </div>
    </div>
  );
}
