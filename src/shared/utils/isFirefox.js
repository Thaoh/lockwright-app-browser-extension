/**
 * True on Firefox / Gecko forks (Zen, etc.).
 * Used to skip Chrome popup-window APIs and vw/vh clamps that break
 * browser-action panels (viewport often starts ~0×0).
 */
export const isFirefox = () => {
  if (
    typeof location !== 'undefined' &&
    location.protocol === 'moz-extension:'
  ) {
    return true
  }
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (ua.includes('Firefox') || ua.includes('Zen/')) return true
  // Gecko forks without "Firefox" in UA (some Zen builds)
  if (
    ua.includes('Gecko/') &&
    !ua.includes('Chrome/') &&
    !ua.includes('Chromium/')
  ) {
    return true
  }
  return typeof globalThis.browser?.runtime?.getBrowserInfo === 'function'
}
