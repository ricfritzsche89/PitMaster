import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/PitMaster/', // GitHub Pages repository name
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg', 'react.svg'],
      manifest: {
        name: 'PitMaster Party Planner',
        short_name: 'PitMaster',
        description: 'Organisiere deine Partys wie ein Profi.',
        theme_color: '#22c55e',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  server: {
    host: true // Expose to network (0.0.0.0)
  }
})
