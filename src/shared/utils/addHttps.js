/**
 * @param {string} url
 * @returns {string}
 */
export const addHttps = (url) => {
  let lowerCaseUrl = url.toLowerCase()
  lowerCaseUrl = lowerCaseUrl.replace(
    /^(https?:\/\/)((?:android|ios)app:\/\/)/,
    '$2'
  )

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(lowerCaseUrl)) {
    return lowerCaseUrl
  }

  return `https://${lowerCaseUrl}`
}
