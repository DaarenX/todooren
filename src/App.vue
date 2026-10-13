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
  <div class="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
    <div class="mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-8">
      <header class="mb-8 flex items-center justify-between">
        <h1 class="text-lg font-semibold tracking-tight">Todooren</h1>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-full text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
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
