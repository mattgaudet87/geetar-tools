/*
 * Data tables for the Music Theory tool: diatonic chord patterns, common
 * progressions, the circle of fifths, intervals, rules of thumb, and a
 * plain-English glossary. No React, no DOM.
 */

/** Diatonic chords of the major and natural-minor keys. */
export const DIATONIC = {
  major: {
    label: 'Major',
    degrees: [0, 2, 4, 5, 7, 9, 11],
    qualities: ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'],
    numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  },
  minor: {
    label: 'Minor',
    degrees: [0, 2, 3, 5, 7, 8, 10],
    qualities: ['Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'],
    numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  },
} as const

export type KeyMode = keyof typeof DIATONIC

export interface Progression {
  name: string
  numerals: string[]
  vibe: string
}

export const PROGRESSIONS: Record<KeyMode, Progression[]> = {
  major: [
    {
      name: 'The classic',
      numerals: ['I', 'IV', 'V', 'I'],
      vibe: 'The backbone of country, folk, rock and blues.',
    },
    {
      name: 'The pop anthem',
      numerals: ['I', 'V', 'vi', 'IV'],
      vibe: 'Thousands of hit songs use exactly these four chords.',
    },
    {
      name: 'The doo-wop',
      numerals: ['I', 'vi', 'IV', 'V'],
      vibe: 'Instant 1950s warmth; loops forever.',
    },
    {
      name: 'The jazz turnaround',
      numerals: ['ii', 'V', 'I'],
      vibe: 'The most common move in jazz — tension, more tension, home.',
    },
    {
      name: 'The emotional build',
      numerals: ['vi', 'IV', 'I', 'V'],
      vibe: 'Same chords as the pop anthem, started on the sad one.',
    },
  ],
  minor: [
    {
      name: 'The minor epic',
      numerals: ['i', 'VI', 'III', 'VII'],
      vibe: 'Big, cinematic, endlessly loopable.',
    },
    {
      name: 'The brooding classic',
      numerals: ['i', 'iv', 'v', 'i'],
      vibe: 'Dark and traditional — the minor cousin of I–IV–V.',
    },
    {
      name: 'The andalusian',
      numerals: ['i', 'VII', 'VI', 'v'],
      vibe: 'A falling staircase — flamenco and classic rock love it.',
    },
    {
      name: 'The soft landing',
      numerals: ['i', 'VI', 'VII', 'i'],
      vibe: 'Rises up and settles back home.',
    },
  ],
}

export const RULES: Record<'writing' | 'solos', { title: string; items: string[] }> = {
  writing: {
    title: 'Writing progressions — rules of thumb',
    items: [
      'Stay diatonic to start: the 7 chords of a key always sound like they belong together. Pick any 3–4 and you have a song.',
      'The I chord (the key itself) is home. Start there and end there to sound finished; end a section on V to leave the listener hanging.',
      'V pulls to I harder than any other move in music. When in doubt, put a V right before your I.',
      'IV and V are the workhorses; vi is the built-in sad chord of every major key.',
      'Most hit songs use 3 or 4 chords. Complexity is a spice, not the meal.',
      'Steal structure, not chords: take a progression you love and swap one chord at a time until it feels like yours.',
      'Want a lift without changing chords? Move the capo up 2 frets and play the same shapes.',
    ],
  },
  solos: {
    title: 'Building solos — rules of thumb',
    items: [
      'The minor pentatonic of the key works over almost everything in that key. It is the "can\'t-miss" scale for a reason.',
      'Over a major key, the major pentatonic sounds sweet and country; the relative minor pentatonic (down 3 frets) sounds bluesy. Same six strings, different attitude.',
      'Land your phrases on a chord tone — the root, 3rd or 5th of whatever chord is playing underneath. That is what "playing the changes" means.',
      'The root always works. The 3rd tells the story (major = happy, minor = sad). The ♭7 adds attitude.',
      'Phrase like a singer: short ideas with space between them beat an unbroken stream of notes.',
      'Repetition is not boring, it is a hook. Play a lick, repeat it, then change the ending.',
      'Bends and slides into a chord tone sound more vocal than landing on it cold.',
    ],
  },
}

/**
 * Circle of fifths, clockwise from C at 12 o'clock.
 * Conventional key names (flats on the left side), pitch class for audio.
 */
export interface CircleKey {
  major: string
  minor: string
  pc: number
  sig: string
  accidentals: string
}

export const CIRCLE: CircleKey[] = [
  { major: 'C', minor: 'Am', pc: 0, sig: 'No sharps or flats', accidentals: '—' },
  { major: 'G', minor: 'Em', pc: 7, sig: '1 sharp', accidentals: 'F♯' },
  { major: 'D', minor: 'Bm', pc: 2, sig: '2 sharps', accidentals: 'F♯ C♯' },
  { major: 'A', minor: 'F♯m', pc: 9, sig: '3 sharps', accidentals: 'F♯ C♯ G♯' },
  { major: 'E', minor: 'C♯m', pc: 4, sig: '4 sharps', accidentals: 'F♯ C♯ G♯ D♯' },
  { major: 'B', minor: 'G♯m', pc: 11, sig: '5 sharps', accidentals: 'F♯ C♯ G♯ D♯ A♯' },
  { major: 'F♯', minor: 'D♯m', pc: 6, sig: '6 sharps (= G♭, 6 flats)', accidentals: 'F♯ C♯ G♯ D♯ A♯ E♯' },
  { major: 'D♭', minor: 'B♭m', pc: 1, sig: '5 flats', accidentals: 'B♭ E♭ A♭ D♭ G♭' },
  { major: 'A♭', minor: 'Fm', pc: 8, sig: '4 flats', accidentals: 'B♭ E♭ A♭ D♭' },
  { major: 'E♭', minor: 'Cm', pc: 3, sig: '3 flats', accidentals: 'B♭ E♭ A♭' },
  { major: 'B♭', minor: 'Gm', pc: 10, sig: '2 flats', accidentals: 'B♭ E♭' },
  { major: 'F', minor: 'Dm', pc: 5, sig: '1 flat', accidentals: 'B♭' },
]

