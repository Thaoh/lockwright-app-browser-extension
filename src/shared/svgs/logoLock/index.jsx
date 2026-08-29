import React from 'react'

/**
 * @param {{
 *  width?: string,
 *  height?: string
 * }} props
 */
export const LogoLock = ({ width = '32', height = '43' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="Lockwright"
  >
    <rect
      x="4"
      y="4"
      width="56"
      height="56"
      rx="2"
      fill="#14161b"
      stroke="#b08d57"
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
    <rect x="25" y="20" width="14" height="14" rx="2" fill="#d4af77" />
    <rect x="29" y="32" width="6" height="14" rx="1" fill="#d4af77" />
  </svg>
)
