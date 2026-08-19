import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import Lottie from 'lottie-react'
import { Analytics } from '@vercel/analytics/react';
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
import confettiBlue from '../assets/confetti_edited.json'
import CameraPiP, { type CameraPiPHandle, type CameraPiPMode } from './components/test/CameraPiP'
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
  const [testQuit, setTestQuit] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiFading, setConfettiFading] = useState(false)
  const [confettiKey, setConfettiKey] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const cameraPiPRef = useRef<CameraPiPHandle>(null)
  const [pipMode, setPipMode] = useState<CameraPiPMode>('off')

  const goTo = (next: SetupScreen | TestScreen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (!showConfetti) return
    const fadeTimer = window.setTimeout(() => setConfettiFading(true), 6300)
    const removeTimer = window.setTimeout(() => {
      setShowConfetti(false)
      setConfettiFading(false)
    }, 6800)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [showConfetti])

  const handleFadeOutEnd = () => {
    setFadingOut(false)
    setScreen('thankYou')
    window.scrollTo({ top: 0 })
    setConfettiKey((k) => k + 1)
    setShowConfetti(true)
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

  useEffect(() => {
    if (screen === 'welcome' || screen === 'thankYou') return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [screen])

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
      if (screen === 'device') {
        setLoaderMode('pre')
        cameraPiPRef.current?.open()
      }
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

  useEffect(() => {
    if (screen !== 'loading' && screen !== 'test') {
      cameraPiPRef.current?.close()
    } else if (screen === 'test') {
      void cameraPiPRef.current?.open()
    }
  }, [screen])

  const onFinishTest = () => {
    cameraPiPRef.current?.close()
    setLoaderMode('post')
    setTestQuit(false)
    goTo('loading')
  }

  const onQuitTest = () => {
    cameraPiPRef.current?.close()
    setTestQuit(true)
    goTo('thankYou')
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
          onSubmit={() => {
            setTestQuit(false)
            window.setTimeout(() => setFadingOut(true), 500)
          }}
        />
      )
      break
    case 'thankYou':
      rightContent = <ThankYouPanel submitted={!testQuit} />
      break
  }

  return (
    <>
      <CameraPiP ref={cameraPiPRef} autoOpen={false} onModeChange={setPipMode} />
      {stepMenu}
      {createPortal(
        <div
          className={`confetti-overlay${showConfetti ? (confettiFading ? ' confetti-fade-out' : '') : ' confetti-hidden'}`}
          style={{ transition: 'opacity 0.5s ease-out' }}
        >
          <Lottie key={confettiKey} animationData={confettiBlue} loop={false} speed={1 / 1.3} />
        </div>,
        document.body,
      )}
      {screen === 'loading' || screen === 'test' ? (
        <div className="app">
          <div className="app-inner app-inner--full">
            {screen === 'loading' ? (
              <LoaderStep showText={loaderMode === 'pre'} />
            ) : (
              <TestStep
                jumpTo={jumpToTestStage}
                onJumpConsumed={() => setJumpToTestStage(null)}
                onFinishTest={onFinishTest}
                onQuit={onQuitTest}
                pipMode={pipMode}
                onToggleCamera={() => cameraPiPRef.current?.toggle()}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="app">
          <div className="app-inner">
            <Analytics />
            <SplitLayout
              leftClassName={fadingOut ? 'animate__animated animate__fadeOut' : undefined}
              leftStyle={fadingOut ? { '--animate-duration': '0.75s' } as CSSProperties : undefined}
              left={
                screen !== 'thankYou' ? (
                  <InstructionsPanel
                    title={
                      screen === 'screenedOut'
                        ? 'Maybe next time!'
                        : screen === 'device'
                          ? 'Test setup'
                          : screen === 'postTest'
                            ? 'Almost there!'
                            : STUDY.title
                    }
                    footer={
                      <>
                        {screen === 'screenedOut' ? (
                          <WuButton
                            className="instr-footer-button"
                            onClick={() => {
                              window.open('https://ux.questionpro.com/tester/signup', '_blank', 'noopener')
                            }}
                          >
                            Get paid to test
                          </WuButton>
                        ) : null}
                        {screen !== 'screener' &&
                          screen !== 'screenedOut' &&
                          screen !== 'postTest' ? (
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
                    <div
                      key={screen}
                      className="panel-step"
                    >
                      {panelContent}
                    </div>
                  </InstructionsPanel>
                ) : undefined
              }
            >
              <div className="flow-content">
                <div
                  key={screen}
                  className={`flow-step ${screen === 'screener' || screen === 'postTest' ? 'flow-step--plain' : ''
                    } ${screen === 'welcome' || screen === 'screenedOut' || screen === 'thankYou'
                      ? 'flow-step--flush'
                      : ''
                    } ${screen === 'postTest' && fadingOut ? 'animate__animated animate__fadeOut' : ''
                    } ${screen === 'thankYou' ? 'animate__animated animate__fadeIn' : ''}`}
                  style={
                    screen === 'postTest' && fadingOut
                      ? { '--animate-duration': '0.3s' } as CSSProperties
                      : screen === 'thankYou'
                        ? { '--animate-duration': '0.5s' } as CSSProperties
                        : undefined
                  }
                  onAnimationEnd={screen === 'postTest' && fadingOut ? handleFadeOutEnd : undefined}
                >
                  {rightContent}
                </div>
              </div>
            </SplitLayout>
          </div>
        </div>
      )}
    </>
  )
}
