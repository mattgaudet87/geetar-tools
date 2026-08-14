import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from './Brand'
import { playPedalSwitch } from './sfx'
import { TOOLS } from '../tools/registry'

/*
 * The hub / landing page for Geetar Tools — a pedalboard. Every tool in the
 * registry gets a painted stompbox: serial number, LED, icon disc, name, blurb
 * and a footswitch knob. Tapping anywhere on a pedal opens that tool (and
 * clicks the switch). Not-yet-ready tools sit on the board unlit.
 *
 * Layout, states and the phone breakpoints are all in `.gt-*` classes in
 * theme.css; each tile only passes its own finish down as custom properties.
 */

interface Finish {
  /** Enclosure gradient, top to bottom. */
  top: string
  bot: string
  /** Enclosure border. */
  edge: string
  /** Icon-disc fill — a dark tint of the finish. */
  disc: string
  /** LED colour, and the same colour at glow alpha. */
  led: string
  glow: string
  /** Alpha of the inset highlight along the top edge. */
  hi: number
  /** Name on the tile, when it differs from the registry name. */
  tile?: string
  /** Name on phones, where the tile is half as wide. */
  tilePhone?: string
  /** One-line blurb for phones. */
  brief: string
}

const FINISHES: Record<string, Finish> = {
  scales: {
    top: '#95504c',
    bot: '#7f3d3a',
    edge: '#5f2c2a',
    disc: 'rgba(20,14,12,0.5)',
    led: '#f0a58e',
    glow: 'rgba(240,165,142,0.9)',
    hi: 0.22,
    brief: 'Every note, any scale.',
  },
  chords: {
    top: '#8a7638',
    bot: '#71602c',
    edge: '#56491f',
    disc: 'rgba(20,16,10,0.5)',
    led: '#f3d68f',
    glow: 'rgba(243,214,143,0.9)',
    hi: 0.22,
    brief: 'Every quality and shape.',
  },
  transpose: {
    top: '#4b5148',
    bot: '#393e37',
    edge: '#2b2f29',
    disc: 'rgba(12,14,12,0.5)',
    led: '#a8dcc0',
    glow: 'rgba(168,220,192,0.85)',
    hi: 0.2,
    brief: 'New key or capo.',
  },
  theory: {
    top: '#77573d',
    bot: '#614631',
    edge: '#493425',
    disc: 'rgba(18,12,8,0.5)',
    led: '#efbf95',
    glow: 'rgba(239,191,149,0.9)',
    hi: 0.22,
    tile: 'Theory',
    brief: 'Keys, intervals, glossary.',
  },
  tuner: {
    top: '#4d5b60',
    bot: '#3b464a',
    edge: '#2c3538',
    disc: 'rgba(10,14,15,0.5)',
    led: '#9fd2e0',
    glow: 'rgba(159,210,224,0.85)',
    hi: 0.2,
    brief: 'By ear or by mic.',
  },
  metronome: {
    top: '#6d5a70',
    bot: '#584860',
    edge: '#413349',
    disc: 'rgba(14,10,16,0.5)',
    led: '#d9b8e4',
    glow: 'rgba(217,184,228,0.85)',
    hi: 0.2,
    tilePhone: 'Metro',
    brief: 'Adjustable tempo.',
  },
}

/** Finish for a tool added to the registry without one painted yet. */
const UNPAINTED: Finish = {
  top: '#4b4640',
  bot: '#393530',
  edge: '#2b2823',
  disc: 'rgba(14,12,10,0.5)',
  led: '#d8cbb8',
  glow: 'rgba(216,203,184,0.85)',
  hi: 0.2,
  brief: '',
}

export function Hub() {
  // The board is a flat, warm dark — not the app's usual radial gradient — so
  // it goes on the body and comes back off when you open a tool.
  useEffect(() => {
    document.body.classList.add('gt-board-bg')
    return () => document.body.classList.remove('gt-board-bg')
  }, [])

  return (
    <div className="gt-hub">
      <header className="gt-hub-head">
        <Brand />
        <span className="gt-hub-hint">Stomp one to start</span>
      </header>

      <div className="gt-hub-grid">
        {TOOLS.map((tool, i) => {
          const f = FINISHES[tool.id] ?? UNPAINTED
          const style = {
            '--pedal-top': f.top,
            '--pedal-bot': f.bot,
            '--pedal-edge': f.edge,
            '--pedal-disc': f.disc,
            '--pedal-led': f.led,
            '--pedal-led-glow': f.glow,
            '--pedal-hi': f.hi,
          } as CSSProperties

          const name = f.tile ?? tool.name
          const inner = (
            <>
              <span className="gt-pedal-row" aria-hidden>
                <span className="gt-pedal-serial">
                  GT-{String(i + 1).padStart(2, '0')}
                </span>
                <span className="gt-pedal-led" />
              </span>
              <span className="gt-pedal-name-row">
                <span className="gt-pedal-disc" aria-hidden>
                  {tool.mark}
                </span>
                <span className="gt-pedal-name">
                  <span className="gt-pedal-full">{name}</span>
                  <span className="gt-pedal-short">{f.tilePhone ?? name}</span>
                </span>
              </span>
              <span className="gt-pedal-blurb">
                <span className="gt-pedal-full">
                  {tool.ready ? tool.blurb : `${tool.blurb} — coming soon.`}
                </span>
                <span className="gt-pedal-short">
                  {tool.ready ? f.brief : 'Coming soon.'}
                </span>
              </span>
              <span className="gt-pedal-foot" aria-hidden>
                <span className="gt-pedal-knob" />
              </span>
            </>
          )

          return tool.ready ? (
            <Link
              key={tool.id}
              to={`/${tool.path}`}
              className="gt-pedal"
              style={style}
              onClick={playPedalSwitch}
            >
              {inner}
            </Link>
          ) : (
            <span key={tool.id} className="gt-pedal gt-pedal-off" style={style}>
              {inner}
            </span>
          )
        })}
      </div>
    </div>
  )
}