export interface IntervalDef {
  semis: number
  name: string
  short: string
  feel: string
}

export const INTERVALS: IntervalDef[] = [
  { semis: 0, name: 'Unison', short: 'P1', feel: 'The same note. Zero distance.' },
  { semis: 1, name: 'Minor 2nd', short: 'm2', feel: 'Maximum tension — the creeping-shark movie theme.' },
  { semis: 2, name: 'Major 2nd', short: 'M2', feel: 'A whole step — the basic building block of scales.' },
  { semis: 3, name: 'Minor 3rd', short: 'm3', feel: 'The "sad" third. It is what makes minor chords minor.' },
  { semis: 4, name: 'Major 3rd', short: 'M3', feel: 'The "happy" third. It is what makes major chords major.' },
  { semis: 5, name: 'Perfect 4th', short: 'P4', feel: 'Open and sturdy — a wedding-march opening.' },
  { semis: 6, name: 'Tritone', short: 'TT', feel: 'The most unstable interval — cartoon-villain energy.' },
  { semis: 7, name: 'Perfect 5th', short: 'P5', feel: 'Strong and hollow. Root + 5th = the power chord.' },
  { semis: 8, name: 'Minor 6th', short: 'm6', feel: 'Bittersweet and dramatic.' },
  { semis: 9, name: 'Major 6th', short: 'M6', feel: 'Warm and open — an old broadcast chime.' },
  { semis: 10, name: 'Minor 7th', short: 'm7', feel: 'Bluesy and unresolved — it wants to fall one step.' },
  { semis: 11, name: 'Major 7th', short: 'M7', feel: 'Dreamy, jazzy shimmer, one step from home.' },
  { semis: 12, name: 'Octave', short: 'P8', feel: 'The same note again, higher. A leap that feels like arrival.' },
]

export interface GlossaryEntry {
  term: string
  def: string
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Semitone (half step)', def: 'The smallest distance between two notes — one fret on the guitar.' },
  { term: 'Whole step', def: 'Two semitones — two frets on the guitar.' },
  { term: 'Interval', def: 'The distance between two notes, measured in semitones. Every interval has its own sound and mood.' },
  { term: 'Octave', def: 'The same note at double (or half) the frequency — 12 frets up the same string.' },
  { term: 'Scale', def: 'A set of notes that sound good together, in order. Most scales have 7 notes; pentatonics have 5.' },
  { term: 'Key', def: 'The home base of a song — which scale the song lives in and which note feels like "home".' },
  { term: 'Root', def: 'The note a chord or scale is built from and named after. The root of C major is C.' },
  { term: 'Chord', def: 'Three or more notes played together. Built by stacking notes from a scale.' },
  { term: 'Triad', def: 'The basic 3-note chord: root, 3rd and 5th. Major and minor chords are triads.' },
  { term: 'Seventh chord', def: 'A triad with one more note stacked on top (the 7th). Adds color: jazzy (maj7), bluesy (7) or moody (m7).' },
  { term: 'Progression', def: 'A repeating sequence of chords — the harmonic loop a song is built on.' },
  { term: 'Diatonic', def: 'Made only from the notes of the current key. Diatonic chords always sound like they belong.' },
  { term: 'Roman numerals', def: 'A way to name chords by their position in the key: I is the home chord, V the fifth, etc. Uppercase = major, lowercase = minor. Works in every key.' },
  { term: 'Relative major / minor', def: 'Every major key has a minor twin with exactly the same notes (C major ↔ A minor). The minor twin starts 3 semitones down.' },
  { term: 'Pentatonic', def: 'A 5-note scale with the clashing notes removed. The go-to scale for solos.' },
  { term: 'Blues scale', def: 'The minor pentatonic plus one extra note (the ♭5, "blue note") for grit.' },
  { term: 'Cadence', def: 'How a phrase of chords ends. V → I sounds finished; ending anywhere else leaves tension.' },
  { term: 'Resolution', def: 'The feeling of tension releasing — usually landing back on the I chord or the root note.' },
  { term: 'Tonic / Dominant', def: 'Fancy names for the I chord (tonic — home) and the V chord (dominant — the chord that most wants to go home).' },
  { term: 'Arpeggio', def: 'A chord played one note at a time instead of strummed.' },
  { term: 'Voicing', def: 'A specific way of arranging the notes of one chord — the same chord can be played many ways up the neck.' },
  { term: 'Inversion', def: 'A chord with a note other than the root in the bass. Written as a slash chord: C/E is C major with E on the bottom.' },
  { term: 'Slash chord', def: 'Chord-over-bass-note notation: G/B means "play G, put B in the bass".' },
  { term: 'Barre chord', def: 'A chord where one finger presses several strings — a movable shape that works anywhere on the neck.' },
  { term: 'Capo', def: 'A clamp that raises every open string. Lets you keep easy open shapes while sounding in a higher key.' },
  { term: 'Transpose', def: 'Moving a song or chord to a different pitch while keeping all the relationships the same.' },
  { term: 'Sharp / Flat', def: '♯ raises a note one semitone; ♭ lowers it one. A♯ and B♭ are the same fret with two names (enharmonic).' },
  { term: 'Tempo (BPM)', def: 'The speed of a song, in beats per minute.' },
  { term: 'Time signature', def: 'How beats are grouped: 4/4 = count to four (most songs), 3/4 = count to three (waltz).' },
]
