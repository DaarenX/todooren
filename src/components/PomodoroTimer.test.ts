import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import PomodoroTimer from './PomodoroTimer.vue'

let wrapper: VueWrapper

function mountTimer() {
  wrapper = mount(PomodoroTimer)
  return wrapper
}

function clock() {
  return wrapper.get('[role="timer"]').text()
}

function button(label: string) {
  const found = wrapper.findAll('button').find((b) => b.text() === label)
  if (!found) throw new Error(`No button labelled ${label}`)
  return found
}

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await flushPromises()
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
})

describe('PomodoroTimer', () => {
  it('starts idle on a 25 minute focus session', () => {
    mountTimer()
    expect(clock()).toBe('25:00')
    expect(button('Start').exists()).toBe(true)
    expect(wrapper.get('[aria-pressed="true"]').text()).toBe('Focus')
  })

  it('counts down once started and shows the time in the tab title', async () => {
    mountTimer()
    await button('Start').trigger('click')
    await advance(1000)
    expect(clock()).toBe('24:59')
    expect(document.title).toBe('24:59 · Focus — Todooren')
  })

  it('pauses, resumes, and resets', async () => {
    mountTimer()
    await button('Start').trigger('click')
    await advance(5000)
    await button('Pause').trigger('click')
    await advance(5000)
    expect(clock()).toBe('24:55')
    expect(button('Resume').exists()).toBe(true)
    await wrapper.get('[aria-label="Reset timer"]').trigger('click')
    expect(clock()).toBe('25:00')
    expect(document.title).toBe('Todooren')
  })

  it('switches to a 5 minute break', async () => {
    mountTimer()
    await button('Break').trigger('click')
    expect(clock()).toBe('05:00')
  })

  it('moves to the break when a focus session ends', async () => {
    mountTimer()
    await button('Start').trigger('click')
    await advance(25 * 60_000)
    expect(clock()).toBe('05:00')
    expect(wrapper.get('[aria-pressed="true"]').text()).toBe('Break')
    expect(button('Start').exists()).toBe(true)
  })

  it('applies and persists custom durations, clamped to the allowed range', async () => {
    mountTimer()
    const settings = wrapper.get('[aria-label="Timer settings"]')
    await settings.trigger('click')
    expect(settings.attributes('aria-expanded')).toBe('true')
    const focus = wrapper.findAll('input[type="number"]')[0]!
    await focus.setValue('10')
    expect(clock()).toBe('10:00')
    expect(JSON.parse(localStorage.getItem('todooren:timer')!)).toEqual({ work: 10, break: 5 })
    await focus.setValue('0')
    expect((focus.element as HTMLInputElement).value).toBe('1')
  })

  it('restores the tab title when unmounted', async () => {
    mountTimer()
    await button('Start').trigger('click')
    wrapper.unmount()
    expect(document.title).toBe('Todooren')
  })
})
