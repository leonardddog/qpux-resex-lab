import Lottie from 'lottie-react'
import thankYouWink from '../../../assets/thank-you-wink.json'
import CenteredOutcome from './CenteredOutcome'

export default function ThankYouPanel({ submitted = true }: { submitted?: boolean }) {
  return (
    <CenteredOutcome
      animate={submitted}
      media={<Lottie animationData={thankYouWink} loop className="thankyou-step__img" />}
      heading={submitted ? 'Thank you!' : undefined}
      copy={
        submitted
          ? <>All set! We have everything we need, so feel free to close this page. Thanks your feedback, it truly helps us make things better.</>
          : 'Your session has been ended. Your response was not submitted. Thank you for your time.'
      }
    />
  )
}
