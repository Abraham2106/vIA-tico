import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

const workspace = fileURLToPath(new URL('../..', import.meta.url))
const aliases = {
  '@viaticocero/contracts': `${workspace}/packages/contracts/index.ts`,
  '@viaticocero/core': `${workspace}/packages/core/index.ts`,
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: aliases },
    build: {
      outDir: 'dist/main',
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
    },
  },
  renderer: {
    plugins: [react()],
    resolve: { alias: aliases },
    build: {
      outDir: 'dist/renderer',
    },
  },
})
