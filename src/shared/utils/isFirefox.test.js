import { isFirefox } from './isFirefox'

describe('isFirefox', () => {
  const originalNavigator = global.navigator
  const originalLocation = global.location

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    })
    Object.defineProperty(global, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true
    })
  })

  it('returns true when userAgent contains Firefox', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0'
      },
      configurable: true,
      writable: true
    })
    expect(isFirefox()).toBe(true)
  })

  it('returns true when location protocol is moz-extension:', () => {
    Object.defineProperty(global, 'location', {
      value: { protocol: 'moz-extension:' },
      configurable: true,
      writable: true
    })
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: '' },
      configurable: true,
      writable: true
    })
    expect(isFirefox()).toBe(true)
  })

  it('returns true for Zen UA with Gecko but without Firefox', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Zen/1.0'
      },
      configurable: true,
      writable: true
    })
    expect(isFirefox()).toBe(true)
  })

  it('returns false for Chrome userAgent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      configurable: true,
      writable: true
    })
    expect(isFirefox()).toBe(false)
  })
})
