import { visibleSaveError } from './visibleSaveError'

describe('visibleSaveError', () => {
  it('keeps a real translated string', () => {
    expect(visibleSaveError('Something went wrong, please try again')).toBe(
      'Something went wrong, please try again'
    )
  })

  it('falls back when lingui returns empty', () => {
    expect(visibleSaveError('')).toBe('Something went wrong, please try again')
    expect(visibleSaveError(undefined)).toBe(
      'Something went wrong, please try again'
    )
  })
})
