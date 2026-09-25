import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { TransposeIcon } from '../../shared/icons'
import { TOOL_PAGE_THEME } from '../../shared/toolPageTheme'
import { useToolPageBackground } from '../../shared/useToolPageBackground'
import { ChordDiagram } from '../chords/ChordDiagram'
import { strum } from '../chords/audio'
import {
  NOTES,
  CHORDS,
  CHORD_CATEGORIES,
  QUALITY_SHORT,
  TUNING_PRESETS,
  TUNING_PRESET_NAMES,
  generateVoicings,
  type Voicing,
} from '../chords/chords'
import {
  loadProgressions,
  persistProgressions,
  type ProgChord,
  type ProgPreset,
} from './presets'
import './transpose.css'

/*
 * Transpose tool.
 *
 * The user enters the chord SHAPES they play (the names they'd call the
 * chords while holding them) plus the capo they play them on. From there:
 *   sounding root = shape root + original capo
 *   transposed sound = sounding root + steps
 *   new shape root  = transposed sound - new capo
 * Qualities never change when transposing.
 */

const mod12 = (n: number) => ((n % 12) + 12) % 12

const FRETS = Array.from({ length: 9 }, (_, i) => i + 1)

const theme = TOOL_PAGE_THEME.transpose
const pageStyle = {
  '--accent': theme.accent,
  '--finish': theme.finish,
} as CSSProperties

type Step = 'chord' | 'transpose'

