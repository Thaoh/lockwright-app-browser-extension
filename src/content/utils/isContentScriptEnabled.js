import { getAllowHttpFromStorage } from '../../shared/utils/allowHttpStorage'
import { runtime } from '../../shared/utils/runtime'

/**
 * True when this content-script instance can still talk to the extension.
 * Becomes false after reload/update until the tab is refreshed.
 *
 * @returns {boolean}
 */
export const isExtensionContextValid = () => {
  try {
    return Boolean(runtime?.id)
  } catch {
    return false
  }
}

/**
 * Checks if the content script should be enabled for the current page.
 * The content script is enabled if the page uses a secure protocol (HTTPS)
 * or if the "Allow non-secure websites" setting is enabled in storage.
 *
 * Note: Content scripts cannot run on `chrome://`, `about:`, `file://`, etc. (per browser policy restrictions),
 * so no special protocol checks needed—these pages never execute this function.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the content script is enabled, false otherwise.
 */
export const isContentScriptEnabled = async () => {
  if (!isExtensionContextValid()) {
    return false
  }

  try {
    const isSecure = window.location.protocol === 'https:'
    const isAllowHttpEnabled = await getAllowHttpFromStorage()

    return isSecure || isAllowHttpEnabled
  } catch (error) {
    // Extension reloaded/updated while this page's old content script is alive.
    if (
      error?.message?.includes('Extension context invalidated') ||
      !isExtensionContextValid()
    ) {
      return false
    }
    throw error
  }
}
