import { useEffect, useRef, useState } from 'react'
import { Brand } from '../../shared/Brand'
import './metronome.css'

const MIN_BPM = 40
const MAX_BPM = 240
const MIN_BEATS = 1
const MAX_BEATS = 12

// Italian tempo markings by BPM range.
function tempoTerm(bpm: number): string {
  if (bpm < 60) return 'Largo'
  if (bpm < 76) return 'Adagio'
  if (bpm < 108) return 'Andante'
  if (bpm < 120) return 'Moderato'
  if (bpm < 168) return 'Allegro'
  if (bpm < 200) return 'Presto'
  return 'Prestissimo'
}

const clampBpm = (n: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(n)))

export function MetronomeTool() {
  const [bpm, setBpm] = useState(120)
  const [beats, setBeats] = useState(4)
  const [accent, setAccent] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)

  // Web Audio scheduler state (mutable refs so the scheduler always sees latest).
  const ctxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const beatInBarRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const queueRef = useRef<{ beat: number; time: number }[]>([])

  const bpmRef = useRef(bpm)
  bpmRef.current = bpm
  const beatsRef = useRef(beats)
  beatsRef.current = beats
  const accentRef = useRef(accent)
  accentRef.current = accent

  const tapsRef = useRef<number[]>([])

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      ctxRef.current = new Ctor()
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }

  function playClick(time: number, isAccent: boolean) {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(isAccent ? 1760 : 920, time)
    const peak = isAccent ? 0.5 : 0.3
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.06)
  }

  // The lookahead scheduler: schedule any beats falling within the next 100ms.
  function scheduler() {
    const ctx = getCtx()
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const beat = beatInBarRef.current
      const isAccent = accentRef.current && beat === 0
      playClick(nextNoteTimeRef.current, isAccent)
      queueRef.current.push({ beat, time: nextNoteTimeRef.current })
      nextNoteTimeRef.current += 60 / bpmRef.current
      beatInBarRef.current = (beat + 1) % beatsRef.current
    }
    timerRef.current = window.setTimeout(scheduler, 25)
  }

  // Visual loop: light up a beat dot when the audio clock reaches its time.
  function draw() {
    const ctx = ctxRef.current
    if (ctx) {
      while (queueRef.current.length && queueRef.current[0].time <= ctx.currentTime) {
        setCurrentBeat(queueRef.current[0].beat)
        queueRef.current.shift()
      }
    }
    rafRef.current = requestAnimationFrame(draw)
  }

  useEffect(() => {
    if (playing) {
      const ctx = getCtx()
      beatInBarRef.current = 0
      nextNoteTimeRef.current = ctx.currentTime + 0.06
      queueRef.current = []
      scheduler()
      rafRef.current = requestAnimationFrame(draw)
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      timerRef.current = null
      rafRef.current = null
      queueRef.current = []
      setCurrentBeat(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  function tapTempo() {
    const now = performance.now()
    const recent = tapsRef.current.filter((t) => now - t < 2000)
    recent.push(now)
    tapsRef.current = recent
    if (recent.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i - 1])
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
      setBpm(clampBpm(60000 / avg))
    }
  }

  const fill = ((bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100

  return (
    <div className="mt-page">
      <div className="mt-header">
        <Brand wordmark="Geetar Tool" />
      </div>

      <div className="mt-card">
        <div className="mt-term">{tempoTerm(bpm)}</div>
        <div className="mt-bpm">
          <span className="mt-bpm-num">{bpm}</span>
          <span className="mt-bpm-unit">BPM</span>
        </div>

        <div className="mt-beatdots">
          {Array.from({ length: beats }, (_, i) => (
            <span
              key={i}
              className={
                'mt-beatdot' +
                (i === 0 && accent ? ' is-accent' : '') +
                (i === currentBeat ? ' is-on' : '')
              }
            />
          ))}
        </div>

        <input
          className="mt-slider"
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ ['--fill' as string]: `${fill}%` }}
          aria-label="Tempo"
        />

        <div className="mt-adjust">
          <button onClick={() => setBpm((b) => clampBpm(b - 5))}>−5</button>
          <button onClick={() => setBpm((b) => clampBpm(b - 1))}>−</button>
          <button onClick={() => setBpm((b) => clampBpm(b + 1))}>+</button>
          <button onClick={() => setBpm((b) => clampBpm(b + 5))}>+5</button>
        </div>

        <div className="mt-row">
          <div className="mt-unit">
            <span className="gt-label">Beats</span>
            <div className="mt-stepper">
              <button
                aria-label="Fewer beats"
                onClick={() => setBeats((b) => Math.max(MIN_BEATS, b - 1))}
              >
                −
              </button>
              <span className="val">{beats}</span>
              <button
                aria-label="More beats"
                onClick={() => setBeats((b) => Math.min(MAX_BEATS, b + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-unit">
            <span className="gt-label">Accent</span>
            <button
              className={`mt-toggle ${accent ? 'is-on' : 'is-off'}`}
              onClick={() => setAccent((a) => !a)}
            >
              <span className="dot" />
              {accent ? 'On' : 'Off'}
            </button>
          </div>

          <button className="mt-tap" onClick={tapTempo}>
            TAP
          </button>
        </div>

        <button
          className={`mt-play ${playing ? 'is-playing' : ''}`}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  )
}
