import { getExtensionDisplayVersion } from './appDisplayVersion'

describe('getExtensionDisplayVersion', () => {
  const previous = globalThis.__LOCKWRIGHT_GIT_SHA__

  afterEach(() => {
    if (previous === undefined) {
      delete globalThis.__LOCKWRIGHT_GIT_SHA__
    } else {
      globalThis.__LOCKWRIGHT_GIT_SHA__ = previous
    }
  })

  it('is manifest version plus injected sha6', () => {
    globalThis.__LOCKWRIGHT_GIT_SHA__ = 'cafeba'
    expect(getExtensionDisplayVersion()).toBe('0.0.1-cafeba')
  })
})
