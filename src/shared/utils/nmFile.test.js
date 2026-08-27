import { decodeNmFile, encodeNmFile } from './nmFile'

describe('nmFile', () => {
  it('round-trips bytes through the NM base64 envelope', () => {
    const bytes = new Uint8Array([104, 105])
    expect(encodeNmFile(bytes)).toEqual({
      encoding: 'base64',
      data: 'aGk='
    })
    expect(
      Array.from(decodeNmFile({ encoding: 'base64', data: 'aGk=' }))
    ).toEqual([104, 105])
  })

  it('encodes ArrayBuffer the same as Uint8Array', () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer
    expect(encodeNmFile(buffer)).toEqual({
      encoding: 'base64',
      data: Buffer.from([1, 2, 3]).toString('base64')
    })
  })

  it('throws when the envelope is missing', () => {
    expect(() => decodeNmFile(null)).toThrow('File data is required')
    expect(() => decodeNmFile({})).toThrow('File data is required')
  })
})
