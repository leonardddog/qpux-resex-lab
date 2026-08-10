const STORAGE_KEY = 'qpux-resex-devices'

export interface StoredDevices {
  cameraId: string | null
  micId: string | null
}

export function getStoredDevices(): StoredDevices {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredDevices>
      return {
        cameraId: parsed.cameraId ?? null,
        micId: parsed.micId ?? null,
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return { cameraId: null, micId: null }
}

export function storeDevices(devices: StoredDevices): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(devices))
  } catch {
    // ignore storage errors
  }
}
