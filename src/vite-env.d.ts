/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLARIFAI_API_KEY: string
  readonly VITE_SPOONACULAR_API_KEY: string
  readonly VITE_EDAMAM_APP_ID: string
  readonly VITE_EDAMAM_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
