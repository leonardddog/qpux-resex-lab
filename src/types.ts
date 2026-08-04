import type { IWuIcons } from '@npm-questionpro/wick-ui-lib'

export type SetupScreen =
  | 'welcome'
  | 'nda'
  | 'screener'
  | 'screenedOut'
  | 'device'
  | 'ready'

export type SetupStepId = Exclude<SetupScreen, 'welcome' | 'ready' | 'screenedOut'>

export interface StudyStep {
  id: SetupStepId
  label: string
  caption: string
  icon: IWuIcons
}

export interface ParticipantDetails {
  name: string
  email: string
}

export type ScreenerAnswers = Record<string, string>

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
