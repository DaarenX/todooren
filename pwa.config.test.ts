import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import { pwaOptions } from './pwa.config.ts'

const manifest = pwaOptions.manifest || {}
const icons = manifest.icons ?? []

function publicFile(src: string) {
  return join(import.meta.dirname, 'public', src)
}

describe('pwaOptions', () => {
  it('describes a standalone app that Android can install', () => {
    expect(manifest.name).toBe('Todooren')
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('./')
  })

  it('provides 192px and 512px icons plus a maskable one', () => {
    const sizes = icons.map((icon) => icon.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    expect(icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
  })

  it('points every icon at a file in public/', () => {
    for (const icon of icons) expect(existsSync(publicFile(icon.src))).toBe(true)
  })

  it('caches the favicons for offline use', () => {
    const assets = [pwaOptions.includeAssets ?? []].flat()
    expect(assets).toEqual(expect.arrayContaining(['favicon.ico', 'icon.svg']))
    for (const asset of assets) expect(existsSync(publicFile(asset))).toBe(true)
  })

  it('updates the service worker without forcing a reload', () => {
    expect(pwaOptions.registerType).toBe('autoUpdate')
    expect(pwaOptions.injectRegister).toBe('script-defer')
  })
})
