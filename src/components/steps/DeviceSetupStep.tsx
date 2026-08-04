import { useCallback, useEffect, useRef, useState } from 'react'
import { WuButton, WuChip, WuIcon, WuSelect } from '@npm-questionpro/wick-ui-lib'
import cameraEmpty from '../../../assets/camera-empty.svg'
import { iconStyle } from '../../lib/icon'

const DEVICE_GROUPS = [
  { id: 'cameraMic', title: 'Camera & microphone' },
  { id: 'screenShare', title: 'Screen sharing' },
]

type MediaDevice = { id: string; label: string }
type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied'

type DeviceSetupStepProps = {
  onReadyChange?: (ready: boolean) => void
}

export default function DeviceSetupStep({ onReadyChange }: DeviceSetupStepProps) {
  const [permission, setPermission] = useState<PermissionState>('idle')
  const [cameras, setCameras] = useState<MediaDevice[]>([])
  const [microphones, setMicrophones] = useState<MediaDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [selectedMic, setSelectedMic] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [sharing, setSharing] = useState(false)
  const [screenName, setScreenName] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  const startScreenShare = useCallback(() => {
    if (!navigator.mediaDevices?.getDisplayMedia) return
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        selfBrowserSurface: 'include',
        monitorTypeSurfaces: 'include',
      } as DisplayMediaStreamOptions)
      .then((stream) => {
        screenStreamRef.current = stream
        const track = stream.getVideoTracks()[0]
        setScreenName(track?.label ?? '')
        track?.addEventListener('ended', () => {
          screenStreamRef.current = null
          setSharing(false)
          setScreenName('')
        })
        setSharing(true)
        if (screenRef.current) {
          screenRef.current.srcObject = stream
          screenRef.current.play().catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const startCamera = useCallback((deviceId?: string) => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    return navigator.mediaDevices
      .getUserMedia(deviceId ? { video: { deviceId: { exact: deviceId } } } : { video: true })
      .then((stream) => {
        cameraStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const startMic = useCallback((deviceId?: string) => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setAudioLevel(0)

    navigator.mediaDevices
      .getUserMedia(deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true })
      .then((stream) => {
        micStreamRef.current = stream
        const audioCtx = new AudioContext()
        audioCtxRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        const data = new Uint8Array(analyser.fftSize)
        const tick = () => {
          analyser.getByteTimeDomainData(data)
          let max = 0
          for (let i = 0; i < data.length; i++) {
            const v = Math.abs(data[i] - 128) / 128
            if (v > max) max = v
          }
          setAudioLevel(max)
          rafRef.current = requestAnimationFrame(tick)
        }
        tick()
      })
      .catch(() => setAudioLevel(0))
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermission('denied')
        return
      }
      setPermission('requesting')
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop())
          return navigator.mediaDevices.enumerateDevices()
        })
        .then((devices) => {
          if (cancelled) return
          setCameras(
            devices
              .filter((device) => device.kind === 'videoinput')
              .map((device) => ({ id: device.deviceId, label: device.label || 'Camera' })),
          )
          setMicrophones(
            devices
              .filter((device) => device.kind === 'audioinput')
              .map((device) => ({ id: device.deviceId, label: device.label || 'Microphone' })),
          )
          setPermission('granted')
          startCamera()
        })
        .catch(() => {
          if (!cancelled) setPermission('denied')
        })
    }, 3000)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [startCamera])

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
      micStreamRef.current?.getTracks().forEach((track) => track.stop())
      screenStreamRef.current?.getTracks().forEach((track) => track.stop())
      audioCtxRef.current?.close()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const canSelect = permission === 'granted'
  const cameraMicReady = canSelect && selectedCamera !== null && selectedMic !== null
  const allReady = cameraMicReady && sharing

  useEffect(() => {
    onReadyChange?.(allReady)
  }, [allReady, onReadyChange])

  return (
    <div className="device">
      {DEVICE_GROUPS.map((group) => {
        const ready =
          group.id === 'cameraMic' ? cameraMicReady : group.id === 'screenShare' ? sharing : false
        return (
          <div key={group.id} className="device-group">
            <div className="device-group-head">
              <WuChip variant="secondary" className="device-group-title">
                {group.title}
              </WuChip>
              <span className={`device-group-status${ready ? ' device-group-status--ready' : ''}`}>
                {ready ? 'Ready' : 'Pending'}
                {ready ? <WuIcon icon="wm-check" style={iconStyle(14, '#1b3380')} /> : null}
              </span>
            </div>
            <div className="device-group-body">
              {group.id === 'cameraMic' ? (
                <div className="device-camera-row">
                  <div className="device-camera-preview">
                    {permission === 'granted' ? (
                      <video ref={videoRef} className="device-camera-live" autoPlay playsInline muted />
                    ) : (
                      <img src={cameraEmpty} alt="Camera preview" />
                    )}
                  </div>
                  <div className="device-camera-selects">
                    <div className="device-camera-select-col">
                      <WuSelect
                        data={cameras}
                        accessorKey={{ value: 'id', label: 'label' }}
                        variant="outlined"
                        Label="Camera"
                        placeholder="Select camera"
                        disabled={!canSelect}
                        value={cameras.find((camera) => camera.id === selectedCamera) ?? null}
                        onSelect={(value) => {
                          const device = Array.isArray(value) ? value[0] : value
                          if (device) {
                            setSelectedCamera(device.id)
                            startCamera(device.id)
                          }
                        }}
                      />
                      <WuSelect
                        data={microphones}
                        accessorKey={{ value: 'id', label: 'label' }}
                        variant="outlined"
                        Label="Microphone"
                        placeholder="Select microphone"
                        disabled={!canSelect}
                        value={microphones.find((mic) => mic.id === selectedMic) ?? null}
                        onSelect={(value) => {
                          const device = Array.isArray(value) ? value[0] : value
                          if (device) {
                            setSelectedMic(device.id)
                            startMic(device.id)
                          }
                        }}
                      />
                      {selectedMic ? (
                        <div className="device-mic-level">
                          <WuIcon icon="wm-mic" style={iconStyle(16, '#6b6b6b')} />
                          <div className="device-mic-level-bar">
                            <div
                              className="device-mic-level-fill"
                              style={{ width: `${Math.min(Math.round(audioLevel * 100), 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : group.id === 'screenShare' ? (
                <div className="device-camera-row">
                  <div className={`device-screen-preview${sharing ? '' : ' device-screen-preview--standby'}`}>
                    {sharing ? (
                      <video ref={screenRef} className="device-camera-live" autoPlay playsInline muted />
                    ) : (
                      <div className="device-screen-standby">
                        <WuButton variant="secondary" onClick={startScreenShare}>
                          Share screen
                        </WuButton>
                      </div>
                    )}
                  </div>
                  <div className="device-screen-note">
                    {sharing ? (
                      <>
                        <span className="device-screen-note-text">{screenName}</span>
                        <WuButton variant="secondary" onClick={startScreenShare}>
                          Change screen selection
                        </WuButton>
                      </>
                    ) : (
                      <span className="device-screen-note-text">
                        Choose which browser window or screen you'll use during the test.
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
