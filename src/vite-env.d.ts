/// <reference types="vite/client" />

declare module '*.pdf' {
  const src: string
  export default src
}

interface DocumentPictureInPicture {
  readonly window: Window | null
  requestWindow(options?: {
    width?: number
    height?: number
    disallowReturnToOpener?: boolean
    preferInitialWindowPlacement?: boolean
  }): Promise<Window>
  addEventListener(type: 'enter', listener: (event: { window: Window }) => void): void
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture
}
