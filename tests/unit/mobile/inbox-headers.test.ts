import { describe, expect, it } from 'vitest'
import { inboxJobHeaders, PAIRING_CODE_HEADER } from '../../../apps/mobile/src/adapters/driven/inbox-headers.ts'

describe('inbox job headers', () => {
  it('manda X-Pairing-Code recortado junto al JSON', () => {
    expect(inboxJobHeaders('  210614  ')).toEqual({
      'Content-Type': 'application/json',
      [PAIRING_CODE_HEADER]: '210614',
    })
  })

  it('omite el header si el código está vacío', () => {
    expect(inboxJobHeaders('')).toEqual({ 'Content-Type': 'application/json' })
    expect(inboxJobHeaders()).toEqual({ 'Content-Type': 'application/json' })
  })
})
