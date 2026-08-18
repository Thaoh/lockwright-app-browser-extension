import { extractNameFromDomain } from './extractNameFromDomain'

describe('extractNameFromDomain', () => {
  it('should return the name from a domain with subdomain', () => {
    const url = 'https://sub.example.com'
    const result = extractNameFromDomain(url)
    expect(result).toBe('Example')
  })

  it('should return the name from a domain without subdomain', () => {
    const url = 'https://example.com'
    const result = extractNameFromDomain(url)
    expect(result).toBe('Example')
  })

  it('should return the name from a domain with multiple subdomains', () => {
    const url = 'https://sub1.sub2.example.com'
    const result = extractNameFromDomain(url)
    expect(result).toBe('Sub1 Sub2 Example')
  })

  it('should return an empty string if the URL is empty', () => {
    const url = ''
    const result = extractNameFromDomain(url)
    expect(result).toBe('')
  })

  it('should handle domains with country code TLDs', () => {
    const url = 'https://example.co.uk'
    const result = extractNameFromDomain(url)
    expect(result).toBe('Example')
  })

  it('should return capitalized hostname for localhost', () => {
    expect(extractNameFromDomain('http://localhost:8080/dashboard')).toBe(
      'Localhost'
    )
  })
})
