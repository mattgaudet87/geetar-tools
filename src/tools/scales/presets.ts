/*
 * Saved song presets for the Scales tool. A song captures the full board
 * setup (root, scale, capo, capo view, tuning, dot mode) under a name.
 * Many songs can share the same key — it's just a named list, stored in
 * localStorage so it survives reloads.
 */

import { SCALES, MIDI_MIN, MIDI_MAX } from './music'

export interface SongPreset {
  name: string
  root: number
  scale: string
  mode: 'deg' | 'note'
  capo: number
  capoView: boolean
  tuning: number[]
}

const STORAGE_KEY = 'geetar.scales.songs.v1'

function isSong(x: unknown): x is SongPreset {
  if (typeof x !== 'object' || x === null) return false
  const s = x as Record<string, unknown>
  return (
    typeof s.name === 'string' &&
    s.name.trim().length > 0 &&
    typeof s.root === 'number' &&
    Number.isInteger(s.root) &&
    s.root >= 0 &&
    s.root <= 11 &&
    typeof s.scale === 'string' &&
    s.scale in SCALES &&
    (s.mode === 'deg' || s.mode === 'note') &&
    typeof s.capo === 'number' &&
    Number.isInteger(s.capo) &&
    s.capo >= 0 &&
    s.capo <= 9 &&
    typeof s.capoView === 'boolean' &&
    Array.isArray(s.tuning) &&
    s.tuning.length === 6 &&
    s.tuning.every(
      (n) =>
        typeof n === 'number' &&
        Number.isInteger(n) &&
        n >= MIDI_MIN &&
        n <= MIDI_MAX,
    )
  )
}

export function loadSongs(): SongPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSong)
  } catch {
    return []
  }
}

export function persistSongs(songs: SongPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
  } catch {
    // Storage full or unavailable — the in-memory list still works.
  }
}
