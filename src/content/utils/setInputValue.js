/**
 * Set an input/textarea/select value via the native prototype setter (React-safe)
 * and dispatch bubbling input + change events.
 *
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} element
 * @param {string} value
 */
export function setInputValue(element, value) {
  if (!element) {
    return
  }

  try {
    element.focus()
  } catch {
    // ignore focus errors (detached / inert)
  }

  const proto =
    element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : null

  const descriptor = proto
    ? Object.getOwnPropertyDescriptor(proto, 'value')
    : null

  if (descriptor?.set) {
    descriptor.set.call(element, value)
  } else {
    element.value = value
  }

  const inputEvent =
    typeof InputEvent !== 'undefined'
      ? new InputEvent('input', { bubbles: true })
      : new Event('input', { bubbles: true })

  element.dispatchEvent(inputEvent)
  element.dispatchEvent(new Event('change', { bubbles: true }))
}
