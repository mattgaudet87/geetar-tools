import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { TheoryIcon } from '../../shared/icons'
import { TOOL_PAGE_THEME } from '../../shared/toolPageTheme'
import { useToolPageBackground } from '../../shared/useToolPageBackground'
import { strum } from '../chords/audio'
import { playNote } from '../scales/audio'
import { NOTES, TUNING, CHORDS, generateVoicings } from '../chords/chords'
import {
  DIATONIC,
  PROGRESSIONS,
  RULES,
  CIRCLE,
  INTERVALS,
  GLOSSARY,
  type KeyMode,
} from './theory'
import './theory.css'

/*
 * Music Theory tool — four interactive sections:
 *   Keys        diatonic chords + common progressions + rules of thumb
 *   Circle      an interactive circle of fifths
 *   Intervals   every interval from a chosen root, with audio
 *   Glossary    plain-English definitions, filterable
 */

const TABS = [
  { id: 'keys', label: 'Keys & Progressions' },
  { id: 'circle', label: 'Circle of Fifths' },
  { id: 'intervals', label: 'Intervals' },
  { id: 'glossary', label: 'Glossary' },
] as const

type TabId = (typeof TABS)[number]['id']

const mod12 = (n: number) => ((n % 12) + 12) % 12

/** Strum the best voicing of a chord (root pitch class + quality name). */
function playChord(root: number, quality: string) {
  const v = generateVoicings(root, quality)[0]
  if (!v) return
  const midis: number[] = []
  v.frets.forEach((f, s) => {
    if (f != null) midis.push(TUNING[s] + f)
  })
  strum(midis)
}

const theme = TOOL_PAGE_THEME.theory
const pageStyle = {
  '--accent': theme.accent,
  '--finish': theme.finish,
} as CSSProperties

