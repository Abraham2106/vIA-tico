import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { tokens } from '@viaticocero/ui-tokens'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../packages/ui-tokens/tokens.css'),
  'utf8',
)

describe('content contrast tokens (WCAG AA body)', () => {
  it('oscurece secondary y tertiary en light', () => {
    expect(tokens.color.content.secondary.light).toBe('#4B5563')
    expect(tokens.color.content.tertiary.light).toBe('#6B7280')
  })

  it('aclara tertiary en dark', () => {
    expect(tokens.color.content.tertiary.dark).toBe('#9CA3AF')
  })

  it('mantiene el mismo valor en tokens.css', () => {
    expect(css).toMatch(/\[data-theme='light'\][\s\S]*--content-secondary:\s*#4[Bb]5563/)
    expect(css).toMatch(/\[data-theme='light'\][\s\S]*--content-tertiary:\s*#6[Bb]7280/)
    expect(css).toMatch(/\[data-theme='dark'\][\s\S]*--content-tertiary:\s*#9[Cc][Aa]3[Aa][Ff]/)
  })
})
