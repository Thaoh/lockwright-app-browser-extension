import { isFirefox } from './isFirefox'

/**
 * Human label for the current browser, stored with a pairing so desktop
 * can list Chrome and Firefox as separate devices.
 * @returns {string}
 */
export const getBrowserLabel = () => {
  const ua = globalThis.navigator?.userAgent || ''
  if (isFirefox()) {
    if (/\bZen\//i.test(ua) || /ZenBrowser/i.test(ua)) return 'Zen'
    return 'Firefox'
  }
  if (/Vivaldi/i.test(ua)) return 'Vivaldi'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera'
  if (/Brave/i.test(ua)) return 'Brave'
  return 'Chrome'
}
