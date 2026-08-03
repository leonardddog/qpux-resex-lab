import { WuAlert, WuButton, WuCard, WuChip, WuIcon, WuSubtext, WuText } from '@npm-questionpro/wick-ui-lib'
import { DEVICE_CHECKS } from '../../data/study'
import { iconStyle } from '../../lib/icon'
import type { DeviceCheckId, DeviceCheckState } from '../../types'

const BROWSER = detectBrowser()
const OS = detectOs()

interface DeviceSetupStepProps {
  checks: DeviceCheckState
  onRun: (id: DeviceCheckId) => void
  onRunAll: () => void
}

const STATUS_UI: Record<string, { label: string; color?: 'success' | 'warning' | 'danger' }> = {
  idle: { label: 'Not tested' },
  running: { label: 'Checking…', color: 'warning' },
  passed: { label: 'Ready', color: 'success' },
  failed: { label: 'Needs attention', color: 'danger' },
}

export default function DeviceSetupStep({ checks, onRun, onRunAll }: DeviceSetupStepProps) {
  const allPassed = DEVICE_CHECKS.every((c) => checks[c.id] === 'passed')
  const running = DEVICE_CHECKS.some((c) => checks[c.id] === 'running')

  return (
    <div className="device">
      <WuAlert Icon={<WuIcon icon="wm-lock" style={iconStyle(16)} />}>
        When your browser asks for permission, allow camera and microphone access. You can change this
        later in your browser settings.
      </WuAlert>

      <div className="device-preview">
        <div className="device-cam">
          <WuIcon icon="wm-videocam" style={iconStyle(40, 'rgba(255,255,255,0.85)')} />
          <WuSubtext size="sm" className="device-cam-note">
            Camera preview
          </WuSubtext>
        </div>
        <div className="device-spec">
          <WuSubtext size="sm" as="span">
            Detected
          </WuSubtext>
          <WuText size="md">{BROWSER}</WuText>
          <WuSubtext size="sm" as="span">
            {OS}
          </WuSubtext>
        </div>
      </div>

      <div className="device-checks">
        {DEVICE_CHECKS.map((check) => {
          const status = checks[check.id]
          const ui = STATUS_UI[status]
          return (
            <WuCard key={check.id} className="device-check">
              <div className="device-check-icon">
                <WuIcon icon={check.icon} style={iconStyle(22, 'var(--wu-color-blue-p)')} />
              </div>
              <div className="device-check-info">
                <WuSubtext size="md" as="span" className="device-check-label">
                  {check.label}
                </WuSubtext>
                <WuSubtext size="sm" className="device-check-desc">
                  {check.description}
                </WuSubtext>
              </div>
              <WuChip
                size="sm"
                variant="secondary"
                color={ui.color}
                className="chip-icon"
              >
                {status === 'running' ? (
                  <WuIcon icon="wm-sync" style={iconStyle(14)} className="spin" />
                ) : status === 'passed' ? (
                  <WuIcon icon="wm-check" style={iconStyle(14)} />
                ) : null}
                {ui.label}
              </WuChip>
              <WuButton
                size="sm"
                variant={status === 'passed' ? 'secondary' : 'outlined'}
                disabled={status === 'running'}
                onClick={() => onRun(check.id)}
              >
                {status === 'passed' ? 'Retest' : 'Test'}
              </WuButton>
            </WuCard>
          )
        })}
      </div>

      <div className="device-actions">
        <WuButton variant="outlined" onClick={onRunAll} disabled={running}>
          Run all checks
        </WuButton>
        {allPassed ? (
          <WuText size="sm" className="device-all-ok">
            <WuIcon icon="wm-verified" style={iconStyle(16, 'var(--wu-color-green-deep)')} /> Everything
            looks good.
          </WuText>
        ) : null}
      </div>
    </div>
  )
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Microsoft Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Mozilla Firefox'
  if (/Chrome\//.test(ua)) return 'Google Chrome'
  if (/Safari\//.test(ua)) return 'Apple Safari'
  return 'A supported browser'
}

function detectOs(): string {
  const ua = navigator.userAgent
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Your operating system'
}
