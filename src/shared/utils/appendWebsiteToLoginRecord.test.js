import { appendWebsiteToLoginRecord } from './appendWebsiteToLoginRecord'
import {
  getDefaultUriMatchTypeSync,
  resolveUriMatchType
} from './uriMatchSetting'

jest.mock('./uriMatchSetting', () => {
  const actual = jest.requireActual('./uriMatchSetting')
  return {
    ...actual,
    getDefaultUriMatchTypeSync: jest.fn(() => 'domain'),
    resolveUriMatchType: jest.fn((_record, website) =>
      website.includes('existing') ? 'exact' : 'domain'
    )
  }
})

describe('appendWebsiteToLoginRecord', () => {
  beforeEach(() => {
    getDefaultUriMatchTypeSync.mockClear()
    resolveUriMatchType.mockClear()
  })

  it('returns null for invalid page URL', () => {
    const record = {
      id: '1',
      type: 'login',
      data: { websites: [], uris: [] }
    }
    expect(appendWebsiteToLoginRecord(record, '')).toBeNull()
    expect(appendWebsiteToLoginRecord(record, 'not a valid url')).toBeNull()
    expect(appendWebsiteToLoginRecord(null, 'https://example.com')).toBeNull()
  })

  it('returns null when website already stored (normalized)', () => {
    const record = {
      id: '1',
      type: 'login',
      data: {
        websites: ['https://example.com/path'],
        uris: [{ uri: 'https://example.com/path', match: 'domain' }]
      }
    }
    expect(
      appendWebsiteToLoginRecord(record, 'https://Example.com/path/')
    ).toBeNull()
  })

  it('returns null when URL only present in uris', () => {
    const record = {
      id: '1',
      type: 'login',
      data: {
        websites: [],
        uris: [{ uri: 'https://example.com', match: 'host' }]
      }
    }
    expect(appendWebsiteToLoginRecord(record, 'https://example.com')).toBeNull()
  })

  it('appends tab URL and rebuilds uris preserving existing match types', () => {
    const record = {
      id: '1',
      type: 'login',
      data: {
        title: 'Example',
        username: 'u',
        password: 'p',
        websites: ['https://existing.example.com'],
        uris: [{ uri: 'https://existing.example.com', match: 'exact' }]
      }
    }

    const updated = appendWebsiteToLoginRecord(
      record,
      'https://new.example.com/app'
    )

    expect(updated).not.toBeNull()
    expect(updated.data.websites).toEqual([
      'https://existing.example.com',
      'https://new.example.com/app'
    ])
    expect(updated.data.title).toBe('Example')
    expect(resolveUriMatchType).toHaveBeenCalledWith(
      record,
      'https://existing.example.com'
    )
    expect(getDefaultUriMatchTypeSync).toHaveBeenCalled()
    expect(updated.data.uris).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'https://existing.example.com',
          match: 'exact'
        }),
        expect.objectContaining({
          uri: 'https://new.example.com/app',
          match: 'baseDomain'
        })
      ])
    )
  })
})
