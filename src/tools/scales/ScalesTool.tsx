import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { ScalesIcon } from '../../shared/icons'
import { TOOL_PAGE_THEME } from '../../shared/toolPageTheme'
import { useToolPageBackground } from '../../shared/useToolPageBackground'
import { MATERIALS, MATERIAL_NAMES } from './materials'
import { playNote } from './audio'
import { loadSongs, persistSongs, type SongPreset } from './presets'
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
  SINGLE_INLAY_FRETS,
  isDoubleInlay,
} from './music'
import './scales.css'

const theme = TOOL_PAGE_THEME.scales
const pageStyle = {
  '--accent': theme.accent,
  '--finish': theme.finish,
} as CSSProperties

type Step = 'scale' | 'style'

export function ScalesTool() {
  useToolPageBackground(theme)
  const [root, setRoot] = useState(9) // A
  const [scale, setScale] = useState('Major')
  const [mode, setMode] = useState<'deg' | 'note'>('deg')
  const [sound, setSound] = useState(true)
  const [capo, setCapo] = useState(0)
  // false = true sounding notes; true = notes named as if the capo were the nut
  const [capoView, setCapoView] = useState(false)
  const [material, setMaterial] = useState('Walnut')
  const [tuning, setTuning] = useState<number[]>([64, 59, 55, 50, 45, 40])
  const [customOpen, setCustomOpen] = useState(false)

  // Guided-steps controls panel: which tab is showing, and which root's
  // scale dropdown is currently expanded (hover on desktop, tap on touch).
  const [step, setStep] = useState<Step>('scale')
  const [openRoot, setOpenRoot] = useState<number | null>(null)

  // Saved song presets (persisted in localStorage), now living in the
  // slide-out side panel instead of an inline row.
  const [songs, setSongs] = useState<SongPreset[]>(loadSongs)
  const [savedOpen, setSavedOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [songName, setSongName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    if (pendingDelete === null) return
    const t = setTimeout(() => setPendingDelete(null), 5000)
    return () => clearTimeout(t)
  }, [pendingDelete])

  // Config points — fixed for now, easy to wire to controls later (see README).
  const lefty = false
  const fretCount = 12

  const mat = MATERIALS[material]
  const presetName = useMemo(() => presetNameFor(tuning), [tuning])

  const noteShift = capoView ? capo : 0
  const board = useMemo(
    () => buildBoard(root, scale, tuning, fretCount, mode, noteShift),
    [root, scale, tuning, fretCount, mode, noteShift],
  )

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
    if (name === 'Custom') {
      setCustomOpen(true)
      return
    }
    if (PRESETS[name]) {
      setTuning([...PRESETS[name]])
      setCustomOpen(false)
    }
  }

  function onDot(midi: number) {
    if (sound) playNote(midi)
  }

  function songIsActive(s: SongPreset): boolean {
    return (
      s.root === root &&
      s.scale === scale &&
      s.mode === mode &&
      s.capo === capo &&
      (capo === 0 || s.capoView === capoView) &&
      s.tuning.length === tuning.length &&
      s.tuning.every((v, i) => v === tuning[i])
    )
  }

  function openSaveForm() {
    setSongName(`${NOTES[root]} ${scale}`)
    setSaveOpen(true)
  }

  function saveSong() {
    const fallback = `${NOTES[root]} ${scale}`
    const name = songName.trim() || fallback
    const entry: SongPreset = {
      name,
      root,
      scale,
      mode,
      capo,
      capoView,
      tuning: [...tuning],
    }
    setSongs((prev) => {
      const idx = prev.findIndex((s) => s.name === name)
      const next =
        idx >= 0 ? prev.map((s, i) => (i === idx ? entry : s)) : [...prev, entry]
      persistSongs(next)
      return next
    })
    setSongName('')
    setSaveOpen(false)
  }

  function applySong(s: SongPreset) {
    setRoot(s.root)
    setScale(s.scale)
    setMode(s.mode)
    setCapo(s.capo)
    setCapoView(s.capoView)
    setTuning([...s.tuning])
    setCustomOpen(false)
  }

  // Deleting is two-click: first click arms the button ("Delete?"), a second
  // click within 5s confirms. Anything else lets it disarm.
  function onDeleteClick(name: string) {
    if (pendingDelete === name) {
      setSongs((prev) => {
        const next = prev.filter((s) => s.name !== name)
        persistSongs(next)
        return next
      })
      setPendingDelete(null)
    } else {
      setPendingDelete(name)
    }
  }

  function closeSaved() {
    setSavedOpen(false)
    setSaveOpen(false)
  }

  return (
    <div className="sc-page" style={pageStyle}>
      {/* Header */}
      <ToolHeader name="Scales" icon={<ScalesIcon />} serial={theme.serial} />

      {/* Toolbar — tab switcher + Saved panel trigger */}
      <div className="sc-toolbar">
        <div className="sc-tabs">
          <button
            className={`sc-tab ${step === 'scale' ? 'is-active' : ''}`}
            onClick={() => setStep('scale')}
          >
            Scale
          </button>
          <button
            className={`sc-tab ${step === 'style' ? 'is-active' : ''}`}
            onClick={() => setStep('style')}
          >
            Tuning &amp; Style
          </button>
        </div>
        <button className="sc-saved-btn" onClick={() => setSavedOpen(true)}>
          <span aria-hidden="true">★</span> Saved
        </button>
      </div>

      {/* Controls panel */}
      <div className="sc-controls">
        {step === 'scale' ? (
          <div className="sc-root-row">
            {NOTES.map((n, i) => {
              const isActive = root === i
              const isOpen = openRoot === i
              const anchor = i < 2 ? 'left' : i > 9 ? 'right' : 'center'
              return (
                <div
                  key={n}
                  className="sc-root-wrap"
                  onMouseEnter={() => setOpenRoot(i)}
                  onMouseLeave={() =>
                    setOpenRoot((r) => (r === i ? null : r))
                  }
                >
                  <button
                    className={`sc-root-btn ${
                      isActive || isOpen ? 'is-active' : ''
                    } ${isActive ? 'has-caption' : ''}`}
                    onClick={() =>
                      setOpenRoot((r) => (r === i ? null : i))
                    }
                  >
                    {n}
                    {isActive && (
                      <span className="sc-root-caption">{scale}</span>
                    )}
                  </button>
                  <div
                    className={`sc-root-dropdown anchor-${anchor} ${
                      isOpen ? 'is-open' : ''
                    }`}
                  >
                    {SCALE_NAMES.map((s) => (
                      <button
                        key={s}
                        className={`sc-scale-option ${
                          isActive && scale === s ? 'is-active' : ''
                        }`}
                        onClick={() => {
                          setRoot(i)
                          setScale(s)
                          setOpenRoot(null)
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="sc-style-row">
            <div className="sc-unit sc-tuning-wrap">
              <span className="gt-label">Tuning</span>
              <select
                className="gt-select"
                value={customOpen ? 'Custom' : presetName}
                onChange={(e) => onPreset(e.target.value)}
              >
                {PRESET_NAMES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
              {presetName === 'Custom' && !customOpen && (
                <button
                  className="sc-tuning-edit"
                  onClick={() => setCustomOpen(true)}
                >
                  Edit
                </button>
              )}

              {customOpen && (
                <>
                  <div
                    className="sc-pop-backdrop"
                    onClick={() => setCustomOpen(false)}
                  />
                  <div className="sc-tuning-pop">
                    <div className="sc-tuning-pop-head">
                      <span className="gt-label">Custom tuning</span>
                      <button
                        className="sc-tuning-done"
                        onClick={() => setCustomOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                    <div className="sc-tuning-pop-row">
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
                              <div
                                className={`sc-note-box ${
                                  isRootString ? 'is-root' : ''
                                }`}
                              >
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
                </>
              )}
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
              <span className="gt-label">Capo</span>
              <select
                className="gt-select"
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
              >
                <option value={0}>None</option>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>
                    Fret {f}
                  </option>
                ))}
              </select>
            </div>

            {capo > 0 && (
              <div className="sc-unit">
                <span className="gt-label">Note names</span>
                <div className="sc-seg">
                  <button
                    className={!capoView ? 'is-active' : ''}
                    onClick={() => setCapoView(false)}
                    title="Show the actual sounding pitch at each fret"
                  >
                    True notes
                  </button>
                  <button
                    className={capoView ? 'is-active' : ''}
                    onClick={() => setCapoView(true)}
                    title="Name notes as if the capo were the nut (shape thinking)"
                  >
                    Capo as nut
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board panel */}
      <div className="sc-board">
        <div className="sc-surface-scroll">
          {/* Fret numbers */}
          <div className="sc-fret-numbers" style={rowDir}>
            <div className="spacer" />
            <div style={{ display: 'flex', flex: 1, ...rowDir }}>
              {frets.map((f) => (
                <div
                  key={f}
                  className={`sc-fret-num ${markerFrets.has(f) ? 'is-marker' : ''} ${
                    capo > 0 && f === capo ? 'is-capo' : ''
                  } ${capo > 0 && f < capo ? 'is-behind-capo' : ''}`}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Board body */}
          <div className="sc-board-body">
            <div className="sc-string-labels">
              {board.map((_, i) => (
                <div className="sc-string-label" key={i}>
                  {NOTES[pitchClass(tuning[i] + capo - noteShift)]}
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

              {/* 3.5 capo overlay — shades unplayable frets, draws the capo bar */}
              {capo > 0 && (
                <div className="sc-capo-layer" style={rowDir}>
                  {frets.map((f) => (
                    <div
                      className={`sc-capo-cell ${f < capo ? 'is-shaded' : ''}`}
                      key={f}
                    >
                      {f === capo && <span className="sc-capo-bar" />}
                    </div>
                  ))}
                </div>
              )}

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
                        {dot && f >= capo && (
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
      </div>

      {/* Saved side panel */}
      {savedOpen && (
        <div className="sc-panel-backdrop" onClick={closeSaved} />
      )}
      <div className={`sc-panel ${savedOpen ? 'is-open' : ''}`}>
        <div className="sc-panel-head">
          <span className="sc-panel-title">Saved</span>
          <button
            className="sc-panel-close"
            aria-label="Close saved panel"
            onClick={closeSaved}
          >
            ✕
          </button>
        </div>
        <div className="sc-panel-list">
          {songs.map((s) => (
            <div
              key={s.name}
              className={`sc-panel-item ${songIsActive(s) ? 'is-active' : ''}`}
            >
              <button
                className="sc-panel-load"
                onClick={() => applySong(s)}
                title={`${NOTES[s.root]} ${s.scale}${
                  s.capo > 0 ? ` · capo ${s.capo}` : ''
                }`}
              >
                {s.name}
              </button>
              <button
                className={`sc-panel-del ${
                  pendingDelete === s.name ? 'is-armed' : ''
                }`}
                aria-label={`Delete ${s.name}`}
                onClick={() => onDeleteClick(s.name)}
              >
                {pendingDelete === s.name ? 'Delete?' : '×'}
              </button>
            </div>
          ))}
        </div>

        {saveOpen ? (
          <div className="sc-panel-save-form">
            <input
              className="sc-panel-save-input"
              autoFocus
              placeholder="Song name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveSong()
                if (e.key === 'Escape') {
                  setSaveOpen(false)
                  setSongName('')
                }
              }}
            />
            <div className="sc-panel-save-btnrow">
              <button className="sc-panel-save-confirm" onClick={saveSong}>
                Save
              </button>
              <button
                className="sc-panel-save-cancel"
                onClick={() => {
                  setSaveOpen(false)
                  setSongName('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="sc-panel-add"
            onClick={openSaveForm}
            title="Save the current key, scale, capo and tuning as a song"
          >
            + Save current
          </button>
        )}
      </div>
    </div>
  )
}
