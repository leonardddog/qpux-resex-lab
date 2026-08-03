import type { ReactNode } from 'react'
import { WuHeading } from '@npm-questionpro/wick-ui-lib'

interface InstructionsPanelProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function InstructionsPanel({ title, children, footer }: InstructionsPanelProps) {
  return (
    <aside className="instr-panel">
      <header className="instr-header">
        <WuHeading size="md" className="instr-title">
          {title}
        </WuHeading>
      </header>
      <div className="instr-content">{children}</div>
      {footer ? <footer className="instr-footer">{footer}</footer> : null}
    </aside>
  )
}
