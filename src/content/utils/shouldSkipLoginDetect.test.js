import { shouldSkipLoginDetect } from './shouldSkipLoginDetect'

describe('shouldSkipLoginDetect', () => {
  it('returns true when capture matches lastAutofill username and password', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'alice',
        password: 'secret',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(true)
  })

  it('trims both sides before comparing', () => {
    expect(
      shouldSkipLoginDetect({
        username: '  alice  ',
        password: '  secret  ',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(true)
  })

  it('returns false when password differs (autofill then change)', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'alice',
        password: 'changed',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(false)
  })

  it('returns false when username differs', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'bob',
        password: 'secret',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(false)
  })

  it('returns false when lastAutofill is null', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'alice',
        password: 'secret',
        lastAutofill: null
      })
    ).toBe(false)
  })

  it('returns false when lastAutofill password is empty', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'alice',
        password: 'secret',
        lastAutofill: { username: 'alice', password: '' }
      })
    ).toBe(false)
  })

  it('returns false when capture username is empty', () => {
    expect(
      shouldSkipLoginDetect({
        username: '',
        password: 'secret',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(false)
  })

  it('returns false when capture password is empty', () => {
    expect(
      shouldSkipLoginDetect({
        username: 'alice',
        password: '',
        lastAutofill: { username: 'alice', password: 'secret' }
      })
    ).toBe(false)
  })
})
