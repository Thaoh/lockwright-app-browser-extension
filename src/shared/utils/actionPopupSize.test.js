import {
  clampActionPopupSize,
  loadActionPopupSize,
  saveActionPopupSize
} from './actionPopupSize'
import {
  ACTION_POPUP_MAX_HEIGHT,
  ACTION_POPUP_MAX_WIDTH,
  ACTION_POPUP_MIN_HEIGHT,
  ACTION_POPUP_MIN_WIDTH,
  ACTION_POPUP_SIZE_STORAGE_KEY,
  mainExtensionWindowSize
} from '../constants/windowSizes'

describe('actionPopupSize', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    }
  })

  afterEach(() => {
    delete global.chrome
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('clampActionPopupSize', () => {
    it('clamps below min to min', () => {
      expect(clampActionPopupSize({ width: 100, height: 50 })).toEqual({
        width: ACTION_POPUP_MIN_WIDTH,
        height: ACTION_POPUP_MIN_HEIGHT
      })
    })

    it('clamps above max to max', () => {
      expect(clampActionPopupSize({ width: 9999, height: 9999 })).toEqual({
        width: ACTION_POPUP_MAX_WIDTH,
        height: ACTION_POPUP_MAX_HEIGHT
      })
    })

    it('passes through valid sizes', () => {
      expect(clampActionPopupSize({ width: 700, height: 550 })).toEqual({
        width: 700,
        height: 550
      })
    })
  })

  describe('loadActionPopupSize', () => {
    it('returns default when storage key is missing', async () => {
      chrome.storage.local.get.mockResolvedValue({})

      await expect(loadActionPopupSize()).resolves.toEqual(
        mainExtensionWindowSize
      )
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ACTION_POPUP_SIZE_STORAGE_KEY
      )
    })

    it('returns default when chrome storage is unavailable', async () => {
      global.chrome = undefined

      await expect(loadActionPopupSize()).resolves.toEqual(
        mainExtensionWindowSize
      )
    })

    it('clamps oversized stored values', async () => {
      chrome.storage.local.get.mockResolvedValue({
        [ACTION_POPUP_SIZE_STORAGE_KEY]: { width: 1200, height: 900 }
      })

      await expect(loadActionPopupSize()).resolves.toEqual({
        width: ACTION_POPUP_MAX_WIDTH,
        height: ACTION_POPUP_MAX_HEIGHT
      })
    })

    it('returns stored valid size', async () => {
      chrome.storage.local.get.mockResolvedValue({
        [ACTION_POPUP_SIZE_STORAGE_KEY]: { width: 720, height: 540 }
      })

      await expect(loadActionPopupSize()).resolves.toEqual({
        width: 720,
        height: 540
      })
    })
  })

  describe('saveActionPopupSize', () => {
    it('writes clamped values to chrome storage', async () => {
      chrome.storage.local.set.mockResolvedValue(undefined)

      await saveActionPopupSize({ width: 50, height: 9999 })

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [ACTION_POPUP_SIZE_STORAGE_KEY]: {
          width: ACTION_POPUP_MIN_WIDTH,
          height: ACTION_POPUP_MAX_HEIGHT
        }
      })
    })

    it('does not throw when chrome storage is unavailable', async () => {
      global.chrome = undefined

      await expect(
        saveActionPopupSize({ width: 700, height: 550 })
      ).resolves.toBeUndefined()
    })
  })
})
