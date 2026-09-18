import { Fragment, useMemo, useState } from 'react'
import { strum } from './audio'
import { NOTES, TUNING, CHORDS, findChords, generateVoicings } from './chords'

/*
 * Reverse chord finder: tap notes on a fretboard (one per string) and the
 * matching chord names narrow down live. Supports a capo — frets behind it
 * are unplayable and the capo fret acts as the open string.
 */

const FRET_COUNT = 12
const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, i) => i)
const MARKER_FRETS = new Set([3, 5, 7, 9, 12])
// Display rows top->bottom = high e .. low E; TUNING is low->high.
const ROW_STRINGS = [5, 4, 3, 2, 1, 0]

export function ChordFinder({
  sound,
  onToggleSound,
}: {
  sound: boolean
  onToggleSound: () => void
}) {
  const [capo, setCapo] = useState(0)
  // Selected fret per string (TUNING order low->high); null = muted.
  const [sel, setSel] = useState<(number | null)[]>(Array(6).fill(null))

  // Selected notes, lowest pitch first (the bass leads the chord naming).
  const picked = useMemo(() => {
    const out: { midi: number }[] = []
    sel.forEach((f, s) => {
      if (f != null) out.push({ midi: TUNING[s] + f })
    })
    return out.sort((a, b) => a.midi - b.midi)
  }, [sel])

  const pcs = useMemo(() => {
    const seen = new Set<number>()
    const out: number[] = []
    for (const p of picked) {
      const pc = p.midi % 12
      if (!seen.has(pc)) {
        seen.add(pc)
        out.push(pc)
      }
    }
    return out
  }, [picked])

  const bassPc = picked.length ? picked[0].midi % 12 : null
  const matches = useMemo(() => findChords(pcs, bassPc), [pcs, bassPc])

  function toggleCell(s: number, f: number) {
    const selecting = sel[s] !== f
    setSel((prev) => {
      const next = [...prev]
      next[s] = selecting ? f : null
      return next
    })
    if (sound && selecting) strum([TUNING[s] + f])
  }

  function onCapo(c: number) {
    setCapo(c)
    // Notes behind the new capo can no longer ring — drop them.
    setSel((prev) => prev.map((f) => (f != null && f < c ? null : f)))
  }

  function playSelection() {
    if (sound && picked.length) strum(picked.map((p) => p.midi))
  }

  function playMatch(root: number, quality: string) {
    if (!sound) return
    const v = generateVoicings(root, quality)[0]
    if (!v) return
    const midis: number[] = []
    v.frets.forEach((f, s) => {
      if (f != null) midis.push(TUNING[s] + f)
    })
    strum(midis)
  }

  const symbolFor = (m: { root: number; quality: string; exact: boolean }) => {
    const base = NOTES[m.root] + CHORDS[m.quality].symbol
    if (m.exact && bassPc != null && bassPc !== m.root) {
      return `${base}/${NOTES[bassPc]}` // inversion — slash chord
    }
    return base
  }

  return (
    <>
      {/* Controls */}
      <div className="ch-controls chf-controls">
        <div className="chf-bar">
          <div className="ch-unit">
            <span className="gt-label">Capo</span>
            <div className="ch-fret-row">
              <button
                className={capo === 0 ? 'is-active' : ''}
                onClick={() => onCapo(0)}
              >
                None
              </button>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((f) => (
                <button
                  key={f}
                  className={capo === f ? 'is-active' : ''}
                  onClick={() => onCapo(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="ch-unit">
            <span className="gt-label">Sound</span>
            <button
              className={`ch-sound ${sound ? 'is-on' : 'is-off'}`}
              onClick={onToggleSound}
            >
              <span className="dot" />
              {sound ? 'On' : 'Off'}
            </button>
          </div>

          <div className="chf-bar-right">
            <button
              className="chf-ghost"
              onClick={() => setSel(Array(6).fill(null))}
              disabled={picked.length === 0}
            >
              Clear
            </button>
            <button
              className="chf-strum"
              onClick={playSelection}
              disabled={picked.length === 0}
            >
              ▸ Strum
            </button>
          </div>
        </div>
        <p className="chf-hint">
          Tap the fretboard to build a chord — one note per string. Matches
          narrow down as you add or remove notes.
        </p>
      </div>

      {/* Fretboard */}
      <div className="ch-board chf-boardwrap">
        <div className="ch-board-header">
          <div className="ch-board-title">
            <span className="dot" />
            Fretboard
          </div>
          <div className="ch-count">
            {capo > 0 ? `CAPO ${capo} · ` : ''}TAP TO SELECT
          </div>
        </div>

        <div className="chf-scroll">
          <div className="chf-grid">
            <div />
            {FRETS.map((f) => (
              <div
                key={f}
                className={`chf-fnum ${MARKER_FRETS.has(f) ? 'is-marker' : ''} ${
                  capo > 0 && f === capo ? 'is-capo' : ''
                } ${capo > 0 && f < capo ? 'is-behind' : ''}`}
              >
                {f}
              </div>
            ))}

            {ROW_STRINGS.map((s) => (
              <Fragment key={s}>
                <div className="chf-slabel">
                  {NOTES[(TUNING[s] + capo) % 12]}
                </div>
                {FRETS.map((f) => {
                  const behind = capo > 0 && f < capo
                  const selHere = sel[s] === f
                  return (
                    <button
                      key={f}
                      className={`chf-cell ${behind ? 'is-behind' : ''} ${
                        f === 0 ? 'is-nut' : ''
                      } ${f === FRET_COUNT ? 'is-last' : ''}`}
                      disabled={behind}
                      onClick={() => toggleCell(s, f)}
                      aria-pressed={selHere}
                      aria-label={`String ${6 - s}, fret ${f}`}
                    >
                      {selHere && (
                        <span className="chf-dot">
                          {NOTES[(TUNING[s] + f) % 12]}
                        </span>
                      )}
                    </button>
                  )
                })}
              </Fragment>
            ))}

            {capo > 0 && (
              <span
                className="chf-capo-bar"
                style={{
                  gridColumn: `${capo + 2} / ${capo + 3}`,
                  gridRow: '2 / 8',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="ch-board chf-results">
        <div className="ch-board-header">
          <div className="ch-board-title">
            <span className="dot" />
            Matching chords
          </div>
          <div className="ch-count">
            {matches.length > 0
              ? `${matches.length} ${matches.length === 1 ? 'MATCH' : 'MATCHES'}`
              : `${picked.length} ${picked.length === 1 ? 'NOTE' : 'NOTES'} SELECTED`}
          </div>
        </div>

        {picked.length === 0 ? (
          <p className="ch-empty">
            Nothing selected yet — tap some notes on the fretboard above.
          </p>
        ) : pcs.length < 2 ? (
          <p className="ch-empty">
            Add at least one more (different) note to start matching chords.
          </p>
        ) : matches.length === 0 ? (
          <p className="ch-empty">
            No chord in the library contains all of those notes — try removing
            one.
          </p>
        ) : (
          <>
            <div className="chf-selrow">
              <span className="gt-label">Selected</span>
              {pcs.map((pc, i) => (
                <span key={pc} className={`ch-note ${i === 0 ? 'is-root' : ''}`}>
                  {NOTES[pc]}
                </span>
              ))}
              <span className="chf-selnote">lowest note first</span>
            </div>

            <div className="chf-matchgrid">
              {matches.map((m) => (
                <button
                  key={`${m.root}-${m.quality}`}
                  className={`chf-match ${m.exact ? 'is-exact' : ''}`}
                  onClick={() => playMatch(m.root, m.quality)}
                >
                  <span className="chf-match-symbol">{symbolFor(m)}</span>
                  <span className="chf-match-name">
                    {NOTES[m.root]} {m.quality}
                  </span>
                  {m.exact ? (
                    <span className="chf-badge">Exact match</span>
                  ) : (
                    <span className="chf-missing">add {m.missing.join(', ')}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="ch-legend">
              <span className="ch-legend-item">
                Exact = your notes are the whole chord
              </span>
              <span className="ch-legend-item">
                "add …" = your notes fit it, but it has more
              </span>
              <span className="ch-legend-hint">Click a match to hear it</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
