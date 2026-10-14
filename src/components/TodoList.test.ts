import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { VueDraggable } from 'vue-draggable-plus'
import type { Todo } from '@/types'
import TodoItem from './TodoItem.vue'
import TodoList from './TodoList.vue'

let wrapper: VueWrapper

function todos(): Todo[] {
  return [
    { id: 'a', text: 'First', done: false },
    { id: 'b', text: 'Second', done: false },
  ]
}

function mountList(items = todos()) {
  wrapper = mount(TodoList, {
    props: {
      modelValue: items,
      'onUpdate:modelValue': (value: Todo[]) => wrapper.setProps({ modelValue: value }),
      emptyText: 'Nothing here',
    },
  })
  return wrapper
}

function texts() {
  return wrapper.findAllComponents(TodoItem).map((item) => item.props('todo').text)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper.unmount()
  vi.useRealTimers()
})

describe('TodoList', () => {
  it('shows the empty text only when there are no items', async () => {
    mountList([])
    expect(wrapper.text()).toContain('Nothing here')
    await wrapper.setProps({ modelValue: todos() })
    expect(wrapper.text()).not.toContain('Nothing here')
  })

  it('applies item updates in place', async () => {
    const items = todos()
    mountList(items)
    wrapper.findAllComponents(TodoItem)[1]!.vm.$emit('update', { done: true })
    expect(items[1]!.done).toBe(true)
  })

  it('removes an item', async () => {
    mountList()
    wrapper.findAllComponents(TodoItem)[0]!.vm.$emit('remove')
    await wrapper.vm.$nextTick()
    expect(texts()).toEqual(['Second'])
  })

  it('reorders with nudges and ignores moves past either end', async () => {
    mountList()
    const first = () => wrapper.findAllComponents(TodoItem)[0]!
    first().vm.$emit('nudge', -1)
    await wrapper.vm.$nextTick()
    expect(texts()).toEqual(['First', 'Second'])
    first().vm.$emit('nudge', 1)
    await wrapper.vm.$nextTick()
    expect(texts()).toEqual(['Second', 'First'])
  })

  it('forwards transfers with the item id', () => {
    mountList()
    wrapper.findAllComponents(TodoItem)[1]!.vm.$emit('transfer')
    expect(wrapper.emitted('transfer')).toEqual([['b']])
  })

  it('reports dragging until shortly after the drop', () => {
    mountList()
    const draggable = wrapper.findComponent(VueDraggable)
    draggable.vm.$emit('start')
    expect(wrapper.emitted('update:dragging')).toEqual([[true]])
    draggable.vm.$emit('end')
    vi.advanceTimersByTime(50)
    expect(wrapper.emitted('update:dragging')).toEqual([[true], [false]])
  })
})
