import { useEffect, useState } from 'react'
import { WuButton } from '@npm-questionpro/wick-ui-lib'
import Lottie from 'lottie-react'
import uploader from '../../../assets/uploading.json'
import success from '../../../assets/sucess.json'

export function PostTestPanel() {
  const [showProgress, setShowProgress] = useState(false)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

  useEffect(() => {
    if (!showProgress || uploadComplete) return
    const timer = window.setInterval(() => {
      setUploadPercent((prev) => {
        if (prev >= 100) {
          window.clearInterval(timer)
          return 100
        }
        return Math.min(100, prev + Math.ceil(Math.random() * 8))
      })
    }, 350)
    return () => window.clearInterval(timer)
  }, [showProgress, uploadComplete])

  const done = uploadComplete || uploadPercent >= 100

  return (
    <div className="post-test-panel">
      <div className="instr-group">
        <div className="instr-intro">
          <p>Thanks your participation, please answer the follow-up survey.</p>
          <p>Your session will only be counted once the survey is submitted.</p>
        </div>
      </div>
      <div className="instr-group">
        {showProgress ? (
          <div className="post-progress">
            {uploadComplete ? (
              <>
                <Lottie
                  animationData={success}
                  loop={false}
                  autoplay={false}
                  initialSegment={[47, 47]}
                  className="post-progress-anim"
                />
                <p className="post-progress-text">Session uploaded!</p>
              </>
            ) : (
              <>
                {uploadPercent >= 100 ? (
                  <Lottie
                    key="success"
                    animationData={success}
                    loop={false}
                    autoplay
                    className="post-progress-anim"
                    onComplete={() => setUploadComplete(true)}
                  />
                ) : (
                  <Lottie
                    key="uploader"
                    animationData={uploader}
                    loop
                    autoplay
                    className="post-progress-anim"
                  />
                )}
                <p className="post-progress-text">
                  {uploadPercent >= 100
                    ? 'Session uploaded!'
                    : `Uploading your session (${uploadPercent}%)`}
                </p>
              </>
            )}
            <WuButton
              className="post-progress-toggle"
              variant="secondary"
              onClick={() => setShowProgress(false)}
            >
              Hide
            </WuButton>
          </div>
        ) : (
          <>
            <p className="instr-disclaimer">
              {done
                ? 'Your session has been submitted!'
                : "Note: We're saving your recording in the background, don't worry."}
            </p>
            {!uploadComplete ? (
              <WuButton
                className="post-progress-toggle post-progress-toggle--see"
                variant="secondary"
                onClick={() => setShowProgress(true)}
              >
                See progress
              </WuButton>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
