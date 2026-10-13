<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'

type Mode = 'work' | 'break'

const MIN_MINUTES = 1
const MAX_MINUTES = 180
const DEFAULTS: Record<Mode, number> = { work: 25, break: 5 }
const LABELS: Record<Mode, string> = { work: 'Focus', break: 'Break' }
const MODES: Mode[] = ['work', 'break']

const settings = useLocalStorage<Record<Mode, number>>('todooren:timer', { ...DEFAULTS })

function clampMinutes(value: unknown, fallback: number) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return fallback
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, n))
}

function minutesFor(m: Mode) {
  return clampMinutes(settings.value?.[m], DEFAULTS[m])
}

function setMinutes(m: Mode, event: Event) {
  const input = event.target as HTMLInputElement
  const value = clampMinutes(input.value, minutesFor(m))
  settings.value = { work: minutesFor('work'), break: minutesFor('break'), [m]: value }
  input.value = String(value)
}

const mode = ref<Mode>('work')
const running = ref(false)
const showSettings = ref(false)
const durationMs = computed(() => minutesFor(mode.value) * 60_000)
const remainingMs = ref(durationMs.value)

// The countdown is derived from a fixed end time so it stays accurate
// even when the browser throttles timers in a background tab.
let endAt = 0
let interval: number | undefined

function stopTicking() {
  window.clearInterval(interval)
  interval = undefined
  running.value = false
}

function tick() {
  remainingMs.value = Math.max(0, endAt - Date.now())
  if (remainingMs.value === 0) complete()
}

function start() {
  ensureAudio()
  if (remainingMs.value <= 0) remainingMs.value = durationMs.value
  endAt = Date.now() + remainingMs.value
  running.value = true
  interval = window.setInterval(tick, 200)
}

function pause() {
  remainingMs.value = Math.max(0, endAt - Date.now())
  stopTicking()
}

function reset() {
  stopTicking()
  remainingMs.value = durationMs.value
}

function switchMode(next: Mode) {
  stopTicking()
  mode.value = next
  remainingMs.value = durationMs.value
}

function complete() {
  playChime()
  switchMode(mode.value === 'work' ? 'break' : 'work')
}

watch(durationMs, (ms) => {
  if (!running.value) remainingMs.value = ms
})

const display = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const dashOffset = computed(() => {
  const fraction = Math.min(1, Math.max(0, remainingMs.value / durationMs.value))
  return CIRCUMFERENCE * (1 - fraction)
})

const inProgress = computed(() => running.value || remainingMs.value !== durationMs.value)

watchEffect(() => {
  document.title = inProgress.value
    ? `${display.value} · ${LABELS[mode.value]} — Todooren`
    : 'Todooren'
})

// --- Audio alert (synthesised, no asset needed) ---
let audioCtx: AudioContext | undefined

// Must be called from a user gesture so the browser lets us play later.
function ensureAudio() {
  try {
    audioCtx ??= new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
  } catch {
    audioCtx = undefined
  }
}

function playChime() {
  const ctx = audioCtx
  if (!ctx) return
  const notes = [880, 1108.73, 1318.51]
  for (let repeat = 0; repeat < 2; repeat++) {
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + repeat * 1.1 + i * 0.2
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 1)
    })
  }
}

onBeforeUnmount(() => {
  stopTicking()
  document.title = 'Todooren'
  void audioCtx?.close()
})
</script>

<template>
  <section class="glass rounded-3xl p-6" aria-label="Pomodoro timer">
    <div class="mx-auto flex w-fit rounded-full border border-line p-1 text-sm">
      <button
        v-for="m in MODES"
        :key="m"
        type="button"
        class="rounded-full px-4 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        :class="mode === m ? 'bg-accent-soft text-accent' : 'text-body hover:text-heading'"
        :aria-pressed="mode === m"
        @click="switchMode(m)"
      >
        {{ LABELS[m] }}
      </button>
    </div>

    <div class="relative mx-auto mt-6 aspect-square w-full max-w-64">
      <svg viewBox="0 0 260 260" class="size-full -rotate-90" aria-hidden="true">
        <circle cx="130" cy="130" :r="RADIUS" fill="none" stroke-width="6" class="stroke-line" />
        <circle
          cx="130"
          cy="130"
          :r="RADIUS"
          fill="none"
          stroke-width="6"
          stroke-linecap="round"
          class="ring-glow transition-[stroke-dashoffset] duration-200 ease-linear"
          :class="mode === 'work' ? 'stroke-accent text-accent' : 'stroke-break text-break'"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div
          class="text-6xl font-light tabular-nums tracking-tight"
          role="timer"
          :aria-label="`${display} remaining`"
        >
          {{ display }}
        </div>
        <div class="mt-2 text-xs font-medium uppercase tracking-widest text-faint">
          {{ LABELS[mode] }}
        </div>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full text-body hover:bg-subtle hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Reset timer"
        @click="reset"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </button>

      <button
        type="button"
        class="h-11 min-w-32 rounded-full bg-linear-to-br from-accent-hi to-accent shadow-lg shadow-accent/30 transition active:scale-95 px-6 text-sm font-semibold text-on-accent hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        @click="running ? pause() : start()"
      >
        {{ running ? 'Pause' : inProgress ? 'Resume' : 'Start' }}
      </button>

      <button
        type="button"
        class="grid size-10 place-items-center rounded-full text-body hover:bg-subtle hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        :class="showSettings && 'bg-subtle text-heading'"
        aria-label="Timer settings"
        :aria-expanded="showSettings"
        @click="showSettings = !showSettings"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        >
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="9" cy="17" r="2" />
        </svg>
      </button>
    </div>

    <div
      class="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
      :class="showSettings ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
      :inert="!showSettings"
    >
      <div class="overflow-hidden">
        <div class="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
          <label v-for="m in MODES" :key="m" class="block text-xs font-medium text-body">
            {{ LABELS[m] }} (minutes)
            <input
              type="number"
              inputmode="numeric"
              :min="MIN_MINUTES"
              :max="MAX_MINUTES"
              :value="minutesFor(m)"
              class="mt-1.5 w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm tabular-nums text-heading outline-none focus:border-accent-line focus:ring-2 focus:ring-accent/20"
              @change="setMinutes(m, $event)"
            />
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
