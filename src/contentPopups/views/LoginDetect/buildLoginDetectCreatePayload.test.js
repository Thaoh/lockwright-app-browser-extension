import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { buildLoginDetectCreatePayload } from './buildLoginDetectCreatePayload'
import { normalizeUrl } from '../../../shared/utils/normalizeUrl'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  RECORD_TYPES: { LOGIN: 'login' }
}))

describe('buildLoginDetectCreatePayload', () => {
  it('includes normalized website and uris so v2 create can write', () => {
    const pageUrl = 'https://inking.example/login/'
    const payload = buildLoginDetectCreatePayload({
      title: 'Inking',
      username: 'inkingone@logi.pm',
      password: 'secret',
      pageUrl
    })

    const website = normalizeUrl(pageUrl)
    expect(website).toBeTruthy()
    expect(payload.type).toBe(RECORD_TYPES.LOGIN)
    expect(payload.data.title).toBe('Inking')
    expect(payload.data.username).toBe('inkingone@logi.pm')
    expect(payload.data.password).toBe('secret')
    expect(payload.data.websites).toEqual([website])
    expect(payload.data.uris).toEqual(
      expect.arrayContaining([expect.objectContaining({ uri: website })])
    )
    expect(payload.data.uris).toHaveLength(1)
  })

  it('omits websites and uris when pageUrl is empty', () => {
    const payload = buildLoginDetectCreatePayload({
      title: 'Inking',
      username: 'a@b.c',
      password: 'x',
      pageUrl: ''
    })

    expect(payload.data.websites).toEqual([])
    expect(payload.data.uris).toEqual([])
  })
})
