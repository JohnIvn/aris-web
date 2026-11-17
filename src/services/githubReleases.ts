/**
 * Reads the latest published build of each ARIS client straight from GitHub Releases.
 *
 * Desktop installers live in the aris-app (Tauri) repository and mobile builds live in
 * the aris-mobile (Flutter) repository. Both are public, so the download page can call
 * the GitHub REST API directly from the browser (it is CORS enabled).
 *
 * Unauthenticated GitHub API calls are limited to 60 requests per hour per IP, so
 * successful responses are cached for a short while and a known-good snapshot is used
 * whenever the API is unavailable (offline, rate limited, or the repo has no releases).
 */

const GITHUB_API = (import.meta.env.VITE_GITHUB_API_BASE || "https://api.github.com").replace(
  /\/+$/,
  "",
);
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_PREFIX = "aris:github-release:";

export type ReleasePlatform = "desktop" | "mobile";

export type ReleaseAsset = {
  name: string;
  size: number;
  downloadUrl: string;
  sha256: string | null;
  contentType: string;
  downloadCount: number;
};

export type ReleaseInfo = {
  repo: string;
  tag: string;
  name: string;
  publishedAt: string | null;
  htmlUrl: string;
  prerelease: boolean;
  notes: string;
  assets: ReleaseAsset[];
};

export type AlternateDownload = {
  label: string;
  fileName: string;
  size: string;
  downloadUrl: string;
};

export type ClientRelease = {
  platform: ReleasePlatform;
  repo: string;
  version: string;
  fileName: string;
  fileFormat: string;
  size: string;
  sizeBytes: number;
  date: string;
  sha256: string | null;
  downloadUrl: string;
  releaseUrl: string;
  releasesUrl: string;
  publishedAt: string | null;
  downloadCount: number | null;
  alternate: AlternateDownload | null;
  source: "github" | "fallback";
};

export const RELEASE_REPOS: Record<ReleasePlatform, string> = {
  desktop:
    (import.meta.env.VITE_GITHUB_DESKTOP_REPO || "").trim() ||
    "UnexpectedFeatures/aris-app",
  mobile:
    (import.meta.env.VITE_GITHUB_MOBILE_REPO || "").trim() || "JohnIvn/aris-mobile",
};

/** Optional fine-grained, read-only token. Raises the API limit from 60 to 5,000 requests/hour. */
const GITHUB_TOKEN = (import.meta.env.VITE_GITHUB_TOKEN || "").trim();

/** Last known good builds, used when the API cannot be reached. */
const FALLBACK_RELEASES: Record<ReleasePlatform, ReleaseInfo> = {
  desktop: {
    repo: RELEASE_REPOS.desktop,
    tag: "v1.0.4",
    name: "Release v1.0.4",
    publishedAt: "2026-11-15T13:29:28Z",
    htmlUrl: `https://github.com/${RELEASE_REPOS.desktop}/releases/tag/v1.0.4`,
    prerelease: false,
    notes: "",
    assets: [
      {
        name: "ARIS_1.0.4_x64-setup.exe",
        size: 4_047_503,
        downloadUrl: `https://github.com/${RELEASE_REPOS.desktop}/releases/download/v1.0.4/ARIS_1.0.4_x64-setup.exe`,
        sha256: "cf49388b370a63bbff0c184c8f81f200a1c49267d6dc8801b4afe1e9beb853c9",
        contentType: "application/x-msdownload",
        downloadCount: 0,
      },
      {
        name: "ARIS_1.0.4_x64_en-US.msi",
        size: 5_777_654,
        downloadUrl: `https://github.com/${RELEASE_REPOS.desktop}/releases/download/v1.0.4/ARIS_1.0.4_x64_en-US.msi`,
        sha256: "7a4843351411b552b965c18136e36c3c1403aeb555e620fedda6430c2efbe1e2",
        contentType: "application/x-msi",
        downloadCount: 0,
      },
    ],
  },
  mobile: {
    repo: RELEASE_REPOS.mobile,
    tag: "v1.0.2",
    name: "v1.0.2",
    publishedAt: "2026-10-27T04:38:38Z",
    htmlUrl: `https://github.com/${RELEASE_REPOS.mobile}/releases/tag/v1.0.2`,
    prerelease: false,
    notes: "",
    assets: [
      {
        name: "app-v1.0.2.apk",
        size: 53_896_806,
        downloadUrl: `https://github.com/${RELEASE_REPOS.mobile}/releases/download/v1.0.2/app-v1.0.2.apk`,
        sha256: "d239ed29cc0e1bf3c4230635c30c663040e9f7cef7f9d4d380f95b7a3dd75998",
        contentType: "application/vnd.android.package-archive",
        downloadCount: 0,
      },
      {
        name: "app-v1.0.2.ipa",
        size: 8_315_208,
        downloadUrl: `https://github.com/${RELEASE_REPOS.mobile}/releases/download/v1.0.2/app-v1.0.2.ipa`,
        sha256: "cfc31955d7afc7d4fa790a719d71c268bf49d4f1c3071565f1234051150e4226",
        contentType: "application/octet-stream",
        downloadCount: 0,
      },
    ],
  },
};

