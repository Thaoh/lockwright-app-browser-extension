import { isPasswordField } from './isPasswordField'

describe('isPasswordField', () => {
  it('should return true if the input type is "password"', () => {
    const inputElement = document.createElement('input')
    inputElement.type = 'password'
    expect(isPasswordField(inputElement)).toBe(true)
  })

  it('should return false if the input type is not "password"', () => {
    const inputElement = document.createElement('input')
    inputElement.type = 'text'
    expect(isPasswordField(inputElement)).toBe(false)
  })

  it('should return false if the input type is empty', () => {
    const inputElement = document.createElement('input')
    inputElement.type = ''
    expect(isPasswordField(inputElement)).toBe(false)
  })

  it('should return false if the input type is undefined', () => {
    const inputElement = document.createElement('input')
    inputElement.removeAttribute('type')
    expect(isPasswordField(inputElement)).toBe(false)
  })

  it('detects Nextcloud admin password confirmation field', () => {
    document.body.innerHTML = `
      <form class="dialog">
        <div class="input-field input-field--trailing-icon">
          <input visible="false" required id="nc-vue-12"
            class="input-field__input" placeholder="" type="password" value="">
          <label class="input-field__label" for="nc-vue-12">Password</label>
        </div>
        <button type="submit" aria-label="Confirm">Confirm</button>
      </form>
    `

    expect(isPasswordField(document.getElementById('nc-vue-12'))).toBe(true)
    document.body.innerHTML = ''
  })

  it('detects Nextcloud password field rendered as text (as-text / visible toggle)', () => {
    document.body.innerHTML = `
      <form class="dialog">
        <div class="input-field input-field--trailing-icon">
          <input visible="false" required id="nc-vue-12"
            class="input-field__input" placeholder="" type="text" value="">
          <label class="input-field__label" for="nc-vue-12">Password</label>
        </div>
      </form>
    `

    expect(isPasswordField(document.getElementById('nc-vue-12'))).toBe(true)
    document.body.innerHTML = ''
  })
})
