export interface IFileSystem {
  write(path: string, data: Uint8Array | string): Promise<void>
  read(path: string): Promise<Uint8Array>
  exists(path: string): Promise<boolean>
}
