import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honor the PORT env var (the preview harness assigns one) so the dev
    // server is reachable at the expected address; fall back to Vite's default.
    port: Number(process.env.PORT) || 5173,
  },
})
