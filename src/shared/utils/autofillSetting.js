import { CHROME_STORAGE_KEYS } from '../constants/storage'

/**
 * Gets the current autofill enabled state from Chrome storage
 * @returns {Promise<boolean>} Promise that resolves to true if autofill is enabled, false otherwise. Defaults to true if storage is unavailable.
 */
export const getAutofillEnabled = async () => {
  if (!chrome?.storage?.local?.get) return true
  try {
    const res = await chrome.storage.local.get(
      CHROME_STORAGE_KEYS.AUTOFILL_ENABLED
    )
    const enabled = res?.[CHROME_STORAGE_KEYS.AUTOFILL_ENABLED]
    return enabled !== false
  } catch {
    return true
  }
}

/**
 * Sets the autofill enabled state in Chrome storage
 * @param {boolean} isEnabled - Whether autofill should be enabled
 * @returns {Promise<void>} Promise that resolves when the value is set
 */
export const setAutofillEnabled = async (isEnabled) => {
  if (!chrome?.storage?.local?.set) return
  await chrome.storage.local.set({
    [CHROME_STORAGE_KEYS.AUTOFILL_ENABLED]: isEnabled
  })
}

/**
 * Subscribes to changes in the autofill enabled setting
 * @param {function(boolean): void} cb - Callback that receives the new enabled state
 * @returns {function(): void} Unsubscribe function to remove the listener
 */
export const onAutofillEnabledChanged = (cb) => {
  if (!chrome?.storage?.onChanged?.addListener) return () => {}
  const handler = (changes, area) => {
    if (area !== 'local') return
    if (CHROME_STORAGE_KEYS.AUTOFILL_ENABLED in changes) {
      const newVal = changes[CHROME_STORAGE_KEYS.AUTOFILL_ENABLED]?.newValue
      cb(newVal !== false)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}
