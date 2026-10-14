import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { TimerMode } from '@/types'
import { formatClock, usePomodoro } from './usePomodoro'

const MINUTE = 60_000

function setup() {
  const durations = ref<Record<TimerMode, number>>({ work: 25 * MINUTE, break: 5 * MINUTE })
  const onComplete = vi.fn()
  const scope = effectScope()
  const timer = scope.run(() => usePomodoro({ durationMs: (m) => durations.value[m], onComplete }))!
  return { durations, onComplete, scope, timer }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('formatClock', () => {
  it('formats milliseconds as mm:ss, rounding partial seconds up', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(1)).toBe('00:01')
    expect(formatClock(61_000)).toBe('01:01')
    expect(formatClock(180 * MINUTE)).toBe('180:00')
  })
})

describe('usePomodoro', () => {
  it('starts idle with a full focus session', () => {
    const { timer } = setup()
    expect(timer.mode.value).toBe('work')
    expect(timer.running.value).toBe(false)
    expect(timer.display.value).toBe('25:00')
    expect(timer.progress.value).toBe(1)
    expect(timer.inProgress.value).toBe(false)
  })

  it('counts down while running', () => {
    const { timer } = setup()
    timer.start()
    vi.advanceTimersByTime(12.5 * MINUTE)
    expect(timer.running.value).toBe(true)
    expect(timer.display.value).toBe('12:30')
    expect(timer.progress.value).toBe(0.5)
    expect(timer.inProgress.value).toBe(true)
  })

  it('holds the remaining time while paused', () => {
    const { timer } = setup()
    timer.start()
    vi.advanceTimersByTime(5000)
    timer.pause()
    vi.advanceTimersByTime(10_000)
    expect(timer.running.value).toBe(false)
    expect(timer.display.value).toBe('24:55')
    expect(timer.inProgress.value).toBe(true)
  })

  it('resets to the full duration', () => {
    const { timer } = setup()
    timer.start()
    vi.advanceTimersByTime(5000)
    timer.reset()
    expect(timer.running.value).toBe(false)
    expect(timer.display.value).toBe('25:00')
  })

  it('switches mode and stops the countdown', () => {
    const { timer } = setup()
    timer.start()
    timer.switchMode('break')
    expect(timer.mode.value).toBe('break')
    expect(timer.running.value).toBe(false)
    expect(timer.display.value).toBe('05:00')
  })

  it('moves to the other mode and reports the finished one on completion', () => {
    const { timer, onComplete } = setup()
    timer.start()
    vi.advanceTimersByTime(25 * MINUTE)
    expect(onComplete).toHaveBeenCalledWith('work')
    expect(timer.mode.value).toBe('break')
    expect(timer.running.value).toBe(false)
    expect(timer.display.value).toBe('05:00')
  })

  it('restarts a full session when started at zero', () => {
    const { timer } = setup()
    timer.remainingMs.value = 0
    timer.start()
    expect(timer.display.value).toBe('25:00')
  })

  it('follows duration changes only while idle', async () => {
    const { durations, timer } = setup()
    durations.value = { work: 10 * MINUTE, break: 5 * MINUTE }
    await nextTick()
    expect(timer.display.value).toBe('10:00')
    timer.start()
    durations.value = { work: 20 * MINUTE, break: 5 * MINUTE }
    await nextTick()
    expect(timer.display.value).toBe('10:00')
  })

  it('stops ticking when its scope is disposed', () => {
    const { scope, timer } = setup()
    timer.start()
    scope.stop()
    expect(timer.running.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
