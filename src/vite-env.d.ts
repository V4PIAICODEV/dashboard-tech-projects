/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_GRUPO1: string;
  readonly VITE_WEBHOOK_GRUPO2: string;
  readonly VITE_WEBHOOK_GRUPO3: string;
  readonly VITE_WEBHOOK_GRUPO4: string;
  readonly VITE_AUTH_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
