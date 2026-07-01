# Handoff: Geetar Tool — Guitar Scale Visualizer

## Overview
Geetar Tool is a single-screen interactive web app for guitarists learning scales. The user picks a **root note**, a **scale type**, and a **tuning**, and the app renders a fretboard (frets 0–12+) showing every note in that scale. Each note dot displays either its **scale degree** or its **note name**. Clicking a dot plays the pitched note. The neck material (wood color), left-handed flip, and fret count are also configurable.

## About the Design Files
The file in this bundle — `Geetar Tool.dc.html` — is a **design reference created in HTML**. It is a working prototype that demonstrates the intended look, layout, and behavior. It is **not** production code to copy directly: it runs on a proprietary streaming-component runtime (`support.js`) and uses inline React-style props, which you should not port.

**Your task:** recreate this design in the target codebase's environment using its established patterns. If there is no existing codebase, the recommended stack is **Vite + React + TypeScript** (deploys to Vercel as a static SPA with zero config). The app is entirely client-side — no backend, no data fetching, no auth. All logic is pure functions over small constant tables (documented below).

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate the UI pixel-perfectly. All exact values are in the Design Tokens section.

---

## Screens / Views

There is **one screen**, a vertical stack centered in a `max-width: 1180px` column with `padding: 40px 28px 64px`. Top to bottom:

### 1. Header
- Left: a 34×34px rounded-square logo mark (radius 9px) with an emerald radial-gradient fill `radial-gradient(circle at 35% 30%, #7df0c0, #10b07f)`, glow `box-shadow: 0 0 18px rgba(52,211,153,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)`.
- Right of it: the wordmark **"Geetar Tool"** — Sora 800, 25px, `letter-spacing: -0.02em`, color `#f3f6fa`.
- `margin-bottom: 30px`. Logo + wordmark in a flex row, `gap: 14px`, `align-items: center`.

### 2. Controls panel (single unified card)
Card: `background: linear-gradient(180deg, #161d28, #131923)`, `border: 1px solid #242d3b`, `border-radius: 16px`, `padding: 6px 22px 4px`, `box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 14px 40px rgba(0,0,0,0.35)`. It contains four horizontal rows separated by `1px solid #1d2531` dividers:

**Row A — Toolbar** (`padding: 14px 0`, flex, `justify-content: flex-end`, `gap: 14px 22px`, wraps). Three label+control units, each a flex row with `gap: 9px`. Unit labels are Sora... no — **all small labels use JetBrains Mono, 10px, `letter-spacing: 0.16em`, uppercase, color `#6b7485`**.
  - **Dots** → segmented toggle: a pill container `background: #0f141d`, `border: 1px solid #242d3b`, `border-radius: 10px`, `padding: 3px`, holding two buttons "Degrees" / "Note names". Active segment: `background: rgba(52,211,153,0.16)`, color `#7ff0c4`. Inactive: transparent, color `#7b8492`. Segment button: `padding: 8px 15px`, `border-radius: 8px`, JetBrains Mono 600 12px, no border.
  - **Sound** → toggle button showing a 7px status dot + label "On"/"Off". On state: `background: rgba(52,211,153,0.12)`, `border: 1px solid rgba(52,211,153,0.45)`, color `#7ff0c4`, dot `#34d399` with `box-shadow: 0 0 8px #34d399`. Off state: `background: #141a24`, `border: 1px solid #28313f`, color `#8b93a3`, dot `#4a5161`. Button: `padding: 8px 13px`, `border-radius: 9px`, JetBrains Mono 600 12px.
  - **Neck** → native `<select>` (Walnut / Graphite / Maple). See "select" styling in tokens.

**Row B — Root** (`padding: 13px 0`, flex, `align-items: center`, `gap: 16px`, wraps). Fixed 52px label "ROOT" + a flex-wrap row (`gap: 6px`) of **12 pills**, one per chromatic note: C, C#, D, D#, E, F, F#, G, G#, A, A#, B. See "pill" styling.

**Row C — Scale** (same layout). Label "SCALE" + a flex-wrap row of **8 pills**: Major, Natural Minor, Dorian, Mixolydian, Lydian, Major Pentatonic, Minor Pentatonic, Blues.

