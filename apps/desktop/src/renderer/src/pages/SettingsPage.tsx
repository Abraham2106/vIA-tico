import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Form,
  InlineNotification,
  InlineLoading,
  NumberInput,
  ProgressBar,
  Select,
  SelectItem,
  Tag,
} from '@carbon/react'
import { OptionsTile } from '@carbon/ibm-products'
import type { Policy, WorkspaceSnapshot } from '@viaticocero/core'
import type { ThemePreference } from '@viaticocero/ui-tokens'
import { PageScaffold } from '../components/PageScaffold'
import { useTheme } from '../theme/ThemeProvider'
import type { DesktopApi, InboxStatus, QvacDesktopStatus, StorageInfo } from '../../../ports/desktop-api.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
}

function phaseTag(phase: string): { type: 'gray' | 'blue' | 'green' | 'red' | 'warm-gray'; label: string } {
  if (phase === 'ready' || phase === 'inferring') return { type: 'green', label: 'Listo' }
  if (phase === 'loading' || phase === 'unloading') return { type: 'blue', label: 'En curso' }
  if (phase === 'error') return { type: 'red', label: 'Error' }
  if (phase === 'idle') return { type: 'warm-gray', label: 'Sin cargar' }
  return { type: 'gray', label: phase }
}

export function SettingsPage({ snapshot, api, onChange }: Props) {
  const { preference, setPreference } = useTheme()
  const [policy, setPolicy] = useState<Policy>(snapshot.policy)
  const [qvac, setQvac] = useState<QvacDesktopStatus | null>(null)
  const [qvacLoading, setQvacLoading] = useState(true)
  const [qvacError, setQvacError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState(snapshot.pairing.pairingCode)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const [inbox, setInbox] = useState<InboxStatus | null>(null)

  const refreshQvac = useCallback(async () => {
    setQvacLoading(true)
    setQvacError(null)
    try {
      setQvac(await api.qvacStatus())
    } catch (error: unknown) {
      setQvacError(error instanceof Error ? error.message : String(error))
    } finally {
      setQvacLoading(false)
    }
  }, [api])

  useEffect(() => {
    void api.storageInfo().then(setStorage).catch(() => setStorage(null))
  }, [api])

  useEffect(() => {
    let active = true
    const refreshInbox = () => {
      void api.inboxStatus().then((status) => {
        if (active) setInbox(status)
      }).catch(() => {
        if (active) setInbox({ listening: false, lastError: 'No se pudo consultar el inbox.' })
      })
    }
    refreshInbox()
    const interval = window.setInterval(refreshInbox, 5_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [api])

  useEffect(() => {
    void refreshQvac()
    const stop = api.onQvacProgress?.((next) => {
      setQvac((current) =>
        current
          ? { ...current, llm: next.status ?? current.llm, progress: next }
          : current,
      )
    })
    return () => {
      stop?.()
    }
  }, [api, refreshQvac])

  const progress = qvac?.progress
  const tag = useMemo(() => phaseTag(progress?.phase ?? 'idle'), [progress?.phase])
  const loading =
    qvacLoading || progress?.phase === 'loading' || progress?.phase === 'unloading' || busy
  const wired = qvac?.llm !== 'not-wired'
  const statusError = qvacError ?? actionError ?? progress?.error

  async function save() {
    await api.updatePolicy(policy)
    await onChange()
  }

  async function rotate() {
    const next = await api.rotatePairing()
    setPairingCode(next.pairingCode)
    setCopyState('idle')
    await onChange()
  }

  async function copyPairingCode() {
    try {
      await navigator.clipboard.writeText(pairingCode)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  async function run(action: () => Promise<QvacDesktopStatus>) {
    setBusy(true)
    setActionError(null)
    try {
      setQvac(await action())
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
      setQvac(await api.qvacStatus())
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageScaffold title="Ajustes" subtitle="Topes de política, código para el celular, tema y el modelo Qwen en este equipo.">
      <Form
        aria-label="Política"
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <OptionsTile title="Política" summary="Topes de alimentación, hospedaje y comprobante" open>
          <NumberInput
            id="meal-cap"
            label="Tope alimentación / día"
            value={policy.dailyMealCap ?? 0}
            hideSteppers
            onChange={(_, state) => setPolicy({ ...policy, dailyMealCap: Number(state.value) })}
          />
          <NumberInput
            id="lodging-cap"
            label="Tope hospedaje / noche"
            value={policy.lodgingCapPerNight ?? 0}
            hideSteppers
            onChange={(_, state) => setPolicy({ ...policy, lodgingCapPerNight: Number(state.value) })}
          />
          <NumberInput
            id="max-receipt"
            label="Tope por comprobante"
            value={policy.maxReceiptAmount ?? 0}
            hideSteppers
            onChange={(_, state) => setPolicy({ ...policy, maxReceiptAmount: Number(state.value) })}
          />
          <Button type="submit" style={{ marginTop: '1rem' }}>
            Guardar política
          </Button>
        </OptionsTile>
      </Form>

      <OptionsTile
        title="Emparejamiento"
        summary={inbox?.listening ? 'Inbox HTTP escuchando' : inbox?.lastError ?? pairingCode}
        open
      >
        <p className="cds--label-01">El celular envía el gasto ya leído. No usamos la clave P2P de QVAC para el expediente.</p>
        <p className="vz-num" style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
          {pairingCode}
        </p>
        <p className="cds--label-01">
          Inbox LAN: {inbox?.url ?? snapshot.pairing.inboxUrl ?? 'sin URL'}
        </p>
        <p className="cds--label-01">
          {inbox?.listening
            ? `Escuchando en el puerto ${inbox.port}.`
            : `No está escuchando${inbox?.lastError ? `: ${inbox.lastError}` : '.'}`}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button kind="secondary" size="sm" onClick={() => void copyPairingCode()}>
            {copyState === 'copied' ? 'Código en portapapeles' : 'Copiar código'}
          </Button>
          <Button kind="ghost" size="sm" onClick={() => void rotate()}>
            Rotar código
          </Button>
        </div>
        {copyState === 'error' ? (
          <p className="cds--label-01" role="status" style={{ marginTop: '0.5rem' }}>
            No se pudo copiar. Selecciona el código y usa Ctrl+C.
          </p>
        ) : null}
      </OptionsTile>

      <OptionsTile
        title="Expediente"
        summary={
          storage?.location === 'file'
            ? 'SQLite 3 en este equipo'
            : storage?.location === 'indexeddb'
              ? 'SQLite 3 en IndexedDB'
              : 'SQLite 3'
        }
        open
      >
        <p className="cds--label-01">
          No hay servidor ni base en la nube. Viajes, comprobantes y excepciones viven en SQLite 3
          {storage?.location === 'file'
            ? ' (archivo local de Electron).'
            : ' compilado a WASM en este preview; Electron usa el mismo esquema en un archivo .sqlite.'}
        </p>
        {storage?.path ? (
          <p className="vz-num" style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>
            {storage.path}
          </p>
        ) : (
          <p className="cds--label-01" style={{ marginTop: '0.5rem' }}>
            Motor: {storage?.driver ?? 'sqlite3'} · ubicación: {storage?.location ?? '…'}
          </p>
        )}
      </OptionsTile>

      <OptionsTile title="Tema" summary={preference} open>
        <Select
          id="theme"
          labelText="Tema Carbon"
          value={preference}
          onChange={(event) => setPreference(event.target.value as ThemePreference)}
        >
          <SelectItem value="light" text="Gray 10 (claro)" />
          <SelectItem value="dark" text="Gray 90 (oscuro)" />
          <SelectItem value="auto" text="Según el sistema" />
        </Select>
      </OptionsTile>

      <OptionsTile
        title="Qwen Instruct"
        summary={qvacLoading ? 'Consultando estado…' : progress ? `${progress.catalogId} · ${tag.label}` : 'Estado no disponible'}
        open
      >
        <p className="cds--label-01">
          Postproceso lingüístico y classify-motive en este equipo. El modelo no emite PROCEDE ni cambia dígitos.
        </p>
        <div aria-live="polite" aria-atomic="true" style={{ marginTop: '0.75rem' }}>
          {qvacLoading ? <InlineLoading description="Consultando estado del motor…" /> : null}
          {!qvacLoading && progress ? <Tag type={tag.type}>{tag.label}</Tag> : null}
          <p style={{ marginTop: '0.5rem' }}>
            {qvacLoading
              ? 'El estado del runtime todavía no está confirmado.'
              : progress?.message ?? 'No se pudo confirmar el estado del runtime.'}
          </p>
        </div>
        {progress?.percent != null && progress.phase === 'loading' ? (
          <ProgressBar
            label="Descarga del modelo"
            helperText={`${Math.round(progress.percent)}%`}
            value={progress.percent}
          />
        ) : null}
        {progress?.phase === 'unloading' ? (
          <InlineLoading description="Liberando memoria del modelo…" status="active" />
        ) : null}
        {!qvacLoading && !wired ? (
          <InlineNotification
            kind="warning"
            title="Qwen no está cableado en este entorno"
            subtitle="El preview web no tiene acceso al runtime local. Abre ViáticoCero con Electron para cargar el modelo."
            lowContrast
            hideCloseButton
          />
        ) : null}
        {statusError ? (
          <InlineNotification
            kind="error"
            title="QVAC"
            subtitle={statusError}
            lowContrast
            hideCloseButton
          />
        ) : null}
        {qvacError && !qvac ? (
          <Button kind="secondary" size="sm" onClick={() => void refreshQvac()}>
            Reintentar consulta
          </Button>
        ) : null}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            disabled={!wired || loading || progress?.phase === 'ready' || progress?.phase === 'inferring'}
            onClick={() => void run(() => api.loadQwen())}
          >
            Cargar modelo
          </Button>
          <Button
            kind="secondary"
            size="sm"
            disabled={!wired || loading || progress?.phase === 'idle' || progress?.phase === 'error'}
            onClick={() => void run(() => api.unloadQwen())}
          >
            Liberar memoria
          </Button>
        </div>
        <ul className="cds--list--unordered" style={{ marginTop: '1rem' }}>
          <li>ILanguageModel: {qvac?.llm ?? '…'}</li>
          <li>IQvacProvider: {qvac?.provider ?? '…'}</li>
          <li>IVisionInference: {qvac?.vision ?? '…'}</li>
        </ul>
      </OptionsTile>
    </PageScaffold>
  )
}
