/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_DESKTOP_REPO?: string;
  readonly VITE_GITHUB_MOBILE_REPO?: string;
  readonly VITE_GITHUB_TOKEN?: string;
  readonly VITE_GITHUB_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
