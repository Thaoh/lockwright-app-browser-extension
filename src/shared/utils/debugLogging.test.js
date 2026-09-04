import {
  loadDebugLogging,
  setDebugLogging,
  watchDebugLogging
} from './debugLogging'
import { logger } from './logger'
import { CHROME_STORAGE_KEYS } from '../constants/storage'

describe('debugLogging', () => {
  beforeEach(() => {
    logger.setDebugMode(false)
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        },
        onChanged: {
          addListener: jest.fn()
        }
      }
    }
  })

  afterEach(() => {
    logger.setDebugMode(false)
    delete global.chrome
    jest.clearAllMocks()
  })

  it('loadDebugLogging turns logger debug on from storage', async () => {
    chrome.storage.local.get.mockResolvedValue({
      [CHROME_STORAGE_KEYS.DEBUG_LOGGING]: true
    })

    await loadDebugLogging()

    expect(logger.debugMode).toBe(true)
  })

  it('setDebugLogging persists and enables logger debug', async () => {
    chrome.storage.local.set.mockResolvedValue()

    await setDebugLogging(true)

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [CHROME_STORAGE_KEYS.DEBUG_LOGGING]: true
    })
    expect(logger.debugMode).toBe(true)
  })

  it('watchDebugLogging applies storage changes', () => {
    let listener
    chrome.storage.onChanged.addListener.mockImplementation((fn) => {
      listener = fn
    })

    watchDebugLogging()
    listener(
      { [CHROME_STORAGE_KEYS.DEBUG_LOGGING]: { newValue: true } },
      'local'
    )

    expect(logger.debugMode).toBe(true)
  })
})
