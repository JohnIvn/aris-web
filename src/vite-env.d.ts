/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_URL: string;
  readonly VITE_SERVER_URL: string | null;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
