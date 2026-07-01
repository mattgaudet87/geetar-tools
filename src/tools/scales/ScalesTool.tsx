import { useMemo, useState } from 'react'
import { Brand } from '../../shared/Brand'
import { MATERIALS, MATERIAL_NAMES } from './materials'
import { playNote } from './audio'
import {
  NOTES,
  SCALE_NAMES,
  STRINGS,
  PRESETS,
  PRESET_NAMES,
  MIDI_MIN,
  MIDI_MAX,
  pitchClass,
  presetNameFor,
  buildBoard,
  buildScaleStrip,
  SINGLE_INLAY_FRETS,
  isDoubleInlay,
} from './music'
import './scales.css'

export function ScalesTool() {
  const [root, setRoot] = useState(9) // A
  const [scale, setScale] = useState('Major')
  const [mode, setMode] = useState<'deg' | 'note'>('deg')
  const [sound, setSound] = useState(true)
  const [material, setMaterial] = useState('Walnut')
  const [tuning, setTuning] = useState<number[]>([64, 59, 55, 50, 45, 40])

  // Config points — fixed for now, easy to wire to controls later (see README).
  const lefty = false
  const fretCount = 12

  const mat = MATERIALS[material]
  const presetName = useMemo(() => presetNameFor(tuning), [tuning])

  const board = useMemo(
    () => buildBoard(root, scale, tuning, fretCount, mode),
    [root, scale, tuning, fretCount, mode],
  )
  const strip = useMemo(() => buildScaleStrip(root, scale), [root, scale])

  const frets = Array.from({ length: fretCount + 1 }, (_, i) => i)
  const markerFrets = useMemo(() => {
    const s = new Set(SINGLE_INLAY_FRETS)
    for (const f of frets) if (isDoubleInlay(f)) s.add(f)
    return s
  }, [fretCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const rowDir: React.CSSProperties = lefty ? { flexDirection: 'row-reverse' } : {}

  function stepString(i: number, delta: number) {
    setTuning((prev) => {
      const next = [...prev]
      next[i] = Math.max(MIDI_MIN, Math.min(MIDI_MAX, next[i] + delta))
      return next
    })
  }

  function onPreset(name: string) {
    if (name === 'Custom') return // display-only, no-op
    if (PRESETS[name]) setTuning([...PRESETS[name]])
  }

  function onDot(midi: number) {
    if (sound) playNote(midi)
  }

  return (
    <div className="sc-page">
      {/* Header */}
      <div className="sc-header">
        <Brand wordmark="Geetar Tool" />
      </div>

      {/* Controls panel */}
      <div className="sc-controls">
        {/* Row A — toolbar */}
        <div className="sc-row sc-row-toolbar">
          <div className="sc-unit">
            <span className="gt-label">Dots</span>
            <div className="sc-seg">
              <button
                className={mode === 'deg' ? 'is-active' : ''}
                onClick={() => setMode('deg')}
              >
                Degrees
              </button>
              <button
                className={mode === 'note' ? 'is-active' : ''}
                onClick={() => setMode('note')}
              >
                Note names
              </button>
            </div>
          </div>

          <div className="sc-unit">
            <span className="gt-label">Sound</span>
            <button
              className={`sc-sound ${sound ? 'is-on' : 'is-off'}`}
              onClick={() => setSound((s) => !s)}
            >
              <span className="dot" />
              {sound ? 'On' : 'Off'}
            </button>
          </div>

          <div className="sc-unit">
            <span className="gt-label">Neck</span>
            <select
              className="gt-select"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              {MATERIAL_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row B — root */}
        <div className="sc-row sc-row-pills">
          <span className="gt-label sc-fixed-label">Root</span>
          <div className="sc-pill-group">
            {NOTES.map((n, i) => (
              <button
                key={n}
                className={`sc-pill ${root === i ? 'is-active' : ''}`}
                onClick={() => setRoot(i)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Row C — scale */}
        <div className="sc-row sc-row-pills">
          <span className="gt-label sc-fixed-label">Scale</span>
          <div className="sc-pill-group">
            {SCALE_NAMES.map((s) => (
              <button
                key={s}
                className={`sc-pill ${scale === s ? 'is-active' : ''}`}
                onClick={() => setScale(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Row D — tuning */}
        <div className="sc-row sc-row-pills" style={{ borderBottom: 'none' }}>
          <span className="gt-label sc-fixed-label">Tuning</span>
          <div className="sc-tuning-group">
            <select
              className="gt-select"
              value={presetName}
              onChange={(e) => onPreset(e.target.value)}
            >
              {PRESET_NAMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>

            <span className="gt-label">High</span>
            <div className="sc-steppers">
              {tuning.map((midi, i) => {
                const pc = pitchClass(midi)
                const isRootString = pc === root
                return (
                  <div className="sc-stepper" key={i}>
                    <button
                      aria-label={`Raise string ${i + 1}`}
                      onClick={() => stepString(i, 1)}
                    >
                      &#9650;
                    </button>
                    <div className={`sc-note-box ${isRootString ? 'is-root' : ''}`}>
                      {NOTES[pc]}
                    </div>
                    <button
                      aria-label={`Lower string ${i + 1}`}
                      onClick={() => stepString(i, -1)}
                    >
                      &#9660;
                    </button>
                  </div>
                )
              })}
            </div>
            <span className="gt-label">Low</span>
          </div>
        </div>
      </div>

      {/* Scale strip */}
      <div className="sc-strip">
        <span className="gt-label">Scale</span>
        {strip.map((entry, idx) => (
          <ScaleStripItem key={idx} entry={entry} />
        ))}
      </div>

      {/* Board panel */}
      <div className="sc-board">
        <div className="sc-board-header">
          <div className="sc-board-title">
            <span className="dot" />
            {NOTES[root]} {scale}
          </div>
          <div className="sc-fret-range">0–{fretCount} FRETS</div>
        </div>

        <div className="sc-surface-scroll">
          {/* Fret numbers */}
          <div className="sc-fret-numbers" style={rowDir}>
            <div className="spacer" />
            <div style={{ display: 'flex', flex: 1, ...rowDir }}>
              {frets.map((f) => (
                <div
                  key={f}
                  className={`sc-fret-num ${markerFrets.has(f) ? 'is-marker' : ''}`}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Board body */}
          <div className="sc-board-body">
            <div className="sc-string-labels">
              {board.map((s, i) => (
                <div className="sc-string-label" key={i}>
                  {s.stringLabel}
                </div>
              ))}
            </div>

            <div className="sc-surface">
              {/* 1. material background */}
              <div className="sc-surface-bg" style={{ background: mat.board }} />
              {/* 2. grain */}
              <div
                className="sc-surface-grain"
                style={{
                  background: `repeating-linear-gradient(180deg, transparent 0 5px, ${mat.grain} 5px 6px)`,
                }}
              />
              {/* 3. inlay overlay */}
              <div className="sc-inlays" style={rowDir}>
                {frets.map((f) => (
                  <div className="sc-inlay-cell" key={f}>
                    {isDoubleInlay(f) ? (
                      <>
                        <span
                          className="sc-inlay-dot"
                          style={{ background: mat.inlay }}
                        />
                        <span
                          className="sc-inlay-dot"
                          style={{ background: mat.inlay }}
                        />
                      </>
                    ) : SINGLE_INLAY_FRETS.has(f) ? (
                      <span
                        className="sc-inlay-dot"
                        style={{ background: mat.inlay }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* 4. strings + dots */}
              <div className="sc-strings">
                {board.map((s, i) => (
                  <div className="sc-string-row" key={i} style={rowDir}>
                    <div
                      className="sc-string-line"
                      style={{ height: STRINGS[i].w, background: mat.str }}
                    />
                    {s.frets.map((dot, f) => (
                      <div
                        className="sc-cell"
                        key={f}
                        style={{
                          borderRight:
                            f === 0
                              ? `3px solid ${mat.nut}`
                              : f === fretCount
                                ? 'none'
                                : `1px solid ${mat.fret}`,
                        }}
                      >
                        {dot && (
                          <button
                            className={`sc-dot ${dot.isRoot ? 'is-root' : 'is-scale'}`}
                            onClick={() => onDot(dot.midi)}
                            title={NOTES[pitchClass(dot.midi)]}
                          >
                            {dot.label}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="sc-legend">
          <div className="sc-legend-left">
            <span className="sc-legend-item">
              <span
                className="sc-legend-swatch"
                style={{
                  background:
                    'radial-gradient(circle at 36% 30%, #7df0c0 0%, #2fd396 46%, #11b07f 100%)',
                }}
              />
              Root note
            </span>
            <span className="sc-legend-item">
              <span
                className="sc-legend-swatch"
                style={{
                  background:
                    'radial-gradient(circle at 36% 30%, #2b3545 0%, #19212e 72%)',
                }}
              />
              Scale note
            </span>
            <span className="sc-legend-item">Click a note to hear it</span>
          </div>
          <div className="sc-legend-note">
            {mode === 'deg' ? 'Numbers = scale degree' : 'Letters = note name'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScaleStripItem({
  entry,
}: {
  entry: ReturnType<typeof buildScaleStrip>[number]
}) {
  return (
    <>
      <div className="sc-strip-cluster">
        <span className={`sc-strip-deg ${entry.isRoot ? 'is-root' : ''}`}>
          {entry.degree}
        </span>
        <span className={`sc-strip-pill ${entry.isRoot ? 'is-root' : ''}`}>
          {entry.note}
        </span>
      </div>
      {entry.stepAfter && <span className="sc-strip-step">{entry.stepAfter}</span>}
    </>
  )
}
