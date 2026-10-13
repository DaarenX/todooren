<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Todo } from '@/types'
import TodoList from './TodoList.vue'

const todos = useLocalStorage<Todo[]>('todooren:todos', [])
const backlog = useLocalStorage<Todo[]>('todooren:backlog', [])
const backlogOpen = useLocalStorage('todooren:backlog-open', true)

if (!Array.isArray(todos.value)) todos.value = []
if (!Array.isArray(backlog.value)) backlog.value = []

const dragging = ref(false)
const draft = ref('')

const remaining = computed(() => todos.value.filter((t) => !t.done).length)
const hasCompleted = computed(() => todos.value.some((t) => t.done))

function addTodo() {
  const text = draft.value.trim()
  if (!text) return
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  todos.value.push({ id, text, done: false })
  draft.value = ''
}

function clearCompleted() {
  todos.value = todos.value.filter((t) => !t.done)
}

function toBacklog(id: string) {
  const index = todos.value.findIndex((t) => t.id === id)
  if (index === -1) return
  const [todo] = todos.value.splice(index, 1)
  if (todo) backlog.value.unshift(todo)
}

function toToday(id: string) {
  const index = backlog.value.findIndex((t) => t.id === id)
  if (index === -1) return
  const [todo] = backlog.value.splice(index, 1)
  if (todo) todos.value.push(todo)
}
</script>

<template>
  <section aria-label="Todos">
    <form class="flex gap-2" @submit.prevent="addTodo">
      <input
        v-model="draft"
        type="text"
        placeholder="Add a task…"
        aria-label="New task"
        class="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
      />
      <button
        type="submit"
        class="rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:opacity-40 disabled:hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:hover:bg-zinc-100"
        :disabled="!draft.trim()"
      >
        Add
      </button>
    </form>

    <div class="mb-3 mt-8 flex items-baseline justify-between px-1">
      <h2 class="text-sm font-semibold">
        Today
        <span class="ml-1.5 font-normal tabular-nums text-zinc-400 dark:text-zinc-500">{{ remaining }} left</span>
      </h2>
      <button
        v-if="hasCompleted"
        type="button"
        class="rounded text-xs text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100"
        @click="clearCompleted"
      >
        Clear completed
      </button>
    </div>
    <TodoList
      v-model="todos"
      v-model:dragging="dragging"
      empty-text="Nothing planned. Add a task above."
      @transfer="toBacklog"
    />

    <button
      type="button"
      class="mb-3 mt-10 flex items-center gap-1.5 rounded px-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      :aria-expanded="backlogOpen"
      @click="backlogOpen = !backlogOpen"
    >
      <svg
        viewBox="0 0 16 16"
        class="size-3.5 text-zinc-400 transition-transform duration-200"
        :class="backlogOpen && 'rotate-90'"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 3.5 4.5 4.5L6 12.5" />
      </svg>
      Backlog
      <span class="font-normal tabular-nums text-zinc-400 dark:text-zinc-500">{{ backlog.length }}</span>
    </button>
    <TodoList
      v-show="backlogOpen"
      v-model="backlog"
      v-model:dragging="dragging"
      backlog
      empty-text="Backlog is empty. Drag tasks here for later."
      @transfer="toToday"
    />
  </section>
</template>
