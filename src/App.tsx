import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import type {
  ParticipantDetails,
  PostTestAnswers,
  ScreenerAnswers,
  SetupScreen,
  SetupStepId,
  TestScreen,
} from './types'
import type { StepTarget, TestStage } from './lib/stepNav'
import { STUDY } from './data/study'
import { STEP_INSTRUCTIONS } from './data/instructions'
import welcomeScreen from '../assets/welcome-screen.svg'
import screenedOutScreen from '../assets/screened-out.svg'
import thankYouScreen from '../assets/thank-you.png'
import DeviceSetupStep from './components/steps/DeviceSetupStep'
import LoaderStep from './components/steps/LoaderStep'
import NdaStep, { NdaPanel } from './components/steps/NdaStep'
import ScreenerStep from './components/steps/ScreenerStep'
import ScreenedOutPanel from './components/steps/ScreenedOutStep'
import ThankYouPanel from './components/steps/ThankYouStep'
import TestStep from './components/steps/TestStep'
import { PostTestPanel } from './components/steps/PostTestStep'
import PostTestSurvey from './components/steps/PostTestSurvey'
import WelcomePanel from './components/steps/WelcomeStep'
import InstructionsPanel from './components/InstructionsPanel'
import SplitLayout from './components/SplitLayout'
import StepMenu from './components/StepMenu'

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
  const [postAnswers, setPostAnswers] = useState<PostTestAnswers>({})
  const [deviceReady, setDeviceReady] = useState(false)
  const [stepMenuOpen, setStepMenuOpen] = useState(false)
  const [jumpToTestStage, setJumpToTestStage] = useState<TestStage | null>(null)
  const [loaderMode, setLoaderMode] = useState<'pre' | 'post'>('pre')

  const goTo = (next: SetupScreen | TestScreen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setStepMenuOpen((open) => !open)
      } else if (e.key === 'Escape') {
        setStepMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const onSelectStep = (target: StepTarget) => {
    setStepMenuOpen(false)
    if (target.startsWith('test/')) {
      const stage = target.slice('test/'.length) as TestStage
      setJumpToTestStage(stage)
      if (screen !== 'test') {
        setScreen('test')
        window.scrollTo({ top: 0 })
      }
    } else {
      goTo(target as SetupScreen | TestScreen)
    }
  }

  const stepMenu = (
    <StepMenu
      open={stepMenuOpen}
      onClose={() => setStepMenuOpen(false)}
      onSelect={onSelectStep}
    />
  )

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
    else if (screen === 'nda' || screen === 'screener' || screen === 'device') {
      if (screen === 'device') setLoaderMode('pre')
      goTo(nextScreen[screen])
    }
  }

  useEffect(() => {
    if (screen !== 'loading') return
    const timer = window.setTimeout(() => {
      setScreen(loaderMode === 'pre' ? 'test' : 'postTest')
      window.scrollTo({ top: 0 })
    }, LOADER_DURATION)
    return () => window.clearTimeout(timer)
  }, [screen, loaderMode])

  const onFinishTest = () => {
    setLoaderMode('post')
    goTo('loading')
  }

  if (screen === 'loading' || screen === 'test') {
    return (
      <>
        {stepMenu}
        <div className="app">
          <div className="app-inner app-inner--full">
            {screen === 'loading' ? (
              <LoaderStep showText={loaderMode === 'pre'} />
            ) : (
              <TestStep
                jumpTo={jumpToTestStage}
                onJumpConsumed={() => setJumpToTestStage(null)}
                onFinishTest={onFinishTest}
              />
            )}
          </div>
        </div>
      </>
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
    case 'postTest':
      panelContent = <PostTestPanel />
      rightContent = (
        <PostTestSurvey
          answers={postAnswers}
          onChange={(id, value) => setPostAnswers((prev) => ({ ...prev, [id]: value }))}
          onSubmit={() => goTo('thankYou')}
        />
      )
      break
    case 'thankYou':
      panelContent = <ThankYouPanel />
      rightContent = <img src={thankYouScreen} alt="" className="welcome-screen" />
      break
  }

  return (
    <>
      {stepMenu}
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
                      : screen === 'postTest'
                        ? 'Great job!'
                        : screen === 'thankYou'
                          ? 'Thank you!'
                          : STUDY.title
                }
                footer={
                  <>
                    {screen !== 'screener' &&
                    screen !== 'screenedOut' &&
                    screen !== 'postTest' &&
                    screen !== 'thankYou' ? (
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
                className={`flow-step ${
                  screen === 'screener' || screen === 'postTest' ? 'flow-step--plain' : ''
                }`}
              >
                {rightContent}
              </div>
            </div>
          </SplitLayout>
          </div>
        </div>
      </>
    )
  }
