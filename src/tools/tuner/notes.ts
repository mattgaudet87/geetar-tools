/* Note helpers and guitar tunings for the Tuner. Self-contained. */

export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

/** MIDI note number -> frequency in Hz (A4 = 69 = 440Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/** MIDI note number -> "E2", "A#3", etc. */
export function midiToName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTES[pc]}${octave}`
}

export interface DetectedNote {
  name: string // note letter, e.g. "A"
  octave: number
  cents: number // -50..+50 offset from the nearest note
  midi: number // nearest MIDI note
}

/** Convert a detected frequency to the nearest note plus cents offset. */
export function freqToNote(freq: number): DetectedNote {
  const midiFloat = 12 * Math.log2(freq / 440) + 69
  const midi = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midi) * 100)
  const pc = ((midi % 12) + 12) % 12
  return { name: NOTES[pc], octave: Math.floor(midi / 12) - 1, cents, midi }
}

export interface GuitarString {
  midi: number
  label: string // note + octave, e.g. "E2"
}

// Tuning presets, stored low string -> high string (as a tuner is read).
export const TUNINGS: Record<string, number[]> = {
  Standard: [40, 45, 50, 55, 59, 64], // E2 A2 D3 G3 B3 E4
  'Drop D': [38, 45, 50, 55, 59, 64],
  'Half Step Down': [39, 44, 49, 54, 58, 63],
  'Whole Step Down': [38, 43, 48, 53, 57, 62],
  'Open G': [38, 43, 50, 55, 59, 62],
  'Open D': [38, 45, 50, 54, 57, 62],
  DADGAD: [38, 45, 50, 55, 57, 62],
}

export const TUNING_NAMES = Object.keys(TUNINGS)

export function stringsFor(tuningName: string): GuitarString[] {
  return TUNINGS[tuningName].map((midi) => ({ midi, label: midiToName(midi) }))
}
