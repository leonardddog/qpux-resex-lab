import type { IWuIcons } from '@npm-questionpro/wick-ui-lib'

export type SetupScreen = 'welcome' | 'nda' | 'screener' | 'device' | 'ready'

export type SetupStepId = Exclude<SetupScreen, 'welcome' | 'ready'>

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
}

export type DeviceCheckId = 'camera' | 'microphone' | 'speakers' | 'screenShare'

export interface DeviceCheck {
  id: DeviceCheckId
  label: string
  description: string
  icon: IWuIcons
}

export type DeviceCheckStatus = 'idle' | 'running' | 'passed' | 'failed'

export type DeviceCheckState = Record<DeviceCheckId, DeviceCheckStatus>
