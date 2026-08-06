import loader from '../../../assets/loader.gif'

interface LoaderStepProps {
  showText?: boolean
}

export default function LoaderStep({ showText = true }: LoaderStepProps) {
  return (
    <div className="loader">
      <img className="loader-media" src={loader} alt="" />
      {showText ? <p className="loader-text">Preparing your test session…</p> : null}
    </div>
  )
}
