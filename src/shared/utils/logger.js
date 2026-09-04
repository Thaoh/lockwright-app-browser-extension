import { isExpectedQuietError } from './isExpectedQuietError'

const skipExpected = (debugMode, messages) =>
  !debugMode && messages.some((arg) => isExpectedQuietError(arg))

export class Logger {
  constructor({ debugMode } = {}) {
    this.debugMode = debugMode || false
  }

  setDebugMode(debugMode) {
    this.debugMode = !!debugMode
  }

  log(...messages) {
    if (!this.debugMode) {
      return
    }

    // eslint-disable-next-line no-console
    console.log(...messages)
  }

  warn(...messages) {
    if (skipExpected(this.debugMode, messages)) {
      return
    }
    // eslint-disable-next-line no-console
    console.warn(...messages)
  }

  error(...messages) {
    if (skipExpected(this.debugMode, messages)) {
      return
    }
    // eslint-disable-next-line no-console
    console.error(...messages)
  }
}

export const logger = new Logger({
  debugMode: false
})
