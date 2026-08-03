import type { ReactNode } from 'react'

interface SplitLayoutProps {
  left: ReactNode
  children?: ReactNode
}

export default function SplitLayout({ left, children }: SplitLayoutProps) {
  return (
    <div className="split">
      <div className="split-left">{left}</div>
      <div className="split-right">{children}</div>
    </div>
  )
}
