import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { recordMatchesCurrentSite } from './doesWebsiteMatchPage'

const LOGIN_TYPE = RECORD_TYPES?.LOGIN ?? 'login'

/**
 * Decide whether login-detect should save, update, or no-op.
 *
 * @param {{
 *   records?: Array<{ type?: string, data?: { username?: string, password?: string, websites?: string[] } }>,
 *   pageUrl?: string,
 *   username?: string,
 *   password?: string
 * }} params
 * @returns {{ action: 'save'|'update'|'noop', existingRecord: object|null }}
 */
export const classifyLoginDetectAction = ({
  records,
  pageUrl,
  username,
  password
}) => {
  const trimmedUsername = (username ?? '').trim()

  const existingRecord =
    (records ?? []).find((record) => {
      if (record?.type !== LOGIN_TYPE && record?.type !== 'login') {
        return false
      }
      const recordUsername = (record?.data?.username ?? '').trim()
      return (
        recordUsername === trimmedUsername &&
        recordMatchesCurrentSite(record, pageUrl ?? '')
      )
    }) ?? null

  if (!existingRecord) {
    return { action: 'save', existingRecord: null }
  }

  if (existingRecord.data?.password === password) {
    return { action: 'noop', existingRecord }
  }

  return { action: 'update', existingRecord }
}
