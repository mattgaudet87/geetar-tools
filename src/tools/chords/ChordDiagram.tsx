import { TUNING, type Voicing } from './chords'

/*
 * Renders one voicing as a vertical chord chart (SVG):
 *   - 6 vertical strings (low E on the left), 5 fret rows
 *   - O / X markers above the nut for open / muted strings
 *   - dots for fretted notes; root notes tinted emerald
 *   - a barre bar when one fret is held across several strings
 *   - a fret-position label when the shape sits up the neck
 * Clicking the diagram strums the chord.
 */

const S = 6 // strings
const ROWS = 5 // fret rows shown
const DX = 17 // string spacing
const DY = 21 // fret spacing
const PAD_X = 18
const PAD_TOP = 22
const PAD_BOTTOM = 8
const DOT_R = 6.5

const boardW = (S - 1) * DX
const boardH = ROWS * DY
const svgW = PAD_X * 2 + boardW
const svgH = PAD_TOP + boardH + PAD_BOTTOM

const stringX = (i: number) => PAD_X + i * DX
const fretLineY = (r: number) => PAD_TOP + r * DY

export function ChordDiagram({
  voicing,
  root,
  onPlay,
}: {
  voicing: Voicing
  root: number
  onPlay: () => void
}) {
  const { frets } = voicing
  const fretted = frets.filter((f): f is number => f != null && f > 0)
  const maxF = fretted.length ? Math.max(...fretted) : 0
  const minF = fretted.length ? Math.min(...fretted) : 0
  const showNut = maxF <= ROWS
  const startFret = showNut ? 1 : minF

  const isRoot = (s: number, f: number) => (TUNING[s] + f) % 12 === root

  // Barre: the lowest fretted fret held across 2+ strings.
  let barre: { fret: number; from: number; to: number } | null = null
  if (fretted.length) {
    const onMin: number[] = []
    frets.forEach((f, s) => {
      if (f === minF) onMin.push(s)
    })
    if (onMin.length >= 2) {
      barre = { fret: minF, from: Math.min(...onMin), to: Math.max(...onMin) }
    }
  }

  const rowForFret = (f: number) => f - startFret + 1 // 1..ROWS

  return (
    <button className="ch-diagram" onClick={onPlay} aria-label="Play chord">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%">
        {/* Strings */}
        {Array.from({ length: S }, (_, i) => (
          <line
            key={`s${i}`}
            x1={stringX(i)}
            y1={fretLineY(0)}
            x2={stringX(i)}
            y2={fretLineY(ROWS)}
            stroke="var(--ch-line)"
            strokeWidth={1}
          />
        ))}

        {/* Fret wires */}
        {Array.from({ length: ROWS + 1 }, (_, r) => (
          <line
            key={`f${r}`}
            x1={stringX(0)}
            y1={fretLineY(r)}
            x2={stringX(S - 1)}
            y2={fretLineY(r)}
            stroke="var(--ch-line)"
            strokeWidth={r === 0 && showNut ? 4 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Position label when the window starts up the neck */}
        {!showNut && (
          <text
            x={stringX(0) - 9}
            y={fretLineY(1) - DY / 2 + 4}
            textAnchor="end"
            className="ch-fretlabel"
          >
            {startFret}fr
          </text>
        )}

        {/* Open / muted markers */}
        {frets.map((f, s) => {
          const y = PAD_TOP - 9
          if (f == null) {
            return (
              <text key={`m${s}`} x={stringX(s)} y={y + 4} textAnchor="middle" className="ch-mark">
                ×
              </text>
            )
          }
          if (f === 0) {
            return (
              <circle
                key={`m${s}`}
                cx={stringX(s)}
                cy={y}
                r={4}
                fill="none"
                stroke={isRoot(s, 0) ? 'var(--accent-bright)' : 'var(--ch-mark)'}
                strokeWidth={1.4}
              />
            )
          }
          return null
        })}

        {/* Barre */}
        {barre && (
          <rect
            x={stringX(barre.from) - DOT_R}
            y={fretLineY(rowForFret(barre.fret)) - DY / 2 - DOT_R}
            width={stringX(barre.to) - stringX(barre.from) + DOT_R * 2}
            height={DOT_R * 2}
            rx={DOT_R}
            fill="var(--ch-dot)"
          />
        )}

        {/* Fretted dots */}
        {frets.map((f, s) => {
          if (f == null || f === 0) return null
          const cx = stringX(s)
          const cy = fretLineY(rowForFret(f)) - DY / 2
          const rootNote = isRoot(s, f)
          if (barre && f === barre.fret && s >= barre.from && s <= barre.to && !rootNote) {
            return null // covered by the barre bar
          }
          return (
            <circle
              key={`d${s}`}
              cx={cx}
              cy={cy}
              r={DOT_R}
              fill={rootNote ? 'var(--accent-bright)' : 'var(--ch-dot)'}
              stroke={rootNote ? 'rgba(140,255,210,0.6)' : 'none'}
              strokeWidth={rootNote ? 1 : 0}
            />
          )
        })}
      </svg>
    </button>
  )
}
