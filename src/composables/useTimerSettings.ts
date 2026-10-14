import type { TimerMode } from '@/types'
import { useLocalStorage } from './useLocalStorage'

export const MIN_MINUTES = 1
export const MAX_MINUTES = 180
export const DEFAULT_MINUTES: Record<TimerMode, number> = { work: 25, break: 5 }

export function clampMinutes(value: unknown, fallback: number) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return fallback
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, n))
}

/** Focus and break durations in minutes, persisted and always within range. */
export function useTimerSettings() {
  const settings = useLocalStorage<Record<TimerMode, number>>('todooren:timer', {
    ...DEFAULT_MINUTES,
  })

  function minutesFor(mode: TimerMode) {
    return clampMinutes(settings.value?.[mode], DEFAULT_MINUTES[mode])
  }

  /** Stores a new duration for `mode` and returns the clamped value. */
  function setMinutes(mode: TimerMode, value: unknown) {
    const minutes = clampMinutes(value, minutesFor(mode))
    settings.value = { work: minutesFor('work'), break: minutesFor('break'), [mode]: minutes }
    return minutes
  }

  return { minutesFor, setMinutes }
}
