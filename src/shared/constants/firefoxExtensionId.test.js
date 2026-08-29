import { existsSync, readFileSync } from 'fs'
import path from 'path'

import {
  FIREFOX_EXTENSION_ID,
  FIREFOX_NIGHTLY_EXTENSION_ID,
  MANIFEST_NAME
} from '@tetherto/pearpass-lib-constants'

// Firefox requires the extension ID in browser_specific_settings.gecko.id to
// match allowed_extensions in the native messaging host manifest (written by
// the desktop app using FIREFOX_EXTENSION_ID). manifest.json is static JSON
// and cannot import the constant, so this test guards against drift.
describe('Firefox extension ID', () => {
  it('matches browser_specific_settings.gecko.id in public/manifest.json', () => {
    const manifestPath = path.resolve(
      __dirname,
      '../../../public/manifest.json'
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      'lockwright@dexterity.works'
    )
    expect(FIREFOX_EXTENSION_ID).toBe('lockwright@dexterity.works')
  })

  it('ships Lockwright name and description, not PearPass', () => {
    const manifestPath = path.resolve(
      __dirname,
      '../../../public/manifest.json'
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    expect(manifest.name).toBe('Lockwright')
    expect(manifest.description).toMatch(/Lockwright/)
    expect(manifest.name).not.toMatch(/PearPass/)
    expect(manifest.description).not.toMatch(/PearPass/)
  })

  it('uses Lockwright native host and nightly gecko ids', () => {
    expect(MANIFEST_NAME).toBe('works.dexterity.lockwright')
    expect(FIREFOX_NIGHTLY_EXTENSION_ID).toBe(
      'lockwright-nightly@dexterity.works'
    )
  })

  it('onboarding wordmark is the hatch plate, not PearPass lime', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../../public/assets/images/logo.svg'),
      'utf8'
    )
    expect(src).toContain('#b08d57')
    expect(src).toContain('Lockwright')
    expect(src).not.toMatch(/#B0D944|#BADE5B|PearPass/i)
  })

  it('onboarding copy says Lockwright, not Pearpass', () => {
    const dir = path.resolve(__dirname, '../../onboarding')
    const leftover = []
    for (const name of ['index.tsx', 'Step1Dialog.tsx']) {
      const src = readFileSync(path.join(dir, name), 'utf8')
      if (/Pearpass|PearPass/.test(src.replace(/PearpassLogo/g, ''))) {
        leftover.push(name)
      }
    }
    expect(leftover).toEqual([])
  })

  it('pins @tetherto/pearpass-lib-constants to Thaoh git, not Tether or file:', () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')
    )
    expect(pkg.dependencies['@tetherto/pearpass-lib-constants']).toBe(
      'git+https://github.com/Thaoh/lockwright-lib-constants.git'
    )
  })

  it('pins @tetherto/pearpass-lib-ui-kit to Thaoh git, not Tether', () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')
    )
    expect(pkg.dependencies['@tetherto/pearpass-lib-ui-kit']).toBe(
      'git+https://github.com/Thaoh/lockwright-lib-ui-react-native-components.git#design-system-v2'
    )
  })

  it('declares gecko min 140 and matching icon pixel sizes', () => {
    const manifestPath = path.resolve(
      __dirname,
      '../../../public/manifest.json'
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const publicDir = path.dirname(manifestPath)

    expect(manifest.browser_specific_settings.gecko.strict_min_version).toBe(
      '140.0'
    )
    expect(
      manifest.browser_specific_settings.gecko_android.strict_min_version
    ).toBe('142.0')
    expect(manifest.icons).toEqual({
      16: 'icon-16.png',
      48: 'icon-48.png',
      128: 'icon-128.png'
    })
    for (const [size, file] of Object.entries(manifest.icons)) {
      const png = readFileSync(path.join(publicDir, file))
      expect(existsSync(path.join(publicDir, file))).toBe(true)
      expect(png.readUInt32BE(16)).toBe(Number(size))
      expect(png.readUInt32BE(20)).toBe(Number(size))
    }
    expect(manifest.action.default_icon).toEqual(manifest.icons)
  })
})
