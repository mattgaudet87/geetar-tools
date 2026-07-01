/*
 * Chord data and a fretboard voicing generator for the Chords tool.
 * Pure functions over small constant tables — no React, no DOM.
 *
 * Instead of a hand-written chord-shape dictionary, voicings are *generated*:
 * for a chord's set of notes we search the fretboard for every playable
 * root-position shape (root in the bass, only chord tones sounding, a
 * comfortable hand span, contiguous sounding strings). That yields "all the
 * variations of ways to play each one" for any root and quality.
 */

export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

// Standard tuning, low string -> high string (chord-chart orientation).
export const TUNING = [40, 45, 50, 55, 59, 64]

export interface ChordDef {
  /** Intervals in semitones from the root (9ths use 14, etc.). */
  intervals: number[]
  /** Chord symbol suffix, e.g. "m7", "maj7", "" for major. */
  symbol: string
}

export const CHORDS: Record<string, ChordDef> = {
  Major: { intervals: [0, 4, 7], symbol: '' },
  Minor: { intervals: [0, 3, 7], symbol: 'm' },
  Diminished: { intervals: [0, 3, 6], symbol: 'dim' },
  Augmented: { intervals: [0, 4, 8], symbol: 'aug' },
  Sus2: { intervals: [0, 2, 7], symbol: 'sus2' },
  Sus4: { intervals: [0, 5, 7], symbol: 'sus4' },
  'Power 5': { intervals: [0, 7], symbol: '5' },

  '6': { intervals: [0, 4, 7, 9], symbol: '6' },
  'Minor 6': { intervals: [0, 3, 7, 9], symbol: 'm6' },
  'Major 7': { intervals: [0, 4, 7, 11], symbol: 'maj7' },
  'Dominant 7': { intervals: [0, 4, 7, 10], symbol: '7' },
  'Minor 7': { intervals: [0, 3, 7, 10], symbol: 'm7' },
  'Minor 7♭5': { intervals: [0, 3, 6, 10], symbol: 'm7♭5' },
  'Diminished 7': { intervals: [0, 3, 6, 9], symbol: 'dim7' },

  Add9: { intervals: [0, 4, 7, 14], symbol: 'add9' },
  'Major 9': { intervals: [0, 4, 7, 11, 14], symbol: 'maj9' },
  'Minor 9': { intervals: [0, 3, 7, 10, 14], symbol: 'm9' },
  'Dominant 9': { intervals: [0, 4, 7, 10, 14], symbol: '9' },
}

// Compact column-header labels for the chord matrix.
export const QUALITY_SHORT: Record<string, string> = {
  Major: 'Major',
  Minor: 'Minor',
  Diminished: 'Dim',
  Augmented: 'Aug',
  Sus2: 'Sus2',
  Sus4: 'Sus4',
  'Power 5': 'Power',
  '6': '6',
  'Minor 6': 'm6',
  'Major 7': 'maj7',
  'Dominant 7': '7',
  'Minor 7': 'm7',
  'Minor 7♭5': 'm7♭5',
  'Diminished 7': 'dim7',
  Add9: 'add9',
  'Major 9': 'maj9',
  'Minor 9': 'm9',
  'Dominant 9': '9',
}

// Quality picker, grouped into tidy categories for the UI.
export const CHORD_CATEGORIES: { name: string; items: string[] }[] = [
  {
    name: 'Triads',
    items: ['Major', 'Minor', 'Diminished', 'Augmented', 'Sus2', 'Sus4', 'Power 5'],
  },
  {
    name: 'Sixths & Sevenths',
    items: ['6', 'Minor 6', 'Major 7', 'Dominant 7', 'Minor 7', 'Minor 7♭5', 'Diminished 7'],
  },
  {
    name: 'Extensions',
    items: ['Add9', 'Major 9', 'Minor 9', 'Dominant 9'],
  },
]

/** A voicing: fret per string low->high; null = muted, 0 = open. */
export interface Voicing {
  frets: (number | null)[]
  /** Lowest fretted (nonzero) fret, or 0 if the shape has no fretted notes. */
  position: number
}

/** Note names of the chord tones, in interval order (deduped by pitch class). */
export function chordNotes(root: number, chordName: string): string[] {
  const seen = new Set<number>()
  const out: string[] = []
  for (const iv of CHORDS[chordName].intervals) {
    const pc = (root + iv) % 12
    if (!seen.has(pc)) {
      seen.add(pc)
      out.push(NOTES[pc])
    }
  }
  return out
}

const MAX_FRET = 12
const MAX_DIFF = 3 // hand span: fretted notes fit within 4 consecutive frets
const LIMIT = 12 // how many voicings to surface

/**
 * Generate a spread of playable voicings for a chord, ordered up the neck.
 */
