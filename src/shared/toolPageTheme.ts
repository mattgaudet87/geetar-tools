/*
 * Per-tool page finish — "On the board" tool-page reskin (part 2 of the
 * pedalboard redesign). Each tool page is that pedal's own corner of the
 * board: a page gradient + border lifted from the hub enclosure, and a
 * single accent lifted from the hub LED. Serials match the hub tile order.
 *
 * Only Scales and Chords are wired up to this so far — the other four keep
 * their original look until they're reskinned too.
 */
export interface ToolPageTheme {
  /** GT-01 .. GT-06, shown in the header, matching the hub tile. */
  serial: string
  /** Full-page background gradient, top to bottom. */
  pageTop: string
  pageBot: string
  /** Hairline frame colour for the page. */
  pageEdge: string
  /** The tool's single accent (= hub LED colour). */
  accent: string
  /** Solid mid-tone of the hub enclosure — icon discs, inline primaries. */
  finish: string
}

export const TOOL_PAGE_THEME: Record<string, ToolPageTheme> = {
  scales: {
    serial: 'GT-01',
    pageTop: '#241715',
    pageBot: '#17100f',
    pageEdge: '#5f2c2a',
    accent: '#f0a58e',
    finish: '#8a4340',
  },
  chords: {
    serial: 'GT-02',
    pageTop: '#221e12',
    pageBot: '#16130e',
    pageEdge: '#56491f',
    accent: '#f3d68f',
    finish: '#7c6a33',
  },
  transpose: {
    serial: 'GT-03',
    pageTop: '#171d19',
    pageBot: '#101310',
    pageEdge: '#2b2f29',
    accent: '#a8dcc0',
    finish: '#3f4a42',
  },
  theory: {
    serial: 'GT-04',
    pageTop: '#221810',
    pageBot: '#16100b',
    pageEdge: '#493425',
    accent: '#efbf95',
    finish: '#6b4d34',
  },
  tuner: {
    serial: 'GT-05',
    pageTop: '#161d20',
    pageBot: '#0f1315',
    pageEdge: '#2c3538',
    accent: '#9fd2e0',
    finish: '#40525a',
  },
  metronome: {
    serial: 'GT-06',
    pageTop: '#1e1722',
    pageBot: '#120e15',
    pageEdge: '#413349',
    accent: '#d9b8e4',
    finish: '#5d4a63',
  },
}
