import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { TransposeIcon } from '../../shared/icons'
import { TOOL_PAGE_THEME } from '../../shared/toolPageTheme'
import { useToolPageBackground } from '../../shared/useToolPageBackground'
import { ChordDiagram } from '../chords/ChordDiagram'
import { strum } from '../chords/audio'
import {
  NOTES,
  TUNING,
  CHORDS,
  CHORD_CATEGORIES,
  QUALITY_SHORT,
  generateVoicings,
} from '../chords/chords'
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

interface ProgChord {
  root: number
  quality: string
}

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
  const shapeVoicings = useMemo(
    () => prog.map((c, i) => generateVoicings(shapeRoots[i], c.quality)[0] ?? null),
    [prog, shapeRoots],
  )

  const unchanged = steps === 0 && capoTo === capoFrom

  function addChord() {
    setProg((p) => [...p, { root, quality }])
  }

  function removeChord(i: number) {
    setProg((p) => p.filter((_, idx) => idx !== i))
  }

  function playShape(i: number) {
    if (!sound) return
    const v = shapeVoicings[i]
    if (!v) return
    const midis: number[] = []
    v.frets.forEach((f, s) => {
      // Add the new capo so it sounds like it would on the real guitar.
      if (f != null) midis.push(TUNING[s] + f + capoTo)
    })
    strum(midis)
  }

  return (
    <div className="tp-page" style={pageStyle}>
      <ToolHeader name="Transpose" icon={<TransposeIcon />} serial={theme.serial} />

      {/* Toolbar — tab switcher */}
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
        {!unchanged && prog.length > 0 && (
          <div className="tp-count">
            {steps > 0 ? `UP ${steps}` : steps < 0 ? `DOWN ${-steps}` : 'SAME PITCH'}
            {steps !== 0 ? ` SEMITONE${Math.abs(steps) === 1 ? '' : 'S'}` : ''}
          </div>
        )}
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
                    <button className="tp-clear" onClick={() => setProg([])}>
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
                          onPlay={() => playShape(i)}
                        />
                        <span className="tp-cell-label">
                          {sym(shapeRoots[i], c.quality)}
                        </span>
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
    </div>
  )
}
