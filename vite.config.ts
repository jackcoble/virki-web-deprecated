import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { VitePWA } from 'vite-plugin-pwa'
import { comlink } from 'vite-plugin-comlink'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      }
    }),
    comlink()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    // @ts-ignore
    allowNodeBuiltins: ["pouchdb-browser", "pouchdb-utils"]
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
