import { PearpassVaultClient } from './index'
import { NATIVE_MESSAGE_TYPES } from '../shared/constants/nativeMessaging'
import { logger } from '../shared/utils/logger'
import { runtime } from '../shared/utils/runtime'

jest.mock('../shared/utils/runtime', () => ({
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    lastError: null
  }
}))

jest.mock('../shared/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

// Mock command definitions
jest.mock('../shared/commandDefinitions', () => ({
  COMMAND_NAMES: [
    'vaultsInit',
    'vaultsClose',
    'checkAvailability',
    'vaultsGetStatus',
    'activeVaultGetStatus',
    'getMasterPasswordStatus',
    'encryptionGetStatus',
    'encryptionInit',
    'encryptionGet',
    'fetchFavicon'
  ],
  getCommandParams: jest.fn((commandName, args) => {
    switch (commandName) {
      case 'vaultsInit':
        return { encryptionKey: args[0] }
      default:
        return {}
    }
  })
}))

const createMockClient = () =>
  new PearpassVaultClient({
    debugMode: true
  })

/** CONNECT + checkAvailability succeed; named command fails with error message. */
const mockSendMessageUntilCommandFails = (failCommand, errorMessage) => {
  runtime.sendMessage.mockImplementation((message, callback) => {
    if (message.type === NATIVE_MESSAGE_TYPES.CONNECT) {
      callback({ success: true })
      return
    }
    if (
      message.type === NATIVE_MESSAGE_TYPES.REQUEST &&
      message.command === 'checkAvailability'
    ) {
      callback({
        success: true,
        result: { available: true, status: 'connected', message: 'ok' }
      })
      return
    }
    if (
      message.type === NATIVE_MESSAGE_TYPES.REQUEST &&
      message.command === failCommand
    ) {
      callback({ success: false, error: errorMessage })
      return
    }
    callback({ success: true, result: {} })
  })
}

describe('PearpassVaultClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    runtime.lastError = null
  })

  describe('constructor', () => {
    it('should create a client with default options', () => {
      const client = new PearpassVaultClient()
      expect(client.debugMode).toBe(false)
      expect(client.connected).toBe(false)
    })

    it('should create a client with debug mode enabled', () => {
      const client = new PearpassVaultClient({ debugMode: true })
      expect(client.debugMode).toBe(true)
    })

    it('should create a client with environment-based debug mode', () => {
      const client = new PearpassVaultClient({
        debugMode: true
      })
      expect(client.debugMode).toBe(true)

      const prodClient = new PearpassVaultClient({
        debugMode: false
      })
      expect(prodClient.debugMode).toBe(false)
    })
  })

  describe('connect', () => {
    it('should connect to native host', async () => {
      const client = createMockClient()
      runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ success: true })
      })

      await client.connect()
      expect(client.connected).toBe(true)
    })

    it('should not connect twice', async () => {
      const client = createMockClient()
      client.connected = true

      await client.connect()
      expect(runtime.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('should disconnect from native host', () => {
      const client = createMockClient()
      client.connected = true

      client.disconnect()
      expect(client.connected).toBe(false)
    })
  })

  describe('expected quiet errors', () => {
    it('vaultsGetStatus MasterPasswordRequired resolves { status: null } without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails(
        'vaultsGetStatus',
        'MasterPasswordRequired'
      )

      await expect(client.vaultsGetStatus()).resolves.toEqual({ status: null })
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('encryptionGetStatus MasterPasswordRequired resolves { status: null } without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails(
        'encryptionGetStatus',
        'MasterPasswordRequired'
      )

      await expect(client.encryptionGetStatus()).resolves.toEqual({
        status: null
      })
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('encryptionInit MasterPasswordRequired resolves without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails(
        'encryptionInit',
        'MasterPasswordRequired'
      )

      await expect(client.encryptionInit()).resolves.toBeUndefined()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('encryptionGet MasterPasswordRequired resolves null without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails(
        'encryptionGet',
        'MasterPasswordRequired'
      )

      await expect(client.encryptionGet('masterPassword')).resolves.toBeNull()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('getMasterPasswordStatus MasterPasswordRequired resolves { isLocked: false } without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails(
        'getMasterPasswordStatus',
        'MasterPasswordRequired'
      )

      await expect(client.getMasterPasswordStatus()).resolves.toEqual({
        isLocked: false
      })
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('fetchFavicon Favicon not found resolves { favicon: null } without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails('fetchFavicon', 'Favicon not found')

      await expect(client.fetchFavicon()).resolves.toEqual({ favicon: null })
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('fetchFavicon INVALID_URL resolves { favicon: null } without logger.error', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails('fetchFavicon', 'INVALID_URL')

      await expect(client.fetchFavicon()).resolves.toEqual({ favicon: null })
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('unrelated error still logs and throws', async () => {
      const client = createMockClient()
      mockSendMessageUntilCommandFails('vaultsGetStatus', 'boom')

      await expect(client.vaultsGetStatus()).rejects.toThrow('boom')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
