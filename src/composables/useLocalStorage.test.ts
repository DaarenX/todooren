import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with the initial value when nothing is stored', () => {
    expect(useLocalStorage('key', [1, 2]).value).toEqual([1, 2])
  })

  it('loads a previously stored value', () => {
    localStorage.setItem('key', JSON.stringify({ done: true }))

    expect(useLocalStorage('key', { done: false }).value).toEqual({ done: true })
  })

  it('falls back to the initial value when the stored JSON is corrupt', () => {
    localStorage.setItem('key', '{not json')

    expect(useLocalStorage('key', 'fallback').value).toBe('fallback')
  })

  it('persists deep changes', async () => {
    const state = useLocalStorage<string[]>('key', [])

    state.value.push('a')
    await nextTick()

    expect(localStorage.getItem('key')).toBe('["a"]')
  })
})
