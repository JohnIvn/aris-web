import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileCode2, Plus, RefreshCw, Upload, X, XCircle } from "lucide-react";
import { Badge, Card, PageTitle } from "@/components/ui";
import { apiClient } from "@/services/apiClient";

const OTA_BUCKET =
  (import.meta.env.VITE_SUPABASE_OTA_BUCKET as string | undefined) || "ota";

type OTAFile = {
  id: string | null;
  name: string;
  size: number | null;
  mimetype: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_main: boolean;
};

function formatFileSize(size: number | null) {
  if (size === null) return "Unknown";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

export default function OTA() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [files, setFiles] = useState<OTAFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingMainFile, setSettingMainFile] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const response = await apiClient.get<OTAFile[]>("/system/ota/files");
      setFiles(response.data);
    } catch (listError) {
      setError(`Unable to load OTA files: ${listError instanceof Error ? listError.message : "Request failed"}`);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const chooseFile = (file: File | undefined) => {
    setMessage(null);
    setError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".ps1")) {
      setSelectedFile(null);
      setError("Only PowerShell (.ps1) files can be uploaded.");
      return;
    }

    setSelectedFile(file);
  };

  const closeAddModal = () => {
    if (uploading) return;
    setIsAddModalOpen(false);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Choose a .ps1 file before uploading.");
      return;
    }
    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await apiClient.post("/system/ota/files", formData);
    } catch (uploadError) {
      setUploading(false);
      setError(`Upload failed: ${uploadError instanceof Error ? uploadError.message : "Request failed"}`);
      return;
    }

    setUploading(false);
    setMessage(`${selectedFile.name} was uploaded successfully.`);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
    await loadFiles();
    setIsAddModalOpen(false);
  };

  const setMainFile = async (name: string) => {
    setSettingMainFile(name);
    setMessage(null);
    setError(null);
    try {
      await apiClient.post("/system/ota/main", { name });
      setMessage(`${name} is now the main OTA file for client downloads.`);
      await loadFiles();
    } catch (requestError) {
      setError(`Unable to set main OTA file: ${requestError instanceof Error ? requestError.message : "Request failed"}`);
    } finally {
      setSettingMainFile(null);
    }
  };

  return (
    <div className="pb-4">
      <PageTitle
        title="OTA"
        subtitle="Upload a PowerShell update script for installation on the app."
        action={
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3a7d4e] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2f7043]"
          >
            <Plus size={16} aria-hidden="true" />
            Add file
          </button>
        }
      />

      {message && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
          <CheckCircle2 size={15} aria-hidden="true" />
          {message}
        </p>
      )}

      <Card className="mt-4 !p-0">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[15px] font-semibold text-[#18251c]">Uploaded files</h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">
              Files currently available in the OTA bucket.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadFiles()}
            disabled={loadingFiles}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce7df] px-3 py-2 text-[12px] font-medium text-[#3d4a41] transition-colors hover:bg-[#f4f8f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingFiles ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="bg-[#f8faf8] text-[10px] uppercase tracking-wide text-[#9aaba0]">
                <th className="px-5 py-3 font-medium sm:px-6">File</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Size</th>
                <th className="px-3 py-3 font-medium">Uploaded</th>
                <th className="px-3 py-3 font-medium">Updated</th>
                <th className="px-3 py-3 font-medium">Client file</th>
              </tr>
            </thead>
            <tbody>
              {loadingFiles && files.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[12px] text-[#8fa394]">
                    Loading uploaded files...
                  </td>
                </tr>
              )}
              {!loadingFiles && files.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[12px] text-[#8fa394]">
                    No OTA files have been uploaded yet.
                  </td>
                </tr>
              )}
              {files.map((file) => (
                <tr key={file.id || file.name} className="border-t border-[#edf0ed] text-[12px] text-[#536258]">
                  <td className="px-5 py-3 font-medium text-[#3d4a41] sm:px-6">{file.name}</td>
                  <td className="px-3 py-3">{file.mimetype || "PowerShell script"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatFileSize(file.size)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(file.created_at)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(file.updated_at)}</td>
                  <td className="px-3 py-3">
                    {file.is_main ? (
                      <Badge tone="green" dot>Main file</Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void setMainFile(file.name)}
                        disabled={settingMainFile !== null}
                        className="whitespace-nowrap rounded-lg border border-[#dce7df] px-2.5 py-1.5 text-[11px] font-medium text-[#3d4a41] hover:bg-[#f4f8f5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {settingMainFile === file.name ? "Saving..." : "Set as main"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102014]/35 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ota-upload-title"
            className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf4ee] text-[#3a7d4e]">
                  <FileCode2 size={23} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="ota-upload-title" className="text-[15px] font-semibold text-[#18251c]">Add OTA file</h2>
                  <p className="mt-1 text-[12px] text-[#8fa394]">
                    Upload a PowerShell script to the <strong>{OTA_BUCKET}</strong> bucket.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                disabled={uploading}
                aria-label="Close upload dialog"
                className="rounded-full p-1.5 text-[#8fa394] hover:bg-[#f4f6f5] hover:text-[#3d4a41] disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <label
              htmlFor="ota-file"
              className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#b8cdbd] bg-[#f8fbf8] px-5 py-10 text-center transition-colors hover:border-[#3a7d4e] hover:bg-[#f1f8f3]"
            >
              <Upload size={24} className="mb-2 text-[#3a7d4e]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#3d4a41]">
                {selectedFile ? selectedFile.name : "Choose a .ps1 file"}
              </span>
              <span className="mt-1 text-[11px] text-[#8fa394]">PowerShell scripts only</span>
              <input
                ref={inputRef}
                id="ota-file"
                type="file"
                accept=".ps1,application/octet-stream"
                className="sr-only"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
            </label>

            {error && (
              <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                <XCircle size={15} aria-hidden="true" />
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={uploading}
                className="rounded-xl border border-[#dce7df] px-4 py-2.5 text-[13px] font-medium text-[#3d4a41] hover:bg-[#f4f8f5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3a7d4e] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#2f7043] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} aria-hidden="true" />
                {uploading ? "Uploading..." : "Upload script"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
