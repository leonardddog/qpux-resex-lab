import type {
  DeviceCheck,
  ScreenerQuestion,
  StudyStep,
} from '../types'

export const STUDY = {
  title: 'QuestionPro Website Usability Study',
  durationMinutes: 20,
  incentive: '$15 e-gift card',
}

export const SETUP_STEPS: StudyStep[] = [
  { id: 'nda', label: 'Non-disclosure', caption: 'Keep it confidential', icon: 'wm-lock' },
  { id: 'screener', label: 'Screener', caption: 'A few quick questions', icon: 'wm-checklist' },
  { id: 'device', label: 'Device setup', caption: 'Camera, mic & sound', icon: 'wm-settings' },
]

export const SCREENER_QUESTIONS: ScreenerQuestion[] = [
  {
    id: 'age',
    question: 'What is your age group?',
    options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55 or older'],
  },
  {
    id: 'device',
    question: 'Which device will you use for this test?',
    hint: 'Please use the same device you are on right now.',
    options: ['Desktop / Laptop', 'Tablet', 'Smartphone'],
  },
  {
    id: 'frequency',
    question: 'How often do you create or edit online surveys?',
    options: ['Daily', 'Weekly', 'Monthly', 'A few times a year', 'Rarely or never'],
  },
  {
    id: 'experience',
    question: 'How familiar are you with QuestionPro?',
    options: [
      'I use it regularly',
      'I have used it a few times',
      'I have seen it but never used it',
      'This is my first time hearing about it',
    ],
  },
]

export const NDA_SECTIONS = [
  {
    heading: '1. Confidential information',
    body: 'During this session you may see product features, designs and business plans that are not yet public. All materials shown are the property of QuestionPro and must be treated as confidential.',
  },
  {
    heading: '2. No disclosure',
    body: 'You agree not to record, screenshot, share or discuss anything you see during the session, including on social media, with colleagues or with other research participants.',
  },
  {
    heading: '3. Recording consent',
    body: 'With your permission we record the session, including your screen, camera and voice, for research purposes only. Recordings are stored securely, used internally and deleted after the study concludes.',
  },
  {
    heading: '4. Use of feedback',
    body: 'Your comments may be quoted internally in aggregated form. Personal information is never shared publicly and is handled in line with our privacy policy.',
  },
]

export const DEVICE_CHECKS: DeviceCheck[] = [
  {
    id: 'camera',
    label: 'Camera',
    description: 'We record your face so we can see reactions while you test.',
    icon: 'wm-videocam',
  },
  {
    id: 'microphone',
    label: 'Microphone',
    description: 'Please think aloud — we want to hear your thoughts out loud.',
    icon: 'wm-mic',
  },
  {
    id: 'speakers',
    label: 'Speakers / headphones',
    description: 'Some tasks include audio prompts and instructions.',
    icon: 'wm-volume-up',
  },
  {
    id: 'screenShare',
    label: 'Screen sharing',
    description: 'We capture your screen so we can follow along with your clicks.',
    icon: 'wm-screen-share',
  },
]
