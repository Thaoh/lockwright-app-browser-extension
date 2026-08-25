import { scheduleShowLogoForField } from './scheduleShowLogoForField'

describe('scheduleShowLogoForField', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows after the field becomes usable (modal layout delay)', () => {
    const field = document.createElement('input')
    document.body.appendChild(field)
    const queued = []
    const schedule = (cb) => {
      queued.push(cb)
    }
    const show = jest.fn()
    let usable = false

    scheduleShowLogoForField(field, {
      isUsable: () => usable,
      show,
      schedule,
      attempts: 4
    })

    expect(show).not.toHaveBeenCalled()

    queued.shift()()
    expect(show).not.toHaveBeenCalled()

    usable = true
    queued.shift()()
    expect(show).toHaveBeenCalledWith(field)
  })
})
