/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `"true"` = always load demo feed; `"false"` = never; omit = demo only in `vite dev` */
  readonly VITE_USE_DEMO_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
