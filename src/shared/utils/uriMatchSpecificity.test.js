import {
  getRecordSiteMatchRank,
  getUriMatchSpecificityRank
} from './uriMatchSpecificity'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

jest.mock('./uriMatchSetting', () => ({
  resolveUriMatchType: (record, website) => {
    const uris = record?.data?.uris
    if (!Array.isArray(uris)) return 'domain'
    const entry = uris.find((u) => u?.uri === website)
    return entry?.match || 'domain'
  }
}))

describe('uriMatchSpecificity', () => {
  it('ranks exact > startsWith > host > domain', () => {
    expect(getUriMatchSpecificityRank(URI_MATCH_TYPES.EXACT)).toBe(4)
    expect(getUriMatchSpecificityRank(URI_MATCH_TYPES.STARTS_WITH)).toBe(3)
    expect(getUriMatchSpecificityRank(URI_MATCH_TYPES.HOST)).toBe(2)
    expect(getUriMatchSpecificityRank(URI_MATCH_TYPES.DOMAIN)).toBe(1)
    expect(getUriMatchSpecificityRank('unknown')).toBe(0)
  })

  it('returns the best matching website rank for a record', () => {
    const record = {
      id: 'r1',
      data: {
        websites: ['https://example.com', 'https://example.com/app'],
        uris: [
          { uri: 'https://example.com', match: URI_MATCH_TYPES.DOMAIN },
          {
            uri: 'https://example.com/app',
            match: URI_MATCH_TYPES.STARTS_WITH
          }
        ]
      }
    }

    expect(
      getRecordSiteMatchRank(record, 'https://example.com/app/dashboard')
    ).toBe(3)
  })

  it('returns 0 when nothing matches', () => {
    const record = {
      id: 'r1',
      data: {
        websites: ['https://other.com'],
        uris: [{ uri: 'https://other.com', match: URI_MATCH_TYPES.DOMAIN }]
      }
    }
    expect(getRecordSiteMatchRank(record, 'https://example.com')).toBe(0)
  })
})
