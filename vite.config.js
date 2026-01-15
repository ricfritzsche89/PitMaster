import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/PitMaster/', // GitHub Pages repository name
  plugins: [react()],
  server: {
    host: true // Expose to network (0.0.0.0)
  }
})
