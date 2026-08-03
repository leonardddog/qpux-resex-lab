import { useState } from 'react'
import type { ReactNode } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import type {
  DeviceCheckId,
  DeviceCheckState,
  ParticipantDetails,
  ScreenerAnswers,
  SetupScreen,
} from './types'
import { DEVICE_CHECKS, SCREENER_QUESTIONS, STUDY } from './data/study'
import { READY_INSTRUCTIONS, STEP_INSTRUCTIONS } from './data/instructions'
import welcomeScreen from '../assets/welcome-screen.svg'
import DeviceSetupStep from './components/steps/DeviceSetupStep'
import NdaStep, { NdaPanel } from './components/steps/NdaStep'
import ReadyStep from './components/steps/ReadyStep'
import ScreenerStep from './components/steps/ScreenerStep'
import WelcomePanel from './components/steps/WelcomeStep'
import InstructionsPanel from './components/InstructionsPanel'
import SplitLayout from './components/SplitLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_CHECKS: DeviceCheckState = {
  camera: 'idle',
  microphone: 'idle',
  speakers: 'idle',
  screenShare: 'idle',
}

export default function App() {
  const [screen, setScreen] = useState<SetupScreen>('welcome')
  const [details, setDetails] = useState<ParticipantDetails>({
    name: '',
    email: '',
  })
  const [ndaAgreed, setNdaAgreed] = useState(false)
  const [ndaScrolled, setNdaScrolled] = useState(false)
  const [screener, setScreener] = useState<ScreenerAnswers>({})
  const [checks, setChecks] = useState<DeviceCheckState>(INITIAL_CHECKS)

  const goTo = (next: SetupScreen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  const detailsComplete =
    details.name.trim() !== '' && EMAIL_RE.test(details.email.trim())

  const screenerComplete = SCREENER_QUESTIONS.every((q) => Boolean(screener[q.id]))

  const deviceComplete = DEVICE_CHECKS.every((c) => checks[c.id] === 'passed')

  const runCheck = (id: DeviceCheckId) => {
    setChecks((prev) => ({ ...prev, [id]: 'running' }))
    window.setTimeout(() => {
      setChecks((prev) => ({ ...prev, [id]: 'passed' }))
    }, 1400)
  }

  const runAllChecks = () => {
    DEVICE_CHECKS.forEach((c, i) => {
      setChecks((prev) => ({ ...prev, [c.id]: 'running' }))
      window.setTimeout(() => {
        setChecks((prev) => ({ ...prev, [c.id]: 'passed' }))
      }, 900 + i * 700)
    })
  }

  const nextScreen: Record<Exclude<SetupScreen, 'welcome' | 'ready'>, SetupScreen> = {
    nda: 'screener',
    screener: 'device',
    device: 'ready',
  }

  const footerLabel =
    screen === 'welcome'
      ? 'Get started'
      : screen === 'device'
        ? 'Finish setup'
        : screen === 'ready'
          ? 'Start the test'
          : 'Continue'

  const canProceed =
    screen === 'welcome'
      ? true
      : screen === 'ready'
        ? true
        : screen === 'nda'
          ? detailsComplete && ndaAgreed
          : screen === 'screener'
            ? screenerComplete
            : deviceComplete

  const onFooterAction = () => {
    if (screen === 'welcome') goTo('nda')
    else if (screen !== 'ready') goTo(nextScreen[screen])
  }

  let panelContent: ReactNode
  let rightContent: ReactNode

  switch (screen) {
    case 'welcome':
      panelContent = <WelcomePanel />
      rightContent = <img src={welcomeScreen} alt="" className="welcome-screen" />
      break
    case 'nda':
      panelContent = (
        <NdaPanel
          details={details}
          onChange={setDetails}
          agreed={ndaAgreed}
          onAgree={setNdaAgreed}
          scrolledToEnd={ndaScrolled}
        />
      )
      rightContent = <NdaStep onScrolledToEnd={setNdaScrolled} />
      break
    case 'screener':
    case 'device':
      panelContent = (
        <ul className="instr-points">
          {STEP_INSTRUCTIONS[screen].points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )
      rightContent =
        screen === 'screener' ? (
          <ScreenerStep
            answers={screener}
            onChange={(id, value) => setScreener((prev) => ({ ...prev, [id]: value }))}
          />
        ) : (
          <DeviceSetupStep checks={checks} onRun={runCheck} onRunAll={runAllChecks} />
        )
      break
    case 'ready':
      panelContent = (
        <ul className="instr-points">
          {READY_INSTRUCTIONS.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )
      rightContent = <ReadyStep details={details} />
      break
  }

  return (
    <div className="app">
      <div className="app-inner">
        <SplitLayout
          left={
            <InstructionsPanel
              title={STUDY.title}
              footer={
                <>
                  <WuButton
                    className="instr-footer-button"
                    disabled={!canProceed}
                    onClick={onFooterAction}
                  >
                    {footerLabel}
                  </WuButton>
                  <p className="instr-powered">
                    Powered by{' '}
                    <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
                      QuestionPro
                    </a>
                  </p>
                </>
              }
            >
              <div key={screen} className="panel-step">
                {panelContent}
              </div>
            </InstructionsPanel>
          }
        >
          <div className="flow-content">
            <div key={screen} className="flow-step">
              {rightContent}
            </div>
          </div>
        </SplitLayout>
      </div>
    </div>
  )
}
