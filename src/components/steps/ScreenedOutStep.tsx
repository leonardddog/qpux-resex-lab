import { WuButton } from '@npm-questionpro/wick-ui-lib'
import screenedOutImg from '../../../assets/screened-out.svg'
import CenteredOutcome from './CenteredOutcome'

export default function ScreenedOutPanel() {
  return (
    <CenteredOutcome
      animate
      media={<img src={screenedOutImg} alt="" className="thankyou-step__img" />}
      heading="Thanks for your time!"
      copy={
        <>
          Unfortunately, you don&apos;t meet the criteria for this test.
          <br />
          You got interested? There are plenty of other opportunities waiting for you:
        </>
      }
      actions={
        <WuButton
          className="instr-footer-button"
          onClick={() => {
            window.open('https://ux.questionpro.com/tester/signup', '_blank', 'noopener')
          }}
        >
          Get paid to test
        </WuButton>
      }
    />
  )
}
