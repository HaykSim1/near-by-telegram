/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string
  readonly VITE_DEV_AUTH_BYPASS?: string
  readonly VITE_DEV_EMAIL?: string
  readonly VITE_DEV_PASSWORD?: string
  /** When "true", logs auth/bootstrap hints to the console in dev (no secrets). */
  readonly VITE_DEV_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
