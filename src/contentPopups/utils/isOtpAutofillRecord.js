/**
 * True when a record can produce a TOTP/HOTP code for OTP-field autofill.
 *
 * @param {{ otpPublic?: unknown, data?: { otpInput?: string, otp?: { secret?: string } } }} record
 * @returns {boolean}
 */
export function isOtpAutofillRecord(record) {
  if (record?.otpPublic) {
    return true
  }

  const otpInput = record?.data?.otpInput
  if (typeof otpInput === 'string' && otpInput.trim() !== '') {
    return true
  }

  const secret = record?.data?.otp?.secret
  if (typeof secret === 'string' && secret.trim() !== '') {
    return true
  }

  return false
}
