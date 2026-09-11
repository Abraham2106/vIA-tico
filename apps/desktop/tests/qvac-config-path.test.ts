import { describe, expect, it } from 'vitest'
import { resolveQvacConfigPath } from '../src/composition/qvac-config-path.ts'

describe('ruta de qvac.config en Electron empaquetado', () => {
  it('usa extraResources cuando la app ya está instalada', () => {
    expect(
      resolveQvacConfigPath({
        packaged: true,
        resourcesPath: '/opt/ViaticoCero/resources',
        unpackagedPath: '/dev/src/config/qvac/qvac.config.json',
      }),
    ).toBe('/opt/ViaticoCero/resources/qvac/qvac.config.json')
  })

  it('respeta VIATICOCERO / QVAC_CONFIG_PATH si ya viene en el entorno', () => {
    expect(
      resolveQvacConfigPath({
        packaged: true,
        resourcesPath: '/opt/ViaticoCero/resources',
        unpackagedPath: '/dev/src/config/qvac/qvac.config.json',
        override: '/tmp/custom.json',
      }),
    ).toBe('/tmp/custom.json')
  })
})
