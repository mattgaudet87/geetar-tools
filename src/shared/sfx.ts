/*
 * App-wide sound effects.
 *
 * Two one-shot samples live in public/sounds/:
 *   pedal-switch — the stompbox click, played when a tool is opened or exited
 *   metro        — the metronome flourish, played once when the Metronome opens
 *
 * Audio elements are created lazily (so nothing loads until first use) and then
 * reused, with currentTime reset so rapid clicks always retrigger. play() can be
 * rejected by autoplay policy (e.g. landing on a tool URL directly, with no user
 * gesture yet) — that's harmless here, so the rejection is swallowed.
 */

const SOURCES = {
  pedal: '/sounds/pedal-switch.mp3',
  metro: '/sounds/metro.mp3',
} as const

type SfxName = keyof typeof SOURCES

const cache: Partial<Record<SfxName, HTMLAudioElement>> = {}

/** Both samples played at a quarter of their original recorded volume. */
const VOLUME = 0.25

function get(name: SfxName): HTMLAudioElement {
  let el = cache[name]
  if (!el) {
    el = new Audio(SOURCES[name])
    el.preload = 'auto'
    el.volume = VOLUME
    cache[name] = el
  }
  return el
}

function play(name: SfxName): HTMLAudioElement {
  const el = get(name)
  el.currentTime = 0
  void el.play().catch(() => {})
  return el
}

// Warm both samples at app boot. This costs one small request each, and means
// `duration` is already known by the time anyone clicks — which the metronome
// relies on to know how long to wait for the pedal click to finish.
get('pedal')
get('metro')

/** performance.now() timestamp at which the last pedal click should finish. */
let pedalEndsAt = 0

/** Fallback used if the mp3's metadata somehow hasn't loaded yet. */
const PEDAL_FALLBACK_MS = 1000

/** The stompbox click. Call when entering or leaving a tool. */
export function playPedalSwitch(): void {
  const el = play('pedal')
  const ms =
    Number.isFinite(el.duration) && el.duration > 0
      ? el.duration * 1000
      : PEDAL_FALLBACK_MS
  pedalEndsAt = performance.now() + ms
}

/** The pending metro timer, so only ever one is queued at a time. */
let metroTimer: number | null = null

/**
 * How early the metro comes in, in ms. The click and the metro overlap by this
 * much — raise it to bring the metro further forward, drop it to 0 to wait for
 * the click to finish.
 */
const METRO_LEAD_MS = 1000

/**
 * The metronome sound, queued to come in as the pedal click ends (overlapping
 * its tail by METRO_LEAD_MS). Any already-pending metro is dropped first, so a
 * double call only ever sounds once. Returns a cancel function so a component
 * that unmounts before the sound fires (a quick in-and-out) doesn't play it
 * over the next screen.
 */
export function playMetroAfterPedal(): () => void {
  if (metroTimer !== null) window.clearTimeout(metroTimer)
  const wait = Math.max(0, pedalEndsAt - performance.now() - METRO_LEAD_MS)
  metroTimer = window.setTimeout(() => {
    metroTimer = null
    play('metro')
  }, wait)
  return () => {
    if (metroTimer !== null) window.clearTimeout(metroTimer)
    metroTimer = null
  }
}
