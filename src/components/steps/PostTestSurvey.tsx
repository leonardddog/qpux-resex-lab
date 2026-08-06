import { useEffect, useRef, useState } from 'react'
import { WuButton, WuChip } from '@npm-questionpro/wick-ui-lib'
import { POST_TEST_QUESTIONS } from '../../data/study'
import type { PostTestAnswers, PostTestQuestion } from '../../types'

interface PostTestSurveyProps {
  answers: PostTestAnswers
  onChange: (id: string, value: string | string[]) => void
}

export default function PostTestSurvey({ answers, onChange }: PostTestSurveyProps) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const settleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const el = list.children[active] as HTMLElement | undefined
    if (!el) return
    const listTop = list.getBoundingClientRect().top
    const elRect = el.getBoundingClientRect()
    const relTop = elRect.top - listTop
    const clientH = list.clientHeight
    const maxScroll = list.scrollHeight - clientH
    const topTarget = list.scrollTop + relTop
    const centerTarget = list.scrollTop + relTop - (clientH - elRect.height) / 2
    const target = topTarget <= maxScroll ? topTarget : Math.max(0, Math.min(maxScroll, centerTarget))
    list.scrollTo({ top: target, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const updatePadding = () => {
      const lastEl = list.children[list.children.length - 1] as HTMLElement | undefined
      if (!lastEl) return
      list.style.paddingBottom = '0px'
      const scrollable = list.scrollHeight > list.clientHeight
      const pad = scrollable ? Math.max(24, Math.round((list.clientHeight - lastEl.offsetHeight) / 2)) : 0
      list.style.paddingBottom = `${pad}px`
    }
    updatePadding()
    const lastEl = list.children[list.children.length - 1] as HTMLElement | undefined
    const ro = new ResizeObserver(updatePadding)
    ro.observe(list)
    if (lastEl) ro.observe(lastEl)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    }
  }, [])

  const activateAtTop = () => {
    const list = listRef.current
    if (!list) return
    const listRect = list.getBoundingClientRect()
    const activeEl = list.children[active] as HTMLElement | undefined
    if (activeEl) {
      const r = activeEl.getBoundingClientRect()
      const inView = r.bottom > listRect.top && r.top < listRect.bottom
      const nearTop = r.top - listRect.top <= 40
      if (inView && !nearTop) return
    }
    const listTop = listRect.top
    let current = POST_TEST_QUESTIONS.length - 1
    for (let i = 0; i < list.children.length; i += 1) {
      const el = list.children[i] as HTMLElement
      if (el.getBoundingClientRect().top - listTop >= -8) {
        current = i
        break
      }
    }
    const question = POST_TEST_QUESTIONS[current]
    const value = answers[question.id]
    const answered = Array.isArray(value) ? value.length > 0 : (value ?? '') !== ''
    if (answered && current !== active) setActive(current)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!e.isTrusted) return
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      activateAtTop()
    }, 150)
  }

  const advanceFrom = (index: number) => {
    setActive(Math.min(index + 1, POST_TEST_QUESTIONS.length - 1))
  }

  const setValue = (id: string, value: string | string[]) => onChange(id, value)

  return (
    <div className="post-survey">
      <WuChip size="md" variant="primary" className="post-survey-chip">
        Post-test survey
      </WuChip>
      <div className="post-survey-list" ref={listRef} onScroll={handleScroll}>
        {POST_TEST_QUESTIONS.map((question, index) => (
          <section
            key={question.id}
            className={`post-survey-question ${index === active ? 'is-focused' : ''}`}
            onClick={() => setActive(index)}
          >
            <h3 className="screener-question post-survey-question-text">
              {index + 1}. {question.question}
            </h3>
            {question.hint ? <p className="screener-hint">{question.hint}</p> : null}
            <QuestionControl
              question={question}
              value={answers[question.id]}
              onChange={(value) => setValue(question.id, value)}
              onAnswered={() => advanceFrom(index)}
            />
          </section>
        ))}
      </div>
    </div>
  )
}

interface QuestionControlProps {
  question: PostTestQuestion
  value?: string | string[]
  onChange: (value: string | string[]) => void
  onAnswered: () => void
}

function QuestionControl({ question, value, onChange, onAnswered }: QuestionControlProps) {
  switch (question.type) {
    case 'multiple':
      return <MultipleControl question={question} value={value} onChange={onChange} onAnswered={onAnswered} />
    case 'slider':
      return <SliderControl question={question} value={value} onChange={onChange} onAnswered={onAnswered} />
    case 'text':
      return <TextControl question={question} value={value} onChange={onChange} onAnswered={onAnswered} />
    default:
      return <SingleControl question={question} value={value} onChange={onChange} onAnswered={onAnswered} />
  }
}

function SingleControl({ question, value, onChange, onAnswered }: QuestionControlProps) {
  const selected = typeof value === 'string' ? value : ''
  return (
    <fieldset className="screener-options" onClick={(e) => e.stopPropagation()}>
      {(question.options ?? []).map((option) => (
        <label key={option} className="screener-option">
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={selected === option}
            onChange={() => {
              onChange(option)
              onAnswered()
            }}
          />
          <span className="screener-indicator" aria-hidden="true" />
          <span className="screener-label">{option}</span>
        </label>
      ))}
    </fieldset>
  )
}

function MultipleControl({ question, value, onChange, onAnswered }: QuestionControlProps) {
  const selected = Array.isArray(value) ? value : []
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option]
    onChange(next)
  }
  return (
    <fieldset className="screener-options" onClick={(e) => e.stopPropagation()}>
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
      <div className="screener-actions post-survey-actions">
        <WuButton className="screener-next" disabled={selected.length < 2} onClick={onAnswered}>
          Continue
        </WuButton>
      </div>
    </fieldset>
  )
}

function SliderControl({ question, value, onChange, onAnswered }: QuestionControlProps) {
  const interacted = useRef(false)
  const min = question.min ?? 0
  const max = question.max ?? 10
  const current = typeof value === 'string' ? Number(value) : min
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100
  const commit = () => {
    if (!interacted.current) return
    interacted.current = false
    onAnswered()
  }
  return (
    <div className="post-survey-slider" onClick={(e) => e.stopPropagation()}>
      <div className="post-survey-slider-readout">
        <span className="post-survey-slider-value">{current}</span>
      </div>
      <input
        type="range"
        className="post-survey-range"
        style={{ ['--fill' as string]: `${percent}%` }}
        min={min}
        max={max}
        step={question.step ?? 1}
        value={current}
        onChange={(e) => {
          interacted.current = true
          onChange(e.target.value)
        }}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
      />
      <div className="post-survey-slider-labels">
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
    </div>
  )
}

function TextControl({ question, value, onChange, onAnswered }: QuestionControlProps) {
  const current = typeof value === 'string' ? value : ''
  return (
    <div className="post-survey-text-control" onClick={(e) => e.stopPropagation()}>
      <textarea
        className="post-survey-textarea"
        placeholder={question.placeholder}
        value={current}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="screener-actions post-survey-actions">
        <WuButton className="screener-next" disabled={current.trim() === ''} onClick={onAnswered}>
          Next
        </WuButton>
      </div>
    </div>
  )
}
