import { Fragment, useEffect, useRef, useState } from 'react'
import { WuButton, WuChip } from '@npm-questionpro/wick-ui-lib'
import { POST_TEST_QUESTIONS, SUS_QUESTIONS, SUS_SCALE } from '../../data/study'
import type { PostTestAnswers, PostTestQuestion } from '../../types'

interface PostTestSurveyProps {
  answers: PostTestAnswers
  onChange: (id: string, value: string | string[]) => void
}

export default function PostTestSurvey({ answers, onChange }: PostTestSurveyProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const susRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [stage, setStage] = useState<'survey' | 'sus'>('survey')
  const [susAnswers, setSusAnswers] = useState<Record<number, number>>({})

  const allAnswered = POST_TEST_QUESTIONS.every((question) => {
    const value = answers[question.id]
    return Array.isArray(value) ? value.length > 0 : typeof value === 'string' && value.trim() !== ''
  })

  const susComplete = SUS_QUESTIONS.every((_, index) => susAnswers[index] !== undefined)

  useEffect(() => {
    const container = stage === 'survey' ? groupRef.current : susRef.current
    if (!container) return
    const scroller = container.closest<HTMLElement>('.split-right')
    if (!scroller) return

    const itemSelector = stage === 'survey' ? '.post-survey-question' : '.sus-item'

    const update = () => {
      const items = container.querySelectorAll<HTMLElement>(itemSelector)
      if (items.length === 0) return
      const rect = scroller.getBoundingClientRect()
      const line = rect.top + rect.height / 2
      const lower: number[] = []
      let prevBottom = -Infinity
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        lower.push(prevBottom === -Infinity ? -Infinity : (prevBottom + itemRect.top) / 2)
        prevBottom = itemRect.bottom
      })
      let active = 0
      for (let i = items.length - 1; i >= 0; i--) {
        const upper = i < items.length - 1 ? lower[i + 1] : Infinity
        if (line >= lower[i] && line < upper) {
          active = i
          break
        }
      }
      if (scroller.scrollTop <= 0) active = 0
      if (scroller.scrollTop >= scroller.scrollHeight - scroller.clientHeight - 1) {
        active = items.length - 1
      }
      setActiveIndex(active)
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      scroller.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [stage])

  return (
    <div className="post-survey">
      <div className="post-survey-chip-group">
        <WuChip size="md" variant="primary" className="post-survey-chip">
          {stage === 'survey' ? 'Post-test survey' : 'Usability questionnaire'}
        </WuChip>
      </div>
      {stage === 'survey' ? (
        <div className="post-survey-question-group" ref={groupRef}>
          {POST_TEST_QUESTIONS.map((question, index) => (
            <Fragment key={question.id}>
              <div className={activeIndex === index ? 'post-survey-question is-active' : 'post-survey-question'}>
                <h3 className="screener-question">
                  {index + 1}. {question.question}
                </h3>
                {question.hint ? <p className="screener-hint">{question.hint}</p> : null}
                <QuestionControl
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => onChange(question.id, value)}
                />
              </div>
              {index < POST_TEST_QUESTIONS.length - 1 ? (
                <div className="post-survey-separator" aria-hidden="true" />
              ) : null}
            </Fragment>
          ))}
          <div className="post-survey-actions">
            <WuButton
              className="post-survey-continue"
              disabled={!allAnswered}
              onClick={() => {
                groupRef.current?.closest<HTMLElement>('.split-right')?.scrollTo({ top: 0 })
                setStage('sus')
              }}
            >
              Continue
            </WuButton>
          </div>
          <div className="post-survey-end" aria-hidden="true" />
        </div>
      ) : (
        <div className="sus" ref={susRef}>
          {SUS_QUESTIONS.map((statement, index) => (
            <Fragment key={statement}>
              <div className={activeIndex === index ? 'sus-item is-active' : 'sus-item'}>
                <p className="screener-question">
                  {index + 1}. {statement}
                </p>
                <div className="sus-scale">
                  {Array.from(
                    { length: SUS_SCALE.max - SUS_SCALE.min + 1 },
                    (_, i) => SUS_SCALE.min + i,
                  ).map((value) => (
                    <label key={value} className="sus-option">
                      <input
                        type="radio"
                        name={`sus-${index}`}
                        value={value}
                        checked={susAnswers[index] === value}
                        onChange={() => setSusAnswers((prev) => ({ ...prev, [index]: value }))}
                      />
                      <span className="sus-option-label">{value}</span>
                    </label>
                  ))}
                </div>
                <div className="sus-legend">
                  <span>Strongly disagree</span>
                  <span>Strongly agree</span>
                </div>
              </div>
              {index < SUS_QUESTIONS.length - 1 ? (
                <div className="post-survey-separator" aria-hidden="true" />
              ) : null}
            </Fragment>
          ))}
          <div className="post-survey-actions">
            <WuButton className="post-survey-continue" disabled={!susComplete}>
              Submit
            </WuButton>
          </div>
          <div className="post-survey-end" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

interface QuestionControlProps {
  question: PostTestQuestion
  value?: string | string[]
  onChange: (value: string | string[]) => void
}

function QuestionControl({ question, value, onChange }: QuestionControlProps) {
  switch (question.type) {
    case 'multiple':
      return <MultipleControl question={question} value={value} onChange={onChange} />
    case 'text':
      return <TextControl question={question} value={value} onChange={onChange} />
    case 'slider':
      return <SliderControl question={question} value={value} onChange={onChange} />
    default:
      return <SingleControl question={question} value={value} onChange={onChange} />
  }
}

function SingleControl({ question, value, onChange }: QuestionControlProps) {
  const selected = typeof value === 'string' ? value : ''
  return (
    <fieldset className="screener-options">
      {(question.options ?? []).map((option) => (
        <label key={option} className="screener-option">
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={selected === option}
            onChange={() => onChange(option)}
          />
          <span className="screener-indicator" aria-hidden="true" />
          <span className="screener-label">{option}</span>
        </label>
      ))}
    </fieldset>
  )
}

function MultipleControl({ question, value, onChange }: QuestionControlProps) {
  const selected = Array.isArray(value) ? value : []
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option]
    onChange(next)
  }
  return (
    <fieldset className="screener-options">
      {(question.options ?? []).map((option) => (
        <label key={option} className="screener-option">
          <input
            type="checkbox"
            name={question.id}
            value={option}
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          <span className="screener-indicator screener-checkbox" aria-hidden="true" />
          <span className="screener-label">{option}</span>
        </label>
      ))}
    </fieldset>
  )
}

function TextControl({ question, value, onChange }: QuestionControlProps) {
  const current = typeof value === 'string' ? value : ''
  return (
    <textarea
      className="post-survey-textarea"
      placeholder={question.placeholder}
      value={current}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function SliderControl({ question, value, onChange }: QuestionControlProps) {
  const min = question.min ?? 0
  const max = question.max ?? 100
  const current = typeof value === 'string' ? Number(value) : Math.round((min + max) / 2)
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100
  return (
    <div className="post-survey-slider">
      <input
        type="range"
        className="post-survey-range"
        style={{ ['--fill' as string]: `${percent}%` }}
        min={min}
        max={max}
        step={question.step ?? 1}
        value={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="post-survey-slider-value">
        <span className="post-survey-slider-number">{current}</span>
        <span className="post-survey-slider-denominator">/{max}</span>
      </div>
    </div>
  )
}