export function TheoryTool() {
  useToolPageBackground(theme)
  const [tab, setTab] = useState<TabId>('keys')
  const [sound, setSound] = useState(true)

  return (
    <div className="th-page" style={pageStyle}>
      <ToolHeader name="Music Theory" icon={<TheoryIcon />} serial={theme.serial} />

      <div className="th-tabrow">
        <div className="th-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'is-active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="th-soundunit">
          <span className="gt-label">Sound</span>
          <button
            className={`th-sound ${sound ? 'is-on' : 'is-off'}`}
            onClick={() => setSound((s) => !s)}
          >
            <span className="dot" />
            {sound ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {tab === 'keys' && <KeysSection sound={sound} />}
      {tab === 'circle' && <CircleSection sound={sound} />}
      {tab === 'intervals' && <IntervalsSection sound={sound} />}
      {tab === 'glossary' && <GlossarySection />}
    </div>
  )
}

/* ---------------- Keys & Progressions ---------------- */

function KeysSection({ sound }: { sound: boolean }) {
  const [key, setKey] = useState(7) // G
  const [mode, setMode] = useState<KeyMode>('major')
  const timeouts = useRef<number[]>([])

  const pattern = DIATONIC[mode]
  const chords = pattern.degrees.map((deg, i) => ({
    root: mod12(key + deg),
    quality: pattern.qualities[i],
    numeral: pattern.numerals[i],
  }))
  const scaleNotes = pattern.degrees.map((deg) => NOTES[mod12(key + deg)])
  const relative =
    mode === 'major'
      ? `${NOTES[mod12(key + 9)]} minor`
      : `${NOTES[mod12(key + 3)]} major`

  const chordFor = (numeral: string) => {
    const i = (pattern.numerals as readonly string[]).indexOf(numeral)
    return chords[i]
  }

  function playProgression(numerals: string[]) {
    if (!sound) return
    timeouts.current.forEach(clearTimeout)
    timeouts.current = numerals.map((numeral, i) => {
      const c = chordFor(numeral)
      return window.setTimeout(() => playChord(c.root, c.quality), i * 700)
    })
  }

  return (
    <>
      <div className="th-panel">
        <div className="th-keypick">
          <span className="gt-label">Key</span>
          <div className="th-pills">
            {NOTES.map((n, i) => (
              <button
                key={n}
                className={`th-pill ${key === i ? 'is-active' : ''}`}
                onClick={() => setKey(i)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="th-modeseg">
            {(Object.keys(DIATONIC) as KeyMode[]).map((m) => (
              <button
                key={m}
                className={mode === m ? 'is-active' : ''}
                onClick={() => setMode(m)}
              >
                {DIATONIC[m].label}
              </button>
            ))}
          </div>
        </div>

        <div className="th-keymeta">
          <span className="gt-label">Notes in this key</span>
          {scaleNotes.map((n, i) => (
            <span key={i} className={`th-note ${i === 0 ? 'is-root' : ''}`}>
              {n}
            </span>
          ))}
          <span className="th-relative">Same notes as {relative}</span>
        </div>
      </div>

      <div className="th-board">
        <div className="th-board-header">
          <div className="th-board-title">
            <span className="dot" />
            The chords of {NOTES[key]} {pattern.label.toLowerCase()}
          </div>
          <div className="th-count">CLICK A CHORD TO HEAR IT</div>
        </div>

        <div className="th-diatonic">
          {chords.map((c) => (
            <button
              key={c.numeral}
              className={`th-dchord ${c.numeral.toLowerCase() === 'i' ? 'is-home' : ''}`}
              onClick={() => sound && playChord(c.root, c.quality)}
            >
              <span className="th-dchord-numeral">{c.numeral}</span>
              <span className="th-dchord-symbol">
                {NOTES[c.root] + CHORDS[c.quality].symbol}
              </span>
              <span className="th-dchord-quality">{c.quality}</span>
            </button>
          ))}
        </div>
        <p className="th-footnote">
          These 7 chords are built only from the notes of the key — mix and
          match them and everything sounds like it belongs. Uppercase numerals
          are major chords, lowercase are minor, ° is diminished.
        </p>
      </div>

      <div className="th-board">
        <div className="th-board-header">
          <div className="th-board-title">
            <span className="dot" />
            Proven progressions, in your key
          </div>
          <div className="th-count">CLICK ▸ TO HEAR ONE</div>
        </div>

        <div className="th-progs">
          {PROGRESSIONS[mode].map((p) => (
            <div className="th-prog" key={p.name}>
              <div className="th-prog-head">
                <span className="th-prog-name">{p.name}</span>
                <button
                  className="th-prog-play"
                  onClick={() => playProgression(p.numerals)}
                  aria-label={`Play ${p.name}`}
                >
                  ▸ Play
                </button>
              </div>
              <div className="th-prog-chips">
                {p.numerals.map((numeral, i) => {
                  const c = chordFor(numeral)
                  return (
                    <button
                      key={i}
                      className="th-prog-chip"
                      onClick={() => sound && playChord(c.root, c.quality)}
                    >
                      <span className="th-prog-chip-num">{numeral}</span>
                      {NOTES[c.root] + CHORDS[c.quality].symbol}
                    </button>
                  )
                })}
              </div>
              <p className="th-prog-vibe">{p.vibe}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="th-rules-grid">
        {(['writing', 'solos'] as const).map((k) => (
          <div className="th-board th-rules" key={k}>
            <div className="th-board-title th-rules-title">
              <span className="dot" />
              {RULES[k].title}
            </div>
            <ul>
              {RULES[k].items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------------- Circle of Fifths ---------------- */

function CircleSection({ sound }: { sound: boolean }) {
  const [selected, setSelected] = useState(0) // C
  const timeouts = useRef<number[]>([])
  const k = CIRCLE[selected]
  const left = CIRCLE[mod(selected - 1, 12)]
  const right = CIRCLE[mod(selected + 1, 12)]

  function mod(n: number, m: number) {
    return ((n % m) + m) % m
  }

  const SIZE = 440
  const C = SIZE / 2
  const R_MAJ = 160
  const R_MIN = 103
  const pos = (i: number, r: number) => {
    const a = (i * 30 - 90) * (Math.PI / 180)
    return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
  }

  function playScale() {
    if (!sound) return
    timeouts.current.forEach(clearTimeout)
    const base = 48 + k.pc
    const steps = [0, 2, 4, 5, 7, 9, 11, 12]
    timeouts.current = steps.map((st, i) =>
      window.setTimeout(() => playNote(base + st), i * 240),
    )
  }

  return (
    <div className="th-circle-layout">
      <div className="th-board th-circle-board">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="th-circle-svg"
          role="group"
          aria-label="Circle of fifths"
        >
          <circle cx={C} cy={C} r={R_MAJ} className="th-ring" />
          <circle cx={C} cy={C} r={R_MIN} className="th-ring" />

          {CIRCLE.map((entry, i) => {
            const pM = pos(i, R_MAJ)
            const pm = pos(i, R_MIN)
            const isSel = i === selected
            const isNear = i === mod(selected - 1, 12) || i === mod(selected + 1, 12)
            return (
              <g
                key={entry.major}
                className={`th-ckey ${isSel ? 'is-selected' : ''} ${isNear ? 'is-near' : ''}`}
                onClick={() => setSelected(i)}
              >
                <circle cx={pM.x} cy={pM.y} r={27} className="th-ckey-outer" />
                <text x={pM.x} y={pM.y + 5} textAnchor="middle" className="th-ckey-label">
                  {entry.major}
                </text>
                <circle cx={pm.x} cy={pm.y} r={19} className="th-ckey-inner" />
                <text x={pm.x} y={pm.y + 4} textAnchor="middle" className="th-ckey-sublabel">
                  {entry.minor}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="th-board th-circle-info">
        <div className="th-board-title">
          <span className="dot" />
          {k.major} major / {k.minor}
        </div>

        <dl className="th-facts">
          <dt>Key signature</dt>
          <dd>
            {k.sig}
            {k.accidentals !== '—' && (
              <span className="th-accidentals"> ({k.accidentals})</span>
            )}
          </dd>
          <dt>Relative minor</dt>
          <dd>{k.minor} — the same notes with a darker home base</dd>
          <dt>Friendly neighbors</dt>
          <dd>
            {left.major} and {right.major} — one step around the circle shares
            6 of 7 notes, so borrowing between them sounds smooth
          </dd>
          <dt>Why guitarists care</dt>
          <dd>
            Moving clockwise adds a sharp (brighter), counter-clockwise adds a
            flat (mellower). Songs usually pick keys near the top — more open
            strings, easier shapes.
          </dd>
        </dl>

        <button className="th-playscale" onClick={playScale}>
          ▸ Hear the {k.major} major scale
        </button>
      </div>
    </div>
  )
}

/* ---------------- Intervals ---------------- */

function IntervalsSection({ sound }: { sound: boolean }) {
  const [root, setRoot] = useState(0) // C
  const timeouts = useRef<number[]>([])
  const base = 48 + root // C3..B3 — comfortable guitar register

  function playInterval(semis: number) {
    if (!sound) return
    timeouts.current.forEach(clearTimeout)
    timeouts.current = [
      window.setTimeout(() => playNote(base), 0),
      window.setTimeout(() => playNote(base + semis), 450),
      window.setTimeout(() => {
        playNote(base)
        playNote(base + semis)
      }, 1050),
    ]
  }

  return (
    <>
      <div className="th-panel">
        <div className="th-keypick">
          <span className="gt-label">From the note</span>
          <div className="th-pills">
            {NOTES.map((n, i) => (
              <button
                key={n}
                className={`th-pill ${root === i ? 'is-active' : ''}`}
                onClick={() => setRoot(i)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <p className="th-footnote" style={{ marginTop: 10 }}>
          An interval is just the distance between two notes — and each
          distance has its own mood. On guitar, semitones = frets.
        </p>
      </div>

      <div className="th-board">
        <div className="th-board-header">
          <div className="th-board-title">
            <span className="dot" />
            Intervals from {NOTES[root]}
          </div>
          <div className="th-count">CLICK ▸ TO HEAR IT</div>
        </div>

        <div className="th-intervals">
          {INTERVALS.map((iv) => (
            <div className="th-interval" key={iv.semis}>
              <button
                className="th-int-play"
                onClick={() => playInterval(iv.semis)}
                aria-label={`Play ${iv.name}`}
              >
                ▸
              </button>
              <span className="th-int-name">
                {iv.name} <em>{iv.short}</em>
              </span>
              <span className="th-int-notes">
                {NOTES[root]} → {NOTES[mod12(root + iv.semis)]}
              </span>
              <span className="th-int-frets">
                {iv.semis} {iv.semis === 1 ? 'fret' : 'frets'}
              </span>
              <span className="th-int-feel">{iv.feel}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------------- Glossary ---------------- */

function GlossarySection() {
  const [filter, setFilter] = useState('')
  const entries = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return GLOSSARY
    return GLOSSARY.filter(
      (e) =>
        e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q),
    )
  }, [filter])

  return (
    <div className="th-board">
      <div className="th-board-header">
        <div className="th-board-title">
          <span className="dot" />
          Plain-English glossary
        </div>
        <input
          className="th-search"
          type="search"
          placeholder="Search terms…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {entries.length === 0 ? (
        <p className="th-footnote">No terms match "{filter}".</p>
      ) : (
        <dl className="th-glossary">
          {entries.map((e) => (
            <div className="th-gloss-entry" key={e.term}>
              <dt>{e.term}</dt>
              <dd>{e.def}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
