import { getBrowserLabel } from './getBrowserLabel'

describe('getBrowserLabel', () => {
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

  it('returns Firefox for a Firefox user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0'
      },
      configurable: true,
      writable: true
    })
    expect(getBrowserLabel()).toBe('Firefox')
  })

  it('returns Zen for a Zen user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Zen/1.0'
      },
      configurable: true,
      writable: true
    })
    expect(getBrowserLabel()).toBe('Zen')
  })

  it('returns Vivaldi for a Vivaldi user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Vivaldi/7.0'
      },
      configurable: true,
      writable: true
    })
    expect(getBrowserLabel()).toBe('Vivaldi')
  })

  it('returns Chrome for a Chrome user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      configurable: true,
      writable: true
    })
    expect(getBrowserLabel()).toBe('Chrome')
  })
})
