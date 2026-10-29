import { useState } from "react";
import { Card, PageTitle, PrimaryButton, Toggle } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

type SystemSettingsData = {
  siteName: string;
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  maxUploadMb: number;
};

const defaultSettings: SystemSettingsData = {
  siteName: "ARIS University",
  maintenanceMode: false,
  sessionTimeoutMinutes: 30,
  maxUploadMb: 6,
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
          <SettingRow
            title="Maintenance mode"
            description="Take ARIS offline for scheduled work."
            control={<Toggle on={settings.maintenanceMode} onChange={(value) => update("maintenanceMode", value)} />}
          />
          <label className="mt-3 block">
            <span className="mb-1 block text-[10px] font-medium text-[#405347]">Maximum upload size (MB)</span>
            <input type="number" min={1} max={6} value={settings.maxUploadMb} onChange={(event) => update("maxUploadMb", Number(event.target.value))} className={inputClassName} />
            <span className="mt-1 block text-[10px] text-[#8fa394]">Applied to profile photo uploads. Maximum supported by the server: 6 MB.</span>
          </label>
        </Card>

        <Card className="!p-3 sm:!p-3.5">
          <h2 className="mb-1 text-[11px] font-semibold text-[#17251c]">Security</h2>
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
          <h2 className="mb-2 text-[11px] font-semibold text-[#17251c]">Notifications &amp; Integrations</h2>
          <p className="py-3 text-[10px] leading-relaxed text-[#8fa394]">
            No external notification or integration provider is configured for this deployment.
          </p>
        </Card>
      </div>
    </div>
  );
}
