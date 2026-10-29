import { useRef, useState, useMemo } from "react";
import { BRAND } from "@/config/navigation";
import { useAuth } from "@/app/authContext";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import getBaseUrl from "@/utils/GetBaseUrl";
import PhotoCropModal from "@/components/PhotoCropModal";
import ProfileDetailsModal, { ProfileModalData } from "@/components/ProfileDetailsModal";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  Toggle,
  Badge,
} from "@/components/ui";

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

type UserProfileData = {
  id?: string;
  employee_id?: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  email?: string;
  department?: string | null;
  position?: string | null;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  created_at?: string | null;
};

export default function UserSettings() {
  const { user } = useAuth();

  const nameParts = (user?.name || "").trim().split(/\s+/);
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initialMiddleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

  const defaultProfile: UserProfileData = {
    firstname: initialFirstName,
    middlename: initialMiddleName,
    lastname: initialLastName,
    email: user?.email || "",
    department: "IT Administration",
    position: "Administrator",
    phone: "",
    address: "",
    avatar_url: "",
    provider: "local",
  };

  const { data: storedProfile, setData: setProfile, reload: reloadProfile } = useResource<UserProfileData>(
    "/users/me/profile",
    defaultProfile,
  );
  const { data: deptResources } = useResource<{ id: string; name: string }[]>(
    "/curriculum/departments?active=true",
    [],
  );
  const { data: prefs, setData: setPrefs } = useResource(
    "/users/me/preferences",
    defaultPreferences,
  );

  const profile = useMemo(() => {
    const p = storedProfile && !Array.isArray(storedProfile) ? storedProfile : defaultProfile;
    return {
      id: p.id,
      employee_id: p.employee_id,
      firstname: p.firstname || initialFirstName,
      middlename: p.middlename || (p.middlename === null ? "" : initialMiddleName),
      lastname: p.lastname || initialLastName,
      email: p.email || user?.email || "",
      department: p.department || "IT Administration",
      position: p.position || "Administrator",
      phone: p.phone || "",
      address: p.address || "",
      avatar_url: p.avatar_url || "",
      provider: p.provider || "local",
      created_at: p.created_at,
    };
  }, [storedProfile, user]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const setPref = (k: keyof typeof prefs) => {
    const updated = { ...prefs, [k]: !prefs[k] };
    setPrefs(updated);
    void saveResource("/users/me/preferences", updated, "PATCH");
  };

  const departmentOptions = useMemo(() => {
    const loaded = Array.isArray(deptResources) && deptResources.length > 0
      ? deptResources.map((d) => d.name)
      : [
          "Computer Studies Department",
          "Languages & Humanities Department",
          "Mathematics & Natural Sciences Department",
          "Business Administration Department",
          "Accountancy Department",
          "Criminal Justice Department",
          "Teacher Education Department",
          "Engineering Department",
          "IT Administration",
        ];
    if (profile.department && !loaded.includes(profile.department)) {
      return [profile.department, ...loaded];
    }
    return loaded;
  }, [deptResources, profile.department]);

  const modalData: ProfileModalData = useMemo(() => {
    return {
      id: profile.id || profile.employee_id || "ADM-0001",
      firstname: profile.firstname,
      middlename: profile.middlename || "",
      lastname: profile.lastname,
      email: profile.email,
      department: profile.department || "",
      roleOrRank: profile.position || "Administrator",
      status: "Active",
      phone: profile.phone || "",
      address: profile.address || "",
      oauthConnected: profile.provider === "google",
    };
  }, [profile]);

  const handleSaveProfile = async (updatedData: ProfileModalData) => {
    const patchPayload: Record<string, string | null> = {
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      email: updatedData.email.trim().toLowerCase(),
      department: profile.department || null,
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
    };

    if (updatedData.password?.trim()) {
      patchPayload.password = updatedData.password.trim();
    }

    const res = await saveResource<UserProfileData>("/users/me/profile", patchPayload, "PATCH");

    setProfile({
      ...profile,
      ...res,
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      email: updatedData.email.trim().toLowerCase(),
      department: updatedData.department?.trim() || profile.department,
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
    });

    try {
      const stored = JSON.parse((localStorage.getItem("aris-user") || sessionStorage.getItem("aris-user")) ?? "null");
      if (stored) {
        stored.name = [updatedData.firstname.trim(), updatedData.middlename?.trim(), updatedData.lastname.trim()]
          .filter(Boolean)
          .join(" ");
        stored.email = updatedData.email.trim().toLowerCase();
        localStorage.setItem("aris-user", JSON.stringify(stored));
        sessionStorage.setItem("aris-user", JSON.stringify(stored));
      }
      window.dispatchEvent(new Event("aris-user-updated"));
    } catch {
      // ignore storage error
    }

    setEditModalOpen(false);
    void reloadProfile();
  };

  const uploadPhoto = async (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    try {
      const response = await saveResource<{ avatar_url: string }>("/users/me/photo", form, "POST");
      setProfile({ ...profile, avatar_url: response.avatar_url });
      try {
        const stored = JSON.parse((localStorage.getItem("aris-user") || sessionStorage.getItem("aris-user")) ?? "null");
        if (stored) {
          stored.avatar_url = response.avatar_url;
          localStorage.setItem("aris-user", JSON.stringify(stored));
          sessionStorage.setItem("aris-user", JSON.stringify(stored));
        }
        window.dispatchEvent(new Event("aris-user-updated"));
      } catch {
        // ignore storage error
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to update photo.";
      setProfileMessage(message);
      throw new Error(message, { cause: reason });
    }
  };

  const fullName = [profile.firstname, profile.middlename, profile.lastname].filter(Boolean).join(" ");
  const memberDateStr = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Aug 2021";

  return (
    <div className="pb-4">
      <PageTitle
        title="User Settings"
        subtitle="Manage your profile and preferences."
        action={
          <PrimaryButton onClick={() => setEditModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Information
          </PrimaryButton>
        }
      />

      <PhotoCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedPhotoFile(null);
        }}
        imageFile={selectedPhotoFile}
        onCropAndUpload={uploadPhoto}
      />

      {/* Edit Staff Format Profile Modal */}
      <ProfileDetailsModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        heading="User Profile"
        initialMode="edit"
        data={modalData}
        departmentOptions={departmentOptions}
        roleOrRankOptions={["Administrator", "Staff", "Dean", "Chair"]}
        roleOrRankLabel="Role"
        statusOptions={[
          { label: "Active", value: "Active" },
          { label: "On Leave", value: "On Leave" },
        ]}
        canEditDepartment={false}
        canEditRoleOrRank={false}
        canEditStatus={false}
        onSave={handleSaveProfile}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Profile summary card */}
        <Card className="flex flex-col items-center text-center overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url.startsWith("http") ? profile.avatar_url : `${getBaseUrl()}${profile.avatar_url}`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[26px] font-semibold"
              style={{ background: BRAND }}
            >
              {(fullName || user?.name || "AD").slice(0, 2).toUpperCase()}
            </div>
          )}
          <p className="text-[16px] font-semibold mt-3" style={{ color: "#111c14" }}>
            {fullName || user?.name || "Administrator"}
          </p>
          <p className="text-[13px]" style={{ color: "#8fa394" }}>
            {profile.email}
          </p>
          <div className="mt-2">
            <Badge tone="green" dot>
              {profile.position || "Administrator"}
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
                if (file) {
                  setSelectedPhotoFile(file);
                  setShowCropModal(true);
                }
                event.target.value = "";
              }}
            />
          </div>
          <div
            className="w-full mt-auto pt-5 border-t space-y-2.5 text-left"
            style={{ borderColor: "#eef1ef" }}
          >
            {[
              ["Member since", memberDateStr],
              ["Account status", "Active"],
              ["Department", profile.department || "IT Administration"],
              ["Phone", profile.phone || "Not provided"],
              ["Address", profile.address || "Not provided"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[13px] gap-2">
                <span className="shrink-0" style={{ color: "#8fa394" }}>{l}</span>
                <span className="font-medium truncate text-right" style={{ color: "#111c14" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card>
            <div className="mb-4">
              <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Profile Information</p>
              <p className="text-[12px] text-[#8fa394]">Your primary account and departmental information.</p>
            </div>
            {profileMessage && (
              <p role="status" className="mb-3 text-[12px]" style={{ color: "#c0392b" }}>
                {profileMessage}
              </p>
            )}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">First Name</p>
                  <p className="text-[13.5px] font-medium text-[#111c14] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.firstname || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Middle Name</p>
                  <p className="text-[13.5px] text-[#334237] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.middlename || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Last Name</p>
                  <p className="text-[13.5px] font-medium text-[#111c14] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.lastname || "Not set"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Email Address</p>
                  <p className="text-[13.5px] text-[#334237] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Department</p>
                  <p className="text-[13.5px] text-[#334237] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.department || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Phone Number</p>
                  <p className="text-[13.5px] text-[#334237] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] font-medium text-[#536258] mb-1">Address</p>
                  <p className="text-[13.5px] text-[#334237] bg-[#fbfcfb] border border-[#e2e8e4] rounded-xl px-3 py-2.5 truncate">
                    {profile.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Password &amp; Security</p>
                <p className="text-[12px] text-[#8fa394]">Manage authentication credentials and password requirements.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-[12.5px] font-medium text-[#2d4a36] hover:underline"
              >
                Change password
              </button>
            </div>
            <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "#f2f4f2" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[13px] text-[#3d4a41]">Password protection is enabled</span>
              </div>
              <span className="text-[12px] text-[#8fa394]">8–15 characters, capital, number &amp; symbol</span>
            </div>
          </Card>

          <Card className="flex-1 min-h-0">
            <p className="text-[15px] font-semibold mb-1" style={{ color: "#111c14" }}>
              Notifications
            </p>
            <Row title="Desktop notifications" desc="Show alerts in the browser.">
              <Toggle on={prefs.desktop} onChange={() => setPref("desktop")} />
            </Row>
            <Row title="Weekly digest" desc="A Monday summary of campus activity.">
              <Toggle on={prefs.weekly} onChange={() => setPref("weekly")} />
            </Row>
            <Row title="Mentions only" desc="Only notify when directly mentioned.">
              <Toggle on={prefs.mentions} onChange={() => setPref("mentions")} />
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
