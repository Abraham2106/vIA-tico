import { useEffect, useState } from 'react'
import type { Policy, WorkspaceSnapshot } from '@viaticocero/core'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
}

export function SettingsPage({ snapshot, api, onChange }: Props) {
  const [policy, setPolicy] = useState<Policy>(snapshot.policy)
  const [qvac, setQvac] = useState<{ llm: string; provider: string; vision: string } | null>(null)
  const [pairingCode, setPairingCode] = useState(snapshot.pairing.pairingCode)

  useEffect(() => {
    void api.qvacStatus().then(setQvac)
  }, [api])

  async function save() {
    await api.updatePolicy(policy)
    await onChange()
  }

  async function rotate() {
    const next = await api.rotatePairing()
    setPairingCode(next.pairingCode)
    await onChange()
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Ajustes</h1>
          <p>Política, emparejamiento DTO y estado de puertos QVAC (aún no cableados).</p>
        </div>
      </div>
      <div className="detail">
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <strong>Política</strong>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              Tope alimentación / día
              <input
                type="number"
                value={policy.dailyMealCap ?? 0}
                onChange={(event) => setPolicy({ ...policy, dailyMealCap: Number(event.target.value) })}
              />
            </label>
            <label>
              Tope hospedaje / noche
              <input
                type="number"
                value={policy.lodgingCapPerNight ?? 0}
                onChange={(event) => setPolicy({ ...policy, lodgingCapPerNight: Number(event.target.value) })}
              />
            </label>
            <label>
              Tope por comprobante
              <input
                type="number"
                value={policy.maxReceiptAmount ?? 0}
                onChange={(event) => setPolicy({ ...policy, maxReceiptAmount: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit">
              Guardar política
            </button>
          </div>
        </form>
        <div className="card">
          <strong>Emparejamiento (DTO)</strong>
          <p className="muted">El celular envía analysis-job. La clave Hyperswarm queda vacía a propósito.</p>
          <p className="mono" style={{ fontSize: 28, margin: '8px 0' }}>
            {pairingCode}
          </p>
          <p className="muted">Inbox: {snapshot.pairing.inboxUrl ?? 'local'}</p>
          <button className="btn" onClick={() => void rotate()}>
            Rotar código
          </button>
          <hr style={{ borderColor: '#2a3542', margin: '18px 0' }} />
          <strong>Puertos QVAC</strong>
          <ul className="muted">
            <li>ILanguageModel: {qvac?.llm ?? '…'}</li>
            <li>IQvacProvider: {qvac?.provider ?? '…'}</li>
            <li>IVisionInference: {qvac?.vision ?? '…'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
