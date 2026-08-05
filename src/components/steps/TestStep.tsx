import { useEffect, useState } from 'react'
import { WuButton, WuChip } from '@npm-questionpro/wick-ui-lib'
import { STUDY } from '../../data/study'
import TestTimerV2 from './TestTimerV2'

const COUNTDOWN_START = STUDY.durationMinutes * 60
const INSTRUCTIONS_DELAY = 1500
const QUESTIONS_DELAY = 5000

const SCENARIO_INTRO =
  'Read the following scenario to set the context for your tasks:'
const SCENARIO_BODY =
  '\u201CYou are a Customer Experience (CX) Manager at a mid-sized company. Your team has outgrown simple tools like Google Forms and needs a professional platform that offers advanced analytics, customer journey mapping, and AI assistance. Your director suggested checking out QuestionPro. You have just arrived at their homepage to evaluate if this platform fits your enterprise needs.\u201D'

const IMPRESSION_PARAGRAPHS = [
  "You're about to complete a first-impression test.",
  "You'll have 15 seconds to view the content and we will then ask you about your first impressions of it.",
  "While viewing it, point with your mouse to what you're focusing on and share your thoughts aloud.",
]

const QUESTION_PARAGRAPHS = [
  'Answer the following questions:',
  '1. Say 3 words that you remember from the site, or that you would use to describe the site.',
  '2. What is this site about?',
  '3. What services and/or products are offered on this site and for whom?',
  '4. What is the feel of this site?',
]

type Stage = 'frameOfMind' | 'impression' | 'questions'

export default function TestStep() {
  const [remaining, setRemaining] = useState(COUNTDOWN_START)
  const [shown, setShown] = useState(false)
  const [closing, setClosing] = useState(false)
  const [stage, setStage] = useState<Stage>('frameOfMind')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((seconds) => Math.max(seconds - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), INSTRUCTIONS_DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  const goToImpression = () => {
    if (closing) return
    setStage('impression')
  }

  const startImpression = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setShown(false)
      setClosing(false)
      setStage('questions')
      window.setTimeout(() => setShown(true), QUESTIONS_DELAY)
    }, 500)
  }

  const chip =
    stage === 'frameOfMind' ? 'Frame of mind' : stage === 'impression' ? 'Impression test' : 'Questions'
  const paragraphs =
    stage === 'frameOfMind'
      ? [SCENARIO_INTRO, SCENARIO_BODY]
      : stage === 'impression'
        ? IMPRESSION_PARAGRAPHS
        : QUESTION_PARAGRAPHS
  const buttonLabel =
    stage === 'frameOfMind' ? 'Continue' : stage === 'impression' ? 'Start impression test' : null
  const onButtonClick = stage === 'frameOfMind' ? goToImpression : startImpression

  return (
    <div className="test">
      <div className="test-artifact">
        <iframe
          className="test-artifact-frame"
          src="https://www.questionpro.com/us"
          title="Test website"
          allow="camera; microphone; display-capture"
        />
        {shown ? (
          <div
            className={`test-instructions-overlay${closing ? ' is-closing' : ''}`}
          >
            <div
              className={`test-instructions-panel${closing ? ' is-closing' : ''}`}
            >
              <div key={stage} className="test-instructions-step">
                <header className="instr-header">
                  <WuChip size="md" variant="secondary" className="instr-chip">
                    {chip}
                  </WuChip>
                </header>
                <div className="instr-content">
                  {paragraphs.map((text) => (
                    <p key={text} className="test-instructions-text">
                      {text}
                    </p>
                  ))}
                </div>
                <footer className="instr-footer">
                  {buttonLabel ? (
                    <WuButton className="instr-footer-button" onClick={onButtonClick}>
                      {buttonLabel}
                    </WuButton>
                  ) : null}
                  <p className="instr-powered">
                    Powered by{' '}
                    <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
                      QuestionPro
                    </a>
                  </p>
                </footer>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="test-tools">
        <TestTimerV2 remaining={remaining} total={COUNTDOWN_START} />
      </div>
    </div>
  )
}
