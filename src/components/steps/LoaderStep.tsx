import loader from '../../../assets/loader.gif'

export default function LoaderStep() {
  return (
    <div className="loader">
      <img className="loader-media" src={loader} alt="" />
      <p className="loader-text">Preparing your test session…</p>
    </div>
  )
}
