export default function ThankYouPanel({ submitted = true }: { submitted?: boolean }) {
  return (
    <p className="instr-lede">
      {submitted
        ? 'Your session has been submitted. Your feedback will directly shape how we improve the experience you just tested.'
        : 'Your session has ended. Your response was not submitted. Thank you for your time.'}
    </p>
  )
}
