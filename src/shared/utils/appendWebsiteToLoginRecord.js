import { normalizeUrl } from './normalizeUrl'
import {
  buildLoginUris,
  getDefaultUriMatchTypeSync,
  resolveUriMatchType
} from './uriMatchSetting'

/**
 * Append a page URL to a login record's websites/uris if not already stored.
 *
 * @param {{ data?: { websites?: string[], uris?: Array<{ uri?: string, match?: string }> } }} record
 * @param {string} pageUrl
 * @returns {object | null} updated record, or null if invalid / already present
 */
export const appendWebsiteToLoginRecord = (record, pageUrl) => {
  if (!record || typeof pageUrl !== 'string' || !pageUrl.trim()) {
    return null
  }

  const normalizedPage = normalizeUrl(pageUrl)
  if (!normalizedPage) return null

  const existingWebsites = Array.isArray(record.data?.websites)
    ? record.data.websites
    : []
  const existingUris = Array.isArray(record.data?.uris) ? record.data.uris : []

  const alreadyPresent =
    existingWebsites.some(
      (website) => normalizeUrl(website) === normalizedPage
    ) ||
    existingUris.some((entry) => normalizeUrl(entry?.uri) === normalizedPage)

  if (alreadyPresent) return null

  const websites = [...existingWebsites, pageUrl]
  const websiteRows = [
    ...existingWebsites.map((website) => ({
      website,
      matchType: resolveUriMatchType(record, website)
    })),
    {
      website: pageUrl,
      matchType: getDefaultUriMatchTypeSync()
    }
  ]

  return {
    ...record,
    data: {
      ...(record.data ?? {}),
      websites,
      uris: buildLoginUris(websiteRows)
    }
  }
}
