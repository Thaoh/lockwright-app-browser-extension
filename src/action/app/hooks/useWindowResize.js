import { useCallback, useEffect, useMemo, useState } from 'react'

import { PASSKEY_PAGES } from '../../../shared/constants/passkey'
import {
  mainExtensionWindowSize,
  passkeyWindowSize
} from '../../../shared/constants/windowSizes'
import { useRouter } from '../../../shared/context/RouterContext'
import {
  applyActionPopupDocumentSize,
  clampActionPopupSize,
  loadActionPopupSize,
  saveActionPopupSize
} from '../../../shared/utils/actionPopupSize'
import { isFirefox } from '../../../shared/utils/isFirefox'

/**
 * Resizes a Chrome window to the target inner dimensions.
 *
 * Due to a compositor-level quirk/bug in Ubuntu Wayland, the reported
 * `outerWidth` can exceed the visually rendered size after the first pass.
 * A second update is required to compensate for the outer/inner dimension
 * difference and achieve the correct visible size for the user.
 *
 * On iOS, Ubuntu X11, and Windows, a single update is sufficient.
 *
 * Uses chrome.windows.get(windowId) instead of window.outerWidth/innerWidth
 * to avoid reading incorrect window context when multiple Chrome windows
 * or extension popups are open simultaneously.
 *
 * @param {number} windowId - The ID of the Chrome window to resize.
 * @param {number} targetInnerWidth - The desired inner width in pixels.
 * @param {number} targetInnerHeight - The desired inner height in pixels.
 * @param {number} attempt - Current attempt number (used internally for recursion).
 * @param {number} maxAttempts - Maximum number of resize attempts.
 */
const resizeWindow = (
  windowId,
  targetInnerWidth,
  targetInnerHeight,
  attempt = 0,
  maxAttempts = 3
) => {
  if (attempt >= maxAttempts) return

  const frameWidth = window.outerWidth - window.innerWidth
  const frameHeight = window.outerHeight - window.innerHeight

  const safeFrameWidth = Math.max(0, frameWidth)
  const safeFrameHeight = Math.max(0, frameHeight)

  const adjustedWidth = targetInnerWidth + safeFrameWidth

  const sizeUpdate =
    targetInnerHeight !== null && targetInnerHeight !== undefined
      ? { width: adjustedWidth, height: targetInnerHeight + safeFrameHeight }
      : { width: adjustedWidth }

  chrome.windows.update(windowId, sizeUpdate, () => {
    if (chrome.runtime.lastError) return

    setTimeout(() => {
      chrome.windows.get(windowId, () => {
        if (chrome.runtime.lastError) return

        const newFrameWidth = window.outerWidth - window.innerWidth
        const newFrameHeight = window.outerHeight - window.innerHeight

        if (newFrameWidth === 0 && newFrameHeight === 0) return

        resizeWindow(
          windowId,
          targetInnerWidth,
          targetInnerHeight,
          attempt + 1,
          maxAttempts
        )
      })
    }, 100)
  })
}

export const useWindowResize = () => {
  const { currentPage, state } = useRouter()
  const isPasskeyFlow =
    PASSKEY_PAGES.includes(currentPage) || state?.inPasskeyFlow === true

  const [mainSize, setMainSize] = useState(mainExtensionWindowSize)

  useEffect(() => {
    if (isPasskeyFlow) return

    let cancelled = false
    loadActionPopupSize().then((size) => {
      if (cancelled) return
      setMainSize(size)
      applyActionPopupDocumentSize(size)
    })

    return () => {
      cancelled = true
    }
  }, [isPasskeyFlow])

  const setSize = useCallback((nextSize) => {
    const clamped = clampActionPopupSize(nextSize)
    setMainSize(clamped)
    applyActionPopupDocumentSize(clamped)
    void saveActionPopupSize(clamped)
    return clamped
  }, [])

  const targetSize = useMemo(() => {
    if (isPasskeyFlow) {
      return {
        ...passkeyWindowSize,
        isResizable: false,
        setSize: undefined
      }
    }

    return {
      ...mainSize,
      isResizable: true,
      setSize
    }
  }, [isPasskeyFlow, mainSize, setSize])

  useEffect(() => {
    // Firefox/Zen browser-action panels are not Chrome popup windows;
    // windows.update can misbehave — size comes from content CSS instead.
    if (isFirefox() || isPasskeyFlow) return

    if (chrome?.windows?.getCurrent) {
      chrome.windows.getCurrent((currentWindow) => {
        if (currentWindow?.type === 'popup' && chrome?.windows?.update) {
          resizeWindow(currentWindow.id, mainSize.width, mainSize.height)
        }
      })
    }
  }, [isPasskeyFlow, mainSize.height, mainSize.width])

  return targetSize
}