**Row D — Tuning** (`padding: 13px 0`, no bottom divider). Label "TUNING" + a flex-wrap group (`gap: 16px`) containing:
  - A native `<select>` of tuning presets + "Custom".
  - A per-string editor: small "HIGH" label, then **6 stepper columns** (one per string, high→low), then "LOW" label. Each stepper column (`flex-direction: column`, `align-items: center`, `gap: 4px`) has: an up button (▲ `&#9650;`), a note box, a down button (▼ `&#9660;`). Stepper buttons: 26×20px, `background: #141a24`, `border: 1px solid #28313f`, color `#8b93a3`, `border-radius: 6px`, 9px glyph. Note box: `min-width: 34px`, centered, `padding: 5px 6px`, `border-radius: 7px`, `background: #0f141d`, `border: 1px solid #242d3b`, JetBrains Mono 700 13px, color `#dfe4ec` (or `#7ff0c4` if that string's open pitch equals the current root).

### 3. Scale strip
A flex row (`align-items: flex-end`, `gap: 16px`, `margin: 26px 2px 18px`, wraps). A "SCALE" label, then one small cluster per scale degree. Each cluster is a column: a tiny degree label on top (JetBrains Mono 600 11px, `margin-bottom: 5px`, color `#7b8492`, or `#52d6a0` for the root) over a note pill. Between clusters, a whole/half-step marker (`W`, `H`, `1½`, `2`) — JetBrains Mono 600 11px, color `#5a6273`, aligned to the pill baseline (`align-self: flex-end`, `margin-bottom: 10px`).
- Note pill: `min-width: 40px`, `padding: 8px 7px`, `border-radius: 8px`, JetBrains Mono 700 14px, centered. Root note pill: `background: rgba(52,211,153,0.14)`, `border: 1px solid rgba(52,211,153,0.55)`, color `#7ff0c4`. Other: `background: #161d28`, `border: 1px solid #2a3342`, color `#dfe4ec`.

### 4. Board panel (the fretboard)
Card: `background: linear-gradient(180deg, #10151e, #0c1118)`, `border: 1px solid #222a37`, `border-radius: 18px`, `padding: 22px 22px 18px`, `box-shadow: 0 18px 50px rgba(0,0,0,0.45)`.
- **Board header** (`margin-bottom: 18px`, flex, space-between): left = a 9px emerald dot (`#34d399`, `box-shadow: 0 0 10px rgba(52,211,153,0.7)`) + current scale label e.g. "A Major" (Sora 700, 19px, `#f3f6fa`); right = fret-range text e.g. "0–12 FRETS" (JetBrains Mono 11px, uppercase, `letter-spacing: 0.12em`, color `#5a6273`).
- **Fret-number row**: a 26px spacer (aligns with string-label column) + a flex row of fret numbers 0..N, each `flex: 1`, centered, JetBrains Mono 500 11px. Numbers at marker frets colored `#5d6a7d`, others `#465062`.
- **Board body**: a flex row of two parts:
  - **String-label column** (26px wide): 6 rows (54px tall each), each right-aligned (`padding-right: 9px`), JetBrains Mono 600 12px, color `#7b8492`, showing that string's open-note letter (high→low). For standard tuning: e, B, G, D, A, E — but labels are derived from the open pitch class, so they change with tuning.
  - **Fret surface** (`flex: 1`, `position: relative`, `border-radius: 12px`, `overflow: hidden`, `border: 1px solid rgba(0,0,0,0.55)`, `box-shadow: inset 0 2px 12px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.35)`), layered z-index bottom→top:
    1. **Board background** (`position: absolute; inset: 0`): the material gradient (see Materials).
    2. **Grain** (`position: absolute; inset: 0; opacity: 0.55`): `repeating-linear-gradient(180deg, transparent 0 5px, <grain> 5px 6px)`.
    3. **Inlay overlay** (`position: absolute; inset: 0; z-index: 1`; flex row of N+1 equal cells): single inlay dots at frets **3, 5, 7, 9, 15, 17, 19, 21**; double inlay (two dots stacked, `gap: 108px`) at every fret where `fret % 12 === 0 && fret > 0` (i.e. 12, 24). Inlay dot: 11px circle, color `<inlay>` per material.
    4. **Strings + dots** (`position: relative; z-index: 2`): 6 string rows stacked. Each row is `position: relative`, `display: flex`, `height: 54px`, with:
       - A horizontal **string line**: `position: absolute; top: 50%; left: 0; right: 0`, `height: <gauge>px`, `background: <str-color>`, `border-radius: 2px`, `box-shadow: 0 1px 1px rgba(0,0,0,0.55)`, `z-index: 1`. Gauges high→low: **1.3, 1.6, 2.0, 2.5, 3.1, 3.7 px**.
       - N+1 fret **cells** (`flex: 1`, 54px tall, centered, `z-index: 2`). Cell right border = the fret wire: fret 0 → `3px solid <nut>` (the nut); last fret → none; others → `1px solid <fret>`.
       - Inside a cell, **if** the note at that (string, fret) is in the scale, a **note dot** (see below).

### Note dot
39×39px circle, centered, JetBrains Mono 700 14px, `cursor: pointer`, `transition: transform .1s ease`, `hover: translateY(-1px) scale(1.1)`.
- **Root note dot**: `background: radial-gradient(circle at 36% 30%, #7df0c0 0%, #2fd396 46%, #11b07f 100%)`, color `#04150d`, `border: 1px solid rgba(140,255,210,0.6)`, `box-shadow: 0 0 0 4px rgba(52,211,153,0.15), 0 5px 12px rgba(0,0,0,0.5)`.
- **Scale note dot**: `background: radial-gradient(circle at 36% 30%, #2b3545 0%, #19212e 72%)`, color `#e2e7f0`, `border: 1px solid #3b4759`, `box-shadow: 0 4px 10px rgba(0,0,0,0.5)`.
- Label text: the scale **degree** (e.g. `1`, `♭3`, `5`) when Dots=Degrees, or the **note name** (e.g. `A`, `C#`) when Dots=Note names.

### 5. Legend
Flex row, space-between, `margin-top: 18px`, `padding-top: 16px`, `border-top: 1px solid #1a212c`. Left group: a 16px root swatch + "Root note", a 16px scale swatch + "Scale note", and the hint "Click a note to hear it" (JetBrains Mono 11px, `#566072`). Right: contextual note — "Numbers = scale degree" (Degrees mode) or "Letters = note name" (Note names mode), JetBrains Mono 11.5px, `#566072`.

---

## Interactions & Behavior
- **Root pills / Scale pills**: click sets the active root / scale; active pill gets the emerald treatment. Recomputes the whole board + scale strip.
- **Dots segmented toggle**: switches dot labels between scale degrees and note names.
- **Sound toggle**: enables/disables click-to-play.
- **Neck select**: swaps the fretboard material (Walnut / Graphite / Maple) — changes board gradient, fret/nut/string/inlay colors.
- **Tuning preset select**: loads a preset (Standard, Drop D, Drop C, Half Step Down, Whole Step Down, Open G, Open D, DADGAD). The "Custom" option is display-only (selecting it is a no-op).
- **Per-string ▲/▼ steppers**: shift that string's open pitch ±1 semitone (clamped to MIDI 31–72). Any manual edit that no longer matches a preset makes the preset selector read "Custom". Retuning updates string labels, the board, and playback pitch.
- **Click a note dot**: if Sound is On, plays the note (see Audio).
- **Hover a note dot**: lifts slightly (`translateY(-1px) scale(1.1)`).
- No entrance animations on dots (an earlier attempt caused invisible dots — keep dots at natural opacity/scale).

### Audio (Web Audio API)
On first interaction, create/resume a single `AudioContext`. For a clicked note at MIDI value `m`:
```
freq = 440 * 2^((m - 69) / 12)
```
Play two oscillators: a `triangle` at `freq` and a `sine` at `freq * 2` (12% gain), summed into a gain node with an exponential pluck envelope: ramp to 0.42 over 6ms, decay to ~0 over ~1.15s; oscillators stop at +1.2s.

---

## State Management
All client-side. Suggested state:
- `root: number` (0–11, index into the chromatic scale; default 9 = A)
- `scale: string` (key into the SCALES table; default "Major")
- `mode: 'deg' | 'note'` (dot label mode; default 'deg')
- `sound: boolean` (default true)
- `material: 'Walnut' | 'Graphite' | 'Maple'` (default Walnut)
- `tuning: number[]` — 6 open-string MIDI values in **display order (high→low)**; default `[64,59,55,50,45,40]`
- Config (could be app settings / props): `lefty: boolean` (default false — reverses fret order via `row-reverse` on the fret rows, inlay overlay, and fret-number row), `fretCount: number` (default 12, range 12–24).

The current preset name is **derived** from `tuning` (match against the preset table; else "Custom"), not stored.

---

## Core Logic / Data Tables

```
NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

// scale intervals in semitones from the root
SCALES = {
  'Major':            [0,2,4,5,7,9,11],
  'Natural Minor':    [0,2,3,5,7,8,10],
  'Dorian':           [0,2,3,5,7,9,10],
  'Mixolydian':       [0,2,4,5,7,9,10],
  'Lydian':           [0,2,4,6,7,9,11],
  'Major Pentatonic': [0,2,4,7,9],
  'Minor Pentatonic': [0,3,5,7,10],
  'Blues':            [0,3,5,6,7,10],
}

// interval (semitones from root) -> scale-degree label
DEG = {0:'1',1:'♭2',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♭6',9:'6',10:'♭7',11:'7'}

// string display order high->low; w = string-line gauge in px
STRINGS = [
  {name:'e', w:1.3}, {name:'B', w:1.6}, {name:'G', w:2.0},
  {name:'D', w:2.5}, {name:'A', w:3.1}, {name:'E', w:3.7},
]

// tuning presets: 6 open-string MIDI values, display order high->low
PRESETS = {
  'Standard':        [64,59,55,50,45,40],
  'Drop D':          [64,59,55,50,45,38],
  'Drop C':          [62,57,53,48,43,36],
  'Half Step Down':  [63,58,54,49,44,39],
  'Whole Step Down': [62,57,53,48,43,38],
  'Open G':          [62,59,55,50,43,38],
  'Open D':          [62,57,54,50,45,38],
  'DADGAD':          [62,57,55,50,45,38],
}

// whole/half step marker between consecutive scale degrees (gap in semitones)
STEP = {1:'H', 2:'W', 3:'1½', 4:'2'}
```

**Building the board** for a given `root`, `scale`, `tuning`, `fretCount`:
```
intervals = SCALES[scale]
scalePitchClasses = { (root + iv) % 12  for iv in intervals }   // Set
degreeByPc        = { (root + iv) % 12 -> DEG[iv] }

for each string s (index i, open MIDI = tuning[i]):
  openPc = ((tuning[i] % 12) + 12) % 12
  stringLabel = NOTES[openPc]
  for fret f in 0..fretCount:
    pc = (openPc + f) % 12
    if pc in scalePitchClasses:
      isRoot = (pc === root)
      label  = (mode === 'deg') ? degreeByPc[pc] : NOTES[pc]
      midi   = tuning[i] + f            // for audio on click
      -> render a dot (root style if isRoot else scale style)

// current-scale header label:
current = NOTES[root] + ' ' + scale       // e.g. "A Major"
```

**Scale strip**: iterate `intervals`; for each, note = `NOTES[(root+iv)%12]`, degree = `DEG[iv]`; the step marker after it (except the last) = `STEP[nextGap]` where `nextGap = (intervals[idx+1] ?? 12) - iv`.

**Fret markers**: single inlay at frets in `{3,5,7,9,15,17,19,21}`; double inlay where `f>0 && f%12===0`.

---

## Design Tokens

### Colors
| Token | Value |
|---|---|
| App background | `radial-gradient(120% 90% at 50% -10%, #161d27 0%, #0d1117 55%, #0a0d12 100%)` |
| Panel background | `linear-gradient(180deg, #161d28, #131923)` |
| Board panel bg | `linear-gradient(180deg, #10151e, #0c1118)` |
| Panel border | `#242d3b` |
| Board panel border | `#222a37` |
| Divider | `#1d2531` / legend top `#1a212c` |
| Accent (emerald) | `#34d399` |
| Accent bright / text | `#7ff0c4`, `#7df0c0` |
| Accent deep | `#2fd396`, `#11b07f`, `#10b07f` |
| Accent tint bg | `rgba(52,211,153,0.12–0.16)` |
| Accent tint border | `rgba(52,211,153,0.45–0.55)` |
| Text primary | `#f3f6fa` / `#e6e9ef` |
| Text secondary | `#dfe4ec` / `#cfd6e2` |
| Text muted | `#8b93a3`, `#7b8492`, `#6b7485` |
| Text faint | `#5a6273`, `#566072`, `#4e5768`, `#465062` |
| Control bg (inactive) | `#141a24` / `#0f141d` |
| Control border | `#28313f` / `#242d3b` |
| Scale note dot | `radial-gradient(circle at 36% 30%, #2b3545, #19212e 72%)`, border `#3b4759`, text `#e2e7f0` |

### Materials (fretboard neck)
| | board gradient | fret wire | nut | string | grain | inlay |
|---|---|---|---|---|---|---|
| Walnut | `linear-gradient(180deg,#3b2d21,#2d2118 52%,#221811)` | `rgba(222,228,240,0.14)` | `#e4dabf` | `#b3b9c6` | `rgba(0,0,0,0.16)` | `rgba(232,237,247,0.20)` |
| Graphite | `linear-gradient(180deg,#2b313a,#1e242d 52%,#161b22)` | `rgba(222,228,240,0.16)` | `#d2d8e2` | `#c1c7d4` | `rgba(0,0,0,0.20)` | `rgba(232,237,247,0.20)` |
| Maple | `linear-gradient(180deg,#d8c39c,#c7ac7c 52%,#b69a6c)` | `rgba(60,45,22,0.30)` | `#7a6840` | `#6c7280` | `rgba(120,90,40,0.12)` | `rgba(70,55,25,0.45)` |

### Typography
- **Display / labels-large**: `Sora` (weights 500, 600, 700, 800). Google Fonts.
- **Mono / all technical labels, numbers, pills, fret numbers**: `JetBrains Mono` (400, 500, 600, 700). Google Fonts.
- Import: `https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap`

### Spacing / radius / sizing
- Content max-width **1180px**; page padding `40px 28px 64px`.
- Radii: pills/selects **8–9px**, panels **16px**, board panel **18px**, fret surface **12px**, segmented container **10px**, stepper button **6px**, note box **7px**.
- Fret cell height **54px**; note dot **39px**; string-label column **26px**; string gauges **1.3 / 1.6 / 2.0 / 2.5 / 3.1 / 3.7 px**.
- Pill: `padding: 7px 10px`, JetBrains Mono 600 12.5px, `letter-spacing: 0.03em`. Active pill: `background: rgba(52,211,153,0.13)`, `border: 1px solid rgba(52,211,153,0.5)`, color `#7ff0c4`, `box-shadow: 0 0 16px rgba(52,211,153,0.12)`. Inactive: `background: #141a24`, `border: 1px solid #28313f`, color `#a7afbd`.
- Select: `appearance: none`, `padding: 8px 30px 8px 12px`, `border-radius: 9px`, JetBrains Mono 600 12px, color `#cfd6e2`, `background: #141a24` + inline SVG chevron at `right 11px center`, `border: 1px solid #28313f`. Chevron SVG: `<svg width='10' height='6'><path d='M1 1l4 4 4-4' stroke='#7b8492' stroke-width='1.6' fill='none' stroke-linecap='round'/></svg>`.

---

## Responsive behavior
Desktop-first. All rows use `flex-wrap: wrap`, so pills and steppers reflow on narrower widths. The fretboard cells are `flex: 1`, so the board scales to container width; at high `fretCount` (up to 24) dots get tight — consider horizontal scroll on the fret surface below ~900px if you support mobile.

## Assets
None external. Logo mark, inlays, string lines, and dots are all pure CSS. The only external dependency is the two Google Fonts (Sora, JetBrains Mono). The select chevron is an inline SVG data-URI.

## Files
- `Geetar Tool.dc.html` — the full working design reference (open in a browser to see and interact with the finished design). Note: it depends on a `support.js` runtime that is intentionally **not** included — treat the file as a visual/behavioral spec, not code to import.
