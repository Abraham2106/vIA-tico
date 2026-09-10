import { useEffect, useState } from 'react'
import { Button, Form, NumberInput, Select, SelectItem } from '@carbon/react'
import { OptionsTile } from '@carbon/ibm-products'
import type { Policy, WorkspaceSnapshot } from '@viaticocero/core'
import type { ThemePreference } from '@viaticocero/ui-tokens'
import { PageScaffold } from '../components/PageScaffold'
import { useTheme } from '../theme/ThemeProvider'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
}

export function SettingsPage({ snapshot, api, onChange }: Props) {
  const { preference, setPreference } = useTheme()
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
    <PageScaffold title="Ajustes" subtitle="Política, emparejamiento DTO, tema Carbon y puertos QVAC.">
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

      <OptionsTile title="Emparejamiento" summary={pairingCode} open>
        <p className="cds--label-01">El celular envía analysis-job. La clave Hyperswarm queda vacía a propósito.</p>
        <p className="vz-num" style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
          {pairingCode}
        </p>
        <p className="cds--label-01">Inbox: {snapshot.pairing.inboxUrl ?? 'local'}</p>
        <Button kind="secondary" size="sm" onClick={() => void rotate()}>
          Rotar código
        </Button>
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

      <OptionsTile title="Puertos QVAC" summary={qvac ? 'Stub local' : 'Consultando…'} open>
        <ul className="cds--list--unordered">
          <li>ILanguageModel: {qvac?.llm ?? '…'}</li>
          <li>IQvacProvider: {qvac?.provider ?? '…'}</li>
          <li>IVisionInference: {qvac?.vision ?? '…'}</li>
        </ul>
      </OptionsTile>
    </PageScaffold>
  )
}
