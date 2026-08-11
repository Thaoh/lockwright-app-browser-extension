import { isUsernameField } from './isUsernameField'

describe('isUsernameField', () => {
  it('should return true for input elements of type "email"', () => {
    const element = { type: 'email' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true for input elements of type "text" with name containing "user"', () => {
    const element = { type: 'text', name: 'username' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true for input elements of type "text" with name containing "email"', () => {
    const element = { type: 'text', name: 'userEmail' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true for input elements of type "text" with name containing "login"', () => {
    const element = { type: 'text', name: 'loginField' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true for Oracle-like cloud account name field', () => {
    const element = {
      type: 'text',
      name: 'rc63input',
      id: 'cloudAccountName'
    }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true when autocomplete is username', () => {
    const element = { type: 'text', autocomplete: 'username' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true when autocomplete is email', () => {
    const element = { type: 'text', autocomplete: 'email' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true when placeholder matches username hint', () => {
    const element = { type: 'text', placeholder: 'Enter your account' }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return true when joined label text matches username hint', () => {
    const element = {
      type: 'text',
      name: 'rc63input',
      labels: [{ textContent: 'Account / Email' }]
    }
    expect(isUsernameField(element)).toBe(true)
  })

  it('should return false for unrelated text inputs', () => {
    const element = { type: 'text', name: 'searchQuery', id: 'q' }
    expect(isUsernameField(element)).toBe(false)
  })

  it('should return false for input elements of type "text" with unrelated names', () => {
    const element = { type: 'text', name: 'password' }
    expect(isUsernameField(element)).toBe(false)
  })

  it('should return false for password type even with username-like name', () => {
    const element = { type: 'password', name: 'userPassword' }
    expect(isUsernameField(element)).toBe(false)
  })

  it('should return false for hidden and checkbox types', () => {
    expect(
      isUsernameField({ type: 'hidden', name: 'username', id: 'account' })
    ).toBe(false)
    expect(
      isUsernameField({ type: 'checkbox', name: 'login', id: 'email' })
    ).toBe(false)
  })

  it('should handle elements with no name property gracefully', () => {
    const element = { type: 'text' }
    expect(isUsernameField(element)).toBe(false)
  })

  it('should handle elements with an empty name property gracefully', () => {
    const element = { type: 'text', name: '' }
    expect(isUsernameField(element)).toBe(false)
  })
})
