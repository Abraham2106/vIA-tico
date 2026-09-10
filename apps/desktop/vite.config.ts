import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const workspace = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('./src/renderer', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      '@viaticocero/contracts': `${workspace}/packages/contracts/index.ts`,
      '@viaticocero/core': `${workspace}/packages/core/index.ts`,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/renderer', import.meta.url)),
    emptyOutDir: true,
  },
})
