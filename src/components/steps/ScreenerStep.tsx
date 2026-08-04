import { useState } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import { SCREENER_QUESTIONS } from '../../data/study'
import type { ScreenerAnswers } from '../../types'

interface ScreenerStepProps {
  answers: ScreenerAnswers
  onChange: (id: string, value: string) => void
  onComplete: () => void
  onScreenedOut: () => void
}

export default function ScreenerStep({ answers, onChange, onComplete, onScreenedOut }: ScreenerStepProps) {
  const [index, setIndex] = useState(0)

  const question = SCREENER_QUESTIONS[index]
  const selected = answers[question.id] ?? ''

  const handleContinue = () => {
    if (question.screenOutIf && selected === question.screenOutIf) {
      onScreenedOut()
    } else if (index < SCREENER_QUESTIONS.length - 1) {
      setIndex((i) => i + 1)
    } else {
      onComplete()
    }
  }

  return (
    <>
      <div
        className="screener-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={SCREENER_QUESTIONS.length}
        aria-valuenow={index + 1}
        aria-label="Screener progress"
      >
        {SCREENER_QUESTIONS.map((q, i) => (
          <span
            key={q.id}
            className={`screener-progress-seg ${i <= index ? 'is-active' : ''}`}
          />
        ))}
      </div>
      <div className="screener">
        <div key={question.id} className="screener-body">
          <h2 className="screener-question">
            {index + 1}. {question.question}
          </h2>
          {question.hint ? <p className="screener-hint">{question.hint}</p> : null}
          <fieldset className="screener-options">
            {question.options.map((option) => (
              <label key={option} className="screener-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={selected === option}
                  onChange={() => onChange(question.id, option)}
                />
                <span className="screener-indicator" aria-hidden="true" />
                <span className="screener-label">{option}</span>
              </label>
            ))}
          </fieldset>
          <div className="screener-actions">
            <WuButton className="screener-next" disabled={!selected} onClick={handleContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>
    </>
  )
}
