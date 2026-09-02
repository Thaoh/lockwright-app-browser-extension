import { shouldDismissAfterSaveError } from './shouldDismissAfterSaveError'

describe('shouldDismissAfterSaveError', () => {
  it('is true when the vault reducer throws after a successful write', () => {
    expect(
      shouldDismissAfterSaveError(
        new TypeError("Cannot read properties of undefined (reading 'push')")
      )
    ).toBe(true)
    expect(
      shouldDismissAfterSaveError(
        new TypeError("Cannot read properties of null (reading 'records')")
      )
    ).toBe(true)
  })

  it('is false for timeout, missing vault, or a real create failure', () => {
    expect(shouldDismissAfterSaveError(new Error('timeout'))).toBe(false)
    expect(shouldDismissAfterSaveError(new Error('Vault ID is required'))).toBe(
      false
    )
    expect(
      shouldDismissAfterSaveError(new Error('Failed to create record'))
    ).toBe(false)
    expect(
      shouldDismissAfterSaveError(new Error('Invalid login data: {}'))
    ).toBe(false)
  })
})
