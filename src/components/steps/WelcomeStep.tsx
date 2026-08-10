import { WuChip, WuIcon } from '@npm-questionpro/wick-ui-lib'
import { STUDY } from '../../data/study'
import { iconStyle } from '../../lib/icon'
import StopwatchIcon from '../icons/StopwatchIcon'

export default function WelcomePanel() {
  return (
    <div className="welcome-panel">
      <div className="instr-group">
        <div className="instr-intro">
          <p>
            Welcome, and thanks for taking part in this usability test! You&apos;ll complete a few
            tasks while we observe how you interact with it.
          </p>
          <p>
            There are no right or wrong answers, we just want to learn from your experience.
          </p>
        </div>
        <WuChip size="md" variant="secondary" className="chip-icon instr-chip">
          <span style={{ display: 'inline-flex', transform: 'translateY(1px)' }}>
            <StopwatchIcon size={12} />
          </span>
          About {STUDY.durationMinutes} minutes
        </WuChip>
      </div>
      <div className="instr-group">
        <p className="instr-disclaimer">This study requires the following permissions:</p>
        <div className="instr-permissions">
          <WuChip size="md" variant="secondary" className="chip-icon">
            <WuIcon icon="wm-videocam" style={{ ...iconStyle(12), transform: 'translateY(1px)' }} />
            Camera
          </WuChip>
          <WuChip size="md" variant="secondary" className="chip-icon">
            <WuIcon icon="wm-mic" style={{ ...iconStyle(12), transform: 'translateY(1px)' }} />
            Microphone
          </WuChip>
          <WuChip size="md" variant="secondary" className="chip-icon">
            <WuIcon
              icon="wm-screen-share"
              style={{ ...iconStyle(12), transform: 'translateY(1px)' }}
            />
            Screen sharing
          </WuChip>
        </div>
      </div>
    </div>
  )
}
