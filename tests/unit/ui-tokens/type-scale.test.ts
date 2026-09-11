import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { tokens } from '@viaticocero/ui-tokens'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../packages/ui-tokens/tokens.css'),
  'utf8',
)

describe('type scale, space, radius, elevation (Sprint 3)', () => {
  it('define la escala tipográfica semántica', () => {
    expect(tokens.type.scale.display).toEqual({ size: 22, weight: '600', lineHeight: 28 })
    expect(tokens.type.scale.heading).toEqual({ size: 16, weight: '600', lineHeight: 22 })
    expect(tokens.type.scale.subheading).toEqual({ size: 14, weight: '500', lineHeight: 20 })
    expect(tokens.type.scale.body).toEqual({ size: 14, weight: '400', lineHeight: 20 })
    expect(tokens.type.scale.bodySmall).toEqual({ size: 12, weight: '400', lineHeight: 16 })
    expect(tokens.type.scale.caption).toEqual({ size: 11, weight: '500', lineHeight: 14 })
    expect(tokens.type.scale.mono).toEqual({ size: 14, weight: '400', lineHeight: 20 })
    expect(tokens.type.fontFamily.mono).toBe('IBM Plex Mono')
  })

  it('expone elevation light en TS igual que tokens.css', () => {
    expect(tokens.elevation.low).toBe('0 1px 2px rgba(0, 0, 0, 0.05)')
    expect(tokens.elevation.medium).toBe('0 4px 6px rgba(0, 0, 0, 0.07)')
    expect(tokens.elevation.high).toBe('0 10px 15px rgba(0, 0, 0, 0.1)')
  })

  it('declara space y radius en CSS', () => {
    expect(css).toMatch(/--space-4:\s*16px/)
    expect(css).toMatch(/--space-8:\s*32px/)
    expect(css).toMatch(/--radius-md:\s*8px/)
    expect(css).toMatch(/--radius-lg:\s*12px/)
  })
})
