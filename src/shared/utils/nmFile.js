const toBytes = (input) => {
  if (input instanceof Uint8Array) return input
  if (input instanceof ArrayBuffer) return new Uint8Array(input)
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
  }
  throw new Error('File data is required')
}

const bytesToBase64 = (bytes) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const base64ToBytes = (data) => {
  const binary = atob(data)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i)
  }
  return out
}

/**
 * JSON-safe envelope for native-messaging file bytes.
 * @param {ArrayBuffer|Uint8Array|ArrayBufferView} input
 * @returns {{ encoding: 'base64', data: string }}
 */
export const encodeNmFile = (input) => ({
  encoding: 'base64',
  data: bytesToBase64(toBytes(input))
})

/**
 * @param {{ encoding?: string, data?: string }|null|undefined} envelope
 * @returns {Uint8Array}
 */
export const decodeNmFile = (envelope) => {
  if (
    !envelope ||
    envelope.encoding !== 'base64' ||
    typeof envelope.data !== 'string'
  ) {
    throw new Error('File data is required')
  }
  return base64ToBytes(envelope.data)
}
