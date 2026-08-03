import { WuCard, WuHeading, WuRadioGroup, WuSubtext } from '@npm-questionpro/wick-ui-lib'
import { SCREENER_QUESTIONS } from '../../data/study'
import type { ScreenerAnswers } from '../../types'

interface ScreenerStepProps {
  answers: ScreenerAnswers
  onChange: (id: string, value: string) => void
}

export default function ScreenerStep({ answers, onChange }: ScreenerStepProps) {
  return (
    <div className="screener">
      {SCREENER_QUESTIONS.map((q, i) => (
        <WuCard key={q.id} className="screener-card">
          <div className="screener-q">
            <span className="screener-index">{i + 1}</span>
            <div>
              <WuHeading size="sm" className="screener-question">
                {q.question}
              </WuHeading>
              {q.hint ? (
                <WuSubtext size="sm" className="screener-hint">
                  {q.hint}
                </WuSubtext>
              ) : null}
            </div>
          </div>
          <WuRadioGroup
            orientation="vertical"
            value={answers[q.id] ?? ''}
            onChange={(value) => onChange(q.id, value)}
            options={q.options.map((option) => ({ value: option, label: option }))}
          />
        </WuCard>
      ))}
    </div>
  )
}
