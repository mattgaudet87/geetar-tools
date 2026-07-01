import type { ComponentType, ReactNode } from 'react'
import { ScalesTool } from './scales/ScalesTool'
import { TunerTool } from './tuner/TunerTool'
import { MetronomeTool } from './metronome/MetronomeTool'
import { ScalesIcon, TunerIcon, MetronomeIcon } from '../shared/icons'

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
  /** Icon shown on the hub card. */
  mark: ReactNode
  /** Whether the tool is finished enough to open. */
  ready: boolean
  /** The React component rendered at the tool's route. */
  component: ComponentType
}

export const TOOLS: ToolDef[] = [
  {
    id: 'scales',
    name: 'Scales',
    path: 'scales',
    blurb: 'Visualize & learn scales. See all notes you can play in all scales (with audio).',
    mark: <ScalesIcon />,
    ready: true,
    component: ScalesTool,
  },
  {
    id: 'tuner',
    name: 'Tuner',
    path: 'tuner',
    blurb: 'Tune by ear with reference tones, or use your mic to see how sharp or flat you are.',
    mark: <TunerIcon />,
    ready: true,
    component: TunerTool,
  },
  {
    id: 'metronome',
    name: 'Metronome',
    path: 'metronome',
    blurb: 'Keep time with the adjustable tempo metronome.',
    mark: <MetronomeIcon />,
    ready: true,
    component: MetronomeTool,
  },
  // Future tools go here, e.g.:
  // { id: 'chords', name: 'Chord Finder', path: 'chords', blurb: '…', mark: <ChordsIcon />, ready: false, component: ChordsTool },
]
