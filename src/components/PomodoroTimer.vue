<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import { useChime } from '@/composables/useChime'
import { usePomodoro } from '@/composables/usePomodoro'
import { MAX_MINUTES, MIN_MINUTES, useTimerSettings } from '@/composables/useTimerSettings'
import type { TimerMode } from '@/types'

const LABELS: Record<TimerMode, string> = { work: 'Focus', break: 'Break' }
const MODES: TimerMode[] = ['work', 'break']
const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const { minutesFor, setMinutes } = useTimerSettings()
const chime = useChime()
const { mode, running, display, progress, inProgress, pause, reset, switchMode, ...timer } =
  usePomodoro({ durationMs: (m) => minutesFor(m) * 60_000, onComplete: chime.play })

const showSettings = ref(false)
const dashOffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

function start() {
  chime.prime()
  timer.start()
}

function onMinutesChange(m: TimerMode, event: Event) {
  const input = event.target as HTMLInputElement
  input.value = String(setMinutes(m, input.value))
}

watchEffect(() => {
  document.title = inProgress.value
    ? `${display.value} · ${LABELS[mode.value]} — Todooren`
    : 'Todooren'
})

onBeforeUnmount(() => {
  document.title = 'Todooren'
})
</script>

<template>
  <section class="glass rounded-3xl p-6" aria-label="Pomodoro timer">
    <div class="mx-auto flex w-fit rounded-full border border-line p-1 text-sm">
      <button
        v-for="m in MODES"
        :key="m"
        type="button"
        class="rounded-full px-4 py-1.5 font-medium transition-colors focus-ring"
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
      <button type="button" class="icon-btn size-10" aria-label="Reset timer" @click="reset">
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
        class="h-11 min-w-32 rounded-full btn-primary px-6"
        @click="running ? pause() : start()"
      >
        {{ running ? 'Pause' : inProgress ? 'Resume' : 'Start' }}
      </button>

      <button
        type="button"
        class="icon-btn size-10"
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
              class="mt-1.5 w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm tabular-nums text-heading outline-none field-focus"
              @change="onMinutesChange(m, $event)"
            />
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
