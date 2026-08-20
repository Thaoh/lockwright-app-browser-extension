import { isExpectedQuietError } from './isExpectedQuietError'

/**
 * Replace vaultLogger.error so expected quiet errors are not logged.
 * Non-quiet args are forwarded to the original error unchanged.
 *
 * @param {{ error: (...args: unknown[]) => void }} vaultLogger
 */
export const silenceVaultLibLogger = (vaultLogger) => {
  const originalError = vaultLogger.error.bind(vaultLogger)

  vaultLogger.error = (...args) => {
    if (args.some((arg) => isExpectedQuietError(arg))) {
      return
    }
    return originalError(...args)
  }
}
