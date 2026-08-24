import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface CenteredOutcomeProps {
  media?: ReactNode
  heading?: string
  copy: ReactNode
  actions?: ReactNode
  animate?: boolean
}

export default function CenteredOutcome({ media, heading, copy, actions, animate = false }: CenteredOutcomeProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!animate || !media) return
    setPulse(true)
  }, [animate, media])

  return (
    <div className="thankyou-step">
      {media && (
        <div className={`thankyou-step__media${pulse ? ' animate__animated animate__pulse' : ''}`}>
          {media}
        </div>
      )}
      {heading && <h2 className="thankyou-step__heading">{heading}</h2>}
      <p className="thankyou-step__copy">{copy}</p>
      {actions}
      <p className="instr-powered">
        Powered by{' '}
        <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
          QuestionPro
        </a>
      </p>
    </div>
  )
}
