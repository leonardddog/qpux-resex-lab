import type { SetupStepId } from '../types'

export interface StepInstructions {
  title: string
  description?: string
  points: string[]
}

export const STEP_INSTRUCTIONS: Record<SetupStepId, StepInstructions> = {
  nda: {
    title: 'About the non-disclosure agreement',
    points: [
      'You will see unreleased product designs — please keep them confidential.',
      'Do not record, screenshot or share anything from the session.',
      'We record your screen, camera and voice for internal research only.',
      'You can stop the study at any time if you are not comfortable.',
    ],
  },
  screener: {
    title: 'Why a few questions first',
    description:
      "We'll ask a few quick questions to determine whether you're eligible for this test. It should only take a moment.",
    points: [],
  },
  device: {
    title: 'Get your device ready',
    description:
      "We'll use these permissions to observe and analyze your interactions during the session. This will help us understand your journey better and improve the experience.",
    points: [],
  },
}

export const READY_INSTRUCTIONS: StepInstructions = {
  title: 'What happens next',
  points: [
    'You will complete real tasks on the website while we watch.',
    'Think aloud — share what you see and feel as you go.',
    'There is no time pressure; you can pause and return later.',
    'After the tasks, you answer a short post-test survey.',
  ],
}
