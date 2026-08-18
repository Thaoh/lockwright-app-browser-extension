import { isFetchableFaviconUrl } from './isFetchableFaviconUrl'

describe('isFetchableFaviconUrl', () => {
  it('returns true for https://example.com', () => {
    expect(isFetchableFaviconUrl('https://example.com')).toBe(true)
  })

  it('returns true for bare hostname example.com', () => {
    expect(isFetchableFaviconUrl('example.com')).toBe(true)
  })

  it('returns true for http IP', () => {
    expect(isFetchableFaviconUrl('http://10.0.12.54')).toBe(true)
  })

  it('returns false for empty / nullish', () => {
    expect(isFetchableFaviconUrl('')).toBe(false)
    expect(isFetchableFaviconUrl(null)).toBe(false)
    expect(isFetchableFaviconUrl(undefined)).toBe(false)
  })

  it('returns false for scheme-only and invalid urls', () => {
    expect(isFetchableFaviconUrl('https://')).toBe(false)
    expect(isFetchableFaviconUrl('http://')).toBe(false)
    expect(isFetchableFaviconUrl('not a url')).toBe(false)
  })
})
