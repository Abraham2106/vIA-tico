import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INBOX_URL,
  defaultStoredPairing,
  parseStoredPairing,
  serializePairing,
} from '../../../apps/mobile/src/state/pairing-persistence.ts'

describe('pairing persistence (puro)', () => {
  it('serializa pairingCode, inboxUrl y transport dto', () => {
    const raw = serializePairing({
      pairingCode: '  210614  ',
      inboxUrl: ' http://192.168.1.10:47821 ',
      transport: 'qvac-delegate',
    })
    expect(JSON.parse(raw)).toEqual({
      pairingCode: '210614',
      inboxUrl: 'http://192.168.1.10:47821',
      transport: 'dto',
    })
  })

  it('roundtrip conserva la LAN del escritorio', () => {
    const raw = serializePairing({
      pairingCode: '210614',
      inboxUrl: 'http://192.168.1.10:47821',
      transport: 'dto',
    })
    expect(parseStoredPairing(raw)).toEqual({
      pairingCode: '210614',
      inboxUrl: 'http://192.168.1.10:47821',
      transport: 'dto',
    })
  })

  it('inbox vacío o ausente vuelve al default 127.0.0.1:47821', () => {
    expect(parseStoredPairing('{"pairingCode":"210614","inboxUrl":"  ","transport":"dto"}')).toEqual({
      pairingCode: '210614',
      inboxUrl: DEFAULT_INBOX_URL,
      transport: 'dto',
    })
    expect(parseStoredPairing('{"pairingCode":"abcd"}').inboxUrl).toBe(DEFAULT_INBOX_URL)
    expect(defaultStoredPairing().inboxUrl).toBe('http://127.0.0.1:47821')
  })

  it('JSON inválido o extraño no rompe: default dto', () => {
    expect(parseStoredPairing('no-json')).toEqual(defaultStoredPairing())
    expect(parseStoredPairing('[]')).toEqual(defaultStoredPairing())
    expect(parseStoredPairing('null')).toEqual(defaultStoredPairing())
    expect(parseStoredPairing('{"transport":"qvac-delegate","pairingCode":1}').transport).toBe('dto')
  })
})
