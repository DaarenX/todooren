import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import TodoBoard from './TodoBoard.vue'
import TodoList from './TodoList.vue'

let wrapper: VueWrapper

function stored(key: string) {
  return JSON.parse(localStorage.getItem(`todooren:${key}`) ?? 'null')
}

function store(key: string, value: unknown) {
  localStorage.setItem(`todooren:${key}`, JSON.stringify(value))
}

function lists() {
  return wrapper
    .findAllComponents(TodoList)
    .map((list) => list.findAll('li').map((li) => li.text()))
}

async function add(text: string) {
  await wrapper.get('[aria-label="New task"]').setValue(text)
  await wrapper.get('form').trigger('submit')
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  wrapper.unmount()
  vi.restoreAllMocks()
})

describe('TodoBoard', () => {
  it('adds trimmed tasks to today and persists them', async () => {
    wrapper = mount(TodoBoard)
    await add('  Write report ')
    await flushPromises()
    expect(lists()[0]).toEqual(['Write report'])
    expect(stored('todos')).toMatchObject([{ text: 'Write report', done: false }])
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
  })

  it('gives each new task a random UUID', async () => {
    const uuid = '123e4567-e89b-42d3-a456-426614174000'
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(uuid)
    wrapper = mount(TodoBoard)
    await add('Task')
    await flushPromises()
    expect(stored('todos')[0].id).toBe(uuid)
  })

  it('ignores blank tasks and disables Add for them', async () => {
    wrapper = mount(TodoBoard)
    await wrapper.get('[aria-label="New task"]').setValue('   ')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    expect(lists()[0]).toEqual([])
  })

  it('counts open tasks and clears completed ones', async () => {
    store('todos', [
      { id: 'a', text: 'Open', done: false },
      { id: 'b', text: 'Done', done: true },
    ])
    wrapper = mount(TodoBoard)
    expect(wrapper.text()).toContain('1 left')
    const clear = wrapper.findAll('button').find((b) => b.text() === 'Clear completed')!
    await clear.trigger('click')
    expect(lists()[0]).toEqual(['Open'])
    expect(wrapper.text()).not.toContain('Clear completed')
  })

  it('moves tasks to the backlog and back', async () => {
    store('todos', [{ id: 'a', text: 'Later', done: false }])
    wrapper = mount(TodoBoard)
    await wrapper.get('[aria-label="Move to backlog"]').trigger('click')
    expect(lists()).toEqual([[], ['Later']])
    await wrapper.get('[aria-label="Move to today"]').trigger('click')
    expect(lists()).toEqual([['Later'], []])
  })

  it('collapses the backlog and remembers it', async () => {
    wrapper = mount(TodoBoard)
    const toggle = wrapper.get('[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(stored('backlog-open')).toBe(false)
  })

  it('recovers from stored data that is not a list', () => {
    store('todos', { broken: true })
    store('backlog', 'nope')
    wrapper = mount(TodoBoard)
    expect(lists()).toEqual([[], []])
  })
})
