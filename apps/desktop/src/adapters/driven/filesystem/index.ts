import type { IFileSystem } from '@viaticocero/core'

export class BrowserDownloadFs implements IFileSystem {
  async write(path: string, data: Uint8Array | string): Promise<void> {
    const blob = new Blob([typeof data === 'string' ? data : data.buffer as ArrayBuffer], {
      type: 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = path.split('/').pop() ?? 'archivo'
    link.click()
    URL.revokeObjectURL(url)
  }
  async read(): Promise<Uint8Array> {
    throw new Error('BrowserDownloadFs no lee del disco')
  }
  async exists(): Promise<boolean> {
    return false
  }
}
