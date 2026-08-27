import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  server: {
    fs: {
      // Allow Vite and Slidev's import guard to follow symlinks into the repo's
      // shared public/ assets (team photos, brand, QR codes, screenshots).
      allow: [path.resolve(__dirname, '../..')]
    }
  }
})
