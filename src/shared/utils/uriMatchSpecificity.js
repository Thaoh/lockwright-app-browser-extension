import {
  doesWebsiteMatchPage,
  getRecordWebsiteValues,
  recordMatchesCurrentSite
} from './doesWebsiteMatchPage'
import { resolveUriMatchType } from './uriMatchSetting'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

/**
 * Higher = more specific. Exact > Starts with > Host > Domain.
 * @param {string|null|undefined} matchType
 * @returns {number}
 */
export const getUriMatchSpecificityRank = (matchType) => {
  switch (matchType) {
    case URI_MATCH_TYPES.EXACT:
      return 4
    case URI_MATCH_TYPES.STARTS_WITH:
      return 3
    case URI_MATCH_TYPES.HOST:
      return 2
    case URI_MATCH_TYPES.DOMAIN:
      return 1
    default:
      return 0
  }
}

/**
 * Best (highest) specificity rank among this record's websites that match
 * the current page under each entry's resolved match type.
 *
 * @param {object|null|undefined} record
 * @param {string} pageUrl
 * @param {{ defaultMatchType?: string }} [options]
 * @returns {number} 0 when nothing matches
 */
export const getRecordSiteMatchRank = (record, pageUrl, options) => {
  const websites = getRecordWebsiteValues(record)
  if (websites.length === 0) {
    return 0
  }

  if (!recordMatchesCurrentSite(record, pageUrl, options)) {
    return 0
  }

  let best = 0
  for (const website of websites) {
    const hasVaultUris =
      Array.isArray(record?.data?.uris) && record.data.uris.length > 0
    const canResolveFromRecord = Boolean(record?.id || hasVaultUris)
    const matchType =
      (canResolveFromRecord ? resolveUriMatchType(record, website) : null) ??
      options?.defaultMatchType ??
      URI_MATCH_TYPES.DOMAIN

    if (!doesWebsiteMatchPage(pageUrl, website, matchType)) {
      continue
    }

    const rank = getUriMatchSpecificityRank(matchType)
    if (rank > best) best = rank
  }

  return best
}
