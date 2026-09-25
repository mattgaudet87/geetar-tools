/*
 * Saved progression presets for the Transpose tool. A preset captures the
 * chord progression plus the capo/tuning/shift setup under a name — stored
 * in localStorage so it survives reloads.
 */

import { CHORDS, TUNING_PRESET_NAMES } from '../chords/chords'

export interface ProgChord {
  root: number
  quality: string
}

export interface ProgPreset {
  name: string
  prog: ProgChord[]
  capoFrom: number
  steps: number
  capoTo: number
  tuningFrom: string
  tuningTo: string
}

const STORAGE_KEY = 'geetar.transpose.progressions.v1'

function isProgChord(x: unknown): x is ProgChord {
  if (typeof x !== 'object' || x === null) return false
  const c = x as Record<string, unknown>
  return (
    typeof c.root === 'number' &&
    Number.isInteger(c.root) &&
    c.root >= 0 &&
    c.root <= 11 &&
    typeof c.quality === 'string' &&
    c.quality in CHORDS
  )
}

function isPreset(x: unknown): x is ProgPreset {
  if (typeof x !== 'object' || x === null) return false
  const p = x as Record<string, unknown>
  return (
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    Array.isArray(p.prog) &&
    p.prog.length > 0 &&
    p.prog.every(isProgChord) &&
    typeof p.capoFrom === 'number' &&
    Number.isInteger(p.capoFrom) &&
    p.capoFrom >= 0 &&
    p.capoFrom <= 9 &&
    typeof p.steps === 'number' &&
    Number.isInteger(p.steps) &&
    p.steps >= -12 &&
    p.steps <= 12 &&
    typeof p.capoTo === 'number' &&
    Number.isInteger(p.capoTo) &&
    p.capoTo >= 0 &&
    p.capoTo <= 9 &&
    typeof p.tuningFrom === 'string' &&
    TUNING_PRESET_NAMES.includes(p.tuningFrom) &&
    typeof p.tuningTo === 'string' &&
    TUNING_PRESET_NAMES.includes(p.tuningTo)
  )
}

export function loadProgressions(): ProgPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPreset)
  } catch {
    return []
  }
}

export function persistProgressions(list: ProgPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Storage full or unavailable — the in-memory list still works.
  }
}
