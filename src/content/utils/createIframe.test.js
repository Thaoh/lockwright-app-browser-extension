import { createIframe } from './createIframe'

beforeAll(() => {
  global.chrome = {
    runtime: {
      getURL: jest.fn((path) => `mocked-chrome-extension://${path}`)
    }
  }
})

afterAll(() => {
  delete global.chrome
})

describe('createIframe', () => {
  it('should create an iframe with default styles when no parameters are provided', () => {
    const iframe = createIframe()

    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.style.position).toBe('fixed')
    expect(iframe.style.top).toBe('20px')
    expect(iframe.style.right).toBe('')
    expect(iframe.style.left).toBe('')
    expect(iframe.style.width).toBe('300px')
    expect(iframe.style.height).toBe('200px')
    expect(iframe.style.borderRadius).toBe('0px')
    expect(iframe.style.overflow).toBe('hidden')
    expect(iframe.style.zIndex).toBe('2147483647')
  })

  it('should create an iframe with custom styles when styles are provided', () => {
    const styles = {
      width: '500px',
      height: '400px',
      top: '50px',
      right: '10px',
      left: '15px',
      borderRadius: '10px',
      overflow: 'visible'
    }
    const iframe = createIframe({ styles })
    expect(iframe.style.width).toBe(styles.width)
    expect(iframe.style.height).toBe(styles.height)
    expect(iframe.style.top).toBe(styles.top)
    expect(iframe.style.right).toBe(styles.right)
    expect(iframe.style.left).toBe(styles.left)
    expect(iframe.style.borderRadius).toBe(styles.borderRadius)
    expect(iframe.style.overflow).toBe(styles.overflow)
  })

  it('should set the iframe src based on options provided', () => {
    const options = { id: 'test-id', type: 'test-type' }
    const iframe = createIframe({ options })
    const expectedUrl = chrome.runtime.getURL(
      `content-popups.html?id=${options.id}&type=${options.type}`
    )
    expect(iframe.src).toBe(expectedUrl)
  })

  it('prevents mousedown default so a page focus-lock does not steal the click', () => {
    const iframe = createIframe({ options: { id: 'logo', type: 'logo' } })
    const event = new MouseEvent('mousedown', {
      cancelable: true,
      bubbles: true
    })

    iframe.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(iframe.tabIndex).toBe(-1)
  })

  it('should handle missing options gracefully', () => {
    const iframe = createIframe()
    const expectedUrl = chrome.runtime.getURL('content-popups.html?id=&type=')
    expect(iframe.src).toBe(expectedUrl)
  })
})
