/**
 * Clamp a popup's top/left so it stays inside the viewport with a margin.
 *
 * @param {Object} params
 * @param {number} params.top
 * @param {number} params.left
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.viewportWidth
 * @param {number} params.viewportHeight
 * @param {number} [params.margin=8]
 * @returns {{ top: number, left: number }}
 */
export function clampPopupPosition({
  top,
  left,
  width,
  height,
  viewportWidth,
  viewportHeight,
  margin = 8
}) {
  let nextTop = top
  let nextLeft = left

  if (width > viewportWidth - 2 * margin) {
    nextLeft = margin
  } else {
    if (nextLeft + width > viewportWidth - margin) {
      nextLeft = viewportWidth - width - margin
    }
    if (nextLeft < margin) {
      nextLeft = margin
    }
  }

  if (height > viewportHeight - 2 * margin) {
    nextTop = margin
  } else {
    if (nextTop + height > viewportHeight - margin) {
      nextTop = viewportHeight - height - margin
    }
    if (nextTop < margin) {
      nextTop = margin
    }
  }

  return { top: nextTop, left: nextLeft }
}
