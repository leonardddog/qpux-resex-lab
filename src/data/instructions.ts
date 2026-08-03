import type { SetupStepId } from '../types'

export interface StepInstructions {
  title: string
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
    points: [
      'Your answers help us confirm you are a good fit for this study.',
      'There are no right or wrong answers.',
      'Answer honestly — it keeps the research reliable.',
      'You move on once every question is answered.',
    ],
  },
  device: {
    title: 'Get your device ready',
    points: [
      'We need your camera, microphone, speakers and screen sharing for the test.',
      'Allow camera and mic access when your browser asks for permission.',
      'Find a quiet place and close apps that could beep or interrupt you.',
      'Headphones give the best audio experience.',
    ],
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
