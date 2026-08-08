import type { IWuIcons } from '@npm-questionpro/wick-ui-lib'

export type SetupScreen =
  | 'welcome'
  | 'nda'
  | 'screener'
  | 'screenedOut'
  | 'device'

export type TestScreen = 'loading' | 'test' | 'postTest' | 'thankYou'

export type SetupStepId = Exclude<SetupScreen, 'welcome' | 'screenedOut'>

export interface StudyStep {
  id: SetupStepId
  label: string
  caption: string
  icon: IWuIcons
}

export interface TestTask {
  title: string
  description: string
}

export interface ParticipantDetails {
  name: string
  email: string
}

export type ScreenerAnswers = Record<string, string>

export type PostTestQuestionType = 'single' | 'multiple' | 'slider' | 'text'

export interface PostTestQuestion {
  id: string
  question: string
  type?: PostTestQuestionType
  options?: string[]
  hint?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  minLabel?: string
  maxLabel?: string
}

export type PostTestAnswers = Record<string, string | string[]>

export interface ScreenerQuestion {
  id: string
  question: string
  hint?: string
  options: string[]
  screenOutIf?: string
}

export type DeviceCheckId = 'camera' | 'microphone' | 'screenShare'

export type DeviceCheckGroup = 'cameraMic' | 'screenShare'

export interface DeviceCheck {
  id: DeviceCheckId
  label: string
  description: string
  icon: IWuIcons
  group: DeviceCheckGroup
}

export type DeviceCheckStatus = 'idle' | 'running' | 'passed' | 'failed'

export type DeviceCheckState = Record<DeviceCheckId, DeviceCheckStatus>
