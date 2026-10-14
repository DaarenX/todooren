import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import App from './App.vue'

const root = document.documentElement
let wrapper: VueWrapper

function mountApp() {
  wrapper = mount(App, { global: { stubs: { PomodoroTimer: true, TodoBoard: true } } })
  return wrapper.get('button[aria-label$="mode"]')
}

beforeEach(() => {
  localStorage.clear()
  root.className = ''
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper.unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('starts from the theme already applied to the page', () => {
    root.classList.add('dark')
    expect(mountApp().attributes('aria-label')).toBe('Switch to light mode')
  })

  it('toggles dark mode and remembers the choice', async () => {
    const toggle = mountApp()
    await toggle.trigger('click')
    expect(root.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('todooren:theme')).toBe('dark')
    expect(toggle.attributes('aria-label')).toBe('Switch to light mode')
    await toggle.trigger('click')
    expect(localStorage.getItem('todooren:theme')).toBe('light')
  })

  it('animates the theme change only briefly', async () => {
    await mountApp().trigger('click')
    expect(root.classList.contains('theme-transition')).toBe(true)
    vi.advanceTimersByTime(400)
    expect(root.classList.contains('theme-transition')).toBe(false)
  })

  it('still switches theme when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    await mountApp().trigger('click')
    expect(root.classList.contains('dark')).toBe(true)
  })
})
