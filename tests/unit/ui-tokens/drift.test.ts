import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { feedbackForVerdict, tokens } from '@viaticocero/ui-tokens'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../packages/ui-tokens/tokens.css'),
  'utf8',
)

describe('ui-tokens CSS/TS drift (Sprint 2)', () => {
  it('unifica content.primary y border.default light', () => {
    expect(tokens.color.content.primary.light).toBe('#111827')
    expect(tokens.color.border.default.light).toBe('#E5E7EB')
    expect(css).toMatch(/\[data-theme='light'\][\s\S]*--content-primary:\s*#111827/)
    expect(css).toMatch(/\[data-theme='light'\][\s\S]*--border-default:\s*#e5e7eb/i)
  })

  it('define surface.header navy / gray', () => {
    expect(tokens.color.surface.header.light).toBe('#0A1628')
    expect(tokens.color.surface.header.dark).toBe('#111827')
    expect(css).toMatch(/\[data-theme='light'\][\s\S]*--surface-header:\s*#0a1628/i)
    expect(css).toMatch(/\[data-theme='dark'\][\s\S]*--surface-header:\s*#111827/i)
  })

  it('mapea REVISION a warning, no a un gris neutro', () => {
    expect(feedbackForVerdict('REVISION')).toBe('warning')
    expect(feedbackForVerdict('PROCEDE')).toBe('success')
    expect(feedbackForVerdict('NO_PROCEDE')).toBe('error')
  })
})
