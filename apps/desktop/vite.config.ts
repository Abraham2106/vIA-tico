import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { createInboxHttpServer } from './src/adapters/driven/inbox-http/server.ts'

const workspace = fileURLToPath(new URL('../..', import.meta.url))

function inboxHttpPlugin(): Plugin {
  let inbox = createInboxHttpServer()

  return {
    name: 'viaticocero-inbox-http',
    async configureServer(server) {
      await inbox.start()
      server.httpServer?.once('close', () => {
        void inbox.stop()
      })
    },
    transformIndexHtml(html) {
      const port = inbox.status().port ?? 47_821
      return html.replace(
        '</head>',
        `<script>window.__VIATICOCERO_INBOX_PORT__=${JSON.stringify(port)}</script></head>`,
      )
    },
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('./src/renderer', import.meta.url)),
  plugins: [react(), inboxHttpPlugin()],
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
