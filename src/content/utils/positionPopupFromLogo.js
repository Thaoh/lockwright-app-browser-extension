import { clampPopupPosition } from './clampPopupPosition'

/**
 * Place a popup under the logo, aligned to the logo's right edge so it
 * grows left across the field instead of off the right of a narrow iframe.
 *
 * @param {object} params
 * @returns {{ top: number, left: number }}
 */
export function positionPopupFromLogo({
  logoTop,
  logoLeft,
  logoWidth,
  logoHeight,
  popupWidth,
  popupHeight,
  viewportWidth,
  viewportHeight,
  gap = 5
}) {
  return clampPopupPosition({
    top: logoTop + logoHeight + gap,
    left: logoLeft + logoWidth - popupWidth,
    width: popupWidth,
    height: popupHeight,
    viewportWidth,
    viewportHeight
  })
}
