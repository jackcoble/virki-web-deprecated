import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA, type ManifestOptions } from "vite-plugin-pwa"

// PWA Manifest
const pwa_manifest = {
  name: "Authoriser",
  description: "Secure your two-factor authentication tokens with Authoriser.",
  orientation: "portrait",
  display: "standalone",
  start_url: "/"
} as ManifestOptions;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: pwa_manifest,
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:5001/',
        rewrite: path => path.replace('/api', ''),
        changeOrigin: true,
        secure: false
      }
    }
  }
})
