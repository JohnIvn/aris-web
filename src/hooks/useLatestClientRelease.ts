import { useCallback, useEffect, useState } from "react";
import {
  fallbackClientRelease,
  fetchLatestRelease,
  toClientRelease,
  type ClientRelease,
  type ReleasePlatform,
} from "@/services/githubReleases";

export type ReleaseStatus = "loading" | "live" | "fallback";

/**
 * Loads the newest GitHub release for a client platform.
 *
 * The known-good snapshot is rendered immediately so the page never blocks on the
 * network, then it is replaced by live release data as soon as GitHub responds.
 */
export function useLatestClientRelease(platform: ReleasePlatform) {
  const [release, setRelease] = useState<ClientRelease>(() => fallbackClientRelease(platform));
  const [status, setStatus] = useState<ReleaseStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    fetchLatestRelease(platform)
      .then((latest) => {
        if (cancelled) return;
        try {
          setRelease(toClientRelease(platform, latest, "github"));
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Unreadable release data.");
          setRelease(fallbackClientRelease(platform));
        }
        setStatus("live");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setRelease(fallbackClientRelease(platform));
        setError(
          reason instanceof Error ? reason.message : "Unable to reach GitHub Releases.",
        );
        setStatus("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, [platform, revision]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  return { release, status, error, refresh };
}
