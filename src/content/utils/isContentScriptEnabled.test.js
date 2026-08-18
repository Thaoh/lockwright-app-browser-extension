import { isContentScriptEnabled } from './isContentScriptEnabled'
import { getAllowHttpFromStorage } from '../../shared/utils/allowHttpStorage'

jest.mock('../../shared/utils/allowHttpStorage', () => ({
  getAllowHttpFromStorage: jest.fn()
}))

describe('isContentScriptEnabled', () => {
  const originalLocation = window.location

  beforeAll(() => {
    delete window.location
    window.location = { protocol: '' }
  })

  afterAll(() => {
    window.location = originalLocation
  })

  beforeEach(() => {
    if (global.chrome?.runtime) {
      global.chrome.runtime.id = 'test-extension-id'
    }
  })

  it('should return true when protocol is https: regardless of storage setting', async () => {
    window.location.protocol = 'https:'

    getAllowHttpFromStorage.mockResolvedValue(false)
    expect(await isContentScriptEnabled()).toBe(true)

    getAllowHttpFromStorage.mockResolvedValue(true)
    expect(await isContentScriptEnabled()).toBe(true)
  })

  it('should return true when protocol is http: and allowHttp is enabled in storage', async () => {
    window.location.protocol = 'http:'
    getAllowHttpFromStorage.mockResolvedValue(true)

    const result = await isContentScriptEnabled()
    expect(result).toBe(true)
  })

  it('should return false when protocol is http: and allowHttp is disabled in storage', async () => {
    window.location.protocol = 'http:'
    getAllowHttpFromStorage.mockResolvedValue(false)

    const result = await isContentScriptEnabled()
    expect(result).toBe(false)
  })

  it('should return false when storage throws extension context invalidated', async () => {
    window.location.protocol = 'http:'
    getAllowHttpFromStorage.mockRejectedValue(
      new Error('Extension context invalidated.')
    )

    await expect(isContentScriptEnabled()).resolves.toBe(false)
  })

  it('should return false when extension runtime id is missing', async () => {
    window.location.protocol = 'https:'
    global.chrome.runtime.id = undefined

    await expect(isContentScriptEnabled()).resolves.toBe(false)
  })
})
