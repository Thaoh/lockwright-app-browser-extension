import { formatDisplayVersion } from './formatDisplayVersion'
import { version } from '../../../public/manifest.json'

export function getExtensionDisplayVersion() {
  const sha =
    typeof globalThis.__LOCKWRIGHT_GIT_SHA__ === 'string'
      ? globalThis.__LOCKWRIGHT_GIT_SHA__
      : 'unknown'
  return formatDisplayVersion(version, sha)
}
