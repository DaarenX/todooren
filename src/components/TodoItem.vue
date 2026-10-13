<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Todo } from '@/types'

const props = defineProps<{
  todo: Todo
  backlog?: boolean
}>()

const emit = defineEmits<{
  update: [patch: Partial<Todo>]
  remove: []
  transfer: []
  nudge: [delta: number]
}>()

const editing = ref(false)
const draft = ref('')
const inputEl = ref<HTMLInputElement>()

async function startEdit() {
  draft.value = props.todo.text
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
}

function commit() {
  if (!editing.value) return
  editing.value = false
  const text = draft.value.trim()
  if (!text) emit('remove')
  else if (text !== props.todo.text) emit('update', { text })
}

function cancel() {
  editing.value = false
}

const iconButton =
  'grid size-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-subtle hover:text-heading focus-visible:outline-2 focus-visible:outline-accent'
</script>

<template>
  <li class="flex items-center gap-1 rounded-2xl border border-line bg-surface py-1.5 pl-1 pr-2">
    <button
      type="button"
      class="drag-handle grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-faint hover:text-body focus-visible:outline-2 focus-visible:outline-accent active:cursor-grabbing"
      aria-label="Reorder: drag, or press the up and down arrow keys"
      @keydown.up.prevent="emit('nudge', -1)"
      @keydown.down.prevent="emit('nudge', 1)"
    >
      <svg viewBox="0 0 16 16" class="size-4" fill="currentColor" aria-hidden="true">
        <circle cx="5.5" cy="3.5" r="1.25" />
        <circle cx="10.5" cy="3.5" r="1.25" />
        <circle cx="5.5" cy="8" r="1.25" />
        <circle cx="10.5" cy="8" r="1.25" />
        <circle cx="5.5" cy="12.5" r="1.25" />
        <circle cx="10.5" cy="12.5" r="1.25" />
      </svg>
    </button>

    <button
      type="button"
      role="checkbox"
      :aria-checked="todo.done"
      :aria-label="`Mark “${todo.text}” as ${todo.done ? 'not done' : 'done'}`"
      class="mx-1 grid size-5 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      :class="
        todo.done
          ? 'border-accent bg-linear-to-br from-accent-hi to-accent text-on-accent shadow-md shadow-accent/30'
          : 'border-faint text-transparent hover:border-accent'
      "
      @click="emit('update', { done: !todo.done })"
    >
      <svg
        viewBox="0 0 16 16"
        class="size-3"
        fill="none"
        stroke="currentColor"
        stroke-width="2.25"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
    </button>

    <input
      v-if="editing"
      ref="inputEl"
      v-model="draft"
      type="text"
      aria-label="Edit task"
      class="min-w-0 flex-1 rounded-lg bg-subtle px-2 py-1.5 text-sm outline-none"
      @keydown.enter="commit"
      @keydown.esc="cancel"
      @blur="commit"
    />
    <button
      v-else
      type="button"
      class="min-w-0 flex-1 cursor-text rounded-lg px-2 py-1.5 text-left text-sm wrap-anywhere transition-colors focus-visible:outline-2 focus-visible:outline-accent"
      :class="[todo.done && 'text-faint line-through', !todo.done && backlog && 'text-body']"
      title="Click to edit"
      @click="startEdit"
    >
      {{ todo.text }}
    </button>

    <button
      type="button"
      :class="iconButton"
      :aria-label="backlog ? 'Move to today' : 'Move to backlog'"
      :title="backlog ? 'Move to today' : 'Move to backlog'"
      @click="emit('transfer')"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path v-if="backlog" d="M12 19V5M6 11l6-6 6 6" />
        <template v-else>
          <path d="M4 7h16v3H4zM6 10v9h12v-9" />
          <path d="M10 14h4" />
        </template>
      </svg>
    </button>

    <button
      type="button"
      :class="[iconButton, 'hover:text-rose-600 dark:hover:text-rose-400']"
      aria-label="Delete task"
      title="Delete"
      @click="emit('remove')"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  </li>
</template>
