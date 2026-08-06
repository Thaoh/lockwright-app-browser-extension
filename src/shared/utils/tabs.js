/**
 * Safe tab helpers for Gecko forks (Firefox / Zen) where there may be no
 * selected tab (empty workspace) or where `tabs.query({ url })` is unsupported.
 */

/**
 * @returns {Promise<chrome.tabs.Tab | null>}
 */
export async function queryActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    return tabs?.[0] ?? null
  } catch {
    return null
  }
}

/**
 * Query tabs by URL pattern; falls back to scanning all tabs when the browser
 * rejects URL filters (some Firefox builds) or when the query throws.
 *
 * @param {string} urlPattern
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
export async function queryTabsByUrl(urlPattern) {
  try {
    return (await chrome.tabs.query({ url: urlPattern })) ?? []
  } catch {
    try {
      const all = (await chrome.tabs.query({})) ?? []
      const needle = typeof urlPattern === 'string' ? urlPattern : ''
      // Support patterns like chrome-extension://id/* by matching prefix before *
      const prefix = needle.replace(/\*$/, '')
      return all.filter(
        (tab) => tab.url?.startsWith(prefix) || tab.url?.includes(prefix)
      )
    } catch {
      return []
    }
  }
}
