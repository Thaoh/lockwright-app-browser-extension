import {
  doesWebsiteMatchPage,
  recordMatchesCurrentSite
} from './doesWebsiteMatchPage'

describe('doesWebsiteMatchPage', () => {
  it('matches a bare host stored without protocol', () => {
    expect(
      doesWebsiteMatchPage('https://example.com/login', 'example.com')
    ).toBe(true)
  })

  it('matches https page URL to https website entry', () => {
    expect(
      doesWebsiteMatchPage('https://example.com/path', 'https://example.com')
    ).toBe(true)
  })

  it('matches across www variants', () => {
    expect(doesWebsiteMatchPage('https://www.example.com', 'example.com')).toBe(
      true
    )
    expect(doesWebsiteMatchPage('https://example.com', 'www.example.com')).toBe(
      true
    )
  })

  it('matches when either side is a subdomain of the other', () => {
    expect(
      doesWebsiteMatchPage(
        'https://login.example.com/app',
        'https://example.com'
      )
    ).toBe(true)
    expect(
      doesWebsiteMatchPage('https://example.com', 'login.example.com')
    ).toBe(true)
  })

  it('returns false for unrelated hosts', () => {
    expect(
      doesWebsiteMatchPage('https://example.com', 'https://evil-example.com')
    ).toBe(false)
    expect(doesWebsiteMatchPage('https://example.com', 'other.com')).toBe(false)
  })

  it('returns false for empty/invalid inputs', () => {
    expect(doesWebsiteMatchPage('https://example.com', '')).toBe(false)
    expect(
      doesWebsiteMatchPage('https://example.com', null as unknown as string)
    ).toBe(false)
    expect(doesWebsiteMatchPage('not-a-url', 'example.com')).toBe(false)
    expect(doesWebsiteMatchPage('https://example.com', ':::')).toBe(false)
  })
})

describe('recordMatchesCurrentSite', () => {
  it('returns true when any websites entry matches the page', () => {
    expect(
      recordMatchesCurrentSite(
        { data: { websites: ['other.com', 'example.com'] } },
        'https://www.example.com'
      )
    ).toBe(true)
  })

  it('returns false when websites is missing or empty', () => {
    expect(recordMatchesCurrentSite({}, 'https://example.com')).toBe(false)
    expect(recordMatchesCurrentSite({ data: {} }, 'https://example.com')).toBe(
      false
    )
    expect(
      recordMatchesCurrentSite(
        { data: { websites: [] } },
        'https://example.com'
      )
    ).toBe(false)
  })

  it('returns false when no website entry matches', () => {
    expect(
      recordMatchesCurrentSite(
        { data: { websites: ['other.com'] } },
        'https://example.com'
      )
    ).toBe(false)
  })
})
