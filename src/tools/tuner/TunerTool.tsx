import { useEffect, useRef, useState } from 'react'
import { ToolHeader } from '../../shared/ToolHeader'
import { autoCorrelate } from './pitch'
import {
  TUNING_NAMES,
  stringsFor,
  midiToFreq,
  freqToNote,
  type DetectedNote,
} from './notes'
import './tuner.css'

const IN_TUNE_CENTS = 5

export function TunerTool() {
  const [mode, setMode] = useState<'reference' | 'listen'>('reference')
  const [tuning, setTuning] = useState('Standard')

  return (
    <div className="tn-page">
      <ToolHeader wordmark="Geetar Tool" />

      <div className="tn-card">
        <div className="tn-modes">
          <div className="tn-seg">
            <button
              className={mode === 'reference' ? 'is-active' : ''}
              onClick={() => setMode('reference')}
            >
              Reference tones
            </button>
            <button
              className={mode === 'listen' ? 'is-active' : ''}
              onClick={() => setMode('listen')}
            >
              Listen (mic)
            </button>
          </div>
        </div>

        {mode === 'reference' ? (
          <ReferenceMode tuning={tuning} setTuning={setTuning} />
        ) : (
          <ListenMode />
        )}
      </div>
    </div>
  )
}

/* ---- Reference-tone mode: play each open string and tune by ear ---- */
function ReferenceMode({
  tuning,
  setTuning,
}: {
  tuning: string
  setTuning: (t: string) => void
}) {
  const [active, setActive] = useState<number | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const strings = stringsFor(tuning)

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

  function playString(midi: number, index: number) {
    const ctx = getCtx()
    const now = ctx.currentTime
    const freq = midiToFreq(midi)
    const dur = 1.6

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02)
    gain.gain.setValueAtTime(0.4, now + dur - 0.4)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    gain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)
    osc.connect(gain)

    const shimmer = ctx.createGain()
    shimmer.gain.setValueAtTime(0.12, now)
    shimmer.connect(gain)
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2, now)
    osc2.connect(shimmer)

    osc.start(now)
    osc2.start(now)
    osc.stop(now + dur)
    osc2.stop(now + dur)

    setActive(index)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setActive(null), dur * 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <>
      <div className="tn-tuning-select">
        <span className="gt-label">Tuning</span>
        <select
          className="gt-select"
          value={tuning}
          onChange={(e) => setTuning(e.target.value)}
        >
          {TUNING_NAMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <p className="tn-hint">
        Click a string to hear its pitch, then match your guitar by ear.
      </p>

      <div className="tn-strings">
        {strings.map((s, i) => (
          <button
            key={i}
            className={`tn-string ${active === i ? 'is-active' : ''}`}
            onClick={() => playString(s.midi, i)}
          >
            <span className="name">{s.label.replace(/\d+$/, '')}</span>
            <span className="freq">{midiToFreq(s.midi).toFixed(1)} Hz</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---- Listen mode: detect pitch from the microphone ---- */
function ListenMode() {
  const [listening, setListening] = useState(false)
  const [note, setNote] = useState<DetectedNote | null>(null)
  const [freq, setFreq] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const bufRef = useRef<Float32Array<ArrayBuffer> | null>(null)
  const lastRef = useRef(0)

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    analyserRef.current = null
    setListening(false)
    setNote(null)
    setFreq(null)
  }

  async function start() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      })
      streamRef.current = stream
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new Ctor()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      bufRef.current = new Float32Array(analyser.fftSize)
      setListening(true)
      tick()
    } catch {
      setError('Microphone access was blocked. Allow mic access to use Listen mode.')
      setListening(false)
    }
  }

  function tick() {
    rafRef.current = requestAnimationFrame(tick)
    const analyser = analyserRef.current
    const buf = bufRef.current
    const ctx = ctxRef.current
    if (!analyser || !buf || !ctx) return

    // Throttle the (relatively heavy) detection to ~20Hz.
    const now = performance.now()
    if (now - lastRef.current < 50) return
    lastRef.current = now

    analyser.getFloatTimeDomainData(buf)
    const f = autoCorrelate(buf, ctx.sampleRate)
    if (f > 0) {
      setFreq(f)
      setNote(freqToNote(f))
    } else {
      setFreq(null)
      setNote(null)
    }
  }

  useEffect(() => {
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cents = note?.cents ?? 0
  const inTune = note != null && Math.abs(cents) <= IN_TUNE_CENTS
  // Map cents (-50..50) to needle position (0..100%).
  const needleLeft = 50 + Math.max(-50, Math.min(50, cents))

  const noteClass = !note
    ? ''
    : inTune
      ? 'is-intune'
      : cents < 0
        ? 'is-flat'
        : 'is-sharp'

  return (
    <div className="tn-listen">
      <div className="tn-readout">
        <span className={`tn-note ${note ? noteClass : 'is-empty'}`}>
          {note ? note.name : '–'}
        </span>
        {note && <span className="tn-octave">{note.octave}</span>}
      </div>

      <div className={`tn-cents-label ${inTune ? 'is-intune' : ''}`}>
        {!listening
          ? 'Press listen and play a string'
          : !note
            ? 'Listening…'
            : inTune
              ? 'In tune ✓'
              : `${cents > 0 ? '+' : ''}${cents} cents ${cents < 0 ? '(flat)' : '(sharp)'}`}
      </div>

      <div className="tn-meter">
        <div className="tn-meter-ticks">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className="tn-meter-tick" />
          ))}
        </div>
        <div className="tn-meter-center" />
        {note && (
          <div
            className={`tn-needle ${inTune ? 'is-intune' : ''}`}
            style={{ left: `calc(${needleLeft}% - 2px)` }}
          />
        )}
      </div>
      <div className="tn-scale-labels">
        <span>♭ 50</span>
        <span>0</span>
        <span>♯ 50</span>
      </div>

      <div className="tn-freq">{freq ? `${freq.toFixed(1)} Hz` : ''}</div>

      <button
        className={`tn-mic ${listening ? 'is-listening' : ''}`}
        onClick={() => (listening ? stop() : start())}
      >
        {listening ? 'Stop listening' : 'Start listening'}
      </button>

      {error && <div className="tn-error">{error}</div>}
    </div>
  )
}
