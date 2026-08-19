import type { CSSProperties, ReactNode } from 'react'

interface SplitLayoutProps {
  left?: ReactNode
  children?: ReactNode
  leftClassName?: string
  leftStyle?: CSSProperties
}

export default function SplitLayout({ left, children, leftClassName, leftStyle }: SplitLayoutProps) {
  return (
    <div className={`split${left ? '' : ' split--single'}`}>
      {left && (
        <div className={`split-left${leftClassName ? ` ${leftClassName}` : ''}`} style={leftStyle}>
          {left}
        </div>
      )}
      <div className="split-right">{children}</div>
    </div>
  )
}
