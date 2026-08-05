import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import type {
  ParticipantDetails,
  ScreenerAnswers,
  SetupScreen,
  SetupStepId,
  TestScreen,
} from './types'
import { STUDY } from './data/study'
import { STEP_INSTRUCTIONS } from './data/instructions'
import welcomeScreen from '../assets/welcome-screen.svg'
import screenedOutScreen from '../assets/screened-out.svg'
import DeviceSetupStep from './components/steps/DeviceSetupStep'
import LoaderStep from './components/steps/LoaderStep'
import NdaStep, { NdaPanel } from './components/steps/NdaStep'
import ScreenerStep from './components/steps/ScreenerStep'
import ScreenedOutPanel from './components/steps/ScreenedOutStep'
import TestStep from './components/steps/TestStep'
import WelcomePanel from './components/steps/WelcomeStep'
import InstructionsPanel from './components/InstructionsPanel'
import SplitLayout from './components/SplitLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOADER_DURATION = 4000

export default function App() {
  const [screen, setScreen] = useState<SetupScreen | TestScreen>('welcome')
  const [details, setDetails] = useState<ParticipantDetails>({
    name: '',
    email: '',
  })
  const [ndaAgreed, setNdaAgreed] = useState(false)
  const [ndaScrolled, setNdaScrolled] = useState(false)
  const [screener, setScreener] = useState<ScreenerAnswers>({})
  const [deviceReady, setDeviceReady] = useState(false)

  const goTo = (next: SetupScreen | TestScreen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  const detailsComplete =
    details.name.trim() !== '' && EMAIL_RE.test(details.email.trim())

  const nextScreen: Record<SetupStepId, SetupScreen | TestScreen> = {
    nda: 'screener',
    screener: 'device',
    device: 'loading',
  }

  const footerLabel =
    screen === 'welcome' ? 'Get started' : screen === 'device' ? 'Start test' : 'Continue'

  const canProceed =
    screen === 'welcome'
      ? true
      : screen === 'nda'
        ? detailsComplete && ndaAgreed
        : deviceReady

  const onFooterAction = () => {
    if (screen === 'welcome') goTo('nda')
    else if (screen === 'nda' || screen === 'screener' || screen === 'device') goTo(nextScreen[screen])
  }

  useEffect(() => {
    if (screen !== 'loading') return
    const timer = window.setTimeout(() => {
      setScreen('test')
      window.scrollTo({ top: 0 })
    }, LOADER_DURATION)
    return () => window.clearTimeout(timer)
  }, [screen])

  if (screen === 'loading' || screen === 'test') {
    return (
      <div className="app">
        <div className="app-inner app-inner--full">
          {screen === 'loading' ? <LoaderStep /> : <TestStep />}
        </div>
      </div>
    )
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
