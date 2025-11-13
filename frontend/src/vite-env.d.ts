interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ROBLE_API_URL: string
  readonly VITE_ROBLE_AUTH_URL: string
  readonly VITE_ROBLE_API_KEY: string
}

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}