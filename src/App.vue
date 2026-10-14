<script setup lang="ts">
import { ref } from 'vue'
import PomodoroTimer from './components/PomodoroTimer.vue'
import TodoBoard from './components/TodoBoard.vue'

const root = document.documentElement
const isDark = ref(root.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  root.classList.add('theme-transition')
  root.classList.toggle('dark', isDark.value)
  window.setTimeout(() => root.classList.remove('theme-transition'), 400)
  try {
    localStorage.setItem('todooren:theme', isDark.value ? 'dark' : 'light')
  } catch {
    // Theme just won't be remembered.
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-bg text-heading antialiased">
    <!-- Ambient background glows -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0">
      <div
        class="glow absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-accent blur-[120px]"
      />
      <div
        class="glow absolute -bottom-24 -right-24 size-[28rem] rounded-full bg-break blur-[120px]"
      />
      <div class="glow absolute -left-40 top-1/3 size-[26rem] rounded-full bg-haze blur-[120px]" />
    </div>

    <div class="relative mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-8">
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="grid size-10 place-items-center rounded-2xl accent-fill">
            <svg
              viewBox="0 0 24 24"
              class="size-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <h1 class="text-xl font-semibold tracking-tight">Todooren</h1>
        </div>
        <button
          type="button"
          class="icon-btn size-9"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
          </svg>
        </button>
      </header>

      <main class="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        <PomodoroTimer class="lg:sticky lg:top-6" />
        <TodoBoard />
      </main>
    </div>
  </div>
</template>
