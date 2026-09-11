import { describe, expect, it } from 'vitest'
import type { ILanguageModel } from '@viaticocero/core'
import { createClassifyMotive } from '@viaticocero/core'

describe('classify-motive', () => {
  it('omite un motivo vacío', async () => {
    const model: ILanguageModel = {
      status: () => 'ready',
      refine: async (value) => value,
      classifyMotive: async () => {
        throw new Error('no debe inferir')
      },
    }

    const result = await createClassifyMotive(model).execute({ motivo: '  ' })

    expect(result).toEqual({ skipped: true, extraRules: [] })
  })

  it('clasifica solo mediante el puerto y agrega revisión si la confianza no es alta', async () => {
    const model: ILanguageModel = {
      status: () => 'ready',
      refine: async (value) => value,
      classifyMotive: async (input) => ({
        categoria: 'otro',
        razon: `Motivo recibido: ${input.motivo}`,
        confianza_clasificacion: 'baja',
      }),
    }

    const result = await createClassifyMotive(model).execute({ motivo: 'gastos varios' })

    expect(result.skipped).toBe(false)
    expect(result.classification?.categoria).toBe('otro')
    expect(result.extraRules[0]?.code).toBe('CONFIANZA_CLASIFICACION')
  })
})
