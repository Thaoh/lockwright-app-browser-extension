import { isExpectedQuietError } from './isExpectedQuietError'

describe('isExpectedQuietError', () => {
  it('returns true for MasterPasswordRequired (Error message)', () => {
    expect(isExpectedQuietError(new Error('MasterPasswordRequired'))).toBe(true)
  })

  it('returns true for RTK SerializedError with MasterPasswordRequired message', () => {
    expect(
      isExpectedQuietError({ name: 'Error', message: 'MasterPasswordRequired' })
    ).toBe(true)
  })

  it('returns true for Favicon not found (case-insensitive)', () => {
    expect(isExpectedQuietError(new Error('favicon not found'))).toBe(true)
  })

  it('returns true for INVALID_URL in stringified error', () => {
    expect(isExpectedQuietError('INVALID_URL: bad url')).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(isExpectedQuietError(new Error('boom'))).toBe(false)
  })

  it('returns false for empty / nullish', () => {
    expect(isExpectedQuietError('')).toBe(false)
    expect(isExpectedQuietError(null)).toBe(false)
    expect(isExpectedQuietError(undefined)).toBe(false)
  })
})
