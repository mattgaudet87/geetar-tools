/*
 * Pure music-theory data and helpers for the Scale Visualizer.
 * No React, no DOM — just constant tables and functions over them, exactly as
 * documented in the README "Core Logic / Data Tables" section.
 */

export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

// Scale intervals in semitones from the root.
export const SCALES: Record<string, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
}

export const SCALE_NAMES = Object.keys(SCALES)

// Interval (semitones from root) -> scale-degree label.
export const DEG: Record<number, string> = {
  0: '1', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
  6: '♭5', 7: '5', 8: '♭6', 9: '6', 10: '♭7', 11: '7',
}

// String display order high -> low; w = string-line gauge in px.
export const STRINGS = [
  { name: 'e', w: 1.3 },
  { name: 'B', w: 1.6 },
  { name: 'G', w: 2.0 },
  { name: 'D', w: 2.5 },
  { name: 'A', w: 3.1 },
  { name: 'E', w: 3.7 },
] as const

// Tuning presets: 6 open-string MIDI values, display order high -> low.
export const PRESETS: Record<string, number[]> = {
  'Standard': [64, 59, 55, 50, 45, 40],
  'Drop D': [64, 59, 55, 50, 45, 38],
  'Drop C': [62, 57, 53, 48, 43, 36],
  'Half Step Down': [63, 58, 54, 49, 44, 39],
  'Whole Step Down': [62, 57, 53, 48, 43, 38],
  'Open G': [62, 59, 55, 50, 43, 38],
  'Open D': [62, 57, 54, 50, 45, 38],
  'DADGAD': [62, 57, 55, 50, 45, 38],
}

export const PRESET_NAMES = Object.keys(PRESETS)

// Whole/half-step marker between consecutive scale degrees (gap in semitones).
export const STEP: Record<number, string> = { 1: 'H', 2: 'W', 3: '1½', 4: '2' }

// MIDI clamp range for per-string tuning edits.
export const MIDI_MIN = 31
export const MIDI_MAX = 72

/** Positive modulo, so negative MIDI values still map into 0..11. */
export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

/** Match a tuning array against the preset table; else "Custom". */
export function presetNameFor(tuning: number[]): string {
  for (const name of PRESET_NAMES) {
    const p = PRESETS[name]
    if (p.length === tuning.length && p.every((v, i) => v === tuning[i])) {
      return name
    }
  }
  return 'Custom'
}

export interface BoardDot {
  isRoot: boolean
  label: string // degree or note name, depending on mode
  midi: number // for audio on click
}

/**
 * Build the fretboard. Returns, for each string (display order high->low),
 * the open-note letter plus an array of length fretCount+1 where each entry is
 * either a BoardDot (note is in scale) or null (not in scale).
 */
export function buildBoard(
  root: number,
  scaleName: string,
  tuning: number[],
  fretCount: number,
  mode: 'deg' | 'note',
): { stringLabel: string; frets: (BoardDot | null)[] }[] {
  const intervals = SCALES[scaleName]
  const scalePitchClasses = new Set(intervals.map((iv) => (root + iv) % 12))
  const degreeByPc: Record<number, string> = {}
  for (const iv of intervals) degreeByPc[(root + iv) % 12] = DEG[iv]

  return tuning.map((openMidi) => {
    const openPc = pitchClass(openMidi)
    const stringLabel = NOTES[openPc]
    const frets: (BoardDot | null)[] = []
    for (let f = 0; f <= fretCount; f++) {
      const pc = (openPc + f) % 12
      if (scalePitchClasses.has(pc)) {
        const isRoot = pc === root
        const label = mode === 'deg' ? degreeByPc[pc] : NOTES[pc]
        frets.push({ isRoot, label, midi: openMidi + f })
      } else {
        frets.push(null)
      }
    }
    return { stringLabel, frets }
  })
}

export interface StripEntry {
  note: string
  degree: string
  isRoot: boolean
  stepAfter: string | null // W/H/1½/2 marker after this degree, or null for last
}

/** Build the scale strip (degrees + step markers between them). */
export function buildScaleStrip(root: number, scaleName: string): StripEntry[] {
  const intervals = SCALES[scaleName]
  return intervals.map((iv, idx) => {
    const nextGap = (intervals[idx + 1] ?? 12) - iv
    return {
      note: NOTES[(root + iv) % 12],
      degree: DEG[iv],
      isRoot: iv === 0,
      stepAfter: idx < intervals.length - 1 ? STEP[nextGap] ?? null : null,
    }
  })
}

// Fret-marker sets.
export const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21])
export function isDoubleInlay(fret: number): boolean {
  return fret > 0 && fret % 12 === 0
}
