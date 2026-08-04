import { useState } from 'react'
import type { ReactNode } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import type {
  ParticipantDetails,
  ScreenerAnswers,
  SetupScreen,
} from './types'
import { STUDY } from './data/study'
import { READY_INSTRUCTIONS, STEP_INSTRUCTIONS } from './data/instructions'
import welcomeScreen from '../assets/welcome-screen.svg'
import screenedOutScreen from '../assets/screened-out.svg'
import DeviceSetupStep from './components/steps/DeviceSetupStep'
import NdaStep, { NdaPanel } from './components/steps/NdaStep'
import ReadyStep from './components/steps/ReadyStep'
import ScreenerStep from './components/steps/ScreenerStep'
import ScreenedOutPanel from './components/steps/ScreenedOutStep'
import WelcomePanel from './components/steps/WelcomeStep'
import InstructionsPanel from './components/InstructionsPanel'
import SplitLayout from './components/SplitLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function App() {
  const [screen, setScreen] = useState<SetupScreen>('welcome')
  const [details, setDetails] = useState<ParticipantDetails>({
    name: '',
    email: '',
  })
  const [ndaAgreed, setNdaAgreed] = useState(false)
  const [ndaScrolled, setNdaScrolled] = useState(false)
  const [screener, setScreener] = useState<ScreenerAnswers>({})
  const [deviceReady, setDeviceReady] = useState(false)

  const goTo = (next: SetupScreen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  const detailsComplete =
    details.name.trim() !== '' && EMAIL_RE.test(details.email.trim())

  const nextScreen: Record<Exclude<SetupScreen, 'welcome' | 'ready' | 'screenedOut'>, SetupScreen> = {
    nda: 'screener',
    screener: 'device',
    device: 'ready',
  }

  const footerLabel =
    screen === 'welcome'
      ? 'Get started'
      : screen === 'device'
        ? 'Start test'
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
          : deviceReady

  const onFooterAction = () => {
    if (screen === 'welcome') goTo('nda')
    else if (screen !== 'ready' && screen !== 'screenedOut') goTo(nextScreen[screen])
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
      panelContent = <p className="instr-lede">{STEP_INSTRUCTIONS.screener.description}</p>
      rightContent = (
        <ScreenerStep
          answers={screener}
          onChange={(id, value) => setScreener((prev) => ({ ...prev, [id]: value }))}
          onComplete={() => goTo(nextScreen.screener)}
          onScreenedOut={() => goTo('screenedOut')}
        />
      )
      break
    case 'screenedOut':
      panelContent = <ScreenedOutPanel />
      rightContent = <img src={screenedOutScreen} alt="" className="welcome-screen" />
      break
    case 'device':
      panelContent = <p className="instr-lede">{STEP_INSTRUCTIONS.device.description}</p>
      rightContent = <DeviceSetupStep onReadyChange={setDeviceReady} />
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
              title={
                screen === 'screenedOut'
                  ? 'Maybe next time!'
                  : screen === 'device'
                    ? 'Test setup'
                    : STUDY.title
              }
              footer={
                <>
                  {screen !== 'screener' && screen !== 'screenedOut' ? (
                    <WuButton
                      className="instr-footer-button"
                      disabled={!canProceed}
                      onClick={onFooterAction}
                    >
                      {footerLabel}
                    </WuButton>
                  ) : null}
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
            <div
              key={screen}
              className={`flow-step ${screen === 'screener' ? 'flow-step--plain' : ''}`}
            >
              {rightContent}
            </div>
          </div>
        </SplitLayout>
      </div>
    </div>
  )
}
