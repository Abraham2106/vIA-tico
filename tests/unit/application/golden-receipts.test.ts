import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  createMemoryDeps,
  createWorkspace,
  DEMO_TRAVELER,
  DEMO_TRIP,
  parseVisionResult,
  type Verdict,
  type VisionResult,
} from '@viaticocero/core'

type GoldenFixture = {
  id: string
  expected: {
    verdict: Verdict
    rules: string[]
  }
  extraction: VisionResult
}

const fixtureNames = [
  'procede-nitido',
  'revision-fuera-periodo',
  'revision-duplicado',
  'revision-confianza-baja',
  'no-procede-hospedaje-tope',
  'revision-motivo-ambiguo',
]

function readGoldenFixture(name: string): GoldenFixture {
  const path = fileURLToPath(
    new URL(`../../../apps/mobile/resources/samples/receipts/${name}.json`, import.meta.url),
  )
  const fixture = JSON.parse(readFileSync(path, 'utf8')) as GoldenFixture
  return { ...fixture, extraction: parseVisionResult(fixture.extraction) }
}

describe('golden receipts de la cuña', () => {
  it('aplica los veredictos esperados con el viaje y política demo, sin GPU', async () => {
    const workspace = createWorkspace(createMemoryDeps())
    await workspace.deps.travelers.save(DEMO_TRAVELER)
    await workspace.deps.trips.save(DEMO_TRIP)

    for (const name of fixtureNames) {
      const fixture = readGoldenFixture(name)
      const receipt = await workspace.attachReceipt({
        tripId: DEMO_TRIP.id,
        extraction: fixture.extraction,
      })

      expect(receipt.verdict, fixture.id).toBe(fixture.expected.verdict)
      expect(receipt.triggeredRules.map((rule) => rule.code), fixture.id).toEqual(fixture.expected.rules)
    }
  })
})
