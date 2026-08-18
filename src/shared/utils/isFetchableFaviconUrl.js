import { getHostname } from './getHostname'

/**
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export const isFetchableFaviconUrl = (url) => {
  const hostname = getHostname(url)
  return Boolean(hostname)
}
