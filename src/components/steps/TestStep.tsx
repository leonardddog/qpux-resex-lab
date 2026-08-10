import { useEffect, useState } from 'react'
import {
  WuButton,
  WuChip,
  WuIcon,
  WuMenu,
  WuMenuItem,
  WuModal,
  WuModalClose,
  WuModalContent,
  WuModalFooter,
  WuModalHeader,
  WuRadioGroup,
  WuTab,
} from '@npm-questionpro/wick-ui-lib'
import type { TestStage } from '../../lib/stepNav'
import { STUDY } from '../../data/study'
import { iconStyle } from '../../lib/icon'
import type { CameraPiPMode } from '../test/CameraPiP'
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

const TASKS = [
  'Explore the landing page to find if they have a specialized solution for Customer Experience (CX).',
  'Your director is keen on leveraging Artificial Intelligence to save time. Look around the landing page to see how QuestionPro integrates AI (like survey generation or text analysis) into their software.',
]

type Stage = TestStage

interface TestStepProps {
  jumpTo?: TestStage | null
  onJumpConsumed?: () => void
  onFinishTest?: () => void
  onQuit?: () => void
  pipMode?: CameraPiPMode
  onToggleCamera?: () => void
}

export default function TestStep({
  jumpTo,
  onJumpConsumed,
  onFinishTest,
  onQuit,
  pipMode,
  onToggleCamera,
}: TestStepProps) {
  const [remaining, setRemaining] = useState(COUNTDOWN_START)
  const [shown, setShown] = useState(false)
  const [closing, setClosing] = useState(false)
  const [stage, setStage] = useState<Stage>('frameOfMind')
  const [running, setRunning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionsClosing, setInstructionsClosing] = useState(false)
  const [completion, setCompletion] = useState(false)
  const [completionFromInline, setCompletionFromInline] = useState(false)
  const [completionAnswer, setCompletionAnswer] = useState('')
  const [usability, setUsability] = useState(false)
  const [usabilityRating, setUsabilityRating] = useState<number | null>(null)
  const [taskIndex, setTaskIndex] = useState(0)
  const [quitOpen, setQuitOpen] = useState(false)

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

  useEffect(() => {
    if (!jumpTo) return
    setClosing(false)
    setShown(true)
    setRunning(false)
    setShowInstructions(false)
    setInstructionsClosing(false)
    setCompletion(false)
    setCompletionFromInline(false)
    setCompletionAnswer('')
    setUsability(false)
    setUsabilityRating(null)
    setTaskIndex(0)
    setStage(jumpTo)
    onJumpConsumed?.()
  }, [jumpTo, onJumpConsumed])

  const goToImpression = () => {
    if (closing) return
    setStage('impression')
  }

  const startImpressionTest = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setShown(false)
      setClosing(false)
      setStage('questions')
      window.setTimeout(() => setShown(true), QUESTIONS_DELAY)
    }, 500)
  }

  const goToTaskInstructions = () => {
    if (closing) return
    setStage('taskInstructions')
  }

  const startTask = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setShown(false)
      setClosing(false)
      setRunning(true)
      setShowInstructions(false)
      setInstructionsClosing(false)
    }, 500)
  }

  const toggleInstructions = () => {
    if (closing) return
    if (showInstructions) {
      if (instructionsClosing) return
      setInstructionsClosing(true)
      window.setTimeout(() => {
        setShowInstructions(false)
        setInstructionsClosing(false)
      }, 300)
    } else {
      setInstructionsClosing(false)
      setShowInstructions(true)
    }
  }

  const finishTask = () => {
    if (closing || completion) return
    const hadInstructions = showInstructions && !instructionsClosing
    setCompletionFromInline(hadInstructions)
    setShowInstructions(false)
    setInstructionsClosing(false)
    setRunning(false)
    setCompletion(true)
  }

  const goToNextTask = () => {
    if (taskIndex !== 0 || closing) return
    setClosing(true)
    window.setTimeout(() => {
      setTaskIndex(1)
      setUsability(false)
      setUsabilityRating(null)
      setCompletion(false)
      setCompletionAnswer('')
      setCompletionFromInline(false)
      setRunning(false)
      setStage('taskInstructions')
      setShown(true)
      setClosing(false)
    }, 500)
  }

  const onUsabilityNext = () => {
    if (taskIndex < TASKS.length - 1) {
      goToNextTask()
    } else {
      onFinishTest?.()
    }
  }

  const OPTIONS_ITEMS = [
    { icon: 'wc-language' as const, label: 'Change language' },
    { icon: 'wm-error' as const, label: 'Report a problem' },
    { icon: 'wm-support-agent' as const, label: 'Help' },
    { icon: 'wm-logout' as const, label: 'Quit study' },
  ]

  const confirmQuit = () => {
    setQuitOpen(false)
    onQuit?.()
  }

  const chip = stage === 'frameOfMind' ? 'Frame of mind' : 'Impression test'
  const paragraphs =
    stage === 'frameOfMind'
      ? [SCENARIO_INTRO, SCENARIO_BODY]
      : stage === 'impression'
        ? IMPRESSION_PARAGRAPHS
        : QUESTION_PARAGRAPHS
  const buttonLabel =
    stage === 'taskInstructions' ? `Start task (${taskIndex + 1} of ${TASKS.length})` : stage === 'questions' ? 'Continue to tasks' : 'Continue'
  const onButtonClick =
    stage === 'frameOfMind'
      ? goToImpression
      : stage === 'impression'
        ? startImpressionTest
        : stage === 'questions'
          ? goToTaskInstructions
          : startTask

  const taskTabs = (
    <WuTab
      className="instr-tabs"
      defaultValue="instructions"
      items={[
        {
          value: 'instructions',
          Trigger: 'Instructions',
          Content: (
            <div className="instr-tabs-content">
              <p className="test-instructions-text">{TASKS[taskIndex]}</p>
            </div>
          ),
        },
        {
          value: 'frameOfMind',
          Trigger: 'Frame of mind',
          Content: (
            <div className="instr-tabs-content">
              <p className="test-instructions-text">{SCENARIO_INTRO}</p>
              <p className="test-instructions-text">{SCENARIO_BODY}</p>
            </div>
          ),
        },
      ]}
    />
  )

  const completionStep = (
    <div className="test-completion-step">
      <header className="instr-header">
        <WuChip size="md" variant="secondary" className="instr-chip">
          Completion
        </WuChip>
      </header>
      <div className="instr-content">
        <p className="test-completion-question">
          Were you able to complete the task successfully?
        </p>
        <WuRadioGroup
          className="test-completion-options"
          value={completionAnswer}
          onChange={setCompletionAnswer}
          options={[
            { value: 'yes', label: 'Yes, I completed it successfully' },
            { value: 'no', label: 'No, I did not complete it successfully' },
          ]}
        />
      </div>
      <footer className="instr-footer">
        <WuButton
          className="instr-footer-button"
          disabled={!completionAnswer}
          onClick={() => setUsability(true)}
        >
          Next
        </WuButton>
        <p className="instr-powered">
          Powered by{' '}
          <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
            QuestionPro
          </a>
        </p>
      </footer>
    </div>
  )

  const usabilityStep = (
    <div className="test-completion-step">
      <header className="instr-header">
        <WuChip size="md" variant="secondary" className="instr-chip">
          Usability
        </WuChip>
      </header>
      <div className="instr-content">
        <p className="test-completion-question">
          On a scale of 1-5, ¿How was your experience with the interface?
        </p>
        <div className="test-usability-scale">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="test-usability-option">
              <input
                type="radio"
                name="usability"
                value={value}
                checked={usabilityRating === value}
                onChange={() => setUsabilityRating(value)}
              />
              <span className="test-usability-label">{value}</span>
            </label>
          ))}
        </div>
        <div className="test-usability-legend">
          <span>Very difficult</span>
          <span>Very easy</span>
        </div>
      </div>
      <footer className="instr-footer">
        <WuButton
          className="instr-footer-button"
          disabled={usabilityRating === null}
          onClick={onUsabilityNext}
        >
          {taskIndex < TASKS.length - 1 ? 'Next task' : 'Finish test'}
        </WuButton>
        <p className="instr-powered">
          Powered by{' '}
          <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
            QuestionPro
          </a>
        </p>
      </footer>
    </div>
  )

  return (
    <div className="test">
      <div className="test-artifact">
        <iframe
          className="test-artifact-frame"
          src="https://www.questionpro.com/us"
          title="Test website"
          allow="camera; microphone; display-capture"
        />
        {running && showInstructions ? (
          <div className="test-instr-inline">
            <div
              className={`test-instr-inline-panel${instructionsClosing ? ' is-closing' : ''}`}
            >
              {taskTabs}
            </div>
          </div>
        ) : null}
        {shown ? (
          <div
            className={`test-instructions-overlay${closing ? ' is-closing' : ''}`}
          >
            <div
              className={`test-instructions-panel${closing ? ' is-closing' : ''}`}
            >
              <div key={stage} className="test-instructions-step">
                {stage === 'taskInstructions' ? taskTabs : (
                  <>
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
                  </>
                )}
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
        {completion ? (
          <div
            className={`test-completion-overlay${closing ? ' is-closing' : ''}`}
          >
            <div
              className={`test-completion-panel${completionFromInline ? ' no-slide' : ''}${closing ? ' is-closing' : ''}`}
            >
              {usability ? usabilityStep : completionStep}
            </div>
          </div>
        ) : null}
      </div>
      <div className="test-tools">
        <div className="test-tools-actions">
          {running ? (
            <>
              <WuButton onClick={finishTask}>Finish task</WuButton>
              <WuButton
                variant="secondary"
                Icon={
                  <WuIcon
                    icon={showInstructions ? 'wm-visibility-off' : 'wm-visibility'}
                    style={iconStyle(16)}
                  />
                }
                onClick={toggleInstructions}
              >
                Instructions
              </WuButton>
            </>
          ) : null}
        </div>
        <TestTimerV2 remaining={remaining} total={COUNTDOWN_START} />
        <div className="test-tools-menu">
          {pipMode === 'off' ? (
            <WuButton
              variant="secondary"
              Icon={<WuIcon icon="wm-videocam" style={iconStyle(16)} />}
              onClick={onToggleCamera}
            >
              Camera
            </WuButton>
          ) : null}
          <WuMenu
            position={{ side: 'top', align: 'end', sideOffset: 8 }}
            Trigger={
              <button type="button" className="test-tools-more" aria-label="More options">
                <WuIcon icon="wm-more-vert" style={iconStyle(20)} />
              </button>
            }
          >
            {OPTIONS_ITEMS.map((item) => (
              <WuMenuItem
                key={item.label}
                className="test-tools-menu-item"
                Icon={
                  <WuIcon
                    icon={item.icon}
                    style={iconStyle(item.icon === 'wc-language' ? 19 : 16)}
                  />
                }
                onClick={item.label === 'Quit study' ? () => setQuitOpen(true) : undefined}
              >
                {item.label}
              </WuMenuItem>
            ))}
          </WuMenu>
        </div>
      </div>
      <WuModal
        open={quitOpen}
        onOpenChange={setQuitOpen}
        size="sm"
        variant="critical"
        preventClickOutside
      >
        <WuModalHeader>Quit test</WuModalHeader>
        <WuModalContent>
          <p className="test-quit-warning">
            Are you sure you want to quit the test? Your response will not be submitted.
          </p>
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Cancel</WuModalClose>
          <WuButton color="error" onClick={confirmQuit}>
            Quit test
          </WuButton>
        </WuModalFooter>
      </WuModal>
    </div>
  )
}
