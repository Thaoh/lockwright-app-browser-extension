const INVALIDATED = /Extension context invalidated/i

export const isInvalidatedContextError = (error) =>
  INVALIDATED.test(error?.message || String(error || ''))

/**
 * Keep stale content-script chrome API failures out of the page console.
 * MV3 cannot replace an already-injected script; after an extension reload
 * this instance just goes inert instead of throwing on every Clockify tick.
 */
export const swallowInvalidatedContextErrors = () => {
  if (window.__pearpassSwallowInvalidatedContext) {
    return
  }
  window.__pearpassSwallowInvalidatedContext = true

  const onRejection = (event) => {
    if (isInvalidatedContextError(event.reason)) {
      event.preventDefault()
    }
  }
  const onError = (event) => {
    if (isInvalidatedContextError(event.error)) {
      event.preventDefault()
    }
  }
  window.addEventListener('unhandledrejection', onRejection)
  window.addEventListener('error', onError)
}
