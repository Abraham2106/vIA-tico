import { join } from 'node:path'

export function resolveQvacConfigPath(input: {
  packaged: boolean
  resourcesPath: string
  unpackagedPath: string
  override?: string
}): string {
  if (input.override) return input.override
  if (input.packaged) return join(input.resourcesPath, 'qvac', 'qvac.config.json')
  return input.unpackagedPath
}