const inFlight = new Map<string, Promise<ReleaseInfo>>();

function parseAsset(raw: unknown): ReleaseAsset | null {
  if (!raw || typeof raw !== "object") return null;
  const asset = raw as Record<string, unknown>;

  if (typeof asset.name !== "string" || typeof asset.browser_download_url !== "string") {
    return null;
  }

  const digest = typeof asset.digest === "string" ? asset.digest : "";
  const sha256 = /^sha256:[a-f0-9]{64}$/i.test(digest) ? digest.slice("sha256:".length) : null;

  return {
    name: asset.name,
    size: typeof asset.size === "number" ? asset.size : 0,
    downloadUrl: asset.browser_download_url,
    sha256,
    contentType: typeof asset.content_type === "string" ? asset.content_type : "",
    downloadCount:
      typeof asset.download_count === "number" ? asset.download_count : 0,
  };
}

function parseRelease(repo: string, raw: unknown): ReleaseInfo {
  if (!raw || typeof raw !== "object") {
    throw new Error("GitHub returned an unexpected release payload.");
  }

  const release = raw as Record<string, unknown>;
  const tag = typeof release.tag_name === "string" ? release.tag_name : "";
  if (!tag) throw new Error("The latest GitHub release is missing a tag name.");

  const assets = Array.isArray(release.assets)
    ? release.assets.map(parseAsset).filter((asset): asset is ReleaseAsset => asset !== null)
    : [];

  if (assets.length === 0) throw new Error("The latest GitHub release has no downloadable assets.");

  return {
    repo,
    tag,
    name: typeof release.name === "string" && release.name ? release.name : tag,
    publishedAt: typeof release.published_at === "string" ? release.published_at : null,
    htmlUrl:
      typeof release.html_url === "string"
        ? release.html_url
        : `https://github.com/${repo}/releases/tag/${tag}`,
    prerelease: release.prerelease === true,
    notes: typeof release.body === "string" ? release.body : "",
    assets,
  };
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    // localStorage keeps the cache across tabs and visits, which matters because
    // unauthenticated GitHub API calls share a small per-IP hourly quota.
    const storage = window.localStorage;
    const probe = `${CACHE_PREFIX}probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function readCache(repo: string): ReleaseInfo | null {
  const storage = browserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${CACHE_PREFIX}${repo}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { at?: number; release?: unknown };
    if (typeof cached.at !== "number" || Date.now() - cached.at > CACHE_TTL_MS) return null;
    return parseRelease(repo, cached.release);
  } catch {
    return null;
  }
}

function writeCache(repo: string, release: ReleaseInfo) {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(
      `${CACHE_PREFIX}${repo}`,
      JSON.stringify({
        at: Date.now(),
        release: {
          tag_name: release.tag,
          name: release.name,
          published_at: release.publishedAt,
          html_url: release.htmlUrl,
          prerelease: release.prerelease,
          body: release.notes,
          assets: release.assets.map((asset) => ({
            name: asset.name,
            size: asset.size,
            browser_download_url: asset.downloadUrl,
            digest: asset.sha256 ? `sha256:${asset.sha256}` : null,
            content_type: asset.contentType,
            download_count: asset.downloadCount,
          })),
        },
      }),
    );
  } catch {
    // Storage can be unavailable (private mode / quota); caching is best effort.
  }
}

async function requestLatestRelease(repo: string): Promise<ReleaseInfo> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    },
    // Never let a stalled connection leave the page on "Checking GitHub…".
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`GitHub Releases request failed (${response.status}) for ${repo}.`);
  }

  const release = parseRelease(repo, await response.json());
  writeCache(repo, release);
  return release;
}

/** Fetches (and caches) the latest GitHub release for a client platform. */
export function fetchLatestRelease(platform: ReleasePlatform): Promise<ReleaseInfo> {
  const repo = RELEASE_REPOS[platform];

  const cached = readCache(repo);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(repo);
  if (pending) return pending;

  const request = requestLatestRelease(repo).finally(() => inFlight.delete(repo));
  inFlight.set(repo, request);
  return request;
}

function pickAsset(assets: ReleaseAsset[], platform: ReleasePlatform): ReleaseAsset | null {
  if (platform === "desktop") {
    return (
      assets.find((asset) => /-setup\.exe$/i.test(asset.name)) ??
      assets.find((asset) => /\.exe$/i.test(asset.name)) ??
      assets.find((asset) => /\.msi$/i.test(asset.name)) ??
      null
    );
  }

  return assets.find((asset) => /\.apk$/i.test(asset.name)) ?? null;
}

function pickAlternate(
  assets: ReleaseAsset[],
  platform: ReleasePlatform,
  primary: ReleaseAsset,
): AlternateDownload | null {
  const alternate =
    platform === "desktop"
      ? assets.find((asset) => /\.msi$/i.test(asset.name))
      : assets.find((asset) => /\.ipa$/i.test(asset.name));

  if (!alternate || alternate.downloadUrl === primary.downloadUrl) return null;

  return {
    label: platform === "desktop" ? "MSI installer" : "iOS build (.ipa)",
    fileName: alternate.name,
    size: formatBytes(alternate.size),
    downloadUrl: alternate.downloadUrl,
  };
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const decimals = mb >= 100 ? 0 : mb >= 10 ? 1 : 2;
  return `${mb.toFixed(decimals)} MB`;
}

export function formatReleaseDate(value: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function extensionOf(fileName: string): string {
  const match = /(\.[a-z0-9]+(?:-[a-z]{2})?)$/i.exec(fileName);
  return match ? match[1].toLowerCase() : "";
}

/** Turns a raw GitHub release into the view model the download page renders. */
export function toClientRelease(
  platform: ReleasePlatform,
  release: ReleaseInfo,
  source: ClientRelease["source"],
): ClientRelease {
  const asset = pickAsset(release.assets, platform);

  if (!asset) {
    throw new Error(`No ${platform === "desktop" ? "installer" : "APK"} asset found in ${release.tag}.`);
  }

  const extension = extensionOf(asset.name);

  return {
    platform,
    repo: release.repo,
    version: release.tag,
    fileName: asset.name,
    fileFormat: `${extension} ${platform === "desktop" ? "installer" : "package"}`,
    size: formatBytes(asset.size),
    sizeBytes: asset.size,
    date: formatReleaseDate(release.publishedAt),
    sha256: asset.sha256,
    downloadUrl: asset.downloadUrl,
    releaseUrl: release.htmlUrl,
    releasesUrl: `https://github.com/${release.repo}/releases`,
    publishedAt: release.publishedAt,
    downloadCount: asset.downloadCount || null,
    alternate: pickAlternate(release.assets, platform, asset),
    source,
  };
}

/** Offline / rate-limited snapshot of the newest known build. */
export function fallbackClientRelease(platform: ReleasePlatform): ClientRelease {
  return toClientRelease(platform, FALLBACK_RELEASES[platform], "fallback");
}
