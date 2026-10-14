import { onScopeDispose } from 'vue'

const NOTES = [880, 1108.73, 1318.51]
const NOTE_GAP_S = 0.2
const REPEAT_GAP_S = 1.1
const REPEATS = 2

function scheduleNote(ctx: AudioContext, frequency: number, at: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9)
  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + 1)
}

function playArpeggio(ctx: AudioContext) {
  for (let repeat = 0; repeat < REPEATS; repeat++) {
    NOTES.forEach((frequency, i) => {
      scheduleNote(ctx, frequency, ctx.currentTime + repeat * REPEAT_GAP_S + i * NOTE_GAP_S)
    })
  }
}

/** A synthesised chime, so no audio asset is needed. */
export function useChime() {
  let audio: AudioContext | undefined

  // Must be called from a user gesture so the browser lets us play later.
  function prime() {
    try {
      audio ??= new AudioContext()
      if (audio.state === 'suspended') void audio.resume()
    } catch {
      audio = undefined
    }
  }

  function play() {
    if (audio) playArpeggio(audio)
  }

  onScopeDispose(() => void audio?.close())

  return { prime, play }
}
