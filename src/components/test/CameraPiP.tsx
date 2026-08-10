import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { getStoredDevices } from '../../lib/deviceStore'

export type CameraPiPMode = 'off' | 'document' | 'video'

export interface CameraPiPHandle {
  open: () => void
  toggle: () => void
  close: () => void
  mode: CameraPiPMode
}

interface CameraPiPProps {
  autoOpen?: boolean
  onModeChange?: (mode: CameraPiPMode) => void
}

const PIP_WIDTH = 320
const PIP_HEIGHT = 240
const PIP_TITLE = 'Usability test'

function copyStylesToPip(pipDoc: Document) {
  ;[...document.styleSheets].forEach((sheet) => {
    try {
      const css = [...sheet.cssRules].map((rule) => rule.cssText).join('')
      const style = document.createElement('style')
      style.textContent = css
      pipDoc.head.appendChild(style)
    } catch {
      if (sheet.href) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = sheet.type
        link.media = sheet.media.mediaText
        link.href = sheet.href
        pipDoc.head.appendChild(link)
      }
    }
  })
}

function populatePipWindow(pipWin: Window, stream: MediaStream) {
  const doc = pipWin.document
  copyStylesToPip(doc)
  doc.title = PIP_TITLE
  doc.body.innerHTML = ''
  doc.body.style.background = '#101418'

  const wrap = doc.createElement('div')
  wrap.className = 'camera-pip'
  wrap.innerHTML = `
    <video class="camera-pip-video" autoplay playsinline muted></video>
  `
  doc.body.appendChild(wrap)

  const video = wrap.querySelector<HTMLVideoElement>('video')
  if (video) {
    video.srcObject = stream
    video.play().catch(() => {})
  }
}

function useCameraPiP(autoOpen: boolean, onModeChange?: (mode: CameraPiPMode) => void) {
  const [mode, setMode] = useState<CameraPiPMode>('off')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const pipWindowRef = useRef<Window | null>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)
  const openingRef = useRef(false)

  const modeRef = useRef<CameraPiPMode>('off')

  const setModeAndNotify = useCallback(
    (next: CameraPiPMode | ((prev: CameraPiPMode) => CameraPiPMode)) => {
      const resolved = typeof next === 'function' ? next(modeRef.current) : next
      modeRef.current = resolved
      setMode(resolved)
      onModeChange?.(resolved)
    },
    [onModeChange],
  )

  const ensureStream = useCallback(async (): Promise<MediaStream | null> => {
    if (streamRef.current && streamRef.current.active) return streamRef.current
    try {
      const { cameraId } = getStoredDevices()
      const next = await navigator.mediaDevices.getUserMedia(
        cameraId ? { video: { deviceId: { exact: cameraId } } } : { video: true },
      )
      streamRef.current = next
      setStream(next)
      return next
    } catch {
      return null
    }
  }, [])

  const openDocumentPip = useCallback(async (): Promise<boolean> => {
    const pip = window.documentPictureInPicture
    if (!pip) return false
    let pipWin: Window
    try {
      pipWin = await pip.requestWindow({ width: PIP_WIDTH, height: PIP_HEIGHT })
    } catch {
      return false
    }
    pipWindowRef.current = pipWin
    const stream = await ensureStream()
    if (!stream) {
      pipWin.close()
      pipWindowRef.current = null
      return false
    }
    populatePipWindow(pipWin, stream)
    pipWin.addEventListener('pagehide', () => {
      pipWindowRef.current = null
      setModeAndNotify((prev) => (prev === 'document' ? 'off' : prev))
    })
    setModeAndNotify('document')
    return true
  }, [ensureStream, setModeAndNotify])

  const openVideoPip = useCallback(async (): Promise<boolean> => {
    const stream = await ensureStream()
    const video = hiddenVideoRef.current
    if (!stream || !video || !('requestPictureInPicture' in video)) return false
    try {
      video.srcObject = stream
      video.play().catch(() => {})
      await video.requestPictureInPicture()
      setModeAndNotify('video')
      return true
    } catch {
      return false
    }
  }, [ensureStream, setModeAndNotify])

  const open = useCallback(async () => {
    if (openingRef.current || modeRef.current !== 'off') return
    openingRef.current = true
    try {
      if (window.documentPictureInPicture && (await openDocumentPip())) return
      await openVideoPip()
    } finally {
      openingRef.current = false
    }
  }, [openDocumentPip, openVideoPip])

  const close = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close()
      pipWindowRef.current = null
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {})
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = null
    setModeAndNotify('off')
  }, [setModeAndNotify])

  const toggle = useCallback(() => {
    if (mode === 'off') void open()
    else close()
  }, [mode, open, close])

  useEffect(() => {
    if (!autoOpen) return
    const timer = window.setTimeout(() => void open(), 600)
    return () => window.clearTimeout(timer)
  }, [autoOpen, open])

  useEffect(() => {
    const video = hiddenVideoRef.current
    if (!video) return
    const onLeave = () => {
      setModeAndNotify((prev) => (prev === 'video' ? 'off' : prev))
    }
    video.addEventListener('leavepictureinpicture', onLeave)
    return () => video.removeEventListener('leavepictureinpicture', onLeave)
  }, [setModeAndNotify])

  useEffect(() => {
    return () => {
      pipWindowRef.current?.close()
      pipWindowRef.current = null
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  return { mode, stream, hiddenVideoRef, open, toggle, close }
}

const CameraPiP = forwardRef<CameraPiPHandle, CameraPiPProps>(function CameraPiP(
  { autoOpen = true, onModeChange },
  ref,
) {
  const pip = useCameraPiP(autoOpen, onModeChange)

  useImperativeHandle(ref, () => ({ open: pip.open, toggle: pip.toggle, close: pip.close, mode: pip.mode }), [
    pip.open,
    pip.toggle,
    pip.close,
    pip.mode,
  ])

  useEffect(() => {
    if (!pip.stream) return
    if (pip.hiddenVideoRef.current && pip.hiddenVideoRef.current.srcObject !== pip.stream) {
      pip.hiddenVideoRef.current.srcObject = pip.stream
    }
  }, [pip.stream, pip.hiddenVideoRef])

  return (
    <video
      ref={pip.hiddenVideoRef}
      className="camera-pip-hidden"
      muted
      playsInline
      aria-hidden="true"
    />
  )
})

export default CameraPiP
