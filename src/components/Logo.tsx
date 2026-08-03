import logo from '../../assets/questionpro.svg'

export default function Logo({ height = 28 }: { height?: number }) {
  return <img src={logo} alt="QuestionPro" height={height} className="logo" />
}
