import { normalizeUrl } from './normalizeUrl'
import { CHROME_STORAGE_KEYS } from '../constants/storage'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

const VALID_MATCH_TYPES = new Set(Object.values(URI_MATCH_TYPES))

/** @type {string} */
let cachedDefault = URI_MATCH_TYPES.DOMAIN

/** @type {Record<string, Record<string, string>>} */
let cachedOverrides = {}

let hydrated = false
let hydratePromise = null
let changeListenerAttached = false

const isValidMatchType = (value) => VALID_MATCH_TYPES.has(value)

const normalizeWebsiteKey = (website) => {
  if (!website || typeof website !== 'string') return null
  return normalizeUrl(website, true) || website.trim().toLowerCase() || null
}

const ensureChangeListener = () => {
  if (changeListenerAttached) return
  if (!chrome?.storage?.onChanged?.addListener) return
  changeListenerAttached = true
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return
    let changed = false
    if (CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE in changes) {
      const next = changes[CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]?.newValue
      cachedDefault = isValidMatchType(next) ? next : URI_MATCH_TYPES.DOMAIN
      changed = true
    }
    if (CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES in changes) {
      const next = changes[CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES]?.newValue
      cachedOverrides =
        next && typeof next === 'object' && !Array.isArray(next) ? next : {}
      changed = true
    }
    if (changed) {
      hydrated = true
      for (const cb of listeners) cb()
    }
  })
}

/** @type {Set<() => void>} */
const listeners = new Set()

/**
 * Loads default + overrides into the in-memory cache.
 * @returns {Promise<void>}
 */
export const hydrateUriMatchSettings = async () => {
  ensureChangeListener()
  if (hydrated) return
  if (!chrome?.storage?.local?.get) {
    hydrated = true
    return
  }
  if (hydratePromise) return hydratePromise

  hydratePromise = (async () => {
    const res = await chrome.storage.local.get([
      CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE,
      CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES
    ])
    const storedDefault = res?.[CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]
    cachedDefault = isValidMatchType(storedDefault)
      ? storedDefault
      : URI_MATCH_TYPES.DOMAIN
    const storedOverrides = res?.[CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES]
    cachedOverrides =
      storedOverrides &&
      typeof storedOverrides === 'object' &&
      !Array.isArray(storedOverrides)
        ? storedOverrides
        : {}
    hydrated = true
  })().finally(() => {
    hydratePromise = null
  })

  return hydratePromise
}

/**
 * @returns {Promise<string>}
 */
export const getDefaultUriMatchType = async () => {
  await hydrateUriMatchSettings()
  return cachedDefault
}

/**
 * Sync read of the cached default (domain if not hydrated yet).
 * @returns {string}
 */
export const getDefaultUriMatchTypeSync = () => cachedDefault

/**
 * @param {string} matchType
 * @returns {Promise<void>}
 */
export const setDefaultUriMatchType = async (matchType) => {
  if (!isValidMatchType(matchType)) return
  cachedDefault = matchType
  hydrated = true
  if (!chrome?.storage?.local?.set) return
  await chrome.storage.local.set({
    [CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]: matchType
  })
}

/**
 * @param {string} recordId
 * @returns {Promise<Record<string, string>>}
 */
export const getUriMatchOverrides = async (recordId) => {
  await hydrateUriMatchSettings()
  if (!recordId) return {}
  return { ...(cachedOverrides[recordId] ?? {}) }
}

/**
 * Replaces overrides for a record. Website keys are normalized.
 * @param {string} recordId
 * @param {Record<string, string>} overrides
 * @returns {Promise<void>}
 */
export const setUriMatchOverrides = async (recordId, overrides) => {
  if (!recordId) return

  await hydrateUriMatchSettings()

  /** @type {Record<string, string>} */
  const normalized = {}
  if (overrides && typeof overrides === 'object') {
    for (const [website, matchType] of Object.entries(overrides)) {
      if (!isValidMatchType(matchType)) continue
      const key = normalizeWebsiteKey(website)
      if (!key) continue
      normalized[key] = matchType
    }
  }

  const nextAll = { ...cachedOverrides }
  if (Object.keys(normalized).length === 0) {
    delete nextAll[recordId]
  } else {
    nextAll[recordId] = normalized
  }
  cachedOverrides = nextAll
  hydrated = true

  if (!chrome?.storage?.local?.set) return
  await chrome.storage.local.set({
    [CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES]: nextAll
  })
}

/**
 * Sync: override for (recordId, website) || cached default || domain.
 * @param {string} recordId
 * @param {string} website
 * @returns {string}
 */
export const resolveUriMatchType = (recordId, website) => {
  ensureChangeListener()
  const key = normalizeWebsiteKey(website)
  if (recordId && key) {
    const override = cachedOverrides?.[recordId]?.[key]
    if (isValidMatchType(override)) return override
  }
  return isValidMatchType(cachedDefault)
    ? cachedDefault
    : URI_MATCH_TYPES.DOMAIN
}

/**
 * @param {() => void} cb
 * @returns {() => void}
 */
export const onUriMatchSettingsChanged = (cb) => {
  ensureChangeListener()
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** @internal */
export const __resetUriMatchSettingsCacheForTests = () => {
  cachedDefault = URI_MATCH_TYPES.DOMAIN
  cachedOverrides = {}
  hydrated = false
  hydratePromise = null
  changeListenerAttached = false
  listeners.clear()
}
