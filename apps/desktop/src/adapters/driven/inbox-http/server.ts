import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { networkInterfaces } from 'node:os'
import { parseAnalysisJob, type AnalysisJob } from '@viaticocero/contracts'

const DEFAULT_PORT = 47_821
const MAX_PORT_OFFSET = 4
const MAX_BODY_BYTES = 1_000_000

export type InboxStatus = {
  listening: boolean
  url?: string
  port?: number
  lastError?: string
}

export type InboxHttpServerOptions = {
  host?: string
  port?: number
  maxPort?: number
  getPairingCode?: () => Promise<string | undefined>
  onJob?: (job: AnalysisJob) => Promise<void>
}

export type InboxHttpServer = {
  start(): Promise<InboxStatus>
  stop(): Promise<void>
  status(): InboxStatus
}

/**
 * Inbox de producto para el DTO AnalysisJob (ADR 0008).
 * Mantiene una cola en memoria cuando el consumidor es el preview Vite.
 */
export function createInboxHttpServer(options: InboxHttpServerOptions = {}): InboxHttpServer {
  const host = options.host ?? '0.0.0.0'
  const preferredPort = options.port ?? DEFAULT_PORT
  const maxPort = options.maxPort ?? (preferredPort === 0 ? 0 : preferredPort + MAX_PORT_OFFSET)
  const pending = new Map<string, AnalysisJob>()
  let listening = false
  let port: number | undefined
  let lastError: string | undefined

  const server = createServer((request, response) => {
    void handleRequest(request, response)
  })

  server.on('error', (error) => {
    lastError = error.message
  })

  function status(): InboxStatus {
    return {
      listening,
      url: listening && port ? `http://${lanIpv4() ?? '127.0.0.1'}:${port}` : undefined,
      port,
      lastError,
    }
  }

  async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    setCors(response, status())
    const url = new URL(request.url ?? '/', 'http://viaticocero-inbox.local')

    if (request.method === 'OPTIONS') {
      response.writeHead(204)
      response.end()
      return
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      writeJson(response, 200, { ok: true, service: 'viaticocero-inbox' })
      return
    }

    if (request.method === 'GET' && url.pathname === '/jobs/pending') {
      writeJson(response, 200, { jobs: [...pending.values()] })
      return
    }

    if (request.method === 'POST' && url.pathname === '/jobs') {
      const expectedPairingCode = await options.getPairingCode?.()
      const receivedPairingCode = header(request, 'x-pairing-code') ?? url.searchParams.get('code') ?? undefined
      if (expectedPairingCode && receivedPairingCode !== expectedPairingCode) {
        writeJson(response, 401, { ok: false, error: 'Código de emparejamiento inválido' })
        return
      }

      let job: AnalysisJob
      try {
        job = parseAnalysisJob(JSON.parse(await readBody(request)))
      } catch {
        writeJson(response, 400, { ok: false, error: 'AnalysisJob inválido' })
        return
      }

      if (options.onJob) {
        try {
          await options.onJob(job)
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error)
          writeJson(response, 500, { ok: false, error: 'No se pudo ingresar el AnalysisJob' })
          return
        }
      } else {
        pending.set(job.id, job)
      }

      writeJson(response, 202, { ok: true, id: job.id })
      return
    }

    const acknowledgement = /^\/jobs\/([^/]+)\/ack$/.exec(url.pathname)
    if (request.method === 'POST' && acknowledgement) {
      const id = decodeURIComponent(acknowledgement[1]!)
      const acknowledged = pending.delete(id)
      writeJson(response, acknowledged ? 200 : 404, { ok: acknowledged, id })
      return
    }

    writeJson(response, 404, { ok: false, error: 'Ruta no encontrada' })
  }

  return {
    async start() {
      if (listening) return status()

      for (let candidate = preferredPort; candidate <= maxPort; candidate += 1) {
        try {
          await listen(server, host, candidate)
          const address = server.address()
          port = typeof address === 'object' && address ? address.port : candidate
          listening = true
          lastError = undefined
          return status()
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error)
          if (!isAddressInUse(error) || candidate === maxPort) break
        }
      }

      return status()
    },
    async stop() {
      if (!listening) return
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
      listening = false
      port = undefined
    },
    status,
  }
}

function setCors(response: ServerResponse, inbox: InboxStatus): void {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Pairing-Code')
  response.setHeader('Access-Control-Expose-Headers', 'X-Inbox-Url, X-Inbox-Port')
  if (inbox.url) response.setHeader('X-Inbox-Url', inbox.url)
  if (inbox.port) response.setHeader('X-Inbox-Port', String(inbox.port))
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

async function readBody(request: IncomingMessage): Promise<string> {
  let body = ''
  for await (const chunk of request) {
    body += String(chunk)
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      throw new Error('Body demasiado grande')
    }
  }
  return body
}

function header(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name]
  return Array.isArray(value) ? value[0] : value
}

function listen(server: Server, host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onListening = () => {
      cleanup()
      resolve()
    }
    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }
    const cleanup = () => {
      server.off('listening', onListening)
      server.off('error', onError)
    }
    server.once('listening', onListening)
    server.once('error', onError)
    server.listen({ host, port })
  })
}

function isAddressInUse(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EADDRINUSE'
}

export function lanIpv4(interfaces: ReturnType<typeof networkInterfaces> = networkInterfaces()): string | undefined {
  for (const network of Object.values(interfaces)) {
    const address = network?.find((item) => item.family === 'IPv4' && !item.internal)
    if (address) return address.address
  }
  return undefined
}
