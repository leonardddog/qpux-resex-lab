import { WuAlert, WuCard, WuHeading, WuIcon, WuSubtext } from '@npm-questionpro/wick-ui-lib'
import { SCREENER_QUESTIONS, STUDY } from '../../data/study'
import { iconStyle } from '../../lib/icon'
import type { ParticipantDetails } from '../../types'

interface ReadyStepProps {
  details: ParticipantDetails
}

export default function ReadyStep({ details }: ReadyStepProps) {
  return (
    <div className="ready">
      <div className="ready-hero">
        <div className="ready-check">
          <WuIcon icon="wm-check" style={iconStyle(30)} />
        </div>
        <WuHeading size="lg" className="ready-title">
          You are all set, {details.name}
        </WuHeading>
        <WuSubtext size="md" className="ready-subtitle">
          Your setup is complete and your device is ready for the session.
        </WuSubtext>
      </div>

      <WuCard className="ready-summary">
        <div className="ready-summary-row">
          <WuSubtext size="sm" as="span" className="ready-summary-label">
            Study
          </WuSubtext>
          <span className="ready-summary-value">{STUDY.title}</span>
        </div>
        <div className="ready-summary-row">
          <WuSubtext size="sm" as="span" className="ready-summary-label">
            Participant
          </WuSubtext>
          <span className="ready-summary-value">
            {details.name} · {details.email}
          </span>
        </div>
        <div className="ready-summary-row">
          <WuSubtext size="sm" as="span" className="ready-summary-label">
            Reward
          </WuSubtext>
          <span className="ready-summary-value">{STUDY.incentive}</span>
        </div>
        <div className="ready-summary-row">
          <WuSubtext size="sm" as="span" className="ready-summary-label">
            Screener
          </WuSubtext>
          <span className="ready-summary-value">
            {SCREENER_QUESTIONS.length} questions answered
          </span>
        </div>
      </WuCard>

      <WuAlert variant="info" Icon={<WuIcon icon="wm-mic" style={iconStyle(16)} />}>
        Remember to think aloud during the test and allow screen recording when prompted.
      </WuAlert>
    </div>
  )
}
