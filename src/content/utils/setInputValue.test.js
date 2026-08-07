import { setInputValue } from './setInputValue'

describe('setInputValue', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('sets element.value', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)

    setInputValue(input, 'secret')

    expect(input.value).toBe('secret')
  })

  it('uses the native value setter so React-like own setters cannot block the write', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)

    const originalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )
    const nativeSet = originalDescriptor.set
    const setMock = jest.fn(function (v) {
      nativeSet.call(this, v)
    })

    Object.defineProperty(HTMLInputElement.prototype, 'value', {
      configurable: true,
      get: originalDescriptor.get,
      set: setMock
    })

    try {
      // Own property setter ignores direct assignment (React controlled pattern)
      Object.defineProperty(input, 'value', {
        configurable: true,
        get() {
          return Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          ).get.call(this)
        },
        set() {
          // swallow non-native sets
        }
      })

      const seen = { input: null, change: null }
      input.addEventListener('input', (e) => {
        seen.input = e.target.value
      })
      input.addEventListener('change', (e) => {
        seen.change = e.target.value
      })

      setInputValue(input, 'react-safe')

      expect(setMock).toHaveBeenCalled()
      expect(input.value).toBe('react-safe')
      expect(seen.input).toBe('react-safe')
      expect(seen.change).toBe('react-safe')
    } finally {
      Object.defineProperty(
        HTMLInputElement.prototype,
        'value',
        originalDescriptor
      )
    }
  })

  it('dispatches bubbling InputEvent for input when available', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)

    let inputEvent = null
    input.addEventListener('input', (e) => {
      inputEvent = e
    })

    setInputValue(input, 'x')

    expect(inputEvent).toBeTruthy()
    expect(inputEvent.bubbles).toBe(true)
    if (typeof InputEvent !== 'undefined') {
      expect(inputEvent).toBeInstanceOf(InputEvent)
    }
  })
})
