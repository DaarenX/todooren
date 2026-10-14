import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { TimerMode } from '@/types'

const TICK_MS = 200

export interface PomodoroOptions {
  durationMs: (mode: TimerMode) => number
  onComplete?: (finished: TimerMode) => void
}

// The countdown is derived from a fixed end time so it stays accurate
// even when the browser throttles timers in a background tab.
interface Countdown {
  options: PomodoroOptions
  mode: Ref<TimerMode>
  running: Ref<boolean>
  remainingMs: Ref<number>
  durationMs: ComputedRef<number>
  endAt: number
  interval?: number
}

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

function stopTicking(c: Countdown) {
  window.clearInterval(c.interval)
  c.interval = undefined
  c.running.value = false
}

function switchMode(c: Countdown, next: TimerMode) {
  stopTicking(c)
  c.mode.value = next
  c.remainingMs.value = c.durationMs.value
}

function tick(c: Countdown) {
  c.remainingMs.value = Math.max(0, c.endAt - Date.now())
  if (c.remainingMs.value > 0) return
  const finished = c.mode.value
  switchMode(c, finished === 'work' ? 'break' : 'work')
  c.options.onComplete?.(finished)
}

function start(c: Countdown) {
  if (c.remainingMs.value <= 0) c.remainingMs.value = c.durationMs.value
  c.endAt = Date.now() + c.remainingMs.value
  c.running.value = true
  c.interval = window.setInterval(() => tick(c), TICK_MS)
}

function pause(c: Countdown) {
  c.remainingMs.value = Math.max(0, c.endAt - Date.now())
  stopTicking(c)
}

function createCountdown(options: PomodoroOptions): Countdown {
  const mode = ref<TimerMode>('work')
  const durationMs = computed(() => options.durationMs(mode.value))
  const running = ref(false)
  const remainingMs = ref(durationMs.value)
  return { options, mode, running, remainingMs, durationMs, endAt: 0 }
}

/** A focus/break countdown that alternates modes when each session ends. */
export function usePomodoro(options: PomodoroOptions) {
  const c = createCountdown(options)
  const { mode, running, remainingMs, durationMs } = c

  watch(durationMs, (ms) => {
    if (!running.value) remainingMs.value = ms
  })
  onScopeDispose(() => stopTicking(c))

  return {
    mode,
    running,
    remainingMs,
    display: computed(() => formatClock(remainingMs.value)),
    progress: computed(() => Math.min(1, Math.max(0, remainingMs.value / durationMs.value))),
    inProgress: computed(() => running.value || remainingMs.value !== durationMs.value),
    start: () => start(c),
    pause: () => pause(c),
    reset: () => switchMode(c, mode.value),
    switchMode: (next: TimerMode) => switchMode(c, next),
  }
}
