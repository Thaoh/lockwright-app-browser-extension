import { addHttps } from './addHttps'

/**
 *
 * @param {string} url
 * @returns  {string}
 */
export function extractNameFromDomain(url) {
  if (!url) {
    return ''
  }

  let hostname

  try {
    const parsed = new URL(addHttps(url))
    hostname = parsed.hostname
  } catch {
    return ''
  }

  if (!hostname) {
    return ''
  }

  const parts = hostname.split('.')

  // localhost, intranet hosts, raw IPs — use the hostname itself.
  if (parts.length < 2 || /^\d+$/.test(parts[parts.length - 1])) {
    return hostname.charAt(0).toUpperCase() + hostname.slice(1)
  }

  const labels = parts.slice(0, -1)

  const domainLabels = labels.reduce((acc, label) => {
    if (label.length > 3) {
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
      acc.push(capitalizedLabel)
    }
    return acc
  }, [])

  return domainLabels.join(' ')
}
