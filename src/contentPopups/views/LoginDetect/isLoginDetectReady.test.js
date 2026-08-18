import { isLoginDetectReady } from './isLoginDetectReady'

describe('isLoginDetectReady', () => {
  it('returns false when not initialized', () => {
    expect(
      isLoginDetectReady({
        isInitialized: false,
        isLoading: false,
        recordsData: []
      })
    ).toBe(false)
  })

  it('returns false when recordsData is not an array', () => {
    expect(
      isLoginDetectReady({
        isInitialized: true,
        isLoading: false,
        recordsData: null
      })
    ).toBe(false)
  })

  it('returns false when loading with empty records (stale empty snapshot)', () => {
    expect(
      isLoginDetectReady({
        isInitialized: true,
        isLoading: true,
        recordsData: []
      })
    ).toBe(false)
  })

  it('returns true when initialized with empty records and not loading (genuine empty vault)', () => {
    expect(
      isLoginDetectReady({
        isInitialized: true,
        isLoading: false,
        recordsData: []
      })
    ).toBe(true)
  })

  it('returns true when initialized with non-empty records even while loading', () => {
    expect(
      isLoginDetectReady({
        isInitialized: true,
        isLoading: true,
        recordsData: [{ id: '1' }]
      })
    ).toBe(true)
  })

  it('returns true when initialized with non-empty records and not loading', () => {
    expect(
      isLoginDetectReady({
        isInitialized: true,
        isLoading: false,
        recordsData: [{ id: '1' }]
      })
    ).toBe(true)
  })
})
