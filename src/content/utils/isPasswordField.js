const PASSWORD_AUTOCOMPLETE = /\b(current-password|new-password|password)\b/i
const PASSWORD_LABEL = /\bpassword\b/i
const NEXTCLOUD_PASSWORD_INPUT = /input-field__input|password-field/

/**
 * @param {HTMLInputElement | null | undefined} element
 * @returns {boolean}
 */
export const isPasswordField = (element) => {
  if (!element) return false

  const type = (element.type || '').toLowerCase()
  if (type === 'password') return true
  if (type === 'hidden' || type === 'checkbox' || type === 'radio') {
    return false
  }

  const autocomplete =
    (typeof element.getAttribute === 'function'
      ? element.getAttribute('autocomplete')
      : null) ||
    element.autocomplete ||
    ''
  if (PASSWORD_AUTOCOMPLETE.test(autocomplete)) {
    return true
  }

  const labelText = element.labels
    ? Array.from(element.labels)
        .map((label) => label.textContent || '')
        .join(' ')
    : ''
  const className =
    typeof element.className === 'string'
      ? element.className
      : element.className?.baseVal || ''
  const hasVisibleAttr =
    typeof element.getAttribute === 'function' &&
    element.getAttribute('visible') !== null

  return (
    PASSWORD_LABEL.test(labelText) &&
    (hasVisibleAttr || NEXTCLOUD_PASSWORD_INPUT.test(className))
  )
}
