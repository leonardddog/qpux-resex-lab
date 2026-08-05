import StopwatchIcon from '../icons/StopwatchIcon'

interface TestTimerV2Props {
  remaining: number
  total: number
}

export default function TestTimerV2({ remaining, total }: TestTimerV2Props) {
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (remaining % 60).toString().padStart(2, '0')

  return (
    <div className="test-tools-timer-v2">
      <svg className="test-tools-ring-v2" viewBox="0 0 84 32" aria-hidden="true">
        <path
          className="test-tools-track-v2"
          d="M42 2 L68 2 A14 14 0 0 1 68 30 L16 30 A14 14 0 0 1 16 2 L42 2"
          pathLength={100}
        />
        <path
          className="test-tools-bar-v2"
          d="M42 2 L68 2 A14 14 0 0 1 68 30 L16 30 A14 14 0 0 1 16 2 L42 2"
          pathLength={100}
          style={{
            strokeDasharray: `${Math.min((remaining / total) * 100, 99.9)} 100`,
          }}
        />
      </svg>
      <StopwatchIcon size={16} color="var(--wu-color-gray-lead)" />
      <span className="test-tools-timer-v2-time">
        {minutes}:{seconds}
      </span>
    </div>
  )
}
