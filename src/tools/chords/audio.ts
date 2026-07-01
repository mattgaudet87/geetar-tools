/*
 * Strum playback for chord voicings, using the Web Audio API.
 * A single shared AudioContext is created/resumed on first use.
 */

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function pluck(audio: AudioContext, midi: number, at: number) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12)

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.3, at + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.4)
  gain.connect(audio.destination)

  const osc = audio.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(freq, at)
  osc.connect(gain)

  const shimmerGain = audio.createGain()
  shimmerGain.gain.setValueAtTime(0.1, at)
  shimmerGain.connect(gain)
  const osc2 = audio.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(freq * 2, at)
  osc2.connect(shimmerGain)

  osc.start(at)
  osc2.start(at)
  osc.stop(at + 1.5)
  osc2.stop(at + 1.5)
}

/** Strum a set of MIDI notes low->high with a small stagger. */
export function strum(midis: number[]): void {
  const audio = getContext()
  if (!audio) return
  const start = audio.currentTime + 0.02
  midis.forEach((m, i) => pluck(audio, m, start + i * 0.03))
}
