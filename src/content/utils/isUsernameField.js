const USERNAME_HINT_PATTERN = /user|email|login|username|account/i
const EXCLUDED_TYPES = new Set(['password', 'hidden', 'checkbox'])

/**
 * @param {HTMLInputElement} element
 * @returns {boolean}
 */
export const isUsernameField = (element) => {
  if (!element) return false

  const type = (element.type || '').toLowerCase()
  if (EXCLUDED_TYPES.has(type)) return false
  if (type && type !== 'text' && type !== 'email') return false

  // Explicit email inputs are username fields.
  if (type === 'email') return true

  const labelText = element.labels
    ? Array.from(element.labels)
        .map((label) => label.textContent || '')
        .join(' ')
    : ''

  const autocomplete =
    (typeof element.getAttribute === 'function'
      ? element.getAttribute('autocomplete')
      : null) ||
    element.autocomplete ||
    ''

  const haystacks = [
    element.name || '',
    element.id || '',
    autocomplete,
    element.placeholder || '',
    labelText
  ]

  return haystacks.some((value) => USERNAME_HINT_PATTERN.test(value))
}
