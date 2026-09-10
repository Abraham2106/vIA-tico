export type CapturedImage = {
  path: string
  mimeType: string
}

export interface ICamera {
  capture(): Promise<CapturedImage>
}
