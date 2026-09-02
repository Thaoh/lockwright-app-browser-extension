/**
 * True when create/update likely wrote to the vault, then the vault
 * slice crashed updating local state (e.g. records.push on missing array).
 * The popup should still close.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export const shouldDismissAfterSaveError = (error) => {
  const message = (error?.message || String(error || '')).toLowerCase()
  if (!message) return false

  if (
    message === 'timeout' ||
    message.includes('vault id is required') ||
    message.includes('failed to create record') ||
    message.includes('failed to update records') ||
    message.includes('invalid login data') ||
    message.includes('payload and vaultid')
  ) {
    return false
  }

  return (
    message.includes("reading 'push'") ||
    message.includes('reading "push"') ||
    message.includes("reading 'records'") ||
    message.includes('reading "records"') ||
    message.includes('immer')
  )
}
