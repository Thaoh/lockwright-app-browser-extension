/**
 *
 * @param {HTMLInputElement} element
 * @returns {boolean}
 */
export const isCreditCardField = (element) => {
  const autocomplete = (
    element.getAttribute('autocomplete') || ''
  ).toLowerCase()
  if (
    autocomplete === 'one-time-code' ||
    autocomplete.split(/\s+/).includes('one-time-code')
  ) {
    return false
  }

  // OTP fields often use name/id "otp" with a "Security code" label — not CVV
  const nameAndId = `${element.name || ''} ${element.id || ''}`
  if (/\botp\b/i.test(nameAndId)) {
    return false
  }

  const creditCardFieldPatterns = [
    /cc-(number|name|exp|csc)/i,
    /card.?(number|no)\b/i,
    /cardnumber/i,
    /card.?holder/i,
    /name.?on.?card/i,
    /(security|card).?code/i,
    /\b(cvv|cvc|csc)\b/i,
    /expir/i
  ]

  const labelText = element.labels
    ? Array.from(element.labels)
        .map((label) => label.textContent)
        .join(' ')
    : ''

  const attributes = [
    element.getAttribute('autocomplete') || '',
    element.name || '',
    element.id || '',
    element.placeholder || '',
    labelText
  ]

  return creditCardFieldPatterns.some((pattern) =>
    attributes.some((attr) => pattern.test(attr))
  )
}
