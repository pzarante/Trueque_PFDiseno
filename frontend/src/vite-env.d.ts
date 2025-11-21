/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FRONTEND_URL: string
  readonly VITE_FRONTEND_PORT: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly VITE_ROBLE_AUTH_URL: string
  readonly VITE_ROBLE_DB_URL: string
  readonly VITE_DB_NAME?: string
  readonly VITE_ROBLE_EMAIL?: string
  readonly VITE_ROBLE_PASSWORD?: string
  readonly VITE_PORT?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

