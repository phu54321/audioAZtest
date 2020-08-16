import pako from 'pako'
import { Base64 } from 'js-base64'

export function p64Encode (s: string): string {
  return Base64.encodeURI(pako.deflateRaw(s, { to: 'string' }))
}

export function p64Decode (s: string): string {
  return pako.inflateRaw(Base64.decode(s), { to: 'string' })
}
