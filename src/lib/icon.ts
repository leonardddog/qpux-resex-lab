import type { CSSProperties } from 'react'

export const iconStyle = (size: number, color?: string): CSSProperties => ({
  fontSize: size,
  color,
  lineHeight: 1,
})
