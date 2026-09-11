import { afterEach, describe, expect, it } from 'vitest'
import {
  draftToJob,
  getDraft,
  hasCaptureDraft,
  normalizeMotive,
  resetDraft,
  setDraft,
} from '../../../apps/mobile/src/state/draft.ts'

afterEach(() => {
  resetDraft()
})

describe('normalizeMotive / setDraft', () => {
  it('recorta el motivo libre y lo pone en el analysis-job', () => {
    setDraft({
      dto: {
        proveedor: 'Soda La Casita',
        monto: 8500,
        motivo: '  Almorcé con el cliente  ',
      },
    })

    const job = draftToJob()
    expect(getDraft().dto.motivo).toBe('Almorcé con el cliente')
    expect(job.visionResult.motivo).toBe('Almorcé con el cliente')
    expect(job.visionResult.proveedor).toBe('Soda La Casita')
    expect(job.visionResult).not.toHaveProperty('veredicto')
    expect(job).not.toHaveProperty('veredicto')
  })

  it('omite un motivo vacío; vacío es válido y no inventa veredicto', () => {
    setDraft({ dto: { motivo: '   ' } })

    const job = draftToJob()
    expect(normalizeMotive('   ')).toBeUndefined()
    expect(job.visionResult.motivo).toBeUndefined()
    expect(job.visionResult).not.toHaveProperty('motivo')
    expect(JSON.stringify(job)).not.toMatch(/veredicto/)
  })

  it('hasCaptureDraft es falso en el default y verdadero con proveedor o motivo', () => {
    expect(hasCaptureDraft()).toBe(false)
    setDraft({ dto: { proveedor: 'Peaje' } })
    expect(hasCaptureDraft()).toBe(true)
    resetDraft()
    setDraft({ dto: { motivo: 'Combustible del viaje' } })
    expect(hasCaptureDraft()).toBe(true)
  })

  it('el caso demo «Compré unas cosas» viaja en visionResult sin veredicto', () => {
    setDraft({ dto: { motivo: 'Compré unas cosas' } })
    const job = draftToJob()
    expect(job.visionResult.motivo).toBe('Compré unas cosas')
    expect(job.visionResult).not.toHaveProperty('veredicto')
  })
})
