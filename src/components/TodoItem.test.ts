import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { Todo } from '@/types'
import TodoItem from './TodoItem.vue'

let wrapper: VueWrapper

function mountItem(todo: Partial<Todo> = {}, backlog = false) {
  wrapper = mount(TodoItem, {
    props: { todo: { id: 'a', text: 'Buy milk', done: false, ...todo }, backlog },
    attachTo: document.body,
  })
  return wrapper
}

async function edit(text: string, key: 'enter' | 'esc' = 'enter') {
  await wrapper.get('[title="Click to edit"]').trigger('click')
  const input = wrapper.get('input')
  await input.setValue(text)
  await input.trigger(`keydown.${key}`)
}

afterEach(() => {
  wrapper.unmount()
})

describe('TodoItem', () => {
  it('toggles done through its checkbox', async () => {
    mountItem({ done: true })
    const checkbox = wrapper.get('[role="checkbox"]')
    expect(checkbox.attributes('aria-checked')).toBe('true')
    await checkbox.trigger('click')
    expect(wrapper.emitted('update')).toEqual([[{ done: false }]])
  })

  it('opens a focused editor with the current text', async () => {
    mountItem()
    await wrapper.get('[title="Click to edit"]').trigger('click')
    const input = wrapper.get('input').element as HTMLInputElement
    expect(input.value).toBe('Buy milk')
    expect(document.activeElement).toBe(input)
  })

  it('saves edited text, trimmed', async () => {
    mountItem()
    await edit('  Buy oat milk ')
    expect(wrapper.emitted('update')).toEqual([[{ text: 'Buy oat milk' }]])
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('emits nothing when the text is unchanged', async () => {
    mountItem()
    await edit('Buy milk')
    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('removes the todo when the text is cleared', async () => {
    mountItem()
    await edit('   ')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('discards the edit on Escape', async () => {
    mountItem()
    await edit('Something else', 'esc')
    expect(wrapper.emitted('update')).toBeUndefined()
    expect(wrapper.text()).toContain('Buy milk')
  })

  it('moves between today and the backlog', async () => {
    mountItem()
    await wrapper.get('[aria-label="Move to backlog"]').trigger('click')
    expect(wrapper.emitted('transfer')).toHaveLength(1)
    await wrapper.setProps({ backlog: true })
    expect(wrapper.find('[aria-label="Move to today"]').exists()).toBe(true)
  })

  it('deletes the todo', async () => {
    mountItem()
    await wrapper.get('[aria-label="Delete task"]').trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('nudges with the arrow keys on the drag handle', async () => {
    mountItem()
    const handle = wrapper.get('.drag-handle')
    await handle.trigger('keydown.up')
    await handle.trigger('keydown.down')
    expect(wrapper.emitted('nudge')).toEqual([[-1], [1]])
  })
})
