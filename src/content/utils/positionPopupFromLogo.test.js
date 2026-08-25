import { positionPopupFromLogo } from './positionPopupFromLogo'

describe('positionPopupFromLogo', () => {
  it('opens leftward from a right-edge logo even when the layout viewport is wider than the form', () => {
    expect(
      positionPopupFromLogo({
        logoTop: 80,
        logoLeft: 360,
        logoWidth: 30,
        logoHeight: 30,
        popupWidth: 280,
        popupHeight: 195,
        viewportWidth: 1200,
        viewportHeight: 800
      })
    ).toEqual({ top: 115, left: 110 })
  })

  it('clamps to the left margin when the logo is near the left edge', () => {
    expect(
      positionPopupFromLogo({
        logoTop: 80,
        logoLeft: 8,
        logoWidth: 30,
        logoHeight: 30,
        popupWidth: 280,
        popupHeight: 195,
        viewportWidth: 400,
        viewportHeight: 600
      })
    ).toEqual({ top: 115, left: 8 })
  })
})