export function TransposeTool() {
  useToolPageBackground(theme)
  const [prog, setProg] = useState<ProgChord[]>([])
  const [root, setRoot] = useState(7) // G — a friendly default
  const [quality, setQuality] = useState('Major')
  const [capoFrom, setCapoFrom] = useState(0)
  const [steps, setSteps] = useState(0)
  const [capoTo, setCapoTo] = useState(0)
  const [sound, setSound] = useState(true)
  const [tuningFrom, setTuningFrom] = useState('Standard')
  const [tuningTo, setTuningTo] = useState('Standard')

  // Which voicing (of the ones generateVoicings finds) is showing per chord,
  // kept in sync with prog by index — see addChord/removeChord.
  const [origVariant, setOrigVariant] = useState<number[]>([])
  const [shapeVariant, setShapeVariant] = useState<number[]>([])

  // Saved progression presets (persisted in localStorage), shown in a
  // slide-out side panel — mirrors the Scales tool's saved songs.
  const [progs, setProgs] = useState<ProgPreset[]>(loadProgressions)
  const [savedOpen, setSavedOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [progName, setProgName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    if (pendingDelete === null) return
    const t = setTimeout(() => setPendingDelete(null), 5000)
    return () => clearTimeout(t)
  }, [pendingDelete])

  // Guided-steps controls panel: which tab is showing, and which root's
  // quality dropdown is currently expanded (hover on desktop, tap on touch).
  const [step, setStep] = useState<Step>('chord')
  const [openRoot, setOpenRoot] = useState<number | null>(null)

  const sym = (r: number, q: string) => NOTES[r] + CHORDS[q].symbol

  const soundingRoots = useMemo(
    () => prog.map((c) => mod12(c.root + capoFrom + steps)),
    [prog, capoFrom, steps],
  )
  const shapeRoots = useMemo(
    () => prog.map((c) => mod12(c.root + capoFrom + steps - capoTo)),
    [prog, capoFrom, steps, capoTo],
  )
  const shapeVoicingLists = useMemo(
    () =>
      prog.map((c, i) => generateVoicings(shapeRoots[i], c.quality, TUNING_PRESETS[tuningTo])),
    [prog, shapeRoots, tuningTo],
  )
  const origVoicingLists = useMemo(
    () => prog.map((c) => generateVoicings(c.root, c.quality, TUNING_PRESETS[tuningFrom])),
    [prog, tuningFrom],
  )

  function pick(list: Voicing[], idx: number): Voicing | null {
    if (!list.length) return null
    return list[((idx % list.length) + list.length) % list.length]
  }

  const shapeVoicings = prog.map((_, i) => pick(shapeVoicingLists[i], shapeVariant[i] ?? 0))
  const origVoicings = prog.map((_, i) => pick(origVoicingLists[i], origVariant[i] ?? 0))

  const unchanged = steps === 0 && capoTo === capoFrom

  function addChord() {
    setProg((p) => [...p, { root, quality }])
    setOrigVariant((v) => [...v, 0])
    setShapeVariant((v) => [...v, 0])
  }

  function removeChord(i: number) {
    setProg((p) => p.filter((_, idx) => idx !== i))
    setOrigVariant((v) => v.filter((_, idx) => idx !== i))
    setShapeVariant((v) => v.filter((_, idx) => idx !== i))
  }

  function clearProg() {
    setProg([])
    setOrigVariant([])
    setShapeVariant([])
  }

  function cycleOrig(i: number, dir: number) {
    const len = origVoicingLists[i]?.length ?? 0
    if (len < 2) return
    setOrigVariant((v) =>
      v.map((val, idx) => (idx === i ? (((val + dir) % len) + len) % len : val)),
    )
  }

  function cycleShape(i: number, dir: number) {
    const len = shapeVoicingLists[i]?.length ?? 0
    if (len < 2) return
    setShapeVariant((v) =>
      v.map((val, idx) => (idx === i ? (((val + dir) % len) + len) % len : val)),
    )
  }

  function playShape(i: number) {
    if (!sound) return
    const v = shapeVoicings[i]
    if (!v) return
    const tuning = TUNING_PRESETS[tuningTo]
    const midis: number[] = []
    v.frets.forEach((f, s) => {
      // Add the new capo so it sounds like it would on the real guitar.
      if (f != null) midis.push(tuning[s] + f + capoTo)
    })
    strum(midis)
  }

  function playOrig(i: number) {
    if (!sound) return
    const v = origVoicings[i]
    if (!v) return
    const tuning = TUNING_PRESETS[tuningFrom]
    const midis: number[] = []
    v.frets.forEach((f, s) => {
      if (f != null) midis.push(tuning[s] + f + capoFrom)
    })
    strum(midis)
  }

  function progIsActive(p: ProgPreset): boolean {
    return (
      p.prog.length === prog.length &&
      p.prog.every((c, i) => c.root === prog[i].root && c.quality === prog[i].quality) &&
      p.capoFrom === capoFrom &&
      p.steps === steps &&
      p.capoTo === capoTo &&
      p.tuningFrom === tuningFrom &&
      p.tuningTo === tuningTo
    )
  }

  function openSaveForm() {
    setProgName(prog.length ? `${sym(prog[0].root, prog[0].quality)} progression` : 'Progression')
    setSaveOpen(true)
  }

  function saveProg() {
    const fallback = prog.length ? `${sym(prog[0].root, prog[0].quality)} progression` : 'Progression'
    const name = progName.trim() || fallback
    const entry: ProgPreset = {
      name,
      prog: prog.map((c) => ({ ...c })),
      capoFrom,
      steps,
      capoTo,
      tuningFrom,
      tuningTo,
    }
    setProgs((prev) => {
      const idx = prev.findIndex((p) => p.name === name)
      const next = idx >= 0 ? prev.map((p, i) => (i === idx ? entry : p)) : [...prev, entry]
      persistProgressions(next)
      return next
    })
    setProgName('')
    setSaveOpen(false)
  }

  function applyProg(p: ProgPreset) {
    setProg(p.prog.map((c) => ({ ...c })))
    setOrigVariant(p.prog.map(() => 0))
    setShapeVariant(p.prog.map(() => 0))
    setCapoFrom(p.capoFrom)
    setSteps(p.steps)
    setCapoTo(p.capoTo)
    setTuningFrom(p.tuningFrom)
    setTuningTo(p.tuningTo)
  }

  // Deleting is two-click: first click arms the button ("Delete?"), a second
  // click within 5s confirms. Anything else lets it disarm.
  function onDeleteClick(name: string) {
    if (pendingDelete === name) {
      setProgs((prev) => {
        const next = prev.filter((p) => p.name !== name)
        persistProgressions(next)
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
    <div className="tp-page" style={pageStyle}>
      <ToolHeader name="Transpose" icon={<TransposeIcon />} serial={theme.serial} />

      {/* Toolbar — tab switcher + Saved panel trigger */}
      <div className="tp-toolbar">
        <div className="tp-tabs">
          <button
            className={`tp-tab ${step === 'chord' ? 'is-active' : ''}`}
            onClick={() => setStep('chord')}
          >
            Your Chord
          </button>
          <button
            className={`tp-tab ${step === 'transpose' ? 'is-active' : ''}`}
            onClick={() => setStep('transpose')}
          >
            Transpose
          </button>
        </div>
        <div className="tp-toolbar-right">
          {!unchanged && prog.length > 0 && (
            <div className="tp-count">
              {steps > 0 ? `UP ${steps}` : steps < 0 ? `DOWN ${-steps}` : 'SAME PITCH'}
              {steps !== 0 ? ` SEMITONE${Math.abs(steps) === 1 ? '' : 'S'}` : ''}
            </div>
          )}
          <button className="tp-saved-btn" onClick={() => setSavedOpen(true)}>
            <span aria-hidden="true">★</span> Saved
          </button>
        </div>
      </div>

      {/* Controls panel */}
      <div className="tp-controls-panel">
        {step === 'chord' ? (
          <>
            <div className="tp-root-row">
              {NOTES.map((n, i) => {
                const isActive = root === i
                const isOpen = openRoot === i
                const anchor = i < 2 ? 'left' : i > 9 ? 'right' : 'center'
                return (
                  <div
                    key={n}
                    className="tp-root-wrap"
                    onMouseEnter={() => setOpenRoot(i)}
                    onMouseLeave={() =>
                      setOpenRoot((r) => (r === i ? null : r))
                    }
                  >
                    <button
                      className={`tp-root-btn ${
                        isActive || isOpen ? 'is-active' : ''
                      } ${isActive ? 'has-caption' : ''}`}
                      onClick={() => setOpenRoot((r) => (r === i ? null : i))}
                    >
                      {n}
                      {isActive && (
                        <span className="tp-root-caption">
                          {QUALITY_SHORT[quality] ?? quality}
                        </span>
                      )}
                    </button>
                    <div
                      className={`tp-root-dropdown anchor-${anchor} ${
                        isOpen ? 'is-open' : ''
                      }`}
                    >
                      {CHORD_CATEGORIES.map((cat) => (
                        <div className="tp-quality-group" key={cat.name}>
                          <div className="tp-quality-group-label">
                            {cat.name}
                          </div>
                          {cat.items.map((q) => (
                            <button
                              key={q}
                              className={`tp-quality-option ${
                                isActive && quality === q ? 'is-active' : ''
                              }`}
                              onClick={() => {
                                setRoot(i)
                                setQuality(q)
                                setOpenRoot(null)
                              }}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="tp-secondary-row">
              <div className="tp-unit">
                <span className="gt-label">Played with capo</span>
                <div className="tp-fret-row">
                  <button
                    className={capoFrom === 0 ? 'is-active' : ''}
                    onClick={() => setCapoFrom(0)}
                  >
                    None
                  </button>
                  {FRETS.map((f) => (
                    <button
                      key={f}
                      className={capoFrom === f ? 'is-active' : ''}
                      onClick={() => setCapoFrom(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tp-unit">
                <span className="gt-label">Your tuning</span>
                <select
                  className="gt-select"
                  value={tuningFrom}
                  onChange={(e) => setTuningFrom(e.target.value)}
                >
                  {TUNING_PRESET_NAMES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tp-unit tp-unit-right">
                <span className="gt-label">Sound</span>
                <button
                  className={`tp-sound ${sound ? 'is-on' : 'is-off'}`}
                  onClick={() => setSound((s) => !s)}
                >
                  <span className="dot" />
                  {sound ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <button className="tp-add" onClick={addChord}>
              + Add {sym(root, quality)} to progression
            </button>

            <div className="tp-built">
              {prog.length === 0 ? (
                <p className="tp-hint">
                  Add the chords of your progression above — the shapes as
                  you'd name them while playing, capo included.
                </p>
              ) : (
                <>
                  <div className="tp-chips">
                    {prog.map((c, i) => (
                      <span className="tp-chip" key={i}>
                        {sym(c.root, c.quality)}
                        <button
                          className="tp-chip-x"
                          onClick={() => removeChord(i)}
                          aria-label={`Remove ${sym(c.root, c.quality)}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button className="tp-clear" onClick={clearProg}>
                      Clear all
                    </button>
                  </div>
                  {capoFrom > 0 && (
                    <div className="tp-sounds-like">
                      <span className="gt-label">Actually sounds like</span>
                      {prog.map((c, i) => (
                        <span className="tp-mini" key={i}>
                          {sym(mod12(c.root + capoFrom), c.quality)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="tp-diagrams">
                    {prog.map((c, i) =>
                      origVoicings[i] ? (
                        <div className="tp-cell" key={i}>
                          <ChordDiagram
                            voicing={origVoicings[i]!}
                            root={c.root}
                            tuning={TUNING_PRESETS[tuningFrom]}
                            onPlay={() => playOrig(i)}
                          />
                          <span className="tp-cell-label">{sym(c.root, c.quality)}</span>
                          {origVoicingLists[i].length > 1 && (
                            <div className="tp-cell-nav">
                              <button
                                onClick={() => cycleOrig(i, -1)}
                                aria-label="Previous way to play this shape"
                              >
                                ‹
                              </button>
                              <span>
                                {(origVariant[i] ?? 0) + 1}/{origVoicingLists[i].length}
                              </span>
                              <button
                                onClick={() => cycleOrig(i, 1)}
                                aria-label="Next way to play this shape"
                              >
                                ›
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="tp-cell" key={i}>
                          <span className="tp-cell-label">
                            {sym(c.root, c.quality)} — no easy shape found
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="tp-secondary-row">
              <div className="tp-unit">
                <span className="gt-label">Shift</span>
                <div className="tp-stepper">
                  <button
                    onClick={() => setSteps((s) => Math.max(-12, s - 1))}
                    aria-label="Transpose down a semitone"
                  >
                    −
                  </button>
                  <span className="tp-step-val">
                    {steps === 0
                      ? 'Original key'
                      : `${steps > 0 ? '+' : ''}${steps} semitone${Math.abs(steps) === 1 ? '' : 's'}`}
                  </span>
                  <button
                    onClick={() => setSteps((s) => Math.min(12, s + 1))}
                    aria-label="Transpose up a semitone"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="tp-unit">
                <span className="gt-label">New capo position</span>
                <div className="tp-fret-row">
                  <button
                    className={capoTo === 0 ? 'is-active' : ''}
                    onClick={() => setCapoTo(0)}
                  >
                    None
                  </button>
                  {FRETS.map((f) => (
                    <button
                      key={f}
                      className={capoTo === f ? 'is-active' : ''}
                      onClick={() => setCapoTo(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tp-unit">
                <span className="gt-label">Output tuning</span>
                <select
                  className="gt-select"
                  value={tuningTo}
                  onChange={(e) => setTuningTo(e.target.value)}
                >
                  {TUNING_PRESET_NAMES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {prog.length === 0 ? (
              <p className="tp-empty">Add some chords in "Your Chord" to transpose them.</p>
            ) : (
              <>
                <div className="tp-result-row">
                  <span className="gt-label">
                    {unchanged ? 'Sounds like (unchanged)' : 'Will sound like'}
                  </span>
                  {prog.map((c, i) => (
                    <span className="tp-mini is-sound" key={i}>
                      {sym(soundingRoots[i], c.quality)}
                    </span>
                  ))}
                </div>

                <div className="tp-result-row">
                  <span className="gt-label">
                    Play these shapes {capoTo > 0 ? `with capo ${capoTo}` : 'with no capo'}
                  </span>
                  {prog.map((c, i) => (
                    <span className="tp-mini is-shape" key={i}>
                      {sym(shapeRoots[i], c.quality)}
                    </span>
                  ))}
                </div>

                <div className="tp-diagrams">
                  {prog.map((c, i) =>
                    shapeVoicings[i] ? (
                      <div className="tp-cell" key={i}>
                        <ChordDiagram
                          voicing={shapeVoicings[i]!}
                          root={shapeRoots[i]}
                          tuning={TUNING_PRESETS[tuningTo]}
                          onPlay={() => playShape(i)}
                        />
                        <span className="tp-cell-label">
                          {sym(shapeRoots[i], c.quality)}
                        </span>
                        {shapeVoicingLists[i].length > 1 && (
                          <div className="tp-cell-nav">
                            <button
                              onClick={() => cycleShape(i, -1)}
                              aria-label="Previous way to play this shape"
                            >
                              ‹
                            </button>
                            <span>
                              {(shapeVariant[i] ?? 0) + 1}/{shapeVoicingLists[i].length}
                            </span>
                            <button
                              onClick={() => cycleShape(i, 1)}
                              aria-label="Next way to play this shape"
                            >
                              ›
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="tp-cell" key={i}>
                        <span className="tp-cell-label">
                          {sym(shapeRoots[i], c.quality)} — no easy shape found
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="tp-legend">
                  <span>
                    Same capo, shift 0 = what you play today. Change the shift
                    or the capo and the shapes update.
                  </span>
                  <span className="tp-legend-hint">Click a shape to hear it</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Saved side panel */}
      {savedOpen && <div className="tp-panel-backdrop" onClick={closeSaved} />}
      <div className={`tp-panel ${savedOpen ? 'is-open' : ''}`}>
        <div className="tp-panel-head">
          <span className="tp-panel-title">Saved</span>
          <button
            className="tp-panel-close"
            aria-label="Close saved panel"
            onClick={closeSaved}
          >
            ✕
          </button>
        </div>
        <div className="tp-panel-list">
          {progs.map((p) => (
            <div
              key={p.name}
              className={`tp-panel-item ${progIsActive(p) ? 'is-active' : ''}`}
            >
              <button
                className="tp-panel-load"
                onClick={() => applyProg(p)}
                title={p.prog.map((c) => sym(c.root, c.quality)).join(' – ')}
              >
                {p.name}
              </button>
              <button
                className={`tp-panel-del ${pendingDelete === p.name ? 'is-armed' : ''}`}
                aria-label={`Delete ${p.name}`}
                onClick={() => onDeleteClick(p.name)}
              >
                {pendingDelete === p.name ? 'Delete?' : '×'}
              </button>
            </div>
          ))}
          {progs.length === 0 && (
            <p className="tp-hint">No saved progressions yet.</p>
          )}
        </div>

        {saveOpen ? (
          <div className="tp-panel-save-form">
            <input
              className="tp-panel-save-input"
              autoFocus
              placeholder="Progression name"
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveProg()
                if (e.key === 'Escape') {
                  setSaveOpen(false)
                  setProgName('')
                }
              }}
            />
            <div className="tp-panel-save-btnrow">
              <button className="tp-panel-save-confirm" onClick={saveProg}>
                Save
              </button>
              <button
                className="tp-panel-save-cancel"
                onClick={() => {
                  setSaveOpen(false)
                  setProgName('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="tp-panel-add"
            onClick={openSaveForm}
            disabled={prog.length === 0}
            title={
              prog.length === 0
                ? 'Add chords to your progression first'
                : 'Save the current progression, capo, shift and tuning'
            }
          >
            + Save current
          </button>
        )}
      </div>
    </div>
  )
}
