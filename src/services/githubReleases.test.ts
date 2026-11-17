import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatReleaseDate,
  toClientRelease,
  type ReleaseInfo,
} from "@/services/githubReleases";

const desktopRelease: ReleaseInfo = {
  repo: "UnexpectedFeatures/aris-app",
  tag: "v1.0.4",
  name: "Release v1.0.4",
  publishedAt: "2026-11-15T13:29:28Z",
  htmlUrl: "https://github.com/UnexpectedFeatures/aris-app/releases/tag/v1.0.4",
  prerelease: false,
  notes: "",
  assets: [
    {
      name: "ARIS_1.0.4_x64-setup.exe",
      size: 4_047_503,
      downloadUrl: "https://example.test/ARIS_1.0.4_x64-setup.exe",
      sha256: "a".repeat(64),
      contentType: "application/x-msdownload",
      downloadCount: 42,
    },
    {
      name: "ARIS_1.0.4_x64_en-US.msi",
      size: 5_777_654,
      downloadUrl: "https://example.test/ARIS_1.0.4_x64_en-US.msi",
      sha256: null,
      contentType: "application/x-msi",
      downloadCount: 0,
    },
  ],
};

const mobileRelease: ReleaseInfo = {
  repo: "JohnIvn/aris-mobile",
  tag: "v1.0.2",
  name: "v1.0.2",
  publishedAt: "2026-10-27T04:38:38Z",
  htmlUrl: "https://github.com/JohnIvn/aris-mobile/releases/tag/v1.0.2",
  prerelease: false,
  notes: "",
  assets: [
    {
      name: "app-v1.0.2.apk",
      size: 53_896_806,
      downloadUrl: "https://example.test/app-v1.0.2.apk",
      sha256: "b".repeat(64),
      contentType: "application/vnd.android.package-archive",
      downloadCount: 7,
    },
    {
      name: "app-v1.0.2.ipa",
      size: 8_315_208,
      downloadUrl: "https://example.test/app-v1.0.2.ipa",
      sha256: null,
      contentType: "application/octet-stream",
      downloadCount: 0,
    },
  ],
};

describe("GitHub release mapping", () => {
  it("selects the NSIS installer and keeps the MSI as an alternate download", () => {
    const client = toClientRelease("desktop", desktopRelease, "github");

    expect(client.version).toBe("v1.0.4");
    expect(client.fileName).toBe("ARIS_1.0.4_x64-setup.exe");
    expect(client.downloadUrl).toBe("https://example.test/ARIS_1.0.4_x64-setup.exe");
    expect(client.size).toBe("3.86 MB");
    expect(client.sha256).toHaveLength(64);
    expect(client.alternate?.label).toBe("MSI installer");
    expect(client.alternate?.fileName).toBe("ARIS_1.0.4_x64_en-US.msi");
    expect(client.releasesUrl).toBe("https://github.com/UnexpectedFeatures/aris-app/releases");
  });

  it("selects the APK from the mobile release and exposes the IPA alternate", () => {
    const client = toClientRelease("mobile", mobileRelease, "github");

    expect(client.fileName).toBe("app-v1.0.2.apk");
    expect(client.size).toBe("51.4 MB");
    expect(client.alternate?.label).toBe("iOS build (.ipa)");
    expect(client.downloadCount).toBe(7);
  });

  it("fails loudly when the release has no installable asset", () => {
    expect(() =>
      toClientRelease("mobile", { ...mobileRelease, assets: [] }, "github"),
    ).toThrow(/No APK asset/);
  });
});

describe("release formatting", () => {
  it("formats asset sizes in megabytes", () => {
    expect(formatBytes(4_047_503)).toBe("3.86 MB");
    expect(formatBytes(53_896_806)).toBe("51.4 MB");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(0)).toBe("—");
  });

  it("formats publish dates", () => {
    expect(formatReleaseDate("2026-11-15T13:29:28Z")).toBe("November 15, 2026");
    expect(formatReleaseDate(null)).toBe("Unknown");
  });
});
