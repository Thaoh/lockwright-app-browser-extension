import { silenceVaultLibLogger } from './silenceVaultLibLogger'

describe('silenceVaultLibLogger', () => {
  it('skips original.error for expected quiet SerializedError args', () => {
    const originalError = jest.fn()
    const vaultLogger = { error: originalError }

    silenceVaultLibLogger(vaultLogger)

    vaultLogger.error({ message: 'MasterPasswordRequired' })

    expect(originalError).not.toHaveBeenCalled()
  })

  it('forwards non-quiet args to original.error unchanged', () => {
    const originalError = jest.fn()
    const vaultLogger = { error: originalError }
    const boom = { message: 'boom' }

    silenceVaultLibLogger(vaultLogger)

    vaultLogger.error(boom)

    expect(originalError).toHaveBeenCalledWith(boom)
  })
})
