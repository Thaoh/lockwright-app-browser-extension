import {
  PASSWORD_GENERATOR_HISTORY_KEY,
  PASSWORD_GENERATOR_HISTORY_MAX,
  appendHistory,
  clearHistory,
  loadHistory
} from './passwordGeneratorHistory'

const mockGet = jest.fn()
const mockAdd = jest.fn()
let mockIdCounter = 0

jest.mock('@tetherto/pearpass-lib-vault/src/instances', () => ({
  pearpassVaultClient: {
    activeVaultGet: (...args) => mockGet(...args),
    activeVaultAdd: (...args) => mockAdd(...args)
  }
}))

jest.mock('@tetherto/pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: () => `id-${++mockIdCounter}`
}))

describe('passwordGeneratorHistory', () => {
  beforeEach(() => {
    mockIdCounter = 0
    mockGet.mockReset()
    mockAdd.mockReset()
    mockAdd.mockResolvedValue(undefined)
  })

  describe('loadHistory', () => {
    it('returns entries from vault document', async () => {
      mockGet.mockResolvedValue({
        entries: [{ id: 'a', value: 'pw', createdAt: 1 }]
      })

      await expect(loadHistory()).resolves.toEqual([
        { id: 'a', value: 'pw', createdAt: 1 }
      ])
      expect(mockGet).toHaveBeenCalledWith(PASSWORD_GENERATOR_HISTORY_KEY)
    })

    it('returns empty array when vault get fails', async () => {
      mockGet.mockRejectedValue(new Error('vault closed'))
      await expect(loadHistory()).resolves.toEqual([])
    })

    it('returns empty array when document is missing', async () => {
      mockGet.mockResolvedValue(null)
      await expect(loadHistory()).resolves.toEqual([])
    })
  })

  describe('appendHistory', () => {
    it('prepends a new entry and persists', async () => {
      mockGet.mockResolvedValue({
        entries: [{ id: 'old', value: 'a', createdAt: 1 }]
      })

      const next = await appendHistory('b')

      expect(next[0]).toMatchObject({ id: 'id-1', value: 'b' })
      expect(next[1]).toEqual({ id: 'old', value: 'a', createdAt: 1 })
      expect(mockAdd).toHaveBeenCalledWith(PASSWORD_GENERATOR_HISTORY_KEY, {
        entries: next
      })
    })

    it('skips when newest value is identical (dedupe)', async () => {
      const existing = [{ id: 'a', value: 'same', createdAt: 1 }]
      mockGet.mockResolvedValue({ entries: existing })

      const next = await appendHistory('same')

      expect(next).toEqual(existing)
      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('caps history at MAX (500)', async () => {
      const filled = Array.from(
        { length: PASSWORD_GENERATOR_HISTORY_MAX },
        (_, i) => ({
          id: `e-${i}`,
          value: `v-${i}`,
          createdAt: i
        })
      )
      mockGet.mockResolvedValue({ entries: filled })

      const next = await appendHistory('brand-new')

      expect(next).toHaveLength(PASSWORD_GENERATOR_HISTORY_MAX)
      expect(next[0].value).toBe('brand-new')
      expect(next[next.length - 1].value).toBe(
        `v-${PASSWORD_GENERATOR_HISTORY_MAX - 2}`
      )
    })

    it('does not persist empty values', async () => {
      mockGet.mockResolvedValue({ entries: [] })
      await appendHistory('')
      expect(mockAdd).not.toHaveBeenCalled()
    })
  })

  describe('clearHistory', () => {
    it('writes empty entries document', async () => {
      await expect(clearHistory()).resolves.toEqual([])
      expect(mockAdd).toHaveBeenCalledWith(PASSWORD_GENERATOR_HISTORY_KEY, {
        entries: []
      })
    })
  })
})
