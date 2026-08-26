const IGNORED_FIELD = /\b(search|find|recipient)\b/i

/**
 * Android AutofillHints ignore search/find/recipient. Same idea on the DOM:
 * those fields are not login username/password candidates.
 *
 * @param {HTMLInputElement | HTMLSelectElement | null | undefined} element
 * @returns {boolean}
 */
export const isIgnoredField = (element) => {
  if (!element) return false

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

  return haystacks.some((value) => IGNORED_FIELD.test(value))
}
