import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const workspace = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('./src/renderer', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@viaticocero/ui-tokens/tokens.css',
        replacement: `${workspace}/packages/ui-tokens/tokens.css`,
      },
      {
        find: '@viaticocero/ui-tokens',
        replacement: `${workspace}/packages/ui-tokens/index.ts`,
      },
      {
        find: '@viaticocero/contracts',
        replacement: `${workspace}/packages/contracts/index.ts`,
      },
      {
        find: '@viaticocero/core',
        replacement: `${workspace}/packages/core/index.ts`,
      },
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    outDir: fileURLToPath(new URL('./dist/renderer', import.meta.url)),
    emptyOutDir: true,
  },
})
