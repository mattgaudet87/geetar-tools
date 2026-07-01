import { useMemo, useState } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { ChordDiagram } from './ChordDiagram'
import { strum } from './audio'
import {
  NOTES,
  TUNING,
  CHORDS,
  CHORD_CATEGORIES,
  chordNotes,
  generateVoicings,
  type Voicing,
} from './chords'
import './chords.css'

export function ChordsTool() {
  const [root, setRoot] = useState(0) // C
  const [quality, setQuality] = useState('Major')
  const [sound, setSound] = useState(true)
  const [open, setOpen] = useState(true) // options card expanded?

  const voicings = useMemo(() => generateVoicings(root, quality), [root, quality])
  const notes = useMemo(() => chordNotes(root, quality), [root, quality])
  const symbol = NOTES[root] + CHORDS[quality].symbol

  function play(v: Voicing) {
    if (!sound) return
    const midis: number[] = []
    v.frets.forEach((f, s) => {
      if (f != null) midis.push(TUNING[s] + f)
    })
    strum(midis)
  }

  return (
    <div className="ch-page">
      <ToolHeader wordmark="Geetar Tool" />

      {/* Picker — collapsible; root dropdown + 3 rows of compact chord chips */}
      <div className="ch-controls">
        <div className="ch-panel-head">
          <button
            className="ch-collapse"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <span className={`ch-chev ${open ? 'is-open' : ''}`} aria-hidden>
              ▾
            </span>
            Chord options
          </button>
          <div className="ch-panel-head-right">
            {!open && <span className="ch-current">{symbol}</span>}
            <div className="ch-unit">
              <span className="gt-label">Sound</span>
              <button
                className={`ch-sound ${sound ? 'is-on' : 'is-off'}`}
                onClick={() => setSound((s) => !s)}
              >
                <span className="dot" />
                {sound ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="ch-panel-body">
            <div className="ch-unit ch-root-row">
              <span className="gt-label">Root</span>
              <select
                className="gt-select"
                value={root}
                onChange={(e) => setRoot(Number(e.target.value))}
              >
                {NOTES.map((n, i) => (
                  <option key={n} value={i}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="ch-quality-rows">
              {CHORD_CATEGORIES.map((cat) => (
                <div className="ch-qrow" key={cat.name}>
                  <span className="ch-qrow-label">{cat.name}</span>
                  <div className="ch-qrow-btns">
                    {cat.items.map((q) => (
                      <button
                        key={q}
                        className={`ch-qchip ${quality === q ? 'is-active' : ''}`}
                        onClick={() => setQuality(q)}
                      >
                        {NOTES[root] + CHORDS[q].symbol}
                        <span className="ch-tip">
                          {NOTES[root]} {q}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chord summary */}
      <div className="ch-summary">
        <div className="ch-summary-left">
          <span className="ch-symbol">{symbol}</span>
          <span className="ch-name">
            {NOTES[root]} {quality}
          </span>
        </div>
        <div className="ch-notes">
          {notes.map((n) => (
            <span
              key={n}
              className={`ch-note ${n === NOTES[root] ? 'is-root' : ''}`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Voicings */}
      <div className="ch-board">
        <div className="ch-board-header">
          <div className="ch-board-title">
            <span className="dot" />
            Voicings
          </div>
          <div className="ch-count">
            {voicings.length} {voicings.length === 1 ? 'WAY' : 'WAYS'} TO PLAY
          </div>
        </div>

        {voicings.length === 0 ? (
          <p className="ch-empty">
            No playable shapes found near the nut for this chord.
          </p>
        ) : (
          <div className="ch-grid">
            {voicings.map((v, i) => (
              <div className="ch-cell" key={i}>
                <ChordDiagram voicing={v} root={root} onPlay={() => play(v)} />
                <span className="ch-cell-label">
                  {v.frets.some((f) => f === 0) ? 'Open' : `${v.position}fr`}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="ch-legend">
          <span className="ch-legend-item">
            <span className="ch-legend-dot is-root" /> Root note
          </span>
          <span className="ch-legend-item">
            <span className="ch-legend-dot" /> Chord note
          </span>
          <span className="ch-legend-item">○ open · × muted</span>
          <span className="ch-legend-hint">Click a shape to hear it</span>
        </div>
      </div>
    </div>
  )
}
