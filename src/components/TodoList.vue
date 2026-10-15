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

// A leaving item goes `position: absolute` so its siblings can slide into place.
// Without a `top`, a flex container drops it at the top of the list, so pin it
// to the spot it is leaving from.
function pinLeaving(el: Element) {
  const item = el as HTMLElement
  item.style.top = `${item.offsetTop}px`
}

// SortableJS animates the drag itself. Keep the TransitionGroup quiet until
// the dropped order has rendered, otherwise the items would animate twice.
// `css: false` matters on drop: vue-draggable-plus puts the dragged element back
// into its source list for Vue to remove, and a CSS leave keeps it there for a
// frame or two, flashing the item in the list it just left.
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
        :css="!dragging"
        :class="[targetClass, 'relative flex min-h-12 flex-col gap-2']"
        @before-leave="pinLeaving"
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
