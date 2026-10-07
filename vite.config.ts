import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The preview environment reaches this dev server through a proxied host, so
// every host must be accepted and the server must bind outside loopback.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
