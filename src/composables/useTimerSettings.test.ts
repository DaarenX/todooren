import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { clampMinutes, useTimerSettings } from './useTimerSettings'

const KEY = 'todooren:timer'

beforeEach(() => {
  localStorage.clear()
})

describe('clampMinutes', () => {
  it('rounds to whole minutes within 1 to 180', () => {
    expect(clampMinutes('12.6', 5)).toBe(13)
    expect(clampMinutes(0, 5)).toBe(1)
    expect(clampMinutes(500, 5)).toBe(180)
  })

  it('falls back when the value is not a number', () => {
    expect(clampMinutes('abc', 5)).toBe(5)
    expect(clampMinutes(undefined, 7)).toBe(7)
  })
})

describe('useTimerSettings', () => {
  it('defaults to 25 minutes of focus and 5 of break', () => {
    const { minutesFor } = useTimerSettings()
    expect(minutesFor('work')).toBe(25)
    expect(minutesFor('break')).toBe(5)
  })

  it('reads stored durations and sanitises invalid ones', () => {
    localStorage.setItem(KEY, JSON.stringify({ work: 999, break: 'x' }))
    const { minutesFor } = useTimerSettings()
    expect(minutesFor('work')).toBe(180)
    expect(minutesFor('break')).toBe(5)
  })

  it('falls back to defaults when the stored value is null', () => {
    localStorage.setItem(KEY, 'null')
    const { minutesFor } = useTimerSettings()
    expect(minutesFor('work')).toBe(25)
  })

  it('stores a clamped duration and returns it', async () => {
    const { minutesFor, setMinutes } = useTimerSettings()
    expect(setMinutes('break', '0')).toBe(1)
    expect(minutesFor('break')).toBe(1)
    await nextTick()
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ work: 25, break: 1 })
  })
})
