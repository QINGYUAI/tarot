/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_PATH: string
  readonly VITE_OUT_DIR: string
  readonly VITE_AI_MODELS: string
  readonly VITE_DEFAULT_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
