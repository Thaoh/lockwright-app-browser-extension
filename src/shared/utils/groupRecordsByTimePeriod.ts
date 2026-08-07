import { recordMatchesCurrentSite } from './doesWebsiteMatchPage'

export type VaultRecord = {
  id: string
  type: string
  createdAt?: number
  updatedAt?: number
  isFavorite?: boolean
  hasSecurityAlert?: boolean
  data?: {
    title?: string
    username?: string
    email?: string
    name?: string
    fullName?: string
    websites?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type RecordSort = {
  key?: string
  direction?: 'asc' | 'desc'
}

export type RecordSection = {
  title: string
  key: string
  isFavorites?: boolean
  isCurrentSite?: boolean
  data: VaultRecord[]
}

export type GroupRecordsOptions = {
  currentSiteUrl?: string | null
}

const getDateField = (key?: string): 'createdAt' | 'updatedAt' =>
  key === 'createdAt' ? 'createdAt' : 'updatedAt'

const collectCurrentSite = (
  records: VaultRecord[],
  currentSiteUrl?: string | null
): { currentSite: VaultRecord[]; currentSiteIds: Set<string> } => {
  const currentSite: VaultRecord[] = []
  const currentSiteIds = new Set<string>()

  if (typeof currentSiteUrl === 'string' && currentSiteUrl.length > 0) {
    for (const record of records) {
      if (recordMatchesCurrentSite(record, currentSiteUrl)) {
        currentSite.push(record)
        currentSiteIds.add(record.id)
      }
    }
  }

  return { currentSite, currentSiteIds }
}

const prependCurrentSite = (
  sections: RecordSection[],
  currentSite: VaultRecord[]
): RecordSection[] => {
  if (!currentSite.length) return sections
  return [
    {
      title: 'Current Site',
      key: 'currentSite',
      isCurrentSite: true,
      data: currentSite
    },
    ...sections
  ]
}

export const groupRecordsByTimePeriod = (
  records: VaultRecord[] | undefined | null,
  sort?: RecordSort,
  options?: GroupRecordsOptions
): RecordSection[] => {
  if (!records?.length) return []

  const { currentSite, currentSiteIds } = collectCurrentSite(
    records,
    options?.currentSiteUrl
  )

  if (sort?.key === 'data.title') {
    const favorites = records.filter(
      (r) => r.isFavorite && !currentSiteIds.has(r.id)
    )
    const rest = records.filter(
      (r) => !r.isFavorite && !currentSiteIds.has(r.id)
    )
    const sections: RecordSection[] = []
    if (favorites.length) {
      sections.push({
        title: 'Favorites',
        key: 'favorites',
        isFavorites: true,
        data: favorites
      })
    }
    if (rest.length) {
      sections.push({ title: 'All Items', key: 'all', data: rest })
    }
    return prependCurrentSite(sections, currentSite)
  }

  const dateField = getDateField(sort?.key)
  const isAsc = sort?.direction === 'asc'

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const favorites: VaultRecord[] = []
  const today: VaultRecord[] = []
  const yesterday: VaultRecord[] = []
  const thisWeek: VaultRecord[] = []
  const thisMonth: VaultRecord[] = []
  const older: VaultRecord[] = []

  const favoriteIds = new Set<string>()

  for (const record of records) {
    if (currentSiteIds.has(record.id)) continue
    if (record.isFavorite) {
      favorites.push(record)
      favoriteIds.add(record.id)
    }
  }

  for (const record of records) {
    if (currentSiteIds.has(record.id)) continue
    if (favoriteIds.has(record.id)) continue

    const timestamp =
      record[dateField] ?? record.updatedAt ?? record.createdAt ?? 0
    const date = new Date(timestamp as number)

    if (date >= todayStart) {
      today.push(record)
    } else if (date >= yesterdayStart) {
      yesterday.push(record)
    } else if (date >= weekStart) {
      thisWeek.push(record)
    } else if (date >= monthStart) {
      thisMonth.push(record)
    } else {
      older.push(record)
    }
  }

  const timeSections: RecordSection[] = []

  if (today.length)
    timeSections.push({ title: 'Today', key: 'today', data: today })
  if (yesterday.length)
    timeSections.push({ title: 'Yesterday', key: 'yesterday', data: yesterday })
  if (thisWeek.length)
    timeSections.push({ title: 'This Week', key: 'thisWeek', data: thisWeek })
  if (thisMonth.length)
    timeSections.push({
      title: 'This Month',
      key: 'thisMonth',
      data: thisMonth
    })
  if (older.length)
    timeSections.push({ title: 'Older', key: 'older', data: older })

  if (isAsc) timeSections.reverse()

  const sections: RecordSection[] = []

  if (favorites.length) {
    sections.push({
      title: 'Favorites',
      key: 'favorites',
      isFavorites: true,
      data: favorites
    })
  }

  return prependCurrentSite(sections.concat(timeSections), currentSite)
}
