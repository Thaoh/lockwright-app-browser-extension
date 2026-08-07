import { URI_MATCH_TYPES } from '../constants/uriMatch'
import {
  groupRecordsByTimePeriod,
  type VaultRecord
} from './groupRecordsByTimePeriod'
import {
  __resetUriMatchSettingsCacheForTests,
  setUriMatchOverrides
} from './uriMatchSetting'

// Anchored on a Wednesday to keep "this week" / "this month" boundaries
// well-separated from "today" / "yesterday".
const NOW = new Date('2026-04-15T12:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000

const buildRecord = (overrides: Partial<VaultRecord>): VaultRecord => ({
  id: 'rec',
  type: 'login',
  data: { title: 'Untitled' },
  ...overrides
})

const sectionKeys = (sections: { key: string }[]) => sections.map((s) => s.key)
const idsByKey = (
  sections: { key: string; data: VaultRecord[] }[],
  key: string
) => sections.find((s) => s.key === key)?.data.map((r) => r.id) ?? []

describe('groupRecordsByTimePeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
    __resetUriMatchSettingsCacheForTests()
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue(undefined)
        },
        onChanged: {
          addListener: jest.fn(),
          removeListener: jest.fn()
        }
      }
    } as typeof chrome
  })

  afterEach(() => {
    jest.useRealTimers()
    __resetUriMatchSettingsCacheForTests()
    // @ts-expect-error test cleanup
    delete global.chrome
  })

  it('returns an empty array for null/undefined/empty input', () => {
    expect(groupRecordsByTimePeriod(null)).toEqual([])
    expect(groupRecordsByTimePeriod(undefined)).toEqual([])
    expect(groupRecordsByTimePeriod([])).toEqual([])
  })

  describe('alphabetical sort (data.title)', () => {
    it('splits favorites and the rest into two sections', () => {
      const records = [
        buildRecord({ id: 'a', isFavorite: true }),
        buildRecord({ id: 'b' }),
        buildRecord({ id: 'c', isFavorite: true }),
        buildRecord({ id: 'd' })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['favorites', 'all'])
      expect(idsByKey(sections, 'favorites')).toEqual(['a', 'c'])
      expect(idsByKey(sections, 'all')).toEqual(['b', 'd'])
      const favorites = sections.find((s) => s.key === 'favorites')
      expect(favorites?.isFavorites).toBe(true)
    })

    it('omits the favorites section when there are no favorites', () => {
      const records = [buildRecord({ id: 'a' }), buildRecord({ id: 'b' })]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['all'])
    })

    it('omits the all section when every record is a favorite', () => {
      const records = [
        buildRecord({ id: 'a', isFavorite: true }),
        buildRecord({ id: 'b', isFavorite: true })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['favorites'])
    })
  })

  describe('time-based grouping', () => {
    it('buckets records by updatedAt by default', () => {
      const records = [
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({ id: 'yesterday', updatedAt: NOW - 1 * DAY - 1000 }),
        buildRecord({ id: 'thisWeek', updatedAt: NOW - 5 * DAY }),
        buildRecord({ id: 'thisMonth', updatedAt: NOW - 10 * DAY }),
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual([
        'today',
        'yesterday',
        'thisWeek',
        'thisMonth',
        'older'
      ])
      expect(idsByKey(sections, 'today')).toEqual(['today'])
      expect(idsByKey(sections, 'yesterday')).toEqual(['yesterday'])
      expect(idsByKey(sections, 'thisWeek')).toEqual(['thisWeek'])
      expect(idsByKey(sections, 'thisMonth')).toEqual(['thisMonth'])
      expect(idsByKey(sections, 'older')).toEqual(['older'])
    })

    it('respects the createdAt sort key', () => {
      const records = [
        buildRecord({
          id: 'r',
          createdAt: NOW - 1 * 60 * 60 * 1000,
          updatedAt: NOW - 60 * DAY
        })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'createdAt' })

      expect(sectionKeys(sections)).toEqual(['today'])
      expect(idsByKey(sections, 'today')).toEqual(['r'])
    })

    it('falls back to updatedAt → createdAt → 0 when the chosen field is missing', () => {
      const records = [
        // createdAt key requested but only updatedAt is present → uses updatedAt.
        buildRecord({ id: 'fellThrough', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        // No timestamps at all → 0 → older bucket.
        buildRecord({ id: 'undated' })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'createdAt' })

      expect(idsByKey(sections, 'today')).toEqual(['fellThrough'])
      expect(idsByKey(sections, 'older')).toEqual(['undated'])
    })

    it('puts favorites in their own section ahead of the time buckets and excludes them from time buckets', () => {
      const records = [
        buildRecord({
          id: 'favToday',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000
        }),
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual(['favorites', 'today'])
      expect(idsByKey(sections, 'favorites')).toEqual(['favToday'])
      expect(idsByKey(sections, 'today')).toEqual(['today'])
    })

    it('reverses the time sections when direction is asc but keeps favorites first', () => {
      const records = [
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY }),
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({
          id: 'fav',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000
        })
      ]

      const sections = groupRecordsByTimePeriod(records, {
        key: 'updatedAt',
        direction: 'asc'
      })

      expect(sectionKeys(sections)).toEqual(['favorites', 'older', 'today'])
    })

    it('omits time buckets that have no records', () => {
      const records = [
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual(['today', 'older'])
    })
  })

  describe('current site section', () => {
    it('prepends currentSite above favorites when a website matches', () => {
      const records = [
        buildRecord({
          id: 'siteMatch',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Site', websites: ['example.com'] }
        }),
        buildRecord({
          id: 'favOther',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Fav', websites: ['other.com'] }
        }),
        buildRecord({
          id: 'today',
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Today', websites: ['unrelated.com'] }
        })
      ]

      const sections = groupRecordsByTimePeriod(records, undefined, {
        currentSiteUrl: 'https://www.example.com/login'
      })

      expect(sectionKeys(sections)).toEqual([
        'currentSite',
        'favorites',
        'today'
      ])
      expect(idsByKey(sections, 'currentSite')).toEqual(['siteMatch'])
      expect(idsByKey(sections, 'favorites')).toEqual(['favOther'])
      expect(idsByKey(sections, 'today')).toEqual(['today'])
      expect(sections.find((s) => s.key === 'currentSite')?.isCurrentSite).toBe(
        true
      )
    })

    it('excludes matching records from favorites and time buckets', () => {
      const records = [
        buildRecord({
          id: 'matchFav',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Match', websites: ['https://example.com'] }
        }),
        buildRecord({
          id: 'matchToday',
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Match2', websites: ['login.example.com'] }
        })
      ]

      const sections = groupRecordsByTimePeriod(
        records,
        { key: 'updatedAt' },
        {
          currentSiteUrl: 'https://example.com'
        }
      )

      expect(sectionKeys(sections)).toEqual(['currentSite'])
      expect(idsByKey(sections, 'currentSite')).toEqual([
        'matchFav',
        'matchToday'
      ])
      expect(idsByKey(sections, 'favorites')).toEqual([])
      expect(idsByKey(sections, 'today')).toEqual([])
    })

    it('omits currentSite when url is missing, empty, or no matches', () => {
      const records = [
        buildRecord({
          id: 'a',
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'A', websites: ['example.com'] }
        })
      ]

      expect(
        sectionKeys(groupRecordsByTimePeriod(records, undefined, {}))
      ).toEqual(['today'])
      expect(
        sectionKeys(
          groupRecordsByTimePeriod(records, undefined, { currentSiteUrl: '' })
        )
      ).toEqual(['today'])
      expect(
        sectionKeys(
          groupRecordsByTimePeriod(records, undefined, {
            currentSiteUrl: null
          })
        )
      ).toEqual(['today'])
      expect(
        sectionKeys(
          groupRecordsByTimePeriod(records, undefined, {
            currentSiteUrl: 'https://other.com'
          })
        )
      ).toEqual(['today'])
    })

    it('prepends currentSite for alphabetical sort as well', () => {
      const records = [
        buildRecord({
          id: 'site',
          isFavorite: true,
          data: { title: 'Site', websites: ['example.com'] }
        }),
        buildRecord({
          id: 'fav',
          isFavorite: true,
          data: { title: 'Fav', websites: ['other.com'] }
        }),
        buildRecord({
          id: 'rest',
          data: { title: 'Rest', websites: ['unrelated.com'] }
        })
      ]

      const sections = groupRecordsByTimePeriod(
        records,
        { key: 'data.title' },
        {
          currentSiteUrl: 'https://example.com'
        }
      )

      expect(sectionKeys(sections)).toEqual(['currentSite', 'favorites', 'all'])
      expect(idsByKey(sections, 'currentSite')).toEqual(['site'])
      expect(idsByKey(sections, 'favorites')).toEqual(['fav'])
      expect(idsByKey(sections, 'all')).toEqual(['rest'])
    })

    it('honors host URI match overrides from cache', async () => {
      const records = [
        buildRecord({
          id: 'hostOnly',
          updatedAt: NOW - 1 * 60 * 60 * 1000,
          data: { title: 'Host', websites: ['https://example.com'] }
        })
      ]

      await setUriMatchOverrides('hostOnly', {
        'https://example.com': URI_MATCH_TYPES.HOST
      })

      const subdomainSections = groupRecordsByTimePeriod(records, undefined, {
        currentSiteUrl: 'https://login.example.com'
      })
      expect(sectionKeys(subdomainSections)).toEqual(['today'])

      const exactHostSections = groupRecordsByTimePeriod(records, undefined, {
        currentSiteUrl: 'https://example.com/login'
      })
      expect(sectionKeys(exactHostSections)).toEqual(['currentSite'])
      expect(idsByKey(exactHostSections, 'currentSite')).toEqual(['hostOnly'])
    })
  })
})
