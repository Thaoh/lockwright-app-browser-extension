import { clampPopupPosition } from './clampPopupPosition'

describe('clampPopupPosition', () => {
  it('shifts left leftward when popup would overflow the right edge', () => {
    expect(
      clampPopupPosition({
        top: 100,
        left: 800,
        width: 300,
        height: 200,
        viewportWidth: 1000,
        viewportHeight: 800
      })
    ).toEqual({ top: 100, left: 692 })
  })

  it('clamps left to margin when left is negative', () => {
    expect(
      clampPopupPosition({
        top: 100,
        left: -20,
        width: 300,
        height: 200,
        viewportWidth: 1000,
        viewportHeight: 800
      })
    ).toEqual({ top: 100, left: 8 })
  })

  it('shifts top upward when popup would overflow the bottom edge', () => {
    expect(
      clampPopupPosition({
        top: 700,
        left: 100,
        width: 300,
        height: 200,
        viewportWidth: 1000,
        viewportHeight: 800
      })
    ).toEqual({ top: 592, left: 100 })
  })

  it('clamps left to margin when width exceeds viewport minus margins', () => {
    expect(
      clampPopupPosition({
        top: 50,
        left: 100,
        width: 1200,
        height: 200,
        viewportWidth: 400,
        viewportHeight: 800
      })
    ).toEqual({ top: 50, left: 8 })
  })
})
