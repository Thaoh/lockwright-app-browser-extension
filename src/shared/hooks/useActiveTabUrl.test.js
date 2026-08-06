import { renderHook, act } from '@testing-library/react'

import { useActiveTabUrl } from './useActiveTabUrl'

describe('useActiveTabUrl', () => {
  let onUpdatedListener
  let onActivatedListener

  beforeEach(() => {
    global.chrome = {
      tabs: {
        query: jest.fn(),
        onUpdated: {
          addListener: jest.fn((fn) => {
            onUpdatedListener = fn
          }),
          removeListener: jest.fn()
        },
        onActivated: {
          addListener: jest.fn((fn) => {
            onActivatedListener = fn
          }),
          removeListener: jest.fn()
        }
      }
    }
  })

  afterEach(() => {
    delete global.chrome
    jest.clearAllMocks()
  })

  it('should fetch the active tab URL on mount', async () => {
    const mockTab = { url: 'https://example.com' }
    chrome.tabs.query.mockResolvedValue([mockTab])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(chrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true
    })
    expect(result.current.url).toBe('https://example.com')
    expect(result.current.loading).toBe(false)
  })

  it('should use pendingUrl if url is not available', async () => {
    const mockTab = { pendingUrl: 'https://pending.com' }
    chrome.tabs.query.mockResolvedValue([mockTab])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('https://pending.com')
  })

  it('should set empty URL if no tab is found', async () => {
    chrome.tabs.query.mockResolvedValue([])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('should set empty URL when tabs.query throws (Zen empty workspace)', async () => {
    chrome.tabs.query.mockRejectedValue(new Error('no selected tab'))

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('should update URL when a tab is updated', async () => {
    chrome.tabs.query.mockResolvedValue([{ url: 'https://initial.com' }])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('https://initial.com')

    chrome.tabs.query.mockResolvedValue([{ url: 'https://updated.com' }])

    await act(async () => {
      onUpdatedListener(1, { url: 'https://updated.com' })
    })

    expect(result.current.url).toBe('https://updated.com')
  })

  it('should update URL when tab activation changes', async () => {
    chrome.tabs.query.mockResolvedValue([{ url: 'https://tab1.com' }])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('https://tab1.com')

    chrome.tabs.query.mockResolvedValue([{ url: 'https://tab2.com' }])

    await act(async () => {
      onActivatedListener({ tabId: 2, windowId: 1 })
    })

    expect(result.current.url).toBe('https://tab2.com')
  })

  it('should provide a refetch function to manually update the URL', async () => {
    chrome.tabs.query.mockResolvedValue([{ url: 'https://initial.com' }])

    let result
    await act(async () => {
      const rendered = renderHook(() => useActiveTabUrl())
      result = rendered.result
    })

    expect(result.current.url).toBe('https://initial.com')

    chrome.tabs.query.mockResolvedValue([{ url: 'https://refetched.com' }])

    await act(async () => {
      result.current.refetch()
    })

    expect(result.current.url).toBe('https://refetched.com')
  })
})
