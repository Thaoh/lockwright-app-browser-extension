import {
  ACTION_POPUP_MAX_HEIGHT,
  ACTION_POPUP_MAX_WIDTH,
  ACTION_POPUP_MIN_HEIGHT,
  ACTION_POPUP_MIN_WIDTH,
  ACTION_POPUP_SIZE_STORAGE_KEY,
  mainExtensionWindowSize
} from '../constants/windowSizes'

/** In-memory fallback when chrome.storage.local is unavailable. */
let memorySize = null

const isValidSizeShape = (value) =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  typeof value.width === 'number' &&
  typeof value.height === 'number' &&
  Number.isFinite(value.width) &&
  Number.isFinite(value.height)

/**
 * Clamps action popup dimensions to browser-safe bounds.
 * @param {{ width: number, height: number }} size
 * @returns {{ width: number, height: number }}
 */
export const clampActionPopupSize = ({ width, height }) => ({
  width: Math.min(
    ACTION_POPUP_MAX_WIDTH,
    Math.max(ACTION_POPUP_MIN_WIDTH, Math.round(width))
  ),
  height: Math.min(
    ACTION_POPUP_MAX_HEIGHT,
    Math.max(ACTION_POPUP_MIN_HEIGHT, Math.round(height))
  )
})

/**
 * Applies width/height (and min-*) to documentElement and body so Firefox
 * toolbar panels follow content size.
 * @param {{ width: number, height: number }} size
 */
export const applyActionPopupDocumentSize = ({ width, height }) => {
  if (typeof document === 'undefined') return

  const widthPx = `${width}px`
  const heightPx = `${height}px`

  for (const el of [document.documentElement, document.body]) {
    if (!el?.style) continue
    el.style.width = widthPx
    el.style.height = heightPx
    el.style.minWidth = widthPx
    el.style.minHeight = heightPx
  }
}

/**
 * Loads persisted action popup size, clamped, or the default.
 * @returns {Promise<{ width: number, height: number }>}
 */
export const loadActionPopupSize = async () => {
  if (!chrome?.storage?.local?.get) {
    return memorySize
      ? clampActionPopupSize(memorySize)
      : { ...mainExtensionWindowSize }
  }

  try {
    const res = await chrome.storage.local.get(ACTION_POPUP_SIZE_STORAGE_KEY)
    const stored = res?.[ACTION_POPUP_SIZE_STORAGE_KEY]
    if (!isValidSizeShape(stored)) {
      return memorySize
        ? clampActionPopupSize(memorySize)
        : { ...mainExtensionWindowSize }
    }
    const clamped = clampActionPopupSize(stored)
    memorySize = clamped
    return clamped
  } catch {
    return memorySize
      ? clampActionPopupSize(memorySize)
      : { ...mainExtensionWindowSize }
  }
}

/**
 * Persists a clamped action popup size.
 * @param {{ width: number, height: number }} size
 * @returns {Promise<void>}
 */
export const saveActionPopupSize = async (size) => {
  const clamped = clampActionPopupSize(size)
  memorySize = clamped

  if (!chrome?.storage?.local?.set) return

  try {
    await chrome.storage.local.set({
      [ACTION_POPUP_SIZE_STORAGE_KEY]: clamped
    })
  } catch {
    // Graceful no-op — memorySize already updated.
  }
}
