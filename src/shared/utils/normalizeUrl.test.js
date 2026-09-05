import { normalizeUrl } from './normalizeUrl'

describe('normalizeUrl', () => {
  test('should add https protocol if missing and lowercases host', () => {
    expect(normalizeUrl('Example.COM')).toBe('https://example.com')
  })

  test('should default to http when defaultToSecureProtocol is false', () => {
    expect(normalizeUrl('Example.COM', false)).toBe('http://example.com')
  })

  test('should retain existing http protocol and lowercases', () => {
    expect(normalizeUrl('HTTP://ExAmPlE.com')).toBe('http://example.com')
  })

  test('should retain existing https protocol and lowercases', () => {
    expect(normalizeUrl('https://Example.com')).toBe('https://example.com')
  })

  test('should strip default port 80 for http', () => {
    expect(normalizeUrl('http://example.com:80')).toBe('http://example.com')
  })

  test('should strip default port 443 for https', () => {
    expect(normalizeUrl('https://example.com:443')).toBe('https://example.com')
  })

  test('should keep non-standard ports', () => {
    expect(normalizeUrl('example.com:8080')).toBe('https://example.com:8080')
    expect(normalizeUrl('https://Example.COM:8443/path')).toBe(
      'https://example.com:8443/path'
    )
  })

  test('should removes trailing slash on path', () => {
    expect(normalizeUrl('example.com/path/')).toBe('https://example.com/path')
    expect(normalizeUrl('https://example.com/path/')).toBe(
      'https://example.com/path'
    )
  })

  test('should returns null for invalid URLs', () => {
    expect(normalizeUrl('not a valid url')).toBeNull()
    expect(normalizeUrl('')).toBeNull()
  })

  test('keeps androidapp URIs', () => {
    expect(normalizeUrl('androidapp://com.twitter.android')).toBe(
      'androidapp://com.twitter.android'
    )
  })

  test('unwraps an https prefix glued onto an androidapp URI', () => {
    expect(normalizeUrl('https://androidapp://com.twitter.android')).toBe(
      'androidapp://com.twitter.android'
    )
  })
})
