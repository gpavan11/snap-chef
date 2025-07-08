/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_GOOGLE_CLOUD_VISION_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly VITE_FOOD_API_KEY: string
  readonly VITE_EDAMAM_APP_ID: string
  readonly VITE_EDAMAM_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
