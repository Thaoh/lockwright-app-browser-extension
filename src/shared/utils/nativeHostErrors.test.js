import {
  isNativeHostNotFoundError,
  resolveNativeHostUserMessage
} from './nativeHostErrors'
import { AVAILABILITY_ERROR_MESSAGES } from '../constants/nativeMessaging'

describe('nativeHostErrors', () => {
  describe('isNativeHostNotFoundError', () => {
    it('detects Chrome host-not-found wording', () => {
      expect(
        isNativeHostNotFoundError('Specified native messaging host not found.')
      ).toBe(true)
    })

    it('detects Firefox-style host-not-found wording', () => {
      expect(isNativeHostNotFoundError('Native messaging host not found')).toBe(
        true
      )
    })

    it('returns false for unrelated errors', () => {
      expect(isNativeHostNotFoundError('Request timeout')).toBe(false)
      expect(isNativeHostNotFoundError('')).toBe(false)
      expect(isNativeHostNotFoundError(null)).toBe(false)
    })
  })

  describe('resolveNativeHostUserMessage', () => {
    it('maps host-not-found to HOST_NOT_FOUND copy', () => {
      const message = resolveNativeHostUserMessage(
        'Specified native messaging host not found.'
      )
      expect(message).toBe(AVAILABILITY_ERROR_MESSAGES.HOST_NOT_FOUND)
      expect(message).toMatch(/Firefox or Zen/i)
      expect(message).toMatch(/Flatpak/i)
    })

    it('passes through other non-empty messages', () => {
      expect(resolveNativeHostUserMessage('Desktop app is not running')).toBe(
        'Desktop app is not running'
      )
    })

    it('falls back to DEFAULT when empty', () => {
      expect(resolveNativeHostUserMessage('')).toBe(
        AVAILABILITY_ERROR_MESSAGES.DEFAULT
      )
    })
  })
})
