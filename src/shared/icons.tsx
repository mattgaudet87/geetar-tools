/*
 * Clean line-style icons for the tool hub cards. They inherit color via
 * `currentColor`, so the hub controls their tint.
 */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** Fretboard with inlay dots — for the Scales tool. */
export function ScalesIcon() {
  return (
    <svg {...base} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <line x1="8" y1="5" x2="8" y2="19" />
      <line x1="13" y1="5" x2="13" y2="19" />
      <line x1="17.5" y1="5" x2="17.5" y2="19" />
      <circle cx="10.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.25" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Gauge with a needle — for the Tuner tool. */
export function TunerIcon() {
  return (
    <svg {...base} aria-hidden>
      <path d="M4 16 a8 8 0 0 1 16 0" />
      <line x1="12" y1="16" x2="15.5" y2="9.5" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Classic metronome with pendulum — for the Metronome tool. */
export function MetronomeIcon() {
  return (
    <svg {...base} aria-hidden>
      <path d="M9 4 h6 l3.5 16 h-13 Z" />
      <line x1="5.5" y1="15" x2="18.5" y2="15" />
      <line x1="12" y1="18.5" x2="14.5" y2="7.5" />
    </svg>
  )
}