export function generateVoicings(root: number, chordName: string): Voicing[] {
  const def = CHORDS[chordName]
  const pcsAll = new Set(def.intervals.map((i) => (root + i) % 12))

  // The perfect 5th may be omitted on 4+ note chords to keep shapes playable.
  const optional = new Set<number>()
  if (def.intervals.length >= 4 && def.intervals.includes(7)) {
    optional.add((root + 7) % 12)
  }
  const required = new Set([...pcsAll].filter((pc) => !optional.has(pc)))
  const minStrings = Math.max(required.size, chordName === 'Power 5' ? 2 : 3)

  const frets = new Array<number | null>(6).fill(null)
  const found: Voicing[] = []
  const matches = (str: number, f: number) => pcsAll.has((TUNING[str] + f) % 12)

  function finalize(lo: number, hi: number) {
    if (hi < lo || hi - lo + 1 < minStrings) return
    const pcs = new Set<number>()
    for (let s = lo; s <= hi; s++) pcs.add((TUNING[s] + (frets[s] as number)) % 12)
    for (const pc of required) if (!pcs.has(pc)) return
    const nz = frets.filter((f): f is number => f != null && f > 0)
    found.push({
      frets: frets.slice(),
      position: nz.length ? Math.min(...nz) : 0,
    })
  }

  function recurse(str: number, nzMin: number, nzMax: number, lo: number) {
    finalize(lo, str - 1) // option: mute this string and everything above
    if (str > 5) return
    for (let f = 0; f <= MAX_FRET; f++) {
      if (!matches(str, f)) continue
      let nMin = nzMin
      let nMax = nzMax
      if (f > 0) {
        nMin = Math.min(nzMin, f)
        nMax = Math.max(nzMax, f)
        if (nMax - nMin > MAX_DIFF) continue
      }
      frets[str] = f
      recurse(str + 1, nMin, nMax, lo)
      frets[str] = null
    }
  }

  // The lowest sounding string carries the root (root-position voicings).
  for (let lo = 0; lo <= 3; lo++) {
    for (let bf = 0; bf <= MAX_FRET; bf++) {
      if ((TUNING[lo] + bf) % 12 !== root) continue
      frets.fill(null)
      frets[lo] = bf
      recurse(lo + 1, bf > 0 ? bf : 99, bf > 0 ? bf : 0, lo)
      frets[lo] = null
    }
  }

  return selectSpread(found, pcsAll)
}

function span(v: Voicing): number {
  const nz = v.frets.filter((f): f is number => f != null && f > 0)
  return nz.length ? Math.max(...nz) - Math.min(...nz) : 0
}

function strings(v: Voicing): number {
  return v.frets.filter((f) => f != null).length
}

/** Dedupe, score, and pick a spread of voicings across neck positions. */
function selectSpread(all: Voicing[], pcsAll: Set<number>): Voicing[] {
  const uniq = new Map<string, Voicing>()
  for (const v of all) {
    // Drop hybrids that mix open strings with high frets: they aren't idiomatic
    // and can't be drawn cleanly on a windowed chord chart (a 5-row diagram
    // shows the nut only when the top fret is within reach of it).
    const nz = v.frets.filter((f): f is number => f != null && f > 0)
    const hasOpen = v.frets.some((f) => f === 0)
    const maxFret = nz.length ? Math.max(...nz) : 0
    if (hasOpen && maxFret > 5) continue

    const key = v.frets.map((f) => (f == null ? 'x' : f)).join('.')
    if (!uniq.has(key)) uniq.set(key, v)
  }

  const score = (v: Voicing) => {
    const sounding = new Set<number>()
    let openStrings = 0
    v.frets.forEach((f, s) => {
      if (f != null) {
        sounding.add((TUNING[s] + f) % 12)
        if (f === 0) openStrings++
      }
    })
    const complete = [...pcsAll].every((pc) => sounding.has(pc)) ? 20 : 0
    const nz = v.frets.filter((f): f is number => f != null && f > 0)
    const maxFret = nz.length ? Math.max(...nz) : 0
    // Prefer complete, open-string, full, low, compact shapes — this surfaces
    // the idiomatic open chords ahead of awkward high stretches.
    return (
      complete +
      openStrings * 10 +
      strings(v) * 5 -
      v.position * 2 -
      span(v) * 3 -
      maxFret * 2
    )
  }

  const byPos = new Map<number, Voicing[]>()
  for (const v of uniq.values()) {
    const bucket = byPos.get(v.position) ?? []
    bucket.push(v)
    byPos.set(v.position, bucket)
  }
  for (const bucket of byPos.values()) bucket.sort((a, b) => score(b) - score(a))

  const positions = [...byPos.keys()].sort((a, b) => a - b)
  const result: Voicing[] = []
  for (let round = 0; result.length < LIMIT; round++) {
    let advanced = false
    for (const pos of positions) {
      const bucket = byPos.get(pos)!
      if (bucket[round]) {
        result.push(bucket[round])
        advanced = true
        if (result.length >= LIMIT) break
      }
    }
    if (!advanced) break
  }

  return result.sort((a, b) => a.position - b.position)
}
