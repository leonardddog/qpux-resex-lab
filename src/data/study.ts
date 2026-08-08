import type {
  DeviceCheck,
  PostTestQuestion,
  ScreenerQuestion,
  StudyStep,
  TestTask,
} from '../types'

export const STUDY = {
  title: 'QuestionPro Website Usability Study',
  durationMinutes: 20,
  incentive: '$15 e-gift card',
}

export const SETUP_STEPS: StudyStep[] = [
  { id: 'nda', label: 'Non-disclosure', caption: 'Keep it confidential', icon: 'wm-lock' },
  { id: 'screener', label: 'Screener', caption: 'A few quick questions', icon: 'wm-checklist' },
  { id: 'device', label: 'Device setup', caption: 'Camera, mic & screen', icon: 'wm-settings' },
]

export const SCREENER_QUESTIONS: ScreenerQuestion[] = [
  {
    id: 'age',
    question: 'What is your age group?',
    options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55 or older'],
    screenOutIf: '55 or older',
  },
  {
    id: 'softwareResearch',
    question: 'How often do you search for or evaluate new software or online services?',
    options: ['Daily', 'Weekly', 'Monthly', 'A few times a year', 'Rarely or never'],
    screenOutIf: 'Rarely or never',
  },
  {
    id: 'softwarePurchase',
    question: 'Have you ever purchased or subscribed to a software or online service?',
    hint: 'For example, a SaaS tool, app subscription or digital service.',
    options: ['Yes, regularly', 'Yes, a few times', 'Yes, once', 'No, never'],
    screenOutIf: 'No, never',
  },
  {
    id: 'navigationConfidence',
    question: 'How comfortable are you finding your way around new websites?',
    options: ['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable'],
    screenOutIf: 'Not comfortable',
  },
]

export const POST_TEST_QUESTIONS: PostTestQuestion[] = [
  {
    id: 'whatQuestionProDoes',
    question:
      'Based on your review of the landing page, which of the following best describes what QuestionPro does?',
    type: 'single',
    options: [
      'An all-in-one research & experience management platform (surveys, CX, EX)',
      'A basic form builder',
      'A customer relationship management (CRM) tool',
      'A website builder',
      'Not sure',
    ],
  },
  {
    id: 'overwhelmingElements',
    question: 'Which element on the landing page felt the most overwhelming or confusing?',
    hint: 'Select all that apply.',
    type: 'multiple',
    options: [
      'The number of products and features listed',
      'The navigation menu',
      'The hero section messaging',
      'Customer stories and logos',
      'Pricing information',
      'Nothing felt overwhelming',
    ],
  },
  {
    id: 'overallExperience',
    question:
      'In your own words, describe the overall experience of browsing the landing page — what stood out most to you?',
    type: 'text',
    placeholder: 'Share your thoughts…',
  },
  {
    id: 'enterpriseTool',
    question:
      'It was clear that QuestionPro is a high-level research/enterprise tool, not just a basic form builder.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    minLabel: 'Strongly disagree',
    maxLabel: 'Strongly agree',
  },
]

export const SUS_SCALE = { min: 1, max: 5 }

export const SUS_QUESTIONS = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to be able to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
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

export const TEST_TASKS: TestTask[] = [
  {
    title: 'Browse the homepage',
    description: 'Take a look around the homepage and tell us, in your own words, what this website is about.',
  },
  {
    title: 'Compare pricing plans',
    description: 'Navigate to the pricing page and walk us through the plans. What stands out to you?',
  },
  {
    title: 'Find help',
    description: 'Find the help or support section and show us how you would look up an answer.',
  },
  {
    title: 'Start a trial',
    description: 'Start a free trial using fake details and describe how easy or difficult it felt.',
  },
]

export const DEVICE_CHECKS: DeviceCheck[] = [
  {
    id: 'camera',
    label: 'Camera',
    description: 'We record your face so we can see reactions while you test.',
    icon: 'wm-videocam',
    group: 'cameraMic',
  },
  {
    id: 'microphone',
    label: 'Microphone',
    description: 'Please think aloud — we want to hear your thoughts out loud.',
    icon: 'wm-mic',
    group: 'cameraMic',
  },
  {
    id: 'screenShare',
    label: 'Screen sharing',
    description: 'We capture your screen so we can follow along with your clicks.',
    icon: 'wm-screen-share',
    group: 'screenShare',
  },
]
