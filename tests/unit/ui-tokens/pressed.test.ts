import { describe, expect, it } from 'vitest'
import { pressedStyle, tokens } from '@viaticocero/ui-tokens'

describe('pressed feedback (Sprint 4)', () => {
  it('define opacidad de pressed distinta de disabled', () => {
    expect(tokens.motion.pressedOpacity).toBe(0.72)
    expect(tokens.motion.pressedOpacity).toBeGreaterThan(0.4)
    expect(tokens.motion.pressedOpacity).toBeLessThan(1)
  })

  it('pressedStyle solo aplica opacidad cuando está presionado', () => {
    expect(pressedStyle(false)).toBeNull()
    expect(pressedStyle(true)).toEqual({ opacity: 0.72 })
  })
})
