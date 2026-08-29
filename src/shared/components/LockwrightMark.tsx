type LockwrightMarkProps = {
  width?: number | string
  height?: number | string
  color?: string
  style?: React.CSSProperties
}

export function LockwrightMark({
  width = 24,
  height = 24,
  color = '#b08d57',
  style
}: LockwrightMarkProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lockwright"
      style={style}
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="2"
        fill="#14161b"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="2"
        fill="#08090b"
        stroke="#2a2e36"
        strokeWidth="1"
      />
      <rect x="25" y="20" width="14" height="14" rx="2" fill={color} />
      <rect x="29" y="32" width="6" height="14" rx="1" fill={color} />
    </svg>
  )
}
