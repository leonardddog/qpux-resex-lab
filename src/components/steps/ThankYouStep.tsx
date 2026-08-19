import { useEffect, useState } from 'react'
import thankYouImg from '../../../assets/thank-you.svg'

export default function ThankYouPanel({ submitted = true }: { submitted?: boolean }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!submitted) return
    const id = window.setInterval(() => {
      setPulse(true)
      const t = window.setTimeout(() => setPulse(false), 1000)
      return () => window.clearTimeout(t)
    }, 3000)
    return () => window.clearInterval(id)
  }, [submitted])

  return (
    <div className={`thankyou-step${submitted ? '' : ' thankyou-step--plain'}`}>
      {submitted && (
        <div className="thankyou-step__media">
          <img
            src={thankYouImg}
            alt=""
            className={`thankyou-step__img${pulse ? ' animate__animated animate__pulse' : ''}`}
          />
        </div>
      )}
      {submitted && <h2 className="thankyou-step__heading">Thank you!</h2>}
      <p className="thankyou-step__copy">
        {submitted
          ? <>All set! We have everything we need, so feel free to close this page. Thanks your feedback, it truly helps us make things better.</>
          : 'Your session has been ended. Your response was not submitted. Thank you for your time.'}
      </p>
      <p className="instr-powered">
        Powered by{' '}
        <a href="https://www.questionpro.com" target="_blank" rel="noreferrer">
          QuestionPro
        </a>
      </p>
    </div>
  )
}
