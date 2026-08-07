import {
  getDefaultUriMatchType,
  setDefaultUriMatchType,
  getUriMatchOverrides,
  setUriMatchOverrides,
  resolveUriMatchType,
  hydrateUriMatchSettings,
  onUriMatchSettingsChanged,
  __resetUriMatchSettingsCacheForTests
} from './uriMatchSetting'
import { CHROME_STORAGE_KEYS } from '../constants/storage'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

describe('uriMatchSetting', () => {
  let mockChromeStorage
  let mockChromeStorageOnChanged

  beforeEach(() => {
    __resetUriMatchSettingsCacheForTests()

    mockChromeStorage = {
      local: {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn().mockResolvedValue(undefined)
      }
    }

    mockChromeStorageOnChanged = {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }

    global.chrome = {
      storage: {
        ...mockChromeStorage,
        onChanged: mockChromeStorageOnChanged
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete global.chrome
    __resetUriMatchSettingsCacheForTests()
  })

  describe('getDefaultUriMatchType / setDefaultUriMatchType', () => {
    it('defaults to domain when unset or storage unavailable', async () => {
      global.chrome = undefined
      expect(await getDefaultUriMatchType()).toBe(URI_MATCH_TYPES.DOMAIN)

      global.chrome = {
        storage: {
          local: { get: jest.fn().mockResolvedValue({}) },
          onChanged: mockChromeStorageOnChanged
        }
      }
      expect(await getDefaultUriMatchType()).toBe(URI_MATCH_TYPES.DOMAIN)
    })

    it('persists and returns a valid default match type', async () => {
      await setDefaultUriMatchType(URI_MATCH_TYPES.HOST)

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        [CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]: URI_MATCH_TYPES.HOST
      })
      expect(await getDefaultUriMatchType()).toBe(URI_MATCH_TYPES.HOST)
      expect(resolveUriMatchType('rec-1', 'https://example.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
    })

    it('rejects invalid match types and keeps domain', async () => {
      await setDefaultUriMatchType('regex')
      expect(mockChromeStorage.local.set).not.toHaveBeenCalled()
      expect(await getDefaultUriMatchType()).toBe(URI_MATCH_TYPES.DOMAIN)
    })
  })

  describe('overrides', () => {
    it('stores overrides keyed by recordId and normalized website', async () => {
      await setUriMatchOverrides('rec-1', {
        'https://example.com': URI_MATCH_TYPES.EXACT,
        'example.com/path': URI_MATCH_TYPES.STARTS_WITH
      })

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        [CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES]: {
          'rec-1': {
            'https://example.com': URI_MATCH_TYPES.EXACT,
            'https://example.com/path': URI_MATCH_TYPES.STARTS_WITH
          }
        }
      })

      const overrides = await getUriMatchOverrides('rec-1')
      expect(overrides['https://example.com']).toBe(URI_MATCH_TYPES.EXACT)
      expect(overrides['https://example.com/path']).toBe(
        URI_MATCH_TYPES.STARTS_WITH
      )
    })

    it('resolveUriMatchType prefers override over default', async () => {
      await setDefaultUriMatchType(URI_MATCH_TYPES.HOST)
      await setUriMatchOverrides('rec-1', {
        'https://example.com': URI_MATCH_TYPES.EXACT
      })

      expect(resolveUriMatchType('rec-1', 'https://example.com')).toBe(
        URI_MATCH_TYPES.EXACT
      )
      expect(resolveUriMatchType('rec-1', 'https://other.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
      expect(resolveUriMatchType('rec-2', 'https://example.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
    })

    it('replaces the full override map for a recordId', async () => {
      await setUriMatchOverrides('rec-1', {
        'https://example.com': URI_MATCH_TYPES.HOST
      })
      await setUriMatchOverrides('rec-1', {
        'https://other.com': URI_MATCH_TYPES.EXACT
      })

      const overrides = await getUriMatchOverrides('rec-1')
      expect(overrides).toEqual({
        'https://other.com': URI_MATCH_TYPES.EXACT
      })
    })
  })

  describe('hydrate + onChanged cache', () => {
    it('hydrates cache from storage so sync resolve works', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        [CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]:
          URI_MATCH_TYPES.STARTS_WITH,
        [CHROME_STORAGE_KEYS.URI_MATCH_OVERRIDES]: {
          'rec-9': { 'https://example.com': URI_MATCH_TYPES.HOST }
        }
      })

      await hydrateUriMatchSettings()

      expect(resolveUriMatchType('rec-9', 'https://example.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
      expect(resolveUriMatchType('rec-9', 'https://other.com')).toBe(
        URI_MATCH_TYPES.STARTS_WITH
      )
    })

    it('updates cache when storage changes and notifies subscribers', async () => {
      const cb = jest.fn()
      onUriMatchSettingsChanged(cb)

      const handler = mockChromeStorageOnChanged.addListener.mock.calls[0][0]
      handler(
        {
          [CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]: {
            newValue: URI_MATCH_TYPES.EXACT
          }
        },
        'local'
      )

      expect(resolveUriMatchType('x', 'https://example.com')).toBe(
        URI_MATCH_TYPES.EXACT
      )
      expect(cb).toHaveBeenCalled()
    })

    it('does not notify for unrelated storage areas/keys', () => {
      const cb = jest.fn()
      onUriMatchSettingsChanged(cb)
      const handler = mockChromeStorageOnChanged.addListener.mock.calls[0][0]

      handler(
        { [CHROME_STORAGE_KEYS.DEFAULT_URI_MATCH_TYPE]: { newValue: 'host' } },
        'sync'
      )
      handler({ 'other-key': { newValue: 1 } }, 'local')

      expect(cb).not.toHaveBeenCalled()
    })
  })
})
