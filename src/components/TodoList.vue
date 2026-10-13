<script setup lang="ts">
import { useId } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { Todo } from '@/types'
import TodoItem from './TodoItem.vue'

defineProps<{
  backlog?: boolean
  emptyText: string
}>()

const emit = defineEmits<{
  transfer: [id: string]
}>()

const items = defineModel<Todo[]>({ required: true })
// Shared between lists: true while any item is being dragged.
const dragging = defineModel<boolean>('dragging', { default: false })

const targetClass = `sort-${useId().replace(/\W/g, '')}`

function update(id: string, patch: Partial<Todo>) {
  const todo = items.value.find((t) => t.id === id)
  if (todo) Object.assign(todo, patch)
}

function remove(id: string) {
  items.value = items.value.filter((t) => t.id !== id)
}

function nudge(index: number, delta: number) {
  const to = index + delta
  if (to < 0 || to >= items.value.length) return
  const next = [...items.value]
  const [moved] = next.splice(index, 1)
  if (!moved) return
  next.splice(to, 0, moved)
  items.value = next
}

// SortableJS animates the drag itself. Keep the TransitionGroup quiet until
// the dropped order has rendered, otherwise the items would animate twice.
function onDragEnd() {
  window.setTimeout(() => (dragging.value = false), 50)
}
</script>

<template>
  <div class="relative">
    <VueDraggable
      v-model="items"
      :target="`.${targetClass}`"
      group="todos"
      handle=".drag-handle"
      ghost-class="drag-ghost"
      :animation="220"
      @start="dragging = true"
      @end="onDragEnd"
    >
      <TransitionGroup
        tag="ul"
        :name="dragging ? 'none' : 'list'"
        :class="[targetClass, 'relative flex min-h-12 flex-col gap-2']"
      >
        <TodoItem
          v-for="(todo, index) in items"
          :key="todo.id"
          :todo="todo"
          :backlog="backlog"
          @update="update(todo.id, $event)"
          @remove="remove(todo.id)"
          @transfer="emit('transfer', todo.id)"
          @nudge="nudge(index, $event)"
        />
      </TransitionGroup>
    </VueDraggable>
    <p
      v-if="!items.length"
      class="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl border border-dashed border-line text-sm text-faint"
    >
      {{ emptyText }}
    </p>
  </div>
</template>
