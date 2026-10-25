import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/services/apiClient";

type GoogleProfile = {
  email: string;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
};

type GoogleCredentialResponse = { credential: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

export default function GoogleOAuthButton({
  token,
  onVerified,
  onClear,
}: {
  token: string;
  onVerified: (token: string, profile: GoogleProfile) => void;
  onClear: () => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (token || !clientId || !buttonRef.current) return;

    const render = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            setError(null);
            const response = await apiClient.post<{ ok: boolean; data?: GoogleProfile; message?: string }>("/auth/google/profile", {
              id_token: credential,
              platform: "web",
            });
            if (!response.data.ok || !response.data.data) {
              throw new Error(response.data.message ?? "Google account verification failed.");
            }
            setProfile(response.data.data);
            onVerified(credential, response.data.data);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Google account verification failed.");
          }
        },
      });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: "240",
      });
    };

    if (window.google) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => setError("Unable to load Google sign-in.");
    document.head.appendChild(script);
  }, [clientId, onVerified, token]);

  if (token) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#b9ddc2] bg-[#f0f9f2] px-3 py-2.5">
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f7043] text-white" aria-hidden="true">✓</span>
          )}
          <div>
            <p className="text-[12.5px] font-semibold text-[#2f7043]">Verified Google account</p>
            <p className="text-[11px] text-[#5f8068]">{profile?.email ?? "The account details were filled from Google."}</p>
          </div>
        </div>
        <button type="button" onClick={() => { setProfile(null); onClear(); }} className="text-[11px] font-medium text-[#2f7043] hover:underline">Change</button>
      </div>
    );
  }

  return (
    <div>
      {clientId ? <div ref={buttonRef} /> : <p className="text-[12px] text-red-700">Google OAuth is not configured for this web app.</p>}
      {error && <p role="alert" className="mt-1 text-[12px] text-red-700">{error}</p>}
    </div>
  );
}
