/**
 * @param {string} urlString
 * @param defaultToSecureProtocol
 * @returns {string | null}
 */
export const normalizeUrl = (urlString, defaultToSecureProtocol = true) => {
  try {
    if (typeof urlString !== 'string') return null
    let trimmed = urlString.trim()
    if (!trimmed) return null
    trimmed = trimmed.replace(/^(https?:\/\/)((?:android|ios)app:\/\/)/i, '$2')

    const defaultProtocolPrefix = defaultToSecureProtocol
      ? 'https://'
      : 'http://'
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `${defaultProtocolPrefix}${trimmed}`
    const url = new URL(withProtocol)

    // Lower‑case the protocol and hostname
    const protocol = url.protocol.toLowerCase()
    const hostname = url.hostname.toLowerCase()

    // Include port only if non‑standard
    const port =
      url.port && url.port !== '80' && url.port !== '443' ? `:${url.port}` : ''

    // Strip any trailing slash from the path
    const path = url.pathname.replace(/\/$/, '')

    // Rebuild the normalized URL
    return `${protocol}//${hostname}${port}${path}`
  } catch {
    // invalid URL
    return null
  }
}
