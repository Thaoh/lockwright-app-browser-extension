import {
  isInvalidatedContextError,
  swallowInvalidatedContextErrors
} from './swallowInvalidatedContext'

describe('swallowInvalidatedContextErrors', () => {
  afterEach(() => {
    delete window.__pearpassSwallowInvalidatedContext
  })

  it('detects invalidated-context errors', () => {
    expect(
      isInvalidatedContextError(new Error('Extension context invalidated.'))
    ).toBe(true)
    expect(isInvalidatedContextError(new Error('network fail'))).toBe(false)
  })

  it('calls preventDefault for matching unhandledrejection', () => {
    const listeners = {}
    const add = window.addEventListener.bind(window)
    jest.spyOn(window, 'addEventListener').mockImplementation((type, fn) => {
      listeners[type] = fn
      return add(type, fn)
    })

    delete window.__pearpassSwallowInvalidatedContext
    swallowInvalidatedContextErrors()

    const preventDefault = jest.fn()
    listeners.unhandledrejection({
      reason: new Error('Extension context invalidated.'),
      preventDefault
    })
    expect(preventDefault).toHaveBeenCalled()

    preventDefault.mockClear()
    listeners.unhandledrejection({
      reason: new Error('something else'),
      preventDefault
    })
    expect(preventDefault).not.toHaveBeenCalled()

    window.addEventListener.mockRestore()
  })

  it('calls preventDefault for matching window error events', () => {
    const listeners = {}
    const add = window.addEventListener.bind(window)
    jest.spyOn(window, 'addEventListener').mockImplementation((type, fn) => {
      listeners[type] = fn
      return add(type, fn)
    })

    delete window.__pearpassSwallowInvalidatedContext
    swallowInvalidatedContextErrors()

    const preventDefault = jest.fn()
    listeners.error({
      error: new Error('Extension context invalidated.'),
      preventDefault
    })
    expect(preventDefault).toHaveBeenCalled()

    window.addEventListener.mockRestore()
  })
})
