import assert from 'node:assert/strict'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, it } from 'node:test'

import { packageFirefox, transformFirefoxManifest } from './package-firefox.mjs'

function makeFixtureDist(root) {
  const distDir = path.join(root, 'dist')
  mkdirSync(distDir, { recursive: true })
  writeFileSync(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(
      {
        manifest_version: 3,
        name: 'PearPass',
        version: '2.2.0',
        permissions: [
          'storage',
          'nativeMessaging',
          'clipboardRead',
          'clipboardWrite',
          'offscreen',
          'alarms',
          'activeTab'
        ],
        browser_specific_settings: {
          gecko: { id: 'pass@pears.com', strict_min_version: '109.0' }
        },
        background: {
          service_worker: 'background.js',
          scripts: ['background.js']
        },
        key: 'CHROME-ONLY-NIGHTLY-KEY',
        web_accessible_resources: [
          {
            resources: ['content-popups.html', 'inject.js'],
            matches: ['<all_urls>'],
            use_dynamic_url: true
          }
        ]
      },
      null,
      2
    )
  )
  writeFileSync(path.join(distDir, 'background.js'), '// bg\n')
  writeFileSync(path.join(distDir, 'offscreen.html'), '<html></html>\n')
  writeFileSync(path.join(distDir, 'offscreen.js'), '// offscreen\n')
  writeFileSync(path.join(distDir, 'content.js'), '// content\n')
  return distDir
}

describe('transformFirefoxManifest', () => {
  it('strips Chrome-only fields and keeps gecko id + background scripts', () => {
    const input = {
      permissions: ['storage', 'offscreen', 'alarms'],
      background: {
        service_worker: 'background.js',
        scripts: ['background.js']
      },
      key: 'secret',
      browser_specific_settings: {
        gecko: { id: 'pass@pears.com', strict_min_version: '109.0' }
      },
      web_accessible_resources: [
        {
          resources: ['inject.js'],
          matches: ['<all_urls>'],
          use_dynamic_url: true
        }
      ]
    }

    const out = transformFirefoxManifest(input)

    assert.deepEqual(out.permissions, ['storage', 'alarms'])
    assert.deepEqual(out.background, { scripts: ['background.js'] })
    assert.equal(out.key, undefined)
    assert.equal(out.browser_specific_settings.gecko.id, 'pass@pears.com')
    assert.equal(out.web_accessible_resources[0].use_dynamic_url, undefined)
    assert.deepEqual(out.web_accessible_resources[0].resources, ['inject.js'])
  })
})

describe('packageFirefox', () => {
  let root

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'pearpass-ff-'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('copies dist to outDir, omits offscreen assets, writes zip', () => {
    const distDir = makeFixtureDist(root)
    const outDir = path.join(root, 'dist-firefox')
    const zipPath = path.join(root, 'dist-firefox.zip')

    const result = packageFirefox({ distDir, outDir, zipPath })

    assert.equal(result.outDir, outDir)
    assert.equal(result.zipPath, zipPath)
    assert.equal(existsSync(path.join(outDir, 'background.js')), true)
    assert.equal(existsSync(path.join(outDir, 'content.js')), true)
    assert.equal(existsSync(path.join(outDir, 'offscreen.html')), false)
    assert.equal(existsSync(path.join(outDir, 'offscreen.js')), false)
    assert.equal(existsSync(zipPath), true)

    const zipBuf = readFileSync(zipPath)
    assert.ok(zipBuf.length > 22)
    // Local file header signature (STORE zip)
    assert.equal(zipBuf.readUInt32LE(0), 0x04034b50)
    assert.ok(zipBuf.includes(Buffer.from('manifest.json')))
    assert.ok(zipBuf.includes(Buffer.from('background.js')))
    assert.equal(zipBuf.includes(Buffer.from('offscreen.js')), false)

    const manifest = JSON.parse(
      readFileSync(path.join(outDir, 'manifest.json'), 'utf8')
    )
    assert.ok(!manifest.permissions.includes('offscreen'))
    assert.equal(manifest.background.service_worker, undefined)
    assert.deepEqual(manifest.background.scripts, ['background.js'])
    assert.equal(manifest.key, undefined)
    assert.equal(
      manifest.web_accessible_resources[0].use_dynamic_url,
      undefined
    )
    assert.equal(
      manifest.browser_specific_settings.gecko.id,
      'pass@pears.com'
    )
  })

  it('throws when distDir is missing', () => {
    assert.throws(
      () =>
        packageFirefox({
          distDir: path.join(root, 'missing-dist'),
          outDir: path.join(root, 'dist-firefox'),
          zipPath: path.join(root, 'dist-firefox.zip')
        }),
      /run `pnpm run build` first/i
    )
  })
})
