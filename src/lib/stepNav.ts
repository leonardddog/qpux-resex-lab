import type { SetupScreen, TestScreen } from '../types'

export type TestStage = 'frameOfMind' | 'impression' | 'questions' | 'taskInstructions'

export type StepTarget = SetupScreen | TestScreen | `test/${TestStage}`

export interface StepMenuItem {
  id: StepTarget
  label: string
  group: 'Setup' | 'Test' | 'Post'
}

export const STEP_MENU_ITEMS: StepMenuItem[] = [
  { id: 'welcome', label: 'Welcome', group: 'Setup' },
  { id: 'nda', label: 'Non-disclosure agreement', group: 'Setup' },
  { id: 'screener', label: 'Screener', group: 'Setup' },
  { id: 'screenedOut', label: 'Screened out', group: 'Setup' },
  { id: 'device', label: 'Device setup', group: 'Setup' },
  { id: 'loading', label: 'Loading', group: 'Setup' },
  { id: 'test/frameOfMind', label: 'Frame of mind', group: 'Test' },
  { id: 'test/impression', label: 'Impression test', group: 'Test' },
  { id: 'test/questions', label: 'Follow-up questions', group: 'Test' },
  { id: 'test/taskInstructions', label: 'Task instructions', group: 'Test' },
  { id: 'postTest', label: 'Post test', group: 'Post' },
  { id: 'thankYou', label: 'Thank you', group: 'Post' },
]
