/**
 * Skip login-detect when the submitted creds match a recent autofill.
 * Autofill-then-change-password must NOT skip (password mismatch).
 *
 * @param {{
 *   username?: string,
 *   password?: string,
 *   lastAutofill?: { username?: string, password?: string } | null
 * }} params
 * @returns {boolean}
 */
export const shouldSkipLoginDetect = ({ username, password, lastAutofill }) => {
  if (!lastAutofill) return false

  const captureUser = (username ?? '').trim()
  const capturePass = (password ?? '').trim()
  const autofillUser = (lastAutofill.username ?? '').trim()
  const autofillPass = (lastAutofill.password ?? '').trim()

  if (!captureUser || !capturePass || !autofillUser || !autofillPass) {
    return false
  }

  return captureUser === autofillUser && capturePass === autofillPass
}
