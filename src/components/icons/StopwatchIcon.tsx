interface StopwatchIconProps {
  size: number
  color?: string
}

export default function StopwatchIcon({ size, color }: StopwatchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color }}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M9 1h6v2h-6zM11 3h2v2h-2zM12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM11.2 7.8h1.6v4.6h-1.6zM12.166 11.434 11.034 12.566 14.034 15.566 15.166 14.434z"
      />
    </svg>
  )
}
