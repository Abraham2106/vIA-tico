import { File, Paths } from 'expo-file-system'
import type { IFileSystem } from '@viaticocero/core'

/** Copia la URI de ImagePicker a un JPEG en caché. VisionPsy exige path en disco. */
export async function persistCaptureToCache(uri: string): Promise<string> {
  const dest = new File(Paths.cache, 'viaticocero-capture.jpg')
  if (dest.exists) dest.delete()
  new File(uri).copy(dest)
  return dest.uri
}

export function toQvacAttachmentPath(uri: string): string {
  return uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri
}

export class ExpoFileSystemAdapter implements IFileSystem {
  async write(path: string, data: Uint8Array | string): Promise<void> {
    const file = new File(path)
    if (!file.exists) file.create()
    file.write(data)
  }
  async read(path: string): Promise<Uint8Array> {
    return new File(path).bytes()
  }
  async exists(path: string): Promise<boolean> {
    return new File(path).exists
  }
}
