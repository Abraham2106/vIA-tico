import { describe, expect, it } from 'vitest'
import { parseVisionpsyCompletion } from '../../../apps/mobile/src/adapters/driven/qvac-visionpsy/parse.ts'
import { imageNoUpscaleFor } from '../../../apps/mobile/src/adapters/driven/qvac-visionpsy/profile.ts'

describe('parseVisionpsyCompletion', () => {
  it('acepta JSON del contrato vision-result', () => {
    const parsed = parseVisionpsyCompletion(
      JSON.stringify({
        proveedor: 'Soda La Casita',
        fecha: '2026-09-12',
        monto: 8500,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA LA CASITA 8500 CRC',
        categoria: 'alimentacion',
      }),
    )
    expect(parsed.proveedor).toBe('Soda La Casita')
    expect(parsed.monto).toBe(8500)
  })

  it('extrae JSON envuelto en markdown sin inventar campos', () => {
    const parsed = parseVisionpsyCompletion(`\`\`\`json
{"proveedor":"Peaje","fecha":"2026-09-11","monto":1200,"moneda":"CRC","tipo_documento":"ticket","confianza_lectura":"media","raw_text":"PEAJE 1200"}
\`\`\``)
    expect(parsed.tipo_documento).toBe('ticket')
    expect(parsed.confianza_lectura).toBe('media')
  })

  it('rechaza salida que no cumple el schema', () => {
    expect(() =>
      parseVisionpsyCompletion(
        JSON.stringify({
          proveedor: 'X',
          fecha: '12/09/2026',
          monto: 1,
          moneda: 'CRC',
          tipo_documento: 'recibo',
          confianza_lectura: 'alta',
          raw_text: '',
        }),
      ),
    ).toThrow(/schema/i)
  })
})

describe('perfil VisionPsy', () => {
  it('Flash usa image_no_upscale on y Base no setea el flag', () => {
    expect(imageNoUpscaleFor('flash')).toBe('on')
    expect(imageNoUpscaleFor('base')).toBeUndefined()
  })
})
