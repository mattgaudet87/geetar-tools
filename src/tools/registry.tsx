import type { ComponentType } from 'react'
import { ScalesTool } from './scales/ScalesTool'
import { TunerTool } from './tuner/TunerTool'
import { MetronomeTool } from './metronome/MetronomeTool'

/*
 * The tool registry.
 *
 * Geetar Tools is a SUITE. Each tool is a self-contained module that registers
 * itself here. The hub/home page lists every entry, and the router builds a
 * route for each `path`. To add a new tool later:
 *   1. build it under  src/tools/<your-tool>/
 *   2. import its main component
 *   3. add one entry to this array
 * Nothing else needs to change.
 */

export interface ToolDef {
  /** Stable id, used as a React key. */
  id: string
  /** Display name shown on the hub card and in the header. */
  name: string
  /** URL path, e.g. "scales" -> /scales */
  path: string
  /** One-line description for the hub card. */
  blurb: string
  /** Short emoji/text mark for the hub card. */
  mark: string
  /** Whether the tool is finished enough to open. */
  ready: boolean
  /** The React component rendered at the tool's route. */
  component: ComponentType
}

export const TOOLS: ToolDef[] = [
  {
    id: 'scales',
    name: 'Scale Visualizer',
    path: 'scales',
    blurb: 'Pick a root, scale, and tuning — see every note on the fretboard and hear it.',
    mark: '🎸',
    ready: true,
    component: ScalesTool,
  },
  {
    id: 'tuner',
    name: 'Tuner',
    path: 'tuner',
    blurb: 'Tune by ear with reference tones, or use your mic to see how sharp or flat you are.',
    mark: '🎯',
    ready: true,
    component: TunerTool,
  },
  {
    id: 'metronome',
    name: 'Metronome',
    path: 'metronome',
    blurb: 'Keep time with an accurate click — adjustable tempo, tap tempo, beats, and accents.',
    mark: '🥁',
    ready: true,
    component: MetronomeTool,
  },
  // Future tools go here, e.g.:
  // { id: 'chords', name: 'Chord Finder', path: 'chords', blurb: '…', mark: '🎵', ready: false, component: ChordsTool },
]
