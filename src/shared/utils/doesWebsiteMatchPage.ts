import { getHostname } from './getHostname'

const stripWww = (hostname: string): string => hostname.replace(/^www\./i, '')

/**
 * True when the current page hostname matches a stored website entry
 * (same host, www variants, or either side is a subdomain of the other).
 */
export const doesWebsiteMatchPage = (
  pageUrl: string,
  website: string | null | undefined
): boolean => {
  if (!website) return false

  const pageHost = getHostname(pageUrl)
  const recordHost = getHostname(website)
  if (!pageHost || !recordHost) return false

  const page = stripWww(pageHost)
  const record = stripWww(recordHost)

  return (
    page === record ||
    page.endsWith(`.${record}`) ||
    record.endsWith(`.${page}`)
  )
}

type RecordWithWebsites = {
  data?: {
    websites?: string[] | null
    [key: string]: unknown
  } | null
}

/** True when any of the record's website entries match the current page URL. */
export const recordMatchesCurrentSite = (
  record: RecordWithWebsites | null | undefined,
  pageUrl: string
): boolean => {
  const websites = record?.data?.websites
  if (!websites?.length) return false
  return websites.some((website) => doesWebsiteMatchPage(pageUrl, website))
}
