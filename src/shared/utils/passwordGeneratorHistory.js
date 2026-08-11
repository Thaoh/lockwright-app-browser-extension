import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'

export const PASSWORD_GENERATOR_HISTORY_KEY = 'app/password-generator-history'
export const PASSWORD_GENERATOR_HISTORY_MAX = 500

const emptyDoc = () => ({ entries: [] })

const normalizeEntries = (raw) => {
  if (Array.isArray(raw?.entries)) return raw.entries
  if (Array.isArray(raw)) return raw
  return []
}

/**
 * @returns {Promise<Array<{ id: string, value: string, createdAt: number }>>}
 */
export const loadHistory = async () => {
  try {
    const raw = await pearpassVaultClient.activeVaultGet(
      PASSWORD_GENERATOR_HISTORY_KEY
    )
    return normalizeEntries(raw)
  } catch {
    return []
  }
}

/**
 * Prepend a generated password. Skips when newest entry has the same value.
 * Caps at PASSWORD_GENERATOR_HISTORY_MAX.
 *
 * @param {string} value
 * @returns {Promise<Array<{ id: string, value: string, createdAt: number }>>}
 */
export const appendHistory = async (value) => {
  if (typeof value !== 'string' || !value) {
    return loadHistory()
  }

  const current = await loadHistory()
  if (current[0]?.value === value) {
    return current
  }

  const next = [
    { id: generateUniqueId(), value, createdAt: Date.now() },
    ...current
  ].slice(0, PASSWORD_GENERATOR_HISTORY_MAX)

  await pearpassVaultClient.activeVaultAdd(PASSWORD_GENERATOR_HISTORY_KEY, {
    entries: next
  })
  return next
}

/**
 * @returns {Promise<Array>}
 */
export const clearHistory = async () => {
  await pearpassVaultClient.activeVaultAdd(
    PASSWORD_GENERATOR_HISTORY_KEY,
    emptyDoc()
  )
  return []
}
