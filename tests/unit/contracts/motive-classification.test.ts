import { describe, expect, it } from 'vitest'
import { parseMotiveClassification } from '@viaticocero/contracts'

describe('motiveClassificationSchema', () => {
  it('acepta únicamente la clasificación sin veredicto', () => {
    expect(
      parseMotiveClassification({
        categoria: 'alimentacion',
        razon: 'Almuerzo durante el viaje',
        confianza_clasificacion: 'alta',
      }),
    ).toEqual({
      categoria: 'alimentacion',
      razon: 'Almuerzo durante el viaje',
      confianza_clasificacion: 'alta',
    })
  })

  it('rechaza un veredicto extra por contrato estricto', () => {
    expect(() =>
      parseMotiveClassification({
        categoria: 'otro',
        razon: 'Motivo ambiguo',
        confianza_clasificacion: 'baja',
        veredicto: 'PROCEDE',
      }),
    ).toThrow()
  })
})
