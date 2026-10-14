import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useChime } from './useChime'

function fakeNode() {
  return {
    type: '',
    frequency: { value: 0 },
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn((next: unknown) => next),
    start: vi.fn(),
    stop: vi.fn(),
  }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  state = 'suspended'
  currentTime = 0
  destination = {}
  oscillators: ReturnType<typeof fakeNode>[] = []
  resume = vi.fn(() => Promise.resolve())
  close = vi.fn(() => Promise.resolve())
  createGain = vi.fn(fakeNode)
  createOscillator = vi.fn(() => {
    const osc = fakeNode()
    this.oscillators.push(osc)
    return osc
  })

  constructor() {
    FakeAudioContext.instances.push(this)
  }
}

function setup() {
  const scope = effectScope()
  const chime = scope.run(() => useChime())!
  return { scope, chime }
}

beforeEach(() => {
  FakeAudioContext.instances = []
  vi.stubGlobal('AudioContext', FakeAudioContext)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useChime', () => {
  it('stays silent until primed', () => {
    const { chime } = setup()
    chime.play()
    expect(FakeAudioContext.instances).toHaveLength(0)
  })

  it('creates and resumes a single audio context when primed', () => {
    const { chime } = setup()
    chime.prime()
    chime.prime()
    expect(FakeAudioContext.instances).toHaveLength(1)
    expect(FakeAudioContext.instances[0]!.resume).toHaveBeenCalled()
  })

  it('plays a rising three-note arpeggio twice', () => {
    const { chime } = setup()
    chime.prime()
    chime.play()
    const oscillators = FakeAudioContext.instances[0]!.oscillators
    expect(oscillators.map((o) => o.frequency.value)).toEqual([
      880, 1108.73, 1318.51, 880, 1108.73, 1318.51,
    ])
    expect(oscillators.every((o) => o.start.mock.calls.length === 1)).toBe(true)
  })

  it('stays silent when audio is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined)
    const { chime } = setup()
    expect(() => chime.prime()).not.toThrow()
    expect(() => chime.play()).not.toThrow()
  })

  it('closes the audio context when its scope is disposed', () => {
    const { scope, chime } = setup()
    chime.prime()
    scope.stop()
    expect(FakeAudioContext.instances[0]!.close).toHaveBeenCalled()
  })
})
