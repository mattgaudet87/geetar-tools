/*
 * Click-to-play audio for note dots, using the Web Audio API.
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

/** Play the note at MIDI value `midi` with a short plucked envelope. */
export function playNote(midi: number): void {
  const audio = getContext()
  if (!audio) return

  const freq = 440 * Math.pow(2, (midi - 69) / 12)
  const now = audio.currentTime

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.42, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15)
  gain.connect(audio.destination)

  // Fundamental — triangle.
  const osc1 = audio.createOscillator()
  osc1.type = 'triangle'
  osc1.frequency.setValueAtTime(freq, now)
  osc1.connect(gain)

  // Octave shimmer — sine at 2x, quiet.
  const shimmerGain = audio.createGain()
  shimmerGain.gain.setValueAtTime(0.12, now)
  shimmerGain.connect(gain)
  const osc2 = audio.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(freq * 2, now)
  osc2.connect(shimmerGain)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + 1.2)
  osc2.stop(now + 1.2)
}
