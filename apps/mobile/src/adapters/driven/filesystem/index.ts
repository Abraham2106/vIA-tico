import * as FileSystem from 'expo-file-system'
import type { IFileSystem } from '@viaticocero/core'

export class ExpoFileSystemAdapter implements IFileSystem {
  async write(path: string, data: Uint8Array | string): Promise<void> {
    const contents = typeof data === 'string' ? data : uint8ToBase64(data)
    await FileSystem.writeAsStringAsync(path, contents, {
      encoding: typeof data === 'string' ? FileSystem.EncodingType.UTF8 : FileSystem.EncodingType.Base64,
    })
  }
  async read(path: string): Promise<Uint8Array> {
    const base64 = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return base64ToUint8(base64)
  }
  async exists(path: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(path)
    return info.exists
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToUint8(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
